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

Use the dependency manager already configured in the repository. Dependabot and
Renovate are both valid. Keep digest pinning enabled where supported, group
compatible patch/minor updates when useful, isolate major changes, and read the
release notes. Green CI is evidence, not approval to merge. Do not switch managers
or enable automerge without a request.

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

Use full history and tags for GitVersion and release-note ranges. PR checks must
not publish releases, push images, or move tags. Dry-run paths still compute
real versions and render relevant notes. Serialize publication where competing
runs could conflict. Test before publication, preserve exact tags on retries,
and surface failures instead of treating them as an absent release.