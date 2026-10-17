---
title: "Every repository follows the conventions"
type: decision
description: "Owner repositories follow these conventions whether or not they are onboarded; a full-SHA pin selects the revision."
status: accepted
---

# Every repository follows the conventions

## Choice

Every repository owned by `vhco-pro` or `michielvha` follows these conventions, onboarded or not.

- A repository's pin selects the revision: a link to `https://github.com/vhco-pro/docs/blob/<SHA>/...` in
  its root `AGENTS.md` or the bridges that point to it.
- A pin is exactly one full 40-character commit SHA. A short SHA, a branch name such as `main`, or several
  distinct SHAs is an invalid pin. Tools stop on an invalid pin; it never falls back to `main`.
- A repository without a pin follows the revision pinned by the tool working in it. That tool says so,
  and its first change in the repository adds the pinned `AGENTS.md` and bridges following the
  [onboarding guide](../guides/onboard-a-repository.md), merged into any existing local instructions.
- A pinned revision that lacks a page the work needs is a stop with a recommended pin bump, never a read
  from another revision.
- Unreadable docs are a stop with a report of what could not be read.
- Repository-local instructions still beat central conventions. A conflict is reported, never silently
  resolved.

## Reason

All work comes from one developer, who wants every repository to work the same way. Under
[0001](0001-central-conventions-with-local-agent-entry-points.md), an un-onboarded repository silently got
no conventions, so the same task behaved differently depending on whether onboarding had happened yet.
Explicit full-SHA pins keep what 0001 got right: every applied revision is a reviewed, immutable commit.

## Alternative considered

Keep opt-in, and let tools apply only the feature-document standard to un-onboarded repositories. That
keeps 0001 intact but leaves coding and delivery conventions unapplied until someone onboards each
repository by hand.

## Consequences

A tool working in an un-onboarded repository onboards it as part of its first change. Pins remain explicit
and are bumped deliberately. Tools resolve only explicit full-SHA pins; there is still no knowledge
mapper or automatic route selection.
