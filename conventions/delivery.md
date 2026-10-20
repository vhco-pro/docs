---
title: "Delivery conventions"
type: guideline
description: "Review immutable delivery inputs and publish exact versions through shared components."
status: active
---

# Delivery conventions

## Git and versioning

Use short-lived branches and review changes through PRs. Conventional Commit
subjects determine version intent: `feat` is minor; `fix`, `chore`, `perf`,
`refactor`, and `revert` are patch; `!` on the type/scope or an uppercase
`BREAKING CHANGE:` or `BREAKING-CHANGE:` footer is major. `docs`, `style`, `test`,
and `ci` do not normally bump the version. The shared action's selected config
is authoritative.

Patch bumps for `chore`, including Renovate's `chore(deps)`, are an intentional
personal policy so dependency updates release the changed software. A later
documentation commit must not suppress that bump. A feature or breaking change
in the same history still takes precedence.

Consumers must adopt an action revision carrying this policy. An older pinned
revision or custom config can still treat chores differently; a docs change does
not upgrade an existing workflow pin automatically.

Publish exact semantic versions. Do not create or move major/minor alias tags.
Choose one component to decide the version and one path to publish the release;
do not recompute or publish it independently in parallel jobs.

## Feature delivery

A feature follows the [feature-document standard](feature-documents.md).

- **Documents first on the default branch.** Until a feature document has a `branch` field, it is
  committed and pushed to the default branch, with any first-run onboarding files and nothing else.
- **Code on a feature branch.** Implementation starts with one claim commit on the default branch that
  sets `in-progress` and `branch`, pushed so other sessions see it. The feature branch, named
  `<conventional type>/<slug>` such as `feat/review-freshness`, starts at that commit. From then on the
  document is edited only on that branch and returns to the default branch with the PR.
- **One PR per feature** or child feature, not per phase. Feature PRs land by merge commit or fast-forward,
  never squash, so the commits its Review Log cites stay reachable.
- **One writer per feature.** Separate features may run in parallel worktrees. A claim advertises a branch;
  it is not a lock. Another session takes over a feature only after the owner confirms the earlier writer
  has stopped. Never force-checkout, reset, prune or delete a worktree to take one over.
- **Review committed work.** Commit relevant changes before an implementation review; only a review of an
  exact commit can complete a feature. Leave unrelated staged, unstaged and untracked work untouched.
- **Skip CI only for documentation.** A delivery whose commit, outgoing push range and PR diff all change
  only feature documents or Markdown onboarding files carries `[skip ci]`. Any code, test, workflow or
  other change in the delivery runs normal CI, even when its last commit is documentation-only. Report a
  skipped run as skipped, never as a pass. Never bypass branch protection or rewrite a pushed commit to
  remove the marker.

Issue linkage: one issue per feature document. A PR says `Closes #N` only when every criterion is met and
closure is authorised; otherwise it says `Refs #N` and names what remains. A residual needs a durable
tracker before the feature is complete.

## Pinning and updates

Pin external GitHub Actions and reusable workflows to full 40-character commit
SHAs. Add the actual release version as a trailing comment when that SHA belongs
to a verified release. For reviewed but unreleased changes, identify the review
ref honestly; never label a PR commit as a released version.

Verify the ref exists and inspect the code at that ref. Repository names that
look like versions can be branches, and a tag can move. A SHA is the execution
identity; the comment is a human-readable label.

The preferred updater for public repositories is the managed Renovate GitHub App,
maintaining action, workflow, and package dependencies through pull requests.
Until its repository access is confirmed, retain the existing Dependabot
configuration rather than leaving a coverage gap or running both for the same
ecosystem. Keep GitHub Actions
digest pinning enabled with `helpers:pinGitHubActionDigests`. The hosted service
runs the updater; do not add a Renovate workflow, runner, scheduler, or updater
token to each public repository. Project CI still validates the proposed changes.

Keep the released tag as a truthful comment beside the executable SHA so Renovate
can track its version and digest. A bare SHA without a recognized tracking
comment may receive no updates. Do not invent a released version for an
unreleased commit.

Make the initial SHA freeze separately from version upgrades. Resolve the current
ref, including annotated tags, to its commit and verify that the replacement is
the same revision. Choosing the latest release instead of the current branch
head is an upgrade, not a pin-only change.

Isolate action majors and require their review. Unversioned branch/channel digest
updates also need review, because their digest changes carry no semantic-version
compatibility promise. Compatible patch/minor grouping and existing approved merge
rules remain repository-specific. Do not enable additional automerge or bypass CI
or branch protection as part of a pinning change.

When migrating updater ownership, remove overlapping Dependabot version-update
entries only after the managed service covers those ecosystems. Preserve
repository-specific commit types and grouping where appropriate. Do not disable
security alerts or close someone else's existing update PRs as cleanup.

See [managed dependency updates](../knowledge/managed-renovate.md) for the
configuration and rollout procedure. Green CI is evidence, not approval to merge
or to publish a release.

Download executable tools at an exact version and verify an independently pinned
checksum before executing them. Do not silently accept a different preinstalled
version. Store tool configuration once, next to its owning component.

## Workflows and permissions

Keep substantial logic in scripts as defined in [coding](coding.md). Reuse the
verified public components listed in [shared delivery](../knowledge/shared-delivery.md),
including those under `michielvha`; do not invent a `vhco-pro` equivalent.

Use least-privilege job permissions. A public reusable workflow can be called
across accounts, and its token acts on the caller repository. Both caller and
callee must permit the operation; no extra PAT is needed just to read a public
workflow. Do not pass all secrets when none are required.

Use full history and tags for GitVersion and release-note ranges. Ordinary PR
validation and packaging checks remain unprivileged and do not publish releases,
push images or create source tags.

The proposed [PR preview policy](../knowledge/tag-driven-go-releases.md#proposed-pr-preview-policy)
uses a persistent `release:preview` label enabled by a repository writer. It
requests prerelease tags for successful revisions of that open PR until the
label is removed. Consumers must explicitly adopt the workflow change before
this behavior is available. Publication remains a separate exact-tag-triggered
workflow; a branch or label event never publishes directly.

Callers choose feature-branch-plus-PR or PR-only development checks according
to cost and feedback needs. Shared workflows do not impose feature-push
triggers. Main integration and exact-tag release validation keep their own
purpose. GitVersion's selected branch configuration, history and tags remain
the version authority; PR metadata only controls preview eligibility.

Dry-run paths still compute real versions and render relevant notes. Serialize
publication where competing runs could conflict. Test before publication,
preserve exact tags on retries, and surface failures instead of treating them
as an absent release.