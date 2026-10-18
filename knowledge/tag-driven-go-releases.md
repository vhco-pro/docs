---
title: "Tag-driven Go releases"
type: architecture
description: "Separate GitVersion tag creation from checked, signed Go artifact publication."
status: draft
---

# Tag-driven Go releases

The pilot consumer is `michielvha/vh-adlc`. Shared orchestration belongs in
[vhco-pro/.github](https://github.com/vhco-pro/.github), while artifact builds use
the existing
[GoReleaser action](https://github.com/michielvha/goreleaser-action).
This design is a pilot, not an estate-wide rollout. Live event delivery and
publication must be verified before adoption.

## Release flow

1. PR checks validate the code and calculate the feature branch's GitVersion
   version without publishing or creating a tag.
2. A push to `main` runs GitVersion to select the next stable version.
   An authorized manual run on a trusted feature branch can instead request
   its computed prerelease version.
3. Tag creation pushes only the exact semantic version for that source commit.
   No new tag means no new publication request. Floating major and minor aliases
   are not release inputs.
4. The exact tag push starts a thin caller of the shared Go release workflow.
   The publisher checks out the event's commit, validates the tag-to-commit
   mapping, and consumes the version from the tag. It does not run GitVersion.
5. Shared verification runs formatting, module tidiness, vet, tests, build, and
   lint as blocking checks. PR CI can call the same verification workflow.
6. The existing GoReleaser action builds and signs a release draft. Only after
   GoReleaser succeeds is the draft published. Prerelease tags become
   prereleases and never replace the latest stable release.

A branch event requests versioning. The exact tag authorizes artifact
publication. These are separate responsibilities even when both are automatic.
Checks on the tagged source may repeat PR checks; they verify the source actually
being released.

The shared verification and release workflows are additive. Existing composite
action inputs and defaults, and the existing notes-only release workflow, do not
change. A binary repository has one publisher; it must not run the notes-only
publisher alongside GoReleaser for the same release.

## Identity and source

Automated tag pushes use an approved, narrowly scoped GitHub App installation
token. A tag pushed with the ordinary `GITHUB_TOKEN` does not start another
tag-push workflow. Checkout or Git's credential helper must use the App identity
for the push; merely generating an App token is insufficient.

PR version calculation gets no tagging or signing credentials. A published PR
preview is requested through an authorized manual run on its trusted feature
branch, not through a privileged `pull_request` job. Fork PRs receive validation
only. Feature names do not supply a second version counter: use GitVersion's
actual prerelease output.

Pin reusable workflows to full commit SHAs. Helper scripts must use the same
revision as the called workflow and stay outside the application's checkout.
The application tag identifies source; the workflow pin identifies the build
implementation.

## Failure and retry

An exact tag can exist before its artifact is ready. GitHub Releases, rather
than the existence of a source tag, indicate completed binary publication in
this pilot.

| State | Recovery |
| --- | --- |
| Checks or build fail before a release exists | Re-run the original tag workflow at the same source commit |
| A partial draft exists | Stop and inspect the original artifacts; do not automatically delete or replace them |
| A public release exists | Do not rebuild or overwrite it |
| The source needs a fix | Commit the fix and release a new exact version |

The shared publisher serializes runs per exact tag and rechecks release state
before building. API failures are errors, not evidence that a release is absent.
A tag event is not automatically repeated by a later branch push. Re-running a
failed workflow preserves its original source ref and commit.

Do not require a new tag to be created on every retry: the original exact tag is
the release identity. Recovery must still protect any content already published.
The pilot refuses automatic recovery once a draft or public release exists.

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

## Related

- [Delivery conventions](../conventions/delivery.md)
- [Shared delivery components](shared-delivery.md)
