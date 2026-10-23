---
status: draft
status_description: "Owner decisions 1 to 4 folded in; waiting on Q1 and Q2, then spec review and acceptance."
issue: https://github.com/vhco-pro/docs/issues/13
goal: "A tagged release of a Go repository publishes its signed binaries and a signed multi-platform image built from those same binaries, through shared workflows, and a prerelease never becomes latest."
covers:
  - knowledge/container-release.md
  - knowledge/tag-driven-go-releases.md
  - knowledge/shared-delivery.md
  - conventions/containers.md
---

# Plan: Container release workflow

This is the container round from the
[release rollout handover](../../../reports/2026-10-23-release-rollout-handover.md#containers). It
hardens `michielvha/docker-release-action`, gives `go-release-workflow` a way to hand its binaries to a
later job, and adds `vhco-pro/container-release-workflow` to compose the image build. `template-go-app`
is the pilot.

## Context

The binary round moved Go repositories to `version-workflow` and `go-release-workflow`. No repository
that also ships an image was migrated, because the image path had three open problems
([tag-driven Go releases](../../../knowledge/tag-driven-go-releases.md#container-migration-boundary)).
All five Go image repositories copy GoReleaser's `dist/` output into their image:

```text
$ grep -n 'COPY dist' */Dockerfile
chart-fetcher/Dockerfile:20, kustomize-build-check/Dockerfile:74, stackgraph/Dockerfile:27,
template-go-app/Dockerfile:27, upgrade-guard/Dockerfile:16
```

Read at `michielvha/docker-release-action@c499e52`, which is `main` and `v2`:

- **Every release moves `latest`.** The single-job path pushes the version, `latest` and the commit
  (`action.yaml:121-123`), and the merge path does the same (`action.yaml:192-194`). Nothing checks
  whether the version is a prerelease, so a labelled PR preview would replace the stable image.
- **Nested actions use moving tags.** `docker/login-action@v4` (`:103`), `docker/setup-buildx-action@v4`
  (`:110`), `docker/build-push-action@v7` (`:116`, `:136`), `actions/upload-artifact@v7` (`:167`),
  `actions/download-artifact@v8` (`:177`) and `github/codeql-action/upload-sarif@v4` (`:227`). The
  other nested actions are already pinned by SHA.
- **One input is both the login and the image namespace.** `username` is the registry login and also
  the path segment of the image name (`action.yaml:121`, `:146`, `:189`).
- **`latest` is applied before the scan.** Trivy runs after the push (`action.yaml:203`), so an image
  that fails the scan is already `latest`.

The namespace problem gets worse in the separate-workflows arrangement. When the release App pushes the
tag, the tag-triggered run's actor is the App's bot:

```text
$ gh api repos/michielvha/mdtoc/actions/runs?event=push --jq '... select(.head_branch|startswith("v")) ...'
v0.1.4 actor=michielvha-repo-write[bot] https://github.com/michielvha/mdtoc/actions/runs/39889671384
$ gh api repos/vhco-pro/postbode/actions/runs?event=push --jq '...'
v0.6.3 actor=vhco-release-bot[bot] https://github.com/vhco-pro/postbode/actions/runs/39892317910
```

`template-go-app` and `kustomize-build-check` pass `username: ${{ github.actor }}`
(`template-go-app/.github/workflows/build-and-release.yaml:50`,
`kustomize-build-check/.github/workflows/build-release.yml:105`). Moved behind a tag push as they are,
they would publish under the bot's name.

`go-release-workflow` builds and publishes in one job and has no outputs
(`vhco-pro/go-release-workflow/.github/workflows/go-release.yml:40-66`). A later job in the caller cannot
see that job's `dist/`. `stackgraph` shows the gap: its per-platform build legs check out the source again
(`vhco-pro/stackgraph/.github/workflows/build-and-release.yaml:122-139`), so `dist/` is empty when its
Dockerfile copies from it. That workflow has never finished:

```text
$ gh run list -R vhco-pro/stackgraph -w build-and-release.yaml -L 100 --json conclusion
5 runs, 0 success; the latest (39357827215) fails in CI on two HIGH Trivy findings before any container job
```

Release history of the Go image repositories on `main`, from `gh run list -L 20`:

| Repository | Runs | Last success |
| --- | --- | --- |
| kustomize-build-check | 17 success, 3 failure | 2026-10-20 |
| chart-fetcher | 8 success, 10 failure, 2 cancelled | 2026-02-19 |
| upgrade-guard | 2 failure | never |
| template-go-app | none | never |
| stackgraph | 5 failure | never |

`template-go-app` has no tags, so its first release needs no `v` baseline (`git tag` prints nothing). Its
open Renovate PR [#7](https://github.com/michielvha/template-go-app/pull/7) moves it to
`goreleaser-action` v2, which drops the CI steps that v1 ran.

These repositories call `docker-release-action@main` and would pick up any change on `main` immediately:

```text
$ grep -rn 'docker-release-action@main' */.github/workflows
bg-remove, debug-shell, edgeforge-front (private), image-resizer, log-spector (private), taskflow
PDS has the call only in a commented-out job (build-apt-package.yml:325)
```

`vitepress` uses the `v2` tag. The seven Stackweaver mirrors, `chart-fetcher`, `kustomize-build-check`,
`stackgraph`, `template-go-app` and `upgrade-guard` pin `c499e52` by SHA.

## Scope

In scope:

1. `michielvha/docker-release-action` v3: SHA-pinned nested actions, a `latest` policy based on the
   version, an image namespace that is separate from the login, and `latest` applied last.
2. Before v3 merges, the six `@main` consumers are pinned to `c499e52`. This is a pin-only change, the
   same freeze `goreleaser-action` had before its v2.
3. `vhco-pro/go-release-workflow`: an opt-in input that uploads the tagged release's Linux binaries as a
   workflow artifact, plus outputs that name it.
4. New `vhco-pro/container-release-workflow`: a reusable workflow that builds one image per platform on
   native runners, merges them into one image index, and scans, signs and attests that index.
5. Pilot: `michielvha/template-go-app` moves to `version-workflow`, `go-release-workflow` and
   `container-release-workflow`, and Renovate PR #7 is closed unmerged.
6. This repository's container pages describe the result.

Out of scope:

- Migrating the other container repositories. Each one follows in its own change once the pilot is
  verified: `kustomize-build-check`, `chart-fetcher`, `upgrade-guard`, `stackgraph`, the image-only
  repositories, and the Stackweaver mirrors through the Stackweaver monorepo.
- Moving any repository other than `template-go-app` to a distroless runtime (see Q2 for the template).
- Scanning before the push. v3 still pushes and then scans. It only keeps `latest` off an image that
  failed.
- Cleaning up prerelease images. Retention is still to be agreed, as for prerelease GitHub Releases.
- Renaming `docker-release-action`. The name describes the tool, not the purpose, but published names
  are not changed ([shared components](../../../conventions/coding.md#shared-components)).
- Other registries. GHCR is the default and the only registry the pilot proves.

## Design

### Components and responsibilities

| Intent | Component | Change |
| --- | --- | --- |
| Decide the version, push the exact tag | `vhco-pro/version-workflow` | None |
| Check, build, sign and publish Go binaries; optionally hand the Linux binaries on | `vhco-pro/go-release-workflow` | New opt-in input and outputs |
| Build per platform, merge, scan, sign, attest, apply `latest` | `vhco-pro/container-release-workflow` | New |
| Build and push one image or index | `michielvha/docker-release-action` | v3 |

GoReleaser stays the only GitHub Release owner for a Go repository. The container workflow never creates
or edits a GitHub Release. GitVersion decides the version once. The container workflow reads it from the
tag and never recalculates it.

### docker-release-action v3

- **Pinned nested actions.** Each of the six moving references listed in Context becomes a full commit
  SHA with its release as a trailing comment. Renovate's `helpers:pinGitHubActionDigests` keeps them
  current.
- **Image namespace.** New input `namespace`. When it is empty, the action uses `username` as before.
  The image is `<registry>/<namespace>/<project>`. `username` is used only for the login.
- **`latest` policy.** New input `latest` with values `auto` (default), `true` and `false`. With `auto`,
  the action applies `latest` only when `version` is a stable SemVer of the form `MAJOR.MINOR.PATCH`
  with no prerelease or build part. The default version `dev` is therefore never `latest`.
- **`latest` comes last.** The version and commit tags are pushed as before. `latest` is added in a final
  step with `docker buildx imagetools create`, pointing at the release digest, and only after the scan,
  signing and attestation steps have succeeded. This applies to the single-job path and to `merge`.
  `build` legs never apply `latest`.
- **Release line.** v3 changes the default behaviour for a prerelease version, so it is a new major,
  released as an exact `v3.0.0` tag. The `v2` and `v1` tags stay where they are.

### go-release-workflow: binary handoff

- New input `upload-linux-binaries` (boolean, default `false`). When it is true, after GoReleaser
  succeeds the job runs `actions/upload-artifact`, pinned by SHA. It uploads `dist/*_linux_*/**` with
  `if-no-files-found: error` and `retention-days: 7`. The upload keeps the paths relative to `dist/`, so
  a download into `dist/` restores the layout the existing Dockerfiles copy from.
- New workflow outputs: `binaries-artifact`, the artifact name (empty when nothing was uploaded), and
  `version`, the tag without its `v`.
- Integrity comes from the platform. `upload-artifact` records the artifact's SHA-256 digest, and
  `download-artifact` v8 checks it on download with `digest-mismatch` defaulting to `error`. No checksum
  script is added. GoReleaser's own `SHA256SUMS` covers the archives, not the raw binaries, so it cannot
  be used for this check.
- Seven days of retention lets **Re-run failed jobs** rebuild the image after a weekend. At the
  [published rate](#sources), 20 MB of binaries kept for seven days is about 3 GB-hours per release in a
  private repository. In a public one it costs nothing.

### container-release-workflow

One reusable workflow, `.github/workflows/container-release.yml`, with three jobs:

1. **resolve** reads the exact tag, from the `tag` input or a `v*` tag push event, as
   `go-release-workflow` does. It rejects anything that is not `v` followed by a SemVer. It computes the
   version (tag without `v`), the lowercase image name and the platform matrix. It then fails if
   `<image>:<version>` already exists in the registry. A version is published once, the same rule
   GoReleaser applies to release assets.
2. **build** runs once per platform on that platform's native runner. It checks out the tag. When
   `binaries-artifact` is set, it downloads that artifact into `dist/`. It then calls
   `docker-release-action` with `matrix-mode: build`.
3. **merge** calls `docker-release-action` with `matrix-mode: merge`, `namespace` set to the repository
   owner, `latest: auto`, and the security profile from
   [container release](../../../knowledge/container-release.md#required-personal-security-profile). The
   profile includes `trivy-exit-code: '1'`, keyless cosign signing, an SBOM, provenance and an SBOM
   attestation. The job exposes the release digest as the workflow output `digest`.

Inputs: `tag`, `binaries-artifact`, `image` (default: the repository name, lowercased), `context`
(default `.`), `platforms` (JSON map from platform to runner, default
`{"linux/amd64":"ubuntu-latest","linux/arm64":"ubuntu-24.04-arm"}`) and `registry` (default `ghcr.io`).
It logs in with the caller's `GITHUB_TOKEN`, so the caller job grants `contents: read`,
`packages: write`, `id-token: write` and `attestations: write`. No secret is passed.

The repository follows the [shared component rules](../../../conventions/coding.md#shared-components):

- Apache-2.0 `LICENSE` naming `VH & Co BV`.
- Complete caller files under `examples/go-binary-and-image/` and `examples/image-only/`.
- A Go test that checks every example against the workflow's inputs and outputs, as
  `go-release-workflow/tests/examples_test.go` does.
- Released through `gh-release-workflow` as an exact `v0.1.0`.

### Caller shape

A Go repository with an image keeps the separate-workflows arrangement it uses for binaries. Its
tag-triggered `release.yml` has two jobs: `release` calls `go-release-workflow` with
`upload-linux-binaries: true`, and `container` `needs: release` and calls `container-release-workflow`
with `binaries-artifact: ${{ needs.release.outputs.binaries-artifact }}`. An image-only repository has the
`container` job alone. Its CI runs its own checks and then `version-workflow`.

### Previews and failure

A labelled PR preview gets a prerelease tag from GitVersion, such as `v0.2.0-feature.1`. GoReleaser
publishes a prerelease. The image is pushed as `0.2.0-feature.1` and as the commit SHA, and `latest`
stays on the last stable digest.

| State | Recovery |
| --- | --- |
| The binary release fails | No image is built. Re-run the tag workflow, as today |
| The binary release succeeds, the image fails | **Re-run failed jobs**. The artifact is still there, and **resolve** does not run again |
| The scan fails after the push | The version tag exists without `latest`. Fix the source and release a new version |
| **Re-run all jobs** after a published image | **resolve** finds the version and refuses. Nothing is overwritten |

## Acceptance Criteria

- [ ] AC-01: Every `uses:` in `docker-release-action` at its `v3.0.0` tag is a 40-character commit SHA
      with a release comment.
- [ ] AC-02: Publishing a prerelease version with `docker-release-action` v3 leaves `latest` on the
      digest it pointed to before. Publishing a stable version moves `latest` to the new release digest.
      Both hold in the single-job path and in `merge`.
- [ ] AC-03: With `docker-release-action` v3, an image whose scan fails is never tagged `latest`.
- [ ] AC-04: A tag pushed by the release App publishes the image under the repository owner's
      namespace, not the App's.
- [ ] AC-05: No repository calls `docker-release-action` by a branch reference.
- [ ] AC-06: `go-release-workflow` with `upload-linux-binaries: true` hands its Linux binaries to a later
      job in the caller's run, laid out as GoReleaser's `dist/` directories. Without the input it behaves
      as before.
- [ ] AC-07: `vhco-pro/container-release-workflow` has a released exact tag, an Apache-2.0 `LICENSE`,
      and examples that a test checks against the workflow's current inputs and outputs.
- [ ] AC-08: The Linux binaries inside the pilot's image are byte-identical to the binaries in the
      GoReleaser archives of the same release.
- [ ] AC-09: A stable `template-go-app` release from `main` publishes a signed GitHub Release and an
      `amd64` and `arm64` image index at `ghcr.io/michielvha/template-go-app:<version>` and `:latest`.
      The index's cosign signature, SLSA provenance and SBOM attestation verify.
- [ ] AC-10: A labelled `template-go-app` PR publishes a prerelease GitHub Release and a prerelease image
      tag, and `:latest` still resolves to the stable digest from AC-09.
- [ ] AC-11: Publishing a version that already exists in the registry fails before anything is pushed.
- [ ] AC-12: This repository's container pages describe `docker-release-action` v3 and
      `container-release-workflow` as released, and `npm run check` passes.

## Test Plan

| Criterion | Proof |
| --- | --- |
| AC-01 | `git show v3.0.0:action.yaml \| grep -E 'uses:'` in `docker-release-action`; every line matches `@[0-9a-f]{40} # ` |
| AC-02 | A test workflow in `docker-release-action` publishes a stable and then a prerelease version to a throwaway GHCR image, in both modes. After each, `docker buildx imagetools inspect <image>:latest` is compared with the expected digest |
| AC-03 | The same test workflow builds an image with a known HIGH finding and `trivy-exit-code: '1'`. The job fails, and `:latest` still resolves to the previous digest |
| AC-04 | The AC-09 run is started by the App's tag push (run actor `michielvha-repo-write[bot]`). The image exists at `ghcr.io/michielvha/template-go-app` |
| AC-05 | Code search across both owners for `docker-release-action@` followed by anything other than a 40-character SHA returns nothing. The result is confirmed by enumerating repository trees, because code search is incomplete |
| AC-06 | The `go-release-workflow` example test passes. In the AC-09 run, the `container` job's download step lists `dist/template-go-app_linux_amd64_v1/template-go-app` and `dist/template-go-app_linux_arm64*/template-go-app`, and digest verification passes |
| AC-07 | `gh release view v0.1.0 -R vhco-pro/container-release-workflow`, the `LICENSE` file, and `go test ./...` in its `tests/` |
| AC-08 | For each platform: `docker create --platform <p> <image>@<digest>`, `docker cp` the binary out, and compare its `sha256sum` with the binary in the matching release archive |
| AC-09 | `gh release view <tag>`; `docker buildx imagetools inspect` lists both platforms; `cosign verify` with the workflow identity; `gh attestation verify oci://<image>@<digest> --owner michielvha` for provenance and SBOM; `gpg --verify` of the checksums against the shared key |
| AC-10 | Label a PR `release:preview` and push. `gh release view <prerelease tag>` shows a prerelease, the prerelease image tag exists, and `:latest` still has the AC-09 digest |
| AC-11 | Run **Re-run all jobs** on the AC-09 release run. **resolve** fails, naming the existing tag, and the image digest does not change |
| AC-12 | Read the updated pages at the merge commit; `npm ci && npm run check` passes |

## Tasks

None yet; written once the document is planned.

## Open Questions

### Q1: Should an image-only repository get a GitHub Release next to its image?

**Recommendation:** A. No GitHub Release this round. The tag and the GHCR package are the release
record, and the workflow stays one-job-one-intent.

| Option | You get | It costs |
| --- | --- | --- |
| **A. Tag and image only** | No second release owner, nothing new to build | No release notes on GitHub for bg-remove, image-resizer, taskflow and debug-shell |
| **B. Notes-only release from the shared notes workflow** | Release notes and a Releases page | Another job and a second publisher per repository, decided before the image-only rollout |

**Why this is yours:** it is a matter of how you want those repositories to look to visitors. Nothing
technical forces either option.

### Q2: Does the pilot also move template-go-app to a distroless runtime?

**Recommendation:** A. Yes. The template is what new projects copy, and its runtime is Alpine with a
`/bin/sh -c` entry point (`template-go-app/Dockerfile:1`, `:38`). The
[container conventions](../../../conventions/containers.md#distroless-application-runtimes) require
`gcr.io/distroless/static-debian13:nonroot` and an exec-form entry point.

| Option | You get | It costs |
| --- | --- | --- |
| **A. Distroless in the pilot** | New projects start compliant. AC-08 checks the binary in the image that will actually ship | The pilot changes the runtime and the pipeline together, so a failure has two possible causes |
| **B. Pipeline first, runtime later** | One change at a time | New projects copy a non-compliant Dockerfile until the follow-up lands |

**Why this is yours:** it trades pilot isolation against how long the template stays non-compliant.

## Review Log

| Date | Review | Kind | Commit | Model | Isolation | Outcome |
| --- | --- | --- | --- | --- | --- | --- |

## Sources

- [GitHub Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions):
  public repositories on standard hosted runners pay nothing; private repositories use the plan's artifact
  storage (500 MB Free, 1 GB Pro, 2 GB Team), measured in GB-hours and billed at $0.25 per GB-month
  beyond it.
- [Artifact digest validation](https://github.blog/changelog/2025-03-18-github-actions-now-supports-a-digest-for-validating-your-artifacts-at-runtime/):
  `upload-artifact` records a SHA-256 digest and `download-artifact` checks it.
- [actions/download-artifact `action.yml` at v8](https://github.com/actions/download-artifact/blob/v8/action.yml):
  `digest-mismatch` defaults to `error`, which fails the step.
- [actions/upload-artifact `action.yml` at v7](https://github.com/actions/upload-artifact/blob/v7/action.yml):
  the `artifact-digest` output.
