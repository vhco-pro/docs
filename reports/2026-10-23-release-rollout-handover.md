# Release rollout handover - 2026-10-23

Scan: **2026-10-23T03:00:22Z**, Atlas depgraph over all 139 non-archived
`michielvha` and `vhco-pro` repositories (6398 files, no gaps). This public
report lists only public repositories; 42 private ones were scanned but are left
out. Rerun the scan (see [reproduce](#reproduce-the-scan)) to see them.

This is the starting point for the next migration round. The design is in
[tag-driven Go releases](../knowledge/tag-driven-go-releases.md), and the rules
are in [delivery](../conventions/delivery.md).

## Where things stand

The shared components are released and in use:

| Component | Release | Role |
| --- | --- | --- |
| [vhco-pro/version-workflow](https://github.com/vhco-pro/version-workflow) | v0.1.0 | After the checks: tag `main`, or a branch whose open PR has `release:preview` |
| [vhco-pro/go-release-workflow](https://github.com/vhco-pro/go-release-workflow) | v0.1.0 | On an exact tag: `go-ci-action`, then signed GoReleaser release |
| [vhco-pro/gh-release-workflow](https://github.com/vhco-pro/gh-release-workflow) | v0.1.1 | Tag and GitHub Release for repositories whose tag is the release (actions, workflows) |
| [michielvha/go-ci-action](https://github.com/michielvha/go-ci-action) | v0.1.0 | gofmt, `go mod tidy -diff`, vet, test, build, golangci-lint v2.15.0 |
| [michielvha/goreleaser-action](https://github.com/michielvha/goreleaser-action) | v2.0.0 | Release only; v1 still runs CI and release together |

Migrated and verified with a real release:

| Repository | Verified release |
| --- | --- |
| [michielvha/vh-adlc](https://github.com/michielvha/vh-adlc) | [v0.3.1](https://github.com/michielvha/vh-adlc/releases/tag/v0.3.1) |
| [michielvha/mdtoc](https://github.com/michielvha/mdtoc) | [v0.1.4](https://github.com/michielvha/mdtoc/releases/tag/v0.1.4), first signed with the shared key |
| [vhco-pro/postbode](https://github.com/vhco-pro/postbode) | [v0.6.3](https://github.com/vhco-pro/postbode/releases/tag/v0.6.3), released by a Dependabot `chore(deps)` merge; the Homebrew formula followed |

Migrated, no release since (their next `fix:`, `feat:` or `chore:` releases):
[vhco-pro/dcv-session-agent](https://github.com/vhco-pro/dcv-session-agent),
[vhco-pro/terraform-provider-garage](https://github.com/vhco-pro/terraform-provider-garage),
[michielvha/auth-refresh](https://github.com/michielvha/auth-refresh) (release
workflow only; no version job yet, tags are pushed by hand).

## Migrating one repository

Every step below came from a problem found in this round.

1. **Run go-ci-action's checks locally first.** Most repositories had no CI or a
   different lint version. Fix findings in a separate `fix:` or `style:` commit.
2. **Copy the example folder** from
   [go-release-workflow](https://github.com/vhco-pro/go-release-workflow/tree/main/examples/separate-workflows).
   Keep repository-specific checks as jobs and add them to `version`'s `needs:`.
   Signing keeps the repository's secret name if it differs (garage passes
   `GPG_PRIVATE_KEY`).
3. **Delete the repository's GitVersion file** and use the action's bundled one.
   The old files had `tag-prefix: ''`, which cannot read `v` tags, so the version
   stops increasing after the first `v` release.
4. **Unprefixed tags need a baseline.** Tag the latest release commit with the same
   version plus `v` (`v0.6.2` beside `0.6.2`). Without it the first merge
   republishes the current version, because the action looks only for the `v`
   tag. Check that the old commit's workflows have no tag trigger before pushing
   it. Watch for stray tags: `chart-fetcher` has `v0.0.1` beside `0.1.8`, and
   `crossplane-docs` has `v0.0.0` beside `0.1.5`.
5. **Simulate the merge** with GitVersion 6.8.0 and the bundled configuration:
   merge the branch locally with `--no-ff`, run `gitversion /showvariable SemVer`,
   and check whether `v<version>` already exists. This caught both problems above.
6. **Find anything that builds a URL from the tag**, such as a Homebrew formula.
   postbode's formula needed
   [a sync change](https://github.com/vhco-pro/homebrew-tap/pull/3) before its
   first `v` release.
7. **Configure the repository:**
   - `RELEASE_APP_CLIENT_ID` variable and `RELEASE_APP_PRIVATE_KEY` secret:
     `michielvha-repo-write` for `michielvha`, `vhco-release-bot` for `vhco-pro`.
     The owner keeps both keys outside every repository.
   - `PGP_PRIVATE_KEY`: the shared VHCO Pro release signing key. Commit its public
     key as `release-signing-key.asc` and put the fingerprint in the README, as
     [mdtoc](https://github.com/michielvha/mdtoc#verify-a-release) does.
   - A `release:preview` label.
   - A dependency updater. postbode had none. Dependabot's default "Bump ..."
     subject does not bump the version; set `commit-message.prefix: chore` with
     `include: scope`.
8. **Merge with a commit message that carries the bump**: a merge commit (GitVersion
   reads every commit) or a squash whose subject has the right type. A `[skip ci]`
   in any squashed commit body stops the release run.
9. **Verify**: the tag, the tag-triggered run, the assets, and
   `gpg --verify` of the checksums against the shared key.

## Next round

### Go binaries still on goreleaser-action v1 or upstream GoReleaser

These have no container step. The binary procedure above applies as is.

| Repository | Today | Notes |
| --- | --- | --- |
| [michielvha/crossplane-docs](https://github.com/michielvha/crossplane-docs) | goreleaser-action v1, gitversion-tag-action v6 | Stray `v0.0.0` tag; check which GoReleaser configuration it uses |
| [michielvha/edgectl](https://github.com/michielvha/edgectl) | upstream GoReleaser v7, gitversion-tag-action v6 | Unprefixed tags (`0.3.11`) |
| [vhco-pro/terraform-provider-stackweaver](https://github.com/vhco-pro/terraform-provider-stackweaver) | upstream GoReleaser v7 | Already `v` tags; follow terraform-provider-garage |
| [michielvha/terraform-provider-proxmox](https://github.com/michielvha/terraform-provider-proxmox) | upstream GoReleaser v6.4 | No tags, last push 2025-12; confirm it is still wanted |
| [michielvha/azure-env](https://github.com/michielvha/azure-env) | upstream GoReleaser v4 | No tags, last push 2024-09; likely archive instead |

### Containers

[michielvha/docker-release-action](https://github.com/michielvha/docker-release-action)
(`v2` = `main` = `c499e52`) needs design work before any container repository moves:

- **Prereleases become `latest`.** The action always pushes `:latest`, so a labelled
  PR preview would replace the stable image.
- **Its nested actions are tag-pinned** (`docker/login-action@v4`,
  `docker/build-push-action@v7` and others), while consumers pin it by SHA.
- **The binary handoff.** Go repositories with an image copy GoReleaser's `dist/`
  into the image in the same job. Calling `go-release-workflow` from one job does
  not give a later Docker job that tree. See
  [container migration boundary](../knowledge/tag-driven-go-releases.md#container-migration-boundary).
- Then decide whether a `container-release-workflow` composes it, following the
  [shared component rules](../conventions/coding.md#shared-components).

Go binary and image (goreleaser-action v1 plus docker-release-action):
[chart-fetcher](https://github.com/michielvha/chart-fetcher),
[kustomize-build-check](https://github.com/michielvha/kustomize-build-check)
(also runs upstream GoReleaser in `image-check.yml`),
[upgrade-guard](https://github.com/michielvha/upgrade-guard),
[stackgraph](https://github.com/vhco-pro/stackgraph) and
[template-go-app](https://github.com/michielvha/template-go-app). Renovate's
[template-go-app#7](https://github.com/michielvha/template-go-app/pull/7) bumps
goreleaser-action to v2, which drops the CI steps. Close it and migrate the
template instead, so new projects start on the new workflows.

Image only, on `docker-release-action@main`:
[PDS](https://github.com/michielvha/PDS),
[bg-remove](https://github.com/michielvha/bg-remove),
[debug-shell](https://github.com/michielvha/debug-shell),
[image-resizer](https://github.com/michielvha/image-resizer),
[taskflow](https://github.com/michielvha/taskflow).

Stackweaver distribution mirrors, on `docker-release-action` v2:
`stackweaver-ansible-runner`, `-api`, `-frontend`, `-opentofu-runner`,
`-orchestrator`, `-secrets-init` and `-zitadel-init` in `vhco-pro`. They are
one-way synced from the Stackweaver monorepo; change their workflows there, not
in the mirrors.

### Repositories versioning with gitversion-tag-action directly

These call the action themselves, often at `@main` or v6, with no shared release
workflow. Actions and reusable workflows move to
[gh-release-workflow](https://github.com/vhco-pro/gh-release-workflow); the rest
need their artifact type decided first.

- Actions: [helm-oci-publish-action](https://github.com/michielvha/helm-oci-publish-action),
  [oras-package-push-action](https://github.com/michielvha/oras-package-push-action),
  [crossplane-validation-action](https://github.com/michielvha/crossplane-validation-action),
  [package-pwsh-script-action](https://github.com/michielvha/package-pwsh-script-action),
  [swift-release-action](https://github.com/vhco-pro/swift-release-action).
- Other: [ERM](https://github.com/michielvha/ERM),
  [logger](https://github.com/michielvha/logger),
  [terraform-azurerm-networking](https://github.com/michielvha/terraform-azurerm-networking),
  [terraform-azurerm-resource-group](https://github.com/michielvha/terraform-azurerm-resource-group),
  [claude-companion](https://github.com/vhco-pro/claude-companion),
  [ssm-connect](https://github.com/vhco-pro/ssm-connect),
  [stackweaver-helm](https://github.com/vhco-pro/stackweaver-helm) (a mirror).

## Open items

- **The labelled preview path has not run live.** Every release so far came from
  `main`. Label a PR in a migrated repository and confirm a prerelease is tagged
  and published, and that it does not become the latest release.
- **Licences.** Public components are Apache-2.0 by convention. These have no
  licence: go-ci-action, changelog-release-action, bicep-publish-action,
  kustomize-build-check-action, package-pwsh-script-action,
  publish-pwsh-module-action and `vhco-pro/.github`.
- **`vhco-pro/.github`** keeps its CodeQL and Scorecard workflows; they move to
  their own repositories when they next change.
- **GitHub list endpoints can return incomplete results** during an incident. On
  2026-10-22, the releases list came back empty for about one call in three, so
  gh-release-action now looks releases up by tag. Code search and repository
  listings were affected the same way: confirm an empty result with a second
  method before acting on it.

## Reproduce the scan

Run Atlas depgraph over both owners' non-archived repositories with
`-follow-uses 0` and a tools file listing:
`michielvha/docker-release-action`, `goreleaser/goreleaser-action`,
`michielvha/goreleaser-action`, `michielvha/gitversion-tag-action`,
`michielvha/go-ci-action`, and the three workflow paths
`vhco-pro/version-workflow/.github/workflows/version.yml`,
`vhco-pro/go-release-workflow/.github/workflows/go-release.yml` and
`vhco-pro/gh-release-workflow/.github/workflows/gh-release.yml`. Build the
repository list from two listings (`gh repo list` and the REST API) and check the
count, because one listing can come back short.
