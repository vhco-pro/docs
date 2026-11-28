---
title: "Delivery conventions"
type: guideline
description: "Review immutable delivery inputs and publish exact versions through shared components."
status: active
---

# Delivery conventions

## Git and versioning

Use trunk-based development: the default branch is the integration trunk and PR
branches are temporary. Enable GitHub's `delete_branch_on_merge` setting on each
repository. After a confirmed merge, delete the remote PR branch if GitHub has
not already removed it. Before deleting a stale branch, prove its current tip
is merged: it is reachable from the current default branch, or it is contained in
the head commit GitHub recorded for a merged PR from that branch, which covers
squash and rebase merges. A previously merged PR alone is not proof because its
branch may have gained new commits.

Do not delete the default branch, protected branches, active PR branches, or
branches with unpublished or unmerged commits. Local cleanup is separate:
delete only merged local branches that are not checked out in any worktree.
Use `git branch -d`; a squash-merged branch, which `git branch -d` refuses, may
be removed with `git update-ref -d refs/heads/BRANCH TIP` once the tip is proven
merged. Never use `git branch -D`. Remove a worktree only when the owner asks,
only when it is clean, and only with `git worktree remove` without `--force`.
Report any branch that cannot safely be removed.

Treat every checkout as shared: other sessions and worktrees may hold uncommitted work in it. Sync with
`git fetch` and `git merge --ff-only`; never run `git reset --hard` or `git checkout -- <path>` over
changes you did not make. Set work aside on a branch or with a named commit, never with a bare
`git stash`, because every worktree of a repository shares one stash stack. Before opening or merging a
PR, confirm `git log --oneline origin/<default>..HEAD` lists only your commits: a branch cut from a
local default branch that was ahead of its remote carries someone else's work. A non-feature branch
drops such duplicates with a rebase; a feature branch merges the default branch in instead (see
[Feature delivery](#feature-delivery)).

Commit as the identity Git is configured with; never set an author name or email for a commit. Name a
branch for its change with a Conventional Commit type prefix, such as `fix/stale-cache`, and never with
an assistant, model or harness name.

Use short-lived branches and review changes through PRs. A private repository with one developer
and a full local check (see [CI by repository visibility](#ci-by-repository-visibility)) may record in
its local instructions that small, contained, verified changes go straight to the default branch: one
independently reviewable correction with a clear cause and bounded impact, every applicable local
check passed. Features, migrations and changes to public contracts, authentication or deployment
behavior still use a branch and a PR. Conventional Commit
subjects determine version intent: `feat` is minor; `fix`, `chore`, `perf`,
`refactor`, and `revert` are patch; `!` on the type/scope or an uppercase
`BREAKING CHANGE:` or `BREAKING-CHANGE:` footer is major. `docs`, `style`, `test`,
and `ci` do not normally bump the version. The shared action's selected config
is authoritative. A commit body explains why the change was made, which the diff cannot show.

Patch bumps for `chore`, including Renovate's `chore(deps)`, are an intentional
personal policy so dependency updates release the changed software. A later
documentation commit must not suppress that bump. A feature or breaking change
in the same history still takes precedence.

Consumers must adopt an action revision carrying this policy. An older pinned
revision or custom config can still treat chores differently; a docs change does
not upgrade an existing workflow pin automatically.

Use the GitVersion configuration bundled with the action. A repository-specific
GitVersion file is an exception that its README must justify.

Tag every release `v` followed by its semantic version: `v1.2.3`,
`v1.3.0-feature.1`. The tag carries the `v`; the version inside artifacts, file
names and package metadata does not (`app_1.2.3_linux_amd64.tar.gz`). SemVer
calls the prefix a convention, not part of the version, but Go modules and the
Terraform Registry require it, and GitHub Actions use it. A mixed estate breaks
tooling that builds a tag from a version.

To move a repository from unprefixed tags, first tag the commit of its latest
release with the same version plus `v` (`v0.6.2` beside `0.6.2`). GitVersion
reads both, and the action looks only for the `v` tag before pushing, so without
that baseline the first run republishes the current version. A tag on an old
commit starts no release when that commit's workflows have no tag trigger;
check before pushing it. Update anything that builds a download URL from the
version, such as a Homebrew formula.

Publish exact semantic versions. Do not create or move major/minor alias tags.
Choose one component to decide the version and one path to publish the release;
do not recompute or publish it independently in parallel jobs.

## Static sites on Cloudflare

For pipeline-driven Cloudflare static hosting, follow the
[static-site standard](cloudflare-static-sites.md). It selects the official
Wrangler action and includes a complete consumer pipeline example.

## Feature delivery

A feature follows the [feature-document standard](feature-documents.md).

- **Documents first on the default branch.** Until a feature document has a `branch` field, it is
  committed and pushed to the default branch, with any first-run onboarding files and nothing else.
- **Code on a feature branch.** Implementation starts with one claim commit on the default branch that
  sets `in-progress` and `branch`, pushed so other sessions see it. The feature branch, named
  `<conventional type>/<slug>` such as `feat/review-freshness`, starts at that commit. From then on the
  document is edited only on that branch and returns to the default branch with the PR.
- **One PR per feature** or child feature, not per phase. Feature PRs land by merge commit or fast-forward,
  never squash, so the commits its Review Log cites stay reachable. For the same reason, a feature branch
  takes follow-ups as new commits and the default branch by merge; it is never amended, rebased or
  force-pushed once a review has cited its commits.
- **One writer per feature.** Separate features may run in parallel worktrees. A claim advertises a branch;
  it is not a lock. Another session takes over a feature only after the owner confirms the earlier writer
  has stopped. Never force-checkout, reset, prune or delete a worktree to take one over.
- **Review committed work.** Commit relevant changes before an implementation review; only a review of an
  exact commit can complete a feature. Leave unrelated staged, unstaged and untracked work untouched.
- **Prove the real release path.** A feature document names every artifact its change affects and the
  path that builds and publishes each one: images, packages, charts, mirrored or synced repositories, and
  the workflows between them. Before merge, a check rebuilds each artifact the way that path builds it, not
  only the way the main repository's CI builds it. After merge, the feature is delivered once every one of
  those paths has published, not when the merge's own CI passes. A change that names an artifact version
  another release publishes, such as an image tag, package or module version, merges only after that
  release exists; until then the reference points at nothing.
- **Skip CI when no check could change its verdict.** CI on GitHub-hosted runners costs nothing for a
  public repository, but a private repository spends a limited budget of minutes, and a long-running suite
  wastes time and capacity in any repository. So CI does not run for a delivery it cannot judge
  differently; this matters most for private repositories and for suites that take long to run. A delivery whose commit, outgoing push range and PR diff all change
  only feature documents or Markdown onboarding files carries `[skip ci]`. A repository may also declare
  extra skip-eligible paths (`skip_ci_paths` in its loop settings): agent instructions, development-only
  scripts that no build or release runs, editor configuration, and other files no build or release reads.
  It may also record, in its local instructions with the reason, that comment-only or formatting-only
  changes skip CI, or that a documentation publisher it runs separately covers its public docs. A delivery
  that changes only those paths, feature documents and onboarding files carries the marker too. Any other code, test, workflow or change in the delivery runs
  normal CI, even when its last commit is documentation-only. Report a skipped run as skipped, never as a
  pass. Never bypass branch protection or rewrite a pushed commit to remove the marker. GitHub honours the
  marker anywhere in a commit message, so push skip-eligible commits separately from code, and before
  squash-merging a PR that holds code, remove every `[skip ci]` from the squash message, whose default body
  concatenates every commit message in the PR.

Issue linkage: one issue per feature document. A PR says `Closes #N` only when every criterion is met and
closure is authorised; otherwise it says `Refs #N` and names what remains. A residual needs a durable
tracker before the feature is complete. The same holds for every PR and tracking issue, inside a feature
or not: a PR that resolves only part of an issue says `Refs`, so it cannot close a multi-item issue on
merge.

## Pinning and updates

Pin external GitHub Actions and reusable workflows to full 40-character commit
SHAs. Add the actual release version as a trailing comment when that SHA belongs
to a verified release. For reviewed but unreleased changes, identify the review
ref honestly; never label a PR commit as a released version.

Verify the ref exists and inspect the code at that ref. Repository names that
look like versions can be branches, and a tag can move. A SHA is the execution
identity; the comment is a human-readable label.

The preferred updater for public and private repositories is the managed Renovate GitHub App,
maintaining action, workflow, and package dependencies through pull requests.
Until its repository access is confirmed, retain the existing Dependabot
configuration rather than leaving a coverage gap or running both for the same
ecosystem. Keep GitHub Actions
digest pinning enabled with `helpers:pinGitHubActionDigests`. The hosted service
runs the updater; do not add a Renovate workflow, runner, scheduler, or updater
token to each repository. Project CI still validates the proposed changes; in a private
repository that is the local command ([CI by repository visibility](#ci-by-repository-visibility)).
[Repository security](repository-security.md) covers the alerts and scanning that
sit beside the updater.

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

Every dependency must be discoverable by the repository's update tool, or it
silently stops being updated. Pin a tool in a manifest that tool reads: a
`requirements.txt` with `--hash` lines, `go.mod`, a lockfile, a Dockerfile `FROM`,
or an action SHA with its tag comment. A version and checksum hardcoded in a
script are invisible to Dependabot and Renovate. When a tool has no supported
manifest, use a Renovate custom manager that matches the pin, and put the pin
where that manager looks. Adding a dependency includes confirming the updater
will propose its next version.

## CI by repository visibility

GitHub-hosted runners are free for public repositories, but private repositories spend a limited
budget of Actions minutes. A repository's visibility decides where its CI runs.

- **Public repositories run CI on GitHub.** Push and PR triggers stay as the repository needs them.
- **Private repositories run CI on the developer's machine.** One read-only command, such as
  `make verify`, runs every check the hosted workflows would run: formatting, linting of whole modules,
  tests, builds and the secret scan. It reports problems and fixes nothing, so a local pass predicts a
  hosted one. It runs the linters and formatters at the versions CI pins and warns when an installed
  version differs, because one configuration can give a different verdict under another release.
  A committed pre-commit hook runs it for the checks the staged change affects, and the full
  command runs before every push. The hook lives in the repository (for example `.githooks/`, enabled
  with `git config core.hooksPath .githooks`), and the local instructions name the command and the hook
  setup. In the vh-adlc loop, declare the command as a verification rung and set `ci_trigger: manual`.
- **Hosted checks in a private repository run only on request.** Check workflows trigger on
  `workflow_dispatch` alone, with no `push`, `pull_request` or `schedule` trigger. Dispatch a run only
  when hosted evidence is needed, such as an operating system the developer cannot run. Do not make a
  branch rule require a status check that no automatic trigger produces.
- **Publication stays on GitHub.** Workflows that tag, sign or publish keep their default-branch or tag
  triggers, because their credentials do not belong on a developer machine. A merge to the default
  branch is the only routine CI spend in a private repository.
- **Validate dependency PRs locally.** A Renovate or Dependabot PR in a private repository gets no
  automatic run. Run the local command on its branch, or dispatch a run, before treating it as checked.
- **Report what ran.** A hosted check that did not run is not a pass. Report the local command's result
  at the pushed commit, and hosted CI as not triggered by policy.
- **The owner may keep hosted checks.** A private repository keeps automatic check triggers only when
  the owner chooses that for it, recorded in its local instructions with the reason. Tooling warns about
  a private repository on automatic CI and never blocks it.
- **Change with the visibility.** When a private repository becomes public, restore its push and PR
  triggers in the same change. When a public repository becomes private, make its check workflows
  manual and move their checks into the local command before the next push.

### Infrastructure checks

1. **Document the native commands.** Developers can run each tool to diagnose a failure. If several
   commands routinely run together, use the existing check entry point or a short script. Return the
   tool's failure and keep verification read-only. Prefer the repo's existing entry points before
   adding a task runner or toolchain container.
2. **Keep Git hooks fast.** Use an opt-in repository Git hook for quick local checks on the relevant
   staged paths. Leave dependency downloads, expensive scans and fixture provisioning for the full
   check. The full check must catch the same failures as the hook.
3. **Use the shared hosted check pattern.** Follow [GitHub Actions](github-actions.md) for pinned setup
   actions and thin workflows. If several repos need the same check, use separate composite actions
   for Terraform or OpenTofu checks and Ansible checks. Keep the tool logic callable locally. Test a
   pass and an expected failure. Public reusable components test synthetic fixtures in their own CI.
4. **Keep check jobs read-only.** Use fixture data and keep deployment credentials out of check jobs.
   Keep existing project secret scanning in place.

Keep using Make where the repo already uses it. `just` and Task can group commands and make checks
easier to find. Each adds a prerequisite. GitHub Actions runs hosted checks and reports their
status. Keep the same native commands available to developers and Git hooks.

## Workflows and permissions

Keep substantial logic in scripts as defined in [coding](coding.md), and build actions and workflows
as [GitHub Actions](github-actions.md) describes. Reuse the verified public components listed in
[shared delivery](../knowledge/shared-delivery.md), including those under `michielvha`. Create new shared
components in `vhco-pro`, and never duplicate one that already exists.

Use least-privilege job permissions. A public reusable workflow can be called
across accounts, and its token acts on the caller repository. Both caller and
callee must permit the operation; no extra PAT is needed just to read a public
workflow. Pass each secret by name and never use `secrets: inherit`.

Use full history and tags for GitVersion and release-note ranges. Run versioning
from branch runs, where GitVersion sees the real branch; a `pull_request` run has
the merge ref and never tags. Check jobs receive no tagging or signing keys.

The [PR preview policy](../knowledge/tag-driven-go-releases.md#pr-preview-policy)
uses a persistent `release:preview` label: while it is on an open PR, each push
that passes CI gets a prerelease tag from GitVersion. Public callers choose branch-push
or PR-only CI by cost; in a private repository a preview needs a dispatched run
([CI by repository visibility](#ci-by-repository-visibility)). Only the exact tag push publishes.

Decide what a push releases by comparing against the last release tag, never against `HEAD~1`: one push
can carry many commits, and a check that sees only the last one misses changes in the others. A release
job that commits back to the default branch, such as a version or dependency bump, expects the branch to
move while it runs: it rebases onto the current branch and retries its push a bounded number of times, and fails with a clear error
on a conflict or when the attempts run out. Recover such a job with a fresh dispatch on the current head, not a re-run,
which repeats the original checkout. A tag-triggered publication is different: re-run its failed jobs at
the same tag within GitHub's 30-day limit, and after that dispatch it for the exact tag
([GitHub Actions](github-actions.md#release-triggers-and-recovery)).

Dry-run paths still compute real versions and render relevant notes. Serialize
publication where competing runs could conflict. Test before publication,
preserve exact tags on retries, and surface failures instead of treating them
as an absent release.
