---
title: "Tag-driven Go releases"
type: architecture
description: "Separate GitVersion tag creation from checked, signed Go artifact publication."
status: active
---

# Tag-driven Go releases

The pilot consumer is `michielvha/vh-adlc`. Shared workflows compose separate
actions, each owning one intent.

| Intent | Component |
| --- | --- |
| Check Go source | [go-ci-action](https://github.com/michielvha/go-ci-action) |
| Calculate a version and create its exact tag | [gitversion-tag-action](https://github.com/michielvha/gitversion-tag-action) |
| Build, sign, and publish Go artifacts | [goreleaser-action](https://github.com/michielvha/goreleaser-action), release-only since v2 |
| Decide when to tag, authenticate, and call GitVersion | [version-workflow](https://github.com/vhco-pro/version-workflow) |
| Check the tagged source, then build, sign, and publish | [go-release-workflow](https://github.com/vhco-pro/go-release-workflow) |

This design has passed the binary pilot, not an estate-wide rollout. Each
consumer still needs its own migration review and live verification.

The binary-only `michielvha/vh-adlc` pilot runs the
[PR preview policy below](#pr-preview-policy) since v0.3.1: branch CI, then
`version-workflow` tags `main` or a labelled PR head, and the tag push starts
`go-release-workflow`. See [verification](#pr-preview-verification-2026-10-22).

Container migration is a later round. `michielvha/chart-fetcher` first produces Go
binaries, then packages those `dist/` binaries into a multi-platform image through
the existing `michielvha/docker-release-action`. A later shared container workflow
can compose the primitives and define the artifact handoff; it is not part of the
binary canary.

Call the GitVersion action directly through `uses:`. Do not check out or invoke
its internal scripts. Shared workflows contain orchestration, not copies of CI
commands or another tagging or publication implementation.

## PR preview policy

Every consumer uses the same shape. Its own checks stay in its own CI.

| Intent | How the caller does it |
| --- | --- |
| CI only | Call `michielvha/go-ci-action` directly, plus repository-specific checks |
| Version and tag | After the checks, `needs:` a call to `vhco-pro/version-workflow` |
| Build, sign and publish | Exact tag push calls `vhco-pro/go-release-workflow` |

`version-workflow` decides whether this run tags, authenticates, checks out the
checked commit and calls `michielvha/gitversion-tag-action`. GitVersion and its configuration decide the
version and push the tag. No workflow adds tagging scripts, version parsing or
a PR-derived counter.

### Run CI on the branch, not the PR

GitVersion reads the branch from the run's ref. A `pull_request` run has GitHub's
merge ref (`refs/pull/N/merge`) instead of the branch, so a version calculated
there is a `PullRequest` version rather than the feature branch's. Callers
therefore run CI on `push`. A PR shows those push checks on its head commit, so
no separate PR run is needed.

After all checks pass, `version-workflow` decides whether this run tags:

| Branch | Result |
| --- | --- |
| `main` | Tags the stable version when it is new |
| Feature branch with an open `release:preview` PR at this commit | Tags the prerelease version |
| Any other feature branch | `dry-run`: calculates the version only |

The decision is one `gh pr list --head <branch> --state open --label release:preview`
query inside `version-workflow`, so callers have no gate of their own and cannot
override it. A writer adds the label once and every later push to that PR gets a
prerelease until the label is removed or the PR closes. Adding the label does
not push a commit, so a small `pull_request: labeled` workflow reruns CI on the
branch with `gh workflow run`. That run tags the current head.

```mermaid
flowchart TD
    Push["Push to a branch"] --> CI["CI: Go CI action and repository checks"]
    Label["Writer adds release:preview"] --> Rerun["Rerun branch CI"]
    Rerun --> CI
    CI --> Passed{"All checks pass?"}
    Passed -->|No| Stop["No version, no tag"]
    Passed -->|Yes| Gate{"main, or open release:preview PR at this commit?"}
    Gate -->|No| Calc["GitVersion calculates only"]
    Gate -->|Yes| Tag["GitVersion pushes the exact tag"]
    Tag --> Release["Tag push: shared Go release workflow"]
    Release --> Publish["Check, build, sign, publish"]
```

```mermaid
sequenceDiagram
    actor Writer
    participant CI as Branch CI
    participant GV as version-workflow
    participant Rel as Tag-triggered release
    Writer->>CI: Add release:preview (CI reruns on head A)
    CI->>GV: Checks pass, label present
    GV->>Rel: Push exact prerelease tag for A
    Writer->>CI: Push commit B, label still present
    CI->>GV: Checks pass, label present
    GV->>Rel: Push next prerelease tag for B
    Writer->>CI: Remove label, push commit C
    CI->>GV: Checks pass, no label
    Note over GV,Rel: Version calculated only. No tag, no release for C
```

Fork PRs do not run the push workflow and never receive tagging or signing
credentials. Removing the label stops future prereleases; it does not delete
existing tags or releases.

### PR-only CI for private repositories

Private repositories pay for runner minutes, so a caller can skip feature-push
CI. It runs CI on `pull_request` and on pushes to `main` only. Checks on a PR run
use the merge ref, so they never tag. For previews, the same small workflow
listens to `pull_request: [labeled, synchronize]` and, while the label is present,
reruns CI on the branch. Only labelled PRs pay for that second run.

### Packaging is tested by the tag workflow

CI does not run GoReleaser. The shared release workflow runs Go CI and the owned
GoReleaser action on every exact tag, and a labelled prerelease exercises the
whole path with the production signing identity. Keep failed-tag retries and
existing-asset protection as defined under [failure and retry](#failure-and-retry).

### Check first or tag first

There are two places a release flow can run its checks relative to the tag.

| | Check first (this design) | Tag first |
| --- | --- | --- |
| Order | Push, checks, tag, then the release workflow checks again, builds and publishes | Push, tag, then the release workflow checks, builds and publishes |
| A version needs | All caller checks to pass | Only GitVersion to compute a new version |
| The artifact is protected by | Checks inside the release workflow | Checks inside the release workflow |
| A commit that fails checks | Gets no tag | Keeps its tag with no artifact; the fix releases as the next version |

In both, the checks inside the release workflow protect the artifact: they run
on the exact tagged commit and are the last step before publishing, including
for a tag pushed by hand. The checks before the tag protect the version number
from tags that never get an artifact. That is why CI runs twice in this design.

Tag first is sound only when every commit that can be tagged has already passed
the same checks the release workflow runs. That requires all three:

- the branch accepts changes only through PRs with required checks;
- the PR runs every check the release workflow runs, including any scanners;
- branches must be up to date before merging, or a merge queue is used, so two
  green PRs cannot combine into a broken branch.

A re-run fixes a transient failure, such as a flaky test or a registry outage,
under the same tag. It does not fix a deterministic one: a check that only the
release workflow runs, a dependency or vulnerability database that changed after
the PR passed, or two PRs that conflict. Those leave a tag without an artifact.

This design checks first because the conditions do not always hold here:

- feature-branch prereleases have no PR gate before each push;
- small repositories are sometimes pushed to `main` directly.

On a branch where all three conditions hold, the checks before the tag add
little beyond a quicker failure.

Where the Git tag is itself the artifact, as for a GitHub Action or a reusable
workflow, there is no later publish step to hold back a broken version.
Consumers can adopt the tag as soon as it exists. Those repositories must pass
their checks before tagging, through required PR checks or check-first CI.

### Same workflow or separate workflows

The tag can start the release in two ways. Use one per repository; enabling both
releases the same tag twice.

| | Separate workflows | Same workflow |
| --- | --- | --- |
| How the release starts | The tag push event starts a tag-triggered workflow | A dependent job in the run that pushed the tag |
| Tag push identity | A GitHub App token; a `GITHUB_TOKEN` push starts no workflow | `GITHUB_TOKEN` with `contents: write` |
| A tag pushed by hand | Is released | Is not released |
| Retrying a failed release | Re-run the tag workflow | **Re-run failed jobs**, which reuses the attempt's `tagged` and `tag` outputs |
| **Re-run all jobs** | Not applicable | The tag already exists, so `tagged` is false and nothing is released |

Both are supported. `version-workflow` inherits the caller job's token and
exposes `tagged`, `tag` and `version`; `go-release-workflow` accepts the tag
created earlier in the run through its `tag` input, and has a complete example
folder for each arrangement. In both arrangements GoReleaser refuses to replace an existing release's
assets, so a retry cannot change what was already published.

## Current live pilot flow

1. Every branch push runs CI. When the checks pass, `version-workflow`
   calculates the version and tags only on `main` or for an open
   `release:preview` PR at that commit.
2. On `main`, GitVersion selects the next stable version; on a labelled PR
   branch, its prerelease version.
3. Tag creation pushes only the exact semantic version for that source commit.
   No new tag means no new publication request. Floating major and minor aliases
   are not release inputs.
4. The exact tag push starts a thin caller of the shared Go release workflow.
   The publisher checks out the event's commit, validates the tag-to-commit
   mapping, and passes the exact event tag to GoReleaser. It must not rediscover
   a different tag from that commit. It does not run GitVersion.
5. `go-ci-action` runs formatting, module tidiness, vet, tests, build, and lint
   as blocking checks. PR CI calls the same action.
6. The release-only GoReleaser action provisions the release toolchain, imports
   the signing key with native GnuPG into a private temporary keyring, and calls
   the upstream GoReleaser action directly. Setup-go manages Go module/build
   caching; there is no separate GoReleaser binary cache or custom CLI launcher.
   In the shared job, Go CI owns cache restore/save; the release step reuses
   those populated caches without restoring them a second time.
   The tool pin is independent of GitVersion's application version. GoReleaser
   itself creates the draft, uploads artifacts, and publishes after successful
   upload. Its configuration marks prerelease tags as prereleases.

A branch event requests versioning. The exact tag authorizes artifact
publication. These are separate responsibilities even when both are automatic.
Checks on the tagged source may repeat PR checks; they verify the source actually
being released.

The release-only GoReleaser action is released as v2.0.0; the legacy v1 tag
is unchanged. Before the release-only change reached its default branch, all
ten inventoried consumers of its floating main ref were frozen to their original
commits, including the legacy v1 release action. That freeze was not a migration
to the new interface. Existing immutable refs and the v1 tag remain unchanged.
The notes-only shared release workflow remains a separate publisher.

A binary repository has one publisher; it must not run the notes-only publisher
alongside GoReleaser for the same release.

## Identity and source

Automated tag pushes use an approved, narrowly scoped GitHub App installation
token. A tag pushed with the ordinary `GITHUB_TOKEN` does not start another
tag-push workflow. Checkout or Git's credential helper must use the App identity
for the push; merely generating an App token is insufficient.

The personal account reuses one owner-wide App, `michielvha-repo-write`, rather
than registering an App for each consumer. It has Contents: write and Metadata:
read, no webhook events, and an all-repositories installation. Each trusted
tagging job narrows its short-lived token to `github.event.repository.name`
under `github.repository_owner`, and explicitly requests Contents: write.

Installation coverage is not the same as workflow access to the key. Configure
`RELEASE_APP_CLIENT_ID` and `RELEASE_APP_PRIVATE_KEY` only in repositories as
they adopt the flow. A user account has no account-wide Actions secret store;
the pilot uses repository-level configuration. Do not put the key in source or
pass it to PR preview jobs. The App key can mint tokens throughout its
installation even though each normal job requests a single-repository token.
Treat that key as an owner-wide credential.

A run that does not tag mints no App token and persists no credentials. A
published PR preview is requested with the `release:preview` label on a
same-repository PR, never through a privileged `pull_request` job. Fork PRs
receive no push CI and no credentials. Feature names do not
supply a second version counter: use GitVersion's actual prerelease output.

Pin actions and reusable workflows to full commit SHAs. The Go workflow needs no
helper checkout or second `workflow-ref` pin. The application tag identifies
source; the workflow and action pins identify the build implementation.

## Failure and retry

An exact tag can exist before its artifact is ready. GitHub Releases, rather
than the existence of a source tag, indicate completed binary publication in
this pilot.

| State | Recovery |
| --- | --- |
| Checks or build fail before a release exists | Re-run the original tag workflow at the same source commit |
| A partial draft exists | Inspect it before retrying; preserve uploaded artifacts and do not delete or replace the draft automatically |
| A public release exists | Do not overwrite its assets; collisions must fail |
| The source needs a fix | Commit the fix and release a new exact version |

The shared workflow serializes runs per exact tag. GoReleaser owns release API
operations and upload failure handling. Configure `replace_existing_artifacts`
and `replace_existing_draft` as false, and `use_existing_draft` as true. An
existing asset collision fails rather than replacing its content. These are
native GoReleaser controls, not custom recovery scripts.

A tag event is not automatically repeated by a later branch push. Re-running a
failed workflow preserves its original source ref and commit.

Do not require a new tag to be created on every retry: the original exact tag is
the release identity. Recovery must still protect any content already published.
The pilot does not automate deletion, asset replacement, or partial-release
recovery.

## Prerelease retention

No automatic deletion is part of the pilot. Agree retention separately before
enabling cleanup. Distinguish source tags, GitHub Releases, stored artifacts, and
deployed references. Cleanup must preserve anything still consumed and must not
remove stable releases or move tags.

## Component types

For a binary or image, a source tag may precede artifact readiness. For a
GitHub action or reusable workflow, the tag itself is already consumable through
`uses:`. Essential component tests must pass before creating that tag; post-tag
checks do not prevent consumers from using it.

## Pilot verification (2026-10-20)

The [consumer activation](https://github.com/michielvha/vh-adlc/pull/6) passed
Go CI and the existing Linux/macOS plugin checks. The
[main-branch Version run](https://github.com/michielvha/vh-adlc/actions/runs/39445345539)
used the App identity to create GitVersion's exact `v0.2.0` tag at commit
`2f77c2d4f393e5a3bec52b872dd18c672299f138`.

That push started a separate
[tag-only release run](https://github.com/michielvha/vh-adlc/actions/runs/39445397839).
Blocking Go CI, native GPG signing, and GoReleaser publication all succeeded.
The [published stable release](https://github.com/michielvha/vh-adlc/releases/tag/v0.2.0)
contains four Linux/macOS amd64/arm64 archives, the checksum manifest, and its
detached signature. All four downloaded archives passed checksum verification;
the signature verified against the consumer's committed release public key.
The downloaded macOS arm64 binary reported `vh-adlc 0.2.0`.

The first run also exposed a duplicate setup-go cache restore: the release
action tried to overwrite read-only modules already restored by CI. Publication
succeeded, but the tar extraction errors warranted a composition fix rather
than being treated as a clean run. The release action retains caching by default
for standalone callers; the shared workflow disables only its duplicate
restore/save through `go-cache: 'false'`.

The [release-action fix](https://github.com/michielvha/goreleaser-action/pull/13)
and [shared composition](https://github.com/vhco-pro/.github/pull/20) passed their
checks and were merged. Before merging the
[pilot pin update](https://github.com/michielvha/vh-adlc/pull/14), a trusted manual
branch run used GitVersion to create `v0.2.0-ci-single-go-cache.1` at
`67cc38bce7628e90266171478e064ceb3a1d64e0`. Its
[tag-triggered publication](https://github.com/michielvha/vh-adlc/actions/runs/39446871759)
succeeded with no cache extraction failures, and GitHub correctly marked the
[release as a prerelease](https://github.com/michielvha/vh-adlc/releases/tag/v0.2.0-ci-single-go-cache.1).
The downloaded signature, all four archive checksums, and the macOS arm64
binary's exact prerelease version also verified. Stable latest remained `v0.2.0`.
The verified pin update was then merged.

Both tag-triggered runs identify `michielvha-repo-write[bot]` as their actor.
A separate
[main-branch versioning retry](https://github.com/michielvha/vh-adlc/actions/runs/39446313064)
found `v0.2.0` already on the remote and skipped tagging. It did not request a
second publication or overwrite the release.

## PR preview verification (2026-10-22)

[vh-adlc#18](https://github.com/michielvha/vh-adlc/pull/18) moved the pilot to
`version-workflow` v0.1.0 and `go-release-workflow` v0.1.0. On its unlabelled
branch, the shared decision looked up the PR, chose not to tag, minted no App
token and ran GitVersion as a dry run. After the merge, CI on `main` tagged
`v0.3.1` with the App, and the
[tag-triggered release](https://github.com/michielvha/vh-adlc/actions/runs/39813406602)
reran Go CI on the tag and published the
[signed release](https://github.com/michielvha/vh-adlc/releases/tag/v0.3.1)
with four archives, `checksums.txt` and its signature. The labelled prerelease
path has not run live yet.

## Container migration boundary

The current
[chart-fetcher Dockerfile](https://github.com/michielvha/chart-fetcher/blob/e884bbe879c2d4dcd211b8be170a6e53f5625c85/Dockerfile)
copies Linux binaries from GoReleaser's architecture-specific `dist/`
directories into its image. Its existing workflow builds binaries and images in
one job, so those files are local. Calling the Go reusable workflow from one job
does not make its `dist/` tree available to a later Docker job: a split-job design
needs an explicit, verified artifact handoff.

Before migrating that consumer, review the selected
[owned Docker action](https://github.com/michielvha/docker-release-action/blob/c499e52a1a05e5bdd8cf03ba19a423d4c7ec25e3/action.yaml).
Its default mode publishes the requested version, `latest`, and the commit tag;
it does not distinguish stable from prerelease versions for that promotion.
It also has tagged rather than SHA-pinned nested action references. The caller
freeze did not rewrite this pinned action's implementation.

The container round therefore needs reviewed nested pins, a stable/prerelease
promotion policy, and a decision about keeping the build in one job or passing
verified binaries between jobs. Preserve the existing native matrix and
digest-based signing/attestation options when changing shared interfaces. Keep
container publication separate from GitVersion's version decision, and do not
add another GitHub Release owner alongside GoReleaser. No container consumer
was migrated by the binary pilot.

## Related

- [Release rollout handover, 2026-10-23](../reports/2026-10-23-release-rollout-handover.md): what is migrated and what is next
- [Dated migration dependency report](../reports/2026-10-19-go-delivery-dependencies.md)
- [Delivery conventions](../conventions/delivery.md)
- [Shared delivery components](shared-delivery.md)
