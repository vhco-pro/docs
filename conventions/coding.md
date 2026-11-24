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

Keep the scripting runtime already used by the repository: where its tooling and
tests run on Node, new tooling and tests use Node too. Bun is the default only in a
repository with no established JavaScript runtime. Shell scripts declare Bash when they use Bash
features, enable `set -euo pipefail`, and quote expansions. No framework is
required for documentation or repository instructions.

`set -e` does not reach everywhere. Bash suppresses it inside a function called from a condition (`if f`,
`f || x`, `f && x`), so such a function checks each command it depends on. A pipeline reports its last
command's status, so never trim a command's output with `cmd | tail` without `pipefail`; write the output
to a file and report the command's own status. Under `pipefail`, a consumer that exits early, such as
`grep -q`, can fail the producer with SIGPIPE: let a check read the whole stream. Bash reads a script
while it runs, so never edit a script a process is executing; change a copy or wait for the run to end.
Stop a process by the PID you recorded when you started it, never with `pkill -f` and a pattern your own
command line also contains.

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
the refs that still pin it. The release workflows have moved out of `vhco-pro/.github`; its
remaining CodeQL and Scorecard workflows move as they change.

Where the Git tag is the release, as for an action or a reusable workflow,
consumers can use the tag as soon as it exists. Its tests run before the tag is
created.

A public component is licensed Apache-2.0, with the full licence text in a root
`LICENSE` file. The copyright line names the owner of the organization: `VH & Co
BV` in `vhco-pro`, `Michiel VH` in `michielvha`. Add the file in the pull request
that creates the repository. Do not change an existing licence as a side effect
of other work.

## Configuration format

Configuration a person writes or reviews is YAML. Never choose JSON for it. Settings files we define use
the `.yaml` suffix and load strictly. A file an external tool defines keeps that tool's format. Generated
files and machine-to-machine output may be JSON.

## Inputs and safety

Pass action inputs into scripts through environment variables or argument arrays;
never substitute untrusted expressions directly into shell code. Use structured
parsers for YAML, JSON, and tool output. Unreadable input and failed commands must
fail the check, not become an empty success.

Checks fail closed: when a check cannot determine its answer, it refuses. An exit status of 0 from an
external tool proves only that the tool exited; before trusting it, run the tool's failure cases and see
what it reports for them. A fallback announces itself, through a log line, a warning or a metric, so a
feature that never ran is visible; never swallow an error around an optional dependency. A counter
counts what happened, not what was attempted. When a change tightens a gate, list every caller of what it
guards, including first-time and recovery flows, and test each one. A process that runs user-supplied
code gets an explicit allowlisted environment, never the parent's environment, which holds the platform's
credentials.

A scoped credential, such as an API key limited to one tenant or a delegated token, is checked against
its scope alone. When the scope check fails, refuse; never fall back to the permissions of the person who
owns the credential, which silently widens a narrow token to its owner's full access.

Classify errors from a driver, database or library in one shared helper that inspects the error's type
or code, never by matching message text at each call site. Message text changes between drivers and
versions, and a copy that stops matching turns an expected error into a crash or a 500.

Never delete persistent data, such as a database, a volume, a bucket or a backup, without the owner's
approval naming the exact target. Prefer removing one named resource over a command that removes
everything of its kind.

Keep generated files and downloaded tools under a temporary or cache directory.
Do not overwrite the caller's config or change the checkout's ownership. Runtime
secrets stay in approved secret stores and never enter code, logs, or documents.

## Tests and changes

Test observable behavior and important failure paths. Prefer tests of the actual
script or action over a second implementation of its logic. Keep CI integration
checks for contracts that only the runner can prove, such as reusable workflow
access and action outputs. Do not add tests just to raise a count; [test strategy](test-strategy.md)
decides which layer proves a behaviour and when a test earns its place.
[Testing](testing.md) covers diagnosing a failure, proving a test catches its
defect, and reading a run's evidence.

A long end-to-end suite, such as one that builds a cluster, is not the loop for fixing what it finds.
Keep its environment, load only what a fix changed, and rerun only the failing tests and their
neighbours. Order the suite so the areas under change fail first. Run the whole suite once, on the
final change, as its own detached job so a tool's time limit cannot cut it short.

When a path moves, such as a call that moves to another process or an old API that gets a replacement,
find every caller and trigger of the old path and move them all in the same change, then delete the old
path. A path left behind for one caller keeps working by accident and drifts.

Treat a review finding, a spec's claim and a code comment as hypotheses. Before acting on one, read the
code at the revision you ship, and probe the library's actual behavior when the claim depends on it; an
interface comment is not proof of what an implementation does. Before handing off a plan, verify each of
its file and line citations and each claim that something exists or is missing, trying to refute it, and
check every path when the code has more than one that does the same job.

Explain changes and their verification in the PR. Use Conventional Commits as
defined in [delivery](delivery.md). Credit no AI assistant: no trailer, footer or credit line in
commits, PRs, issues or documents. Read
[Go](go.md) or [containers](containers.md) when they apply.