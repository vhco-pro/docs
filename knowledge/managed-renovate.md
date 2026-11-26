---
title: "Managed dependency updates"
type: architecture
description: "Use immutable action refs with managed Renovate pull requests instead of floating runtime updates."
status: active
---

# Managed dependency updates

The preferred updater for public and private repositories is the managed Renovate GitHub
App. Once its repository access is confirmed, repository configuration declares
the update policy. No self-hosted updater, repository-local Renovate workflow,
or updater token is needed for public dependencies. Keep existing Dependabot
coverage until the hosted service can take ownership; do not run both managers
for the same ecosystem.

The [delivery convention](../conventions/delivery.md#pinning-and-updates) owns the
pinning and approval rules. This page describes how to apply them.

## Execution identity and update identity

The full commit SHA is what GitHub executes. The adjacent verified tag comment
is what Renovate uses to find later releases and digest changes.

```yaml
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
- uses: michielvha/goreleaser-action@a86fcdf453812a9d69b85208c0cb6a1e73f136b8 # v1
```

The second line deliberately freezes the existing release action. It is not
adoption of the next major. A future major belongs in a separate reviewed update.

Local `uses: ./...` references remain local: they come from the caller's checkout.
GitHub action/reusable-workflow refs use commit SHAs; container images use their
native content digest, and Go modules keep their version and checksum files.
Do not replace those different identities with an arbitrary Git SHA.

If a branch head matches a real release tag, record that tag only after verifying
the match. If it is unreleased, label the branch/review ref honestly and keep its
updates manual or reviewed. Never attach a plausible version comment merely to
make a bot accept the dependency. Pilot commits without a recognized tracking
comment need an explicit follow-up when a release becomes available.

## Repository configuration

The configuration lives in a supported Renovate config file, not in a runner.
Keep existing repository-specific rules; the following is the baseline for new
adoptions:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", "helpers:pinGitHubActionDigests"],
  "packageRules": [
    {
      "matchManagers": ["github-actions"],
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "groupName": null
    },
    {
      "matchManagers": ["github-actions"],
      "matchDatasources": ["github-digest"],
      "automerge": false
    }
  ]
}
```

This requests SHA pinning for actions and reusable workflows. It prevents new
action majors and unversioned branch/channel changes from being merged
automatically. It does not turn on automerge for anything else. Existing approved
patch/minor merge rules and grouping remain separate policy.

A `schedule` limits when Renovate creates a branch, not when it updates one. By default an open branch
is refreshed whenever one of its dependencies publishes a release, so a grouped branch can be
force-pushed several times a day, and each push runs CI where CI runs on PRs. Set
`"updateNotScheduled": false` beside every `schedule`; the two are one setting.

The managed service needs access to the repository. A config file is not proof
that the App is installed or that its newest run succeeded. Check the Dependency
Dashboard or update PRs after adoption. Private registries or packages can require
additional credentials; public source alone does not establish that case.

## Pin and track upstream Markdown references

Use a full commit SHA in a GitHub file or directory link. To follow a live upstream source,
put a source-ref comment immediately after the link on the same line. Record the name of the
actual reviewed branch and verify that no tag has the same name. Keep historical evidence, exact
release examples and other snapshots unannotated so their references stay fixed.

```markdown
[Upstream style guide](https://github.com/OWNER/REPO/blob/FULL_COMMIT_SHA/path/to/SKILL.md) <!-- renovate: source-ref=main -->
```

In this repo, the custom manager in [renovate.json](../renovate.json) reads these comments in
`conventions/`, `guides/` and `knowledge/`. The repository and old SHA come from the link.
The comment selects the Git ref Renovate should follow. The initial set covers the pinned Terraform
and Ansible skills. For this adoption, Dependabot continues to own npm and GitHub Actions. The
existing [VHCO runner](https://github.com/vhco-pro/renovate-runner) can handle the public source
links once this configuration is on the default branch, the App can access the repository and
the repository is in the runner's target list.

Review each proposed digest change. Verify the file exists at the new commit and read the linked
file diff and its referenced guidance. A branch change elsewhere in the upstream repository can
propose an update even if the linked file did not change. Check the path, guidance and any new
commands or dependencies before merging. A move or rewrite may need a hand edit. These updates
use pull requests with automerge disabled. Updating a link does not install or run its content.
[Renovate Git refs](https://docs.renovatebot.com/modules/datasource/git-refs/) and
[regex manager](https://docs.renovatebot.com/modules/manager/regex/).

## Freeze before upgrade

1. Inventory the current refs and relevant workflows/composite actions.
2. Resolve each existing ref to its current commit. Preserve the original major
   and revision; do not combine the freeze with dependency upgrades.
3. Add the real tracking comments and verify their commit matches.
4. Validate that all external action/workflow refs are full SHAs and the workflow
   logic, permissions, triggers, inputs, and commands are otherwise unchanged.
5. Add or merge the hosted Renovate configuration. Remove duplicate version-update
   entries from another updater only when Renovate takes ownership, carrying
   forward repository-specific intent. Security alerts remain enabled.
6. Review and merge the freeze PR explicitly. A release-workflow edit can trigger
   the existing publisher on merge even when every dependency revision is
   unchanged.
7. Let Renovate propose later updates by PR. Read the changelog and CI evidence,
   keep majors separate, and promote new interfaces deliberately.

The one-time tool must not silently substitute a latest release for a branch
head. Confirm the resolved commits independently rather than treating a green
pinning command as proof that no version changed.

## Boundaries

Renovate proposes changes; it does not replace project validation or release
approval. GitHub-hosted runners can still execute tests, builds, and releases.
What is unnecessary here is a runner whose job is to operate Renovate itself.

Pinning an action does not freeze a tool that it downloads through a floating
version input. Exact tool-version inputs and verified downloads are a separate
delivery concern. Nor does preparing pin PRs make a new release workflow live:
updater adoption, code review, and release activation remain distinct steps.

## References

- [Renovate GitHub Actions manager](https://docs.renovatebot.com/modules/manager/github-actions/)
- [Digest pinning preset](https://docs.renovatebot.com/presets-helpers/#pingithubactiondigests)
- [Shared delivery components](shared-delivery.md)
- [Go release dependency snapshot](../reports/2026-10-19-go-delivery-dependencies.md)
