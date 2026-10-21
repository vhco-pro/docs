---
title: "Coding conventions"
type: guideline
description: "Keep implementations small, testable, and separate from workflow orchestration."
status: active
---

# Coding conventions

## Scope and structure

Make the smallest change that satisfies the request. Reuse the repository's
libraries and helpers before adding another abstraction or dependency. Preserve
unrelated work and public interfaces unless the task requires a change.

Workflows orchestrate. Substantial logic lives in `scripts/`, not YAML `run`
blocks: a `run` block longer than about 5 to 10 lines moves into a script. A
command invoking a script, setting up a standard tool, or checking a single
output can stay inline. Branching, retries, downloads with verification, range
selection, and business logic belong in scripts. A script can be linted with
`shellcheck`, read with syntax highlighting and run on its own; the same logic in
a YAML string cannot. Store substantial tool configuration in its own file too.

For a composite action, invoke its scripts through `github.action_path`, not
the caller's working directory. A reusable workflow has no scripts of its own:
steps that do the work belong in an action, which the workflow calls. `./scripts/`
after the default checkout refers to the caller's files, not the shared repo.

Keep the scripting runtime already used by the repository. New JavaScript tooling
and tests use Bun; existing Node tooling keeps working and does not have to
migrate. Shell scripts declare Bash when they use Bash
features, enable `set -euo pipefail`, and quote expansions. No framework is
required for documentation or repository instructions.

## Shared components

A repository that publishes a component names the kind it publishes:

| Publishes | Name | Called as |
| --- | --- | --- |
| Composite action | `<purpose>-action` | `uses: <owner>/<name>@<commit sha> # <tag>` |
| Reusable workflow | `<purpose>-workflow` | `uses: <owner>/<name>/.github/workflows/<file>.yml@<commit sha> # <tag>` |

The purpose says what the component does, not the tool it wraps or the team
that owns it. A repository that publishes no component takes no suffix.

One repository publishes one kind, with its own release line. When an action and
the workflow that orchestrates it are both published, they share the purpose and
differ in the suffix, for example `gh-release-action` and `gh-release-workflow`.
A component has one responsibility: if describing it needs "and", it is two
components, and the caller or a workflow composes them.

Do not rename a published repository. Every consumer pins its name. Add the
correctly named repository, migrate the consumers, and keep the old one serving
the refs that still pin it. The reusable workflows in `vhco-pro/.github` predate
this rule; they move to correctly named repositories as they change.

Where the Git tag is the release, as for an action or a reusable workflow,
consumers can use the tag as soon as it exists. Its tests run before the tag is
created.

A public component is licensed Apache-2.0, with the full licence text in a root
`LICENSE` file. The copyright line names the owner of the organization: `VH & Co
BV` in `vhco-pro`, `Michiel VH` in `michielvha`. Add the file in the pull request
that creates the repository. Do not change an existing licence as a side effect
of other work.

## Inputs and safety

Pass action inputs into scripts through environment variables or argument arrays;
never substitute untrusted expressions directly into shell code. Use structured
parsers for YAML, JSON, and tool output. Unreadable input and failed commands must
fail the check, not become an empty success.

Keep generated files and downloaded tools under a temporary or cache directory.
Do not overwrite the caller's config or change the checkout's ownership. Runtime
secrets stay in approved secret stores and never enter code, logs, or documents.

## Tests and changes

Test observable behavior and important failure paths. Prefer tests of the actual
script or action over a second implementation of its logic. Keep CI integration
checks for contracts that only the runner can prove, such as reusable workflow
access and action outputs. Do not add tests just to raise a count.

Explain changes and their verification in the PR. Use Conventional Commits as
defined in [delivery](delivery.md). Do not add AI credit trailers. Read
[Go](go.md) or [containers](containers.md) when they apply.