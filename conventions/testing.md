---
title: "Testing conventions"
type: guideline
description: "Find the cause before fixing, watch every test fail against its defect, test against the real system, and read the evidence instead of trusting a green result."
status: active
---

# Testing conventions

Apply this page when you diagnose a failure, write or change a test, or decide whether a run proves a
change. [Coding](coding.md#tests-and-changes) covers what to test and how to iterate on a long suite.
[Frontend testing](frontend-testing.md) adds the browser rules: seed data, browser scenarios and
visual checks.

## Diagnose before fixing

Find the root cause before changing code. Read the first error, not the last one; later errors are
often consequences. Read what the failing process actually received: its environment, its working
directory, its arguments and its configuration. When a service is involved, read that service's log
for the same moment.

A fix removes the cause. These do not:

- A run of passes after a retry, or on a slower or less loaded machine.
- A longer timeout or an extra wait in front of an unexplained failure.
- A wider allowance, such as a looser rate limit, a broader permission or a relaxed check, that makes
  the symptom stop.

When a test fails only in a poorer environment, such as CI, a fresh container or a machine with
fewer tools, reproduce that environment locally and fix what it lacks. Rerunning in the richer
environment proves nothing. A failure that also happens on the base branch is still a failure; it is
not evidence that the problem is local.

When several failures appear at once, find the cause of each before grouping them under one
explanation.

## Prove the test catches the defect

Watch every regression test and guard fail against the defect it guards. Reintroduce the defect,
revert the fix, or remove the workaround, run the test, and see it fail for the expected reason. A
test that has never failed may not reach the code it claims to cover.

Assert the thing that separates the fixed code from the broken code. When several paths produce the
same outcome, such as one status code or one log line, assert something only the intended path
produces. Otherwise the broken code can satisfy the test through another path.

A guard over a set of cases covers only the cases it can see. When a guard checks recorded fixtures,
generated routes or discovered files, confirm the set is complete before trusting a pass.

Before changing a function's or an endpoint's contract, search the tests for assertions of the old
contract. When a test contradicts a deliberate fix, update it and record the reason in the commit or
the test. Never delete it to make the suite pass.

## Test against the real system

Prove an integration with the real consumer, client or tool, on a running system, through to the
state the user ends in. Unit tests against the shape of an interface cannot show that a real client
sends what the server expects. A design premise is checked at the outcome the user sees, not only at
the code that decides it.

When a fake stands in for another system, make it enforce that system's rules: authentication,
validation and refusal paths. A fake that accepts what the real system refuses lets broken code pass.
Build error fixtures from output the real tool produced, not from hand-written examples.

Prove installation and upgrade paths on a fresh environment. A long-lived development environment
hides bootstrap defects, because it never runs its first start again. For a change to persistent data
or its schema, start from the previous release's state with representative data, upgrade, and check
the result. An empty database migrated by the tests is not evidence of the upgrade path.

## Read the evidence

A pass is evidence only when the run executed the tests that matter.

- Run evidence uncached. A test runner that reuses earlier results, such as `go test` without
  `-count=1`, replays a verdict from another environment.
- Read the run for skipped tests, not just the final status. A test that needs a dependency, a
  service or a file fails when that dependency is missing; it does not skip and report green.
- A local replica of CI uses CI's toolchain and the installed dependencies match the lockfile. Check
  versions before treating a local pass as CI-matching evidence.
- Evidence belongs to one exact commit. Before citing a CI run, confirm that it ran on your commit and
  finished, not on a neighbouring commit or an earlier push.

## Isolate tests

Each test creates the shared state it asserts on. A test that relies on data another test or an
earlier run left behind passes on a long-lived environment and fails on a fresh one. Work out what
must exist before any test loads, such as files read when a test file is collected, and create it in
setup.

Clean up only what the test created, identified by unique names or recorded identifiers. Never truncate,
drop or sweep a store that other tests, parallel workers or people also use: a global cleanup deletes
data another worker is still using.

Check every cleanup's result. A cleanup that ignores an error leaves state behind and hides the
cause. Clean up in an order that respects dependencies between the things created.

Label out-of-process resources a test creates, such as containers, processes and temporary
directories, and reap them by label. A test binary that hits its timeout runs no cleanup.

A child process inherits the environment of the test that starts it. When a test changes `HOME`,
`PATH` or a tool's configuration for itself, give the child an explicit environment.

Tests that a Git hook runs inherit the hook's Git environment. Git sets `GIT_INDEX_FILE`, and from a
worktree also `GIT_DIR` and related variables, for the repository being committed to. A test that
builds a fixture repository with `git init`, `git add` or `git commit` clears those variables first,
or it changes the real repository instead of its fixture.

## Wait on readiness

Wait for an observable condition, never for a fixed time. Poll the condition the next step needs:
the health endpoint answering, the record existing, the element being interactive rather than just
visible. A sleep is too short on a busy machine and wasted time on an idle one.

Before a long or detached run, check the environment it will use in that same runtime: the checkout
reads cleanly, dependencies resolve offline when the run is offline, the endpoint under test
answers. Set up failure reporting before that check, so an early exit still reports.

Classify each failure by reason before acting on it. An environment failure, such as a missing tool,
an unreachable service or a full disk, is reported as that, never as a test result or as a product
verdict. A test that fails only after another test ran is order-dependent: rerun it alone, and find
the state the earlier test leaves behind.
