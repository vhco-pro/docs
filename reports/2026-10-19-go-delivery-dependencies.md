# Go delivery migration dependencies - 2026-10-19

Current-default snapshot: **2026-10-19T19:47:01Z**. Draft overlay: **2026-10-19T20:19:13Z**.
Collected with **Atlas depgraph only**, scoped to the authorized `michielvha` and `vhco-pro` repository inventory, with two levels of referenced-repository follow-through.
This public report contains only public release consumers. The broader authorized inventory, private helper-consumer appendix, and raw JSON remain local rather than being copied into this public documentation repository.

## Decision summary

- The existing `michielvha/goreleaser-action` has **11** declared public workflow consumer repositories in scope: **10 use `@main`**, and `vh-adlc` pins the existing v1 commit.
- **Do not merge the release-only major into legacy `main` yet.** The ten known main-ref consumers would receive that interface on their next workflow run. Consumers outside these owners were not enumerated, so the known list is not a global safety guarantee.
- The new `go-ci-action` and `reusable-go-release.yml` have **zero default-branch callers** in the measured inventory; they are currently wired only in the draft topology.
- Start the live canary with **`michielvha/vh-adlc`**, after activation approval. Its reviewed release path is binary-only. Code checks pass, but missing App configuration means it is **not yet live-ready**.
- Five release consumers have an explicit container action reference and are deferred. Five reviewed workflow/default-config paths have only binary artifacts; one config selection remains unverified. These labels do not replace per-repository CI preflight.

## Current consumers of our Go release action

| Consumer / source | Go release ref | Versioning ref | Artifact scope |
| --- | --- | --- | --- |
| [michielvha/chart-fetcher](https://github.com/michielvha/chart-fetcher/blob/main/.github/workflows/build-release.yml#L56) | `@main` | `@v6` | Container path: defer |
| [michielvha/crossplane-docs](https://github.com/michielvha/crossplane-docs/blob/main/.github/workflows/build-release.yml#L38) | `@main` | `@v6` | Configuration selection unverified |
| [michielvha/kustomize-build-check](https://github.com/michielvha/kustomize-build-check/blob/main/.github/workflows/build-release.yml#L90) | `@main` | `@v6` | Container path: defer |
| [michielvha/mdtoc](https://github.com/michielvha/mdtoc/blob/main/.github/workflows/build-and-release.yaml#L38) | `@main` | `@main` | Binary path checked; preflight still needed |
| [michielvha/template-go-app](https://github.com/michielvha/template-go-app/blob/main/.github/workflows/build-and-release.yaml#L40) | `@main` | `@main` | Container path: defer |
| [michielvha/upgrade-guard](https://github.com/michielvha/upgrade-guard/blob/main/.github/workflows/build-and-release.yaml#L49) | `@main` | `@main` | Container path: defer |
| [michielvha/vh-adlc](https://github.com/michielvha/vh-adlc/blob/main/.github/workflows/release.yml#L63) | `a86fcdf45381` | `@8cf5869816cf71437052ac97d086e00526bf2d89` | Binary path checked; preflight still needed |
| [vhco-pro/dcv-session-agent](https://github.com/vhco-pro/dcv-session-agent/blob/main/.github/workflows/build-and-release.yaml#L38) | `@main` | `@main` | Binary path checked; preflight still needed |
| [vhco-pro/postbode](https://github.com/vhco-pro/postbode/blob/main/.github/workflows/build-and-release.yaml#L83) | `@main` | `@main` | Binary path checked; preflight still needed |
| [vhco-pro/stackgraph](https://github.com/vhco-pro/stackgraph/blob/main/.github/workflows/build-and-release.yaml#L100) | `@main` | `@main` | Container path: defer |
| [vhco-pro/terraform-provider-garage](https://github.com/vhco-pro/terraform-provider-garage/blob/main/.github/workflows/release.yml#L33) | `@main` | `@main` | Binary path checked; preflight still needed |

The legacy wrapper main head at verification was
`a86fcdf453812a9d69b85208c0cb6a1e73f136b8`.
That is the existing wrapper rollback/freeze point, not a promise that every floating tool-version input is frozen.

### Binary-only candidate round

- First canary: `michielvha/vh-adlc`.
- Later candidates with a reviewed binary-artifact release path: `michielvha/mdtoc`, `vhco-pro/dcv-session-agent`, `vhco-pro/postbode`, and `vhco-pro/terraform-provider-garage`.
- Needs config-selection verification: `michielvha/crossplane-docs`.
- Container round, not this migration: `michielvha/chart-fetcher`, `michielvha/kustomize-build-check`, `michielvha/template-go-app`, `michielvha/upgrade-guard`, and `vhco-pro/stackgraph`.

Every observed release caller currently declares a main-branch push and manual dispatch. Its path filters differ, and this does not prove that a run passed. A new tag-driven publisher must replace the old branch publisher in one reviewed change, not run alongside it.

## Proposed draft topology, not current deployment

```text
vh-adlc CI -> go-ci-action
vh-adlc Version -> gitversion-tag-action
new exact tag -> reusable-go-release.yml
                 -> go-ci-action
                 -> release-only goreleaser-action
                    -> upstream GoReleaser
```

The draft snapshot records two source repositories referring to `go-ci-action`: the consumer's CI and the shared workflow definition. It records one direct source repository referring to the release action, the shared definition; `vh-adlc` reaches that action indirectly through the called workflow. Those are not two independently migrated applications.

GitVersion remains a reused helper, not a component being changed in this round. Its caller pins within the eleven release consumers are shown above. The wider versioning/container footprint is kept in the local full report and is not an authorization to migrate it now.

## Why chart-fetcher waits

Its current workflow runs GitVersion and scans, then GoReleaser builds/signs the binaries. The Dockerfile copies the per-architecture binary from `dist/` into Alpine. The existing `docker-release-action` uses Buildx to push the amd64/arm64 image to Docker Hub with version, `latest`, and commit tags. It does not rebuild the Go source inside that Dockerfile.

There is already a container primitive. A later shared container workflow should compose it with the appropriate CI/build actions and define how `dist/` artifacts cross job boundaries. Do not assume a separate Docker job can see a called Go workflow's workspace. No container or enterprise workflow has been changed in this round.

## Canary readiness and merge gates

1. `vh-adlc` currently has `PGP_PRIVATE_KEY`, but the name-only inventory found neither `RELEASE_APP_CLIENT_ID` nor `RELEASE_APP_PRIVATE_KEY`. Install/configure an approved repo-scoped event-emitting identity before activation. No values were read.
2. Choose the first publishing run explicitly. Merging the current consumer Version workflow enables main-branch tagging once those credentials exist; it is not a dry-run-only merge. A controlled prerelease bootstrap must not accidentally become the first stable publication.
3. Keep legacy GoReleaser main unchanged while using tested immutable next-major SHAs for the canary. Before a main rollout, either preserve legacy refs/migrate callers or select an isolated release line. Freezing only the known callers cannot prove safety for unknown external main-ref users.
4. Merging the shared-workflow PR can run that repository's existing self-release workflow and publish a component tag/notes release. It is a separate side effect from testing a Go application's binary.
5. Container consumers stay outside this round. The original config/token/Homebrew/GHCR reminder remains [issue #12](https://github.com/michielvha/goreleaser-action/issues/12).

## Method and limits

- Counts are exact qualified `uses:` values in root `.github/workflows/` definitions from the collector JSON, not word occurrences or invocation counts. README, examples, and ambiguous mentions are not counted as runtime workflow consumers.
- These are declared dependencies, not proof of enabled workflows, successful runs, or publication. Job/step conditions and credentials still decide execution.
- Local `./` references are not emitted by the collector. Component self-tests and the notes-only workflow's local self-call are not included in the external-caller totals.
- The collector follows referenced repositories at their default HEAD, not at each caller's pinned revision, and stops after the selected depth. Pin strings are captured, but compatibility of every historical pinned body is not established.
- Files larger than 1 MiB are excluded by the collector. Dynamic/generated calls and visibility outside the authorized identity are not established. Zero reported fetch gaps is not a claim of zero analysis limitations.
- Current default branches and the four draft runtime refs are separate snapshots. The docs PR is not an executable dependency. No enterprise rollout or registry/image audit was run.

For the rows without a container action reference, the public workflow and its selected root GoReleaser config were checked for additional publishing targets. `crossplane-docs` was left unverified rather than assuming a missing/ambiguous default config is harmless. This was an artifact-surface check, not a security or whole-repository deployment audit.
