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
blocks. A command invoking a script, setting up a standard tool, or checking a
single output can stay inline. Branching, retries, downloads with verification,
range selection, and business logic belong in scripts. Store substantial tool
configuration in its own file too.

For a composite action, invoke its scripts through `github.action_path`, not
the caller's working directory. For a reusable workflow, explicitly check out
its helper files at the same immutable revision as the workflow. `./scripts/`
after the default checkout refers to the caller's files, not the shared repo.

Keep the scripting runtime already used by the repository. New JavaScript tooling
and tests use Bun; existing Node tooling keeps working and does not have to
migrate. Shell scripts declare Bash when they use Bash
features, enable `set -euo pipefail`, and quote expansions. No framework is
required for documentation or repository instructions.

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