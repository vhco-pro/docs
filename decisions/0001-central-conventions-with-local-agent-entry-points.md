---
title: "Central conventions with local agent entry points"
type: decision
description: "Use one personal docs repository and explicit local pointers instead of a knowledge mapper."
status: accepted
---

# Central conventions with local agent entry points

## Choice

Keep shared personal conventions in `vhco-pro/docs`. Each consumer repository
has a small root `AGENTS.md` referencing a reviewed documentation revision and
its relevant task routes. Harness-specific files point to that local entry point.

Use `conventions/`, `knowledge/`, `guides/`, and flat `decisions/`. Keep component
implementation and repo-specific commands in the implementing repository.

## Reason

This is a solo-developer setup with one shared documentation home. Explicit
links make the applicable knowledge discoverable without a pack manifest,
archetype routing, or an agent-framework dependency. A future framework can
adapt these documents without deciding today's structure.

## Alternative considered

A knowledge mapper can select and pin subsets for many project types and teams.
That extra resolution contract is not needed for the current scope.

## Consequences

Consumers must opt in; org documentation is not magically inherited. Updating a
pin is deliberate work, and unreachable knowledge is a visible failure. Shared
actions can remain under `michielvha` while conventions live under `vhco-pro`.