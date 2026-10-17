---
title: "Feature document template"
type: guide
description: "Copy this template to start a feature document under the feature-document standard."
status: active
---

# Feature document template

Copy the block below into the repository's feature root, named `<slug>.md`. The
[feature-document standard](../conventions/feature-documents.md) defines every section and line format.
Replace each placeholder; never leave invented owners, dates, links or decisions behind.

````markdown
---
status: draft
status_description: "Being written; not yet reviewed."
issue: null
goal: "One observable outcome."
covers:
  - path/to/implementation/
---

# Plan: <Title>

<One or two sentences on what this delivers.>

## Context

<Why this is needed. Cite every claim about the current state with file:line, or a command and its output.>

## Scope

<What is in scope. Out of scope, by name: what someone might reasonably expect but will not get.>

## Design

<The design and its interfaces. Reference files and symbols; do not paste code.>

## Acceptance Criteria

- [ ] AC-01: <The end state, observable without reading the code.>

## Test Plan

| Criterion | Proof |
| --- | --- |
| AC-01 | <The test, scenario or written manual procedure> |

## Tasks

None yet; written once the document is planned.

## Open Questions

### Q1: <The question, as one plain sentence>

**Recommendation:** A. <The option, and one line on why.>

| Option | You get | It costs |
| --- | --- | --- |
| **A. <Name>** | <Benefit> | <Cost> |
| **B. <Name>** | <Benefit> | <Cost> |

**Why this is yours:** <What makes it a judgement call.>

## Review Log

| Date | Review | Kind | Commit | Model | Isolation | Outcome |
| --- | --- | --- | --- | --- | --- | --- |

## Sources

- [<Page title>](<exact URL>): <the claim it supports>
````
