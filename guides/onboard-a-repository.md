---
title: "Onboard a repository"
type: guide
description: "Give a repository an explicit agent entry point to the personal conventions."
status: active
---

# Onboard a repository

Use this procedure for a repo under either `vhco-pro` or `michielvha`. Every such
repository follows these conventions, onboarded or not
([decision 0002](../decisions/0002-every-repository-follows-the-conventions.md)).
Onboarding makes the revision explicit. A tool working in a repository without a
pin uses its own pinned revision and adds the repository pin with its first change.

## Choose the documentation revision

Choose a reviewed commit of `vhco-pro/docs` containing the needed pages. Verify
the full SHA and inspect it. After adoption, update the pin deliberately in a
reviewed change. During initial setup, `main` may contain only the bootstrap
README; do not point a consumer at missing pages or silently fall back to `main`.

A pin is exactly one full 40-character SHA across the root `AGENTS.md` and its
bridges. A short SHA, a branch name or several distinct SHAs is an invalid pin:
stop and fix it.

The pin is in a small Markdown entry point, not another YAML knowledge map.
Agents can read the linked pages through GitHub or a checkout of that exact
revision. If retrieval fails, stop and state what could not be loaded.

## Add the local entry points

Create or merge a root `AGENTS.md`; never overwrite established local rules.
Replace `DOCS_SHA` below with the real selected full commit SHA:

```markdown
# Repository instructions

Read the personal conventions at
https://github.com/vhco-pro/docs/blob/DOCS_SHA/AGENTS.md
and follow the task routes there before implementation.

For all code, read conventions/coding.md at that revision.
To specify, plan or implement a feature, read conventions/feature-documents.md.
For Go, also read conventions/go.md; for images, conventions/containers.md;
for CI and releases, conventions/delivery.md and knowledge/shared-delivery.md.
For TypeScript, read conventions/typescript.md; for React, also read conventions/react.md,
including when specifying or reviewing those parts of a feature.
When onboarding or bootstrapping, read the matching guides/ page.

Load only the relevant documents. If they are inaccessible, report it and stop.
Preserve this repository's local instructions; report a conflict instead of
silently overriding either source.

## Local commands and constraints

Add `Feature documents: <path>` only when feature documents live somewhere other
than docs/internal/plans/.

List only this repo's verified build/test commands and necessary exceptions.
```

Add `.github/copilot-instructions.md` pointing to the local root file:

```markdown
Read [AGENTS.md](../AGENTS.md). It is the canonical instruction entry point.
```

For Claude, add `CLAUDE.md` containing `@AGENTS.md`. These are thin harness
bridges, not duplicated conventions. Other agents use the root file explicitly;
do not assume every tool follows external links without being instructed.

## Turn on automatic branch deletion

PR branches are temporary ([delivery](../conventions/delivery.md#git-and-versioning)).
GitHub's automatic head-branch deletion is the only setting that removes every
merged PR branch, whoever merges it. Check it, and with the owner's agreement turn
it on:

```bash
gh repo view OWNER/NAME --json deleteBranchOnMerge
gh repo edit OWNER/NAME --delete-branch-on-merge
```

This is a repository setting, not a commit, and changing it needs admin rights.
GitHub copies no settings from a template repository, so a repository created from
a template starts with it off.

## Turn on the security features

[Repository security](../conventions/repository-security.md) decides which features
a repository gets from its visibility. Read the current state first:

```bash
gh repo view OWNER/NAME --json visibility
gh api repos/OWNER/NAME --jq .security_and_analysis
gh api -i repos/OWNER/NAME/vulnerability-alerts
```

The last command returns `204` when Dependabot alerts are on and `404` when they are
off. With the owner's agreement, turn on Dependabot alerts in every repository:

```bash
gh api -X PUT repos/OWNER/NAME/vulnerability-alerts
```

In a public repository, also turn on secret scanning and push protection:

```bash
gh api -X PATCH repos/OWNER/NAME \
  -f 'security_and_analysis[secret_scanning][status]=enabled' \
  -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
```

Where the repository has a `.github/dependabot.yml` or `.github/dependabot.yaml` and no sign of
Renovate, also turn on Dependabot security updates:

```bash
gh api -X PUT repos/OWNER/NAME/automated-security-fixes
```

Check the dependency graph under Settings, Advanced Security. CodeQL and Scorecard
are workflow files in a public repository, added in a reviewed change like any other
workflow. These settings need admin rights.

## Public project presentation

For a public open-source repository, offer the
[project banner option](../conventions/documentation.md#public-project-readme-banners)
when preparing or reviewing its README.

## Check the onboarding

1. Verify every selected page exists at the pinned revision.
2. Ask the agent to name the coding and task-specific pages it read.
3. Have it identify a relevant rule, such as scripts outside YAML or the actual
   Go template, before it changes files.
4. Run the repo's checks and review exceptions. A new pointer does not prove the
   existing code is compliant.
5. Confirm `gh repo view OWNER/NAME --json deleteBranchOnMerge` reports `true`,
   or that the owner chose to leave it off.
6. Confirm the security features match the repository's visibility, or that the
   owner chose otherwise.

Update the docs pin when relevant conventions change. Do not copy the central
pages into every consumer. Tools resolve only explicit full-SHA pins; there is no
knowledge mapper or automatic route selection.
