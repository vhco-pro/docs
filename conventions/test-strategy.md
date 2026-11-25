---
title: "Test strategy"
type: guideline
description: "Decide which layer proves a behaviour, keep each layer inside a measured time budget, treat flaky tests as defects, remove tests only on evidence, and run the affected tests before the full suite."
status: active
---

# Test strategy

Apply this page when you add, move or review a test, or when a suite has grown slow. It decides where
a test belongs and whether it earns its place. [Testing](testing.md) decides whether a single test can
be trusted: that it fails against its defect, runs against the real system and reports honest
evidence. Follow both; this page never relaxes a rule there.

## Layers by what a test may use

Assign every test to a layer by the resources it uses, not by what its directory or framework calls
it. A test that uses a resource above its layer belongs to the higher layer, with that layer's budget.

| Layer | May use | Only this layer can prove |
| --- | --- | --- |
| Small | One process: memory, the test's own temporary files, a fake clock. No network, no sleep, no child process. | Logic, edge cases and error paths of one unit, quickly enough to run on every save. |
| Medium | One machine: local services such as a database or a server in a container, child processes, localhost network. | A query against the real engine, a migration, a handler behind real middleware, a real client against a local server. |
| Large | Several machines, a cluster, external networks, production images or a real browser. | Deployment, upgrade from the previous release, cluster behaviour, and the user journeys in [frontend testing](frontend-testing.md). |

Prefer the smaller layer whenever it can prove the behaviour. A small test is the fastest and the
least flaky; a large one is the most faithful and the most expensive.

## Prove each behaviour once, at the lowest layer that can

Write the test for a behaviour at the lowest layer that can prove it. A higher layer repeats the
behaviour only for the part the lower layer cannot reach: a real client, a real engine, a production
image, an upgrade or a browser journey. State that part in the higher test's name or comment.

- When a higher-layer test finds a defect that no lower test caught, add the lower test that
  reproduces it, then keep the higher test only if it still proves something the lower one does not.
- Test a behaviour through the public interface its users call, so a refactor that keeps the
  behaviour leaves the test unchanged.
- A test asserts the property it claims. A test named for idempotence checks that the second run
  changed nothing, not only that it returned no error; see
  [testing](testing.md#prove-the-test-catches-the-defect).
- A table of edge cases belongs in a small test. A medium or large test covers one representative
  case of each path that needs the real resource.

## Shared setup runs once

Expensive shared setup runs once per package or test run, never in per-test setup. This covers
schema migration, creating a database or a cluster, starting a server and installing dependencies.
Per-test setup creates only the test's own rows or resources, which [testing](testing.md#isolate-tests)
requires each test to own. For Go, put the shared setup in `TestMain` or a `sync.Once` fixture; see
[Go](go.md#tests).

Schema migrations converge. Running the migration a second time on a migrated database issues no
schema change. A project with automatic migrations keeps a test that migrates a database, migrates it
again, and fails if the second run changes anything. It asserts on the statements or the schema
the second run produced; a check for "no error" passes while every run rewrites columns. A migration that never converges also makes
every test that runs it pay its full cost.

## Time budgets

Each layer has a time budget per test and per package or file. Start from these and record the
project's own values in its testing documentation. The package budgets follow Bazel's default
timeouts for each test size; the per-test budgets are this page's choice.

| Layer | Per test | Per package or file |
| --- | --- | --- |
| Small | 1 second | 1 minute |
| Medium | 30 seconds | 5 minutes |
| Large | 5 minutes | 15 minutes |

- A test or package over its budget fails the review, like a failing assertion. Fix the cause or
  move the test to the layer whose budget fits, with the reason recorded.
- Report setup time separately from test time, per package, so a slow per-test setup shows as setup
  cost. A suite that only reports its total hides a 15 second setup repeated 400 times.
- Measure on CI's hardware, uncached, and record the numbers with the date, so growth is visible
  between runs. Raise a budget only with the measurement and the reason in the change.
- Keep the runner's timeout above the budget, never as the budget. A package that reaches its
  runner's timeout is already a defect.

## Flaky tests are defects

A test that passes and fails on the same code is flaky. Find its cause with
[diagnose before fixing](testing.md#diagnose-before-fixing). The common causes are waits on time
instead of [readiness](testing.md#wait-on-readiness), concurrency and order dependence on state
another test left behind.

Most flaky tests are flaky from the day they are written. Before a new test merges, run it
repeatedly and fix it if any run fails:

- A new medium test runs ten times in a row, for Go with `-count=10`.
- A new large test, such as one that needs a cluster or a browser, runs three times, targeted at that
  test alone, on a kept environment.

Until the cause is fixed, quarantine the test:

- Open an issue that names the test, the failure seen, an owner and a fix-by date one week out.
- Mark the test as quarantined in the code, linking that issue, so it runs outside the gating suite
  and keeps reporting its results.
- At the date, fix the test or delete it under [removal](#removal-needs-evidence). An expired
  quarantine is not extended without a new reason in the issue.

Report every retry. A test runner that reruns failed tests and reports green hides the defect; a
retry that passes still records the test as flaky.

## Removal needs evidence

A test may be merged into another, moved down a layer or deleted when evidence shows the behaviour
it guards stays covered. Name the evidence in the change:

- coverage of the same lines and branches by the remaining tests, from a coverage report of the
  run before and after the change, or
- mutation evidence: the mutants the removed test killed are still killed by the remaining tests.

Never remove a test to make a suite pass, and never because it is slow without that evidence. A test
that contradicts a deliberate change is updated, as [testing](testing.md#prove-the-test-catches-the-defect)
requires. A slow test with no lower-layer replacement stays, and the slowness becomes its own issue.

## Select tests by change

Run the tests a change can affect first: the changed package or file, its direct dependents and the
tests that name the changed code. Then run the full suite once on the final change, uncached, before
it ships. [Coding](coding.md#tests-and-changes) covers how to iterate on a long suite between those
two runs.

A selection that skips tests is a speed-up, not evidence. Only the full run on the final commit is
evidence that the change is ready.

## Enforcement

The test-value audit in vh-adlc (tracked in michielvha/vh-adlc#170) checks a codebase against this
page. It finds per-test setup that migrates a schema or starts a server, and runs each automatic
migration twice to check that it converges. Reviewers apply the same checks by hand until the audit
covers a project.

## What this page adopts

- **Sizes by resource** from Google's small, medium and large tests: layers are defined by what a test
  may use, because a resource limit is checkable and a name is not.
- **Push tests down and delete duplicates** from Ham Vocke's practical test pyramid: one behaviour,
  one lowest-layer test, and a lower test for each defect a higher one finds.
- **Confidence per cost** from Kent C. Dodds' testing trophy, which keeps the pyramid from becoming a
  ratio target: a medium test that proves a real integration is worth more than many small tests
  against mocks. This page sets no ratio between layers.
- **Trade-offs between properties** from Kent Beck's Test Desiderata: faster tests are less predictive
  of production, so each layer states what only it can prove.
- **Quarantine with limits** from Martin Fowler, Software Engineering at Google and Meta's flakiness work: quarantine is
  temporary, owned and visible, and retries never hide a failure.
- **Mutation evidence** from Google's mutation testing work, as the proof a removed test was redundant.
- **Change-based selection** from test selection at scale, kept subordinate to one full run on the
  final change, because even a good selection misses some failures.
- **Shared setup once and migrations that converge** from a measured adopter suite, where one schema
  migration in per-test setup cost about 15 seconds a test and explained most of a package that ran
  for over three hours.

Not adopted: a target ratio between layers, such as Google's rough 80/15/5. A ratio rewards adding
small tests; this page asks instead whether each test proves something no lower test does.

## Sources

- [Software Engineering at Google, chapter 11: Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html)
  defines test size as "the resources that are required to run a test case": "small tests run in a
  single process, medium tests run on a single machine, and large tests run wherever they want". It
  backs the layers, the preference for small tests ("speed and determinism") and the flaky test rule:
  "rerunning a test is only delaying the need to address the root cause". It gives about 80% unit
  tests "as a very rough guideline", which this page does not adopt.
- [Software Engineering at Google, chapter 12: Unit Testing](https://abseil.io/resources/swe-book/html/ch12.html)
  says to "make calls against its public API rather than its implementation details" and to "write a
  test for each behavior", which backs testing through the public interface.
- [Software Engineering at Google, chapter 14: Larger Testing](https://abseil.io/resources/swe-book/html/ch14.html)
  says "the primary reason larger tests exist" is fidelity, which backs limiting a higher layer to what
  only it can prove, and "without clear ownership, a test rots", which backs the quarantine owner.
- [Bazel test encyclopedia](https://bazel.build/reference/test-encyclopedia) sets default timeouts per
  size: small 60 seconds, medium 300, large 900. The package budgets follow them. It also says to "set
  your timeout as tight as you can without incurring any flakiness".
- [Ham Vocke, The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
  says "Push your tests as far down the test pyramid as you can", "If a higher-level test spots an
  error and there's no lower-level test failing, you need to write a lower-level test", and "I delete
  high-level tests that are already covered on a lower level (given they don't provide extra value)".
  It backs proving each behaviour once at the lowest layer.
- [Martin Fowler, Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) calls UI-driven tests
  "brittle, expensive to write, and time consuming to run", which backs preferring the smaller layer.
- [Kent C. Dodds, The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
  frames testing as return on investment, "where 'return' is 'confidence' and 'investment' is 'time'",
  and [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests) warns
  that mocking removes "all confidence in the integration". Together they back valuing a medium test
  that proves a real integration and setting no ratio.
- [Kent Beck, Test Desiderata](https://testdesiderata.com/) lists properties such as fast,
  deterministic, structure-insensitive and predictive, and notes "Making tests more predictive of
  production behavior makes them slower". It backs naming what each layer alone can prove.
- [Martin Fowler, Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)
  says to "quarantine your non-deterministic tests" but "fix quarantined tests quickly", with a limit
  such as "no longer than a week". It backs the quarantine and its one-week date.
- [Luo, Hariri, Eloussi and Marinov, An Empirical Analysis of Flaky Tests (FSE 2014)](https://mir.cs.illinois.edu/marinov/publications/LuoETAL14FlakyTestsAnalysis.pdf)
  studied 201 commits that fix flaky tests: the top causes are async wait, concurrency and test order
  dependency, and "Most flaky tests (78%) are flaky the first time they are written". It backs the
  causes listed and the repeated run of a new test.
- [Machalica, Chmiel, Swierc and Sakevych, Probabilistic flakiness](https://engineering.fb.com/2020/12/10/developer-tools/probabilistic-flakiness/)
  describes raising a ticket for the test's owner and marking tests "not fixed on time" as flaky, out
  of change-based testing. It backs the owned quarantine that keeps reporting.
- [Petrovic and Ivankovic, State of Mutation Testing at Google (ICSE SEIP 2018)](https://research.google/pubs/state-of-mutation-testing-at-google/)
  and [Petrovic, Ivankovic, Fraser and Just, Practical Mutation Testing at Scale](https://arxiv.org/abs/2102.11378)
  describe mutation testing of changed code during review, used by thousands of engineers. They back
  mutation evidence as a practical proof that a removed test was redundant.
- [Machalica, Samylkin, Porth and Chandra, Predictive Test Selection](https://arxiv.org/abs/1810.05286)
  halves the cost of testing changes while still reporting "over 95% of individual test failures and
  over 99.9% of faulty changes". It backs selecting tests by change, and its misses back the full run
  on the final change.
