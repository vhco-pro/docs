---
title: "Feature documents"
type: standard
description: "One living document per feature that is both its specification and its plan, with machine-checked rules."
status: active
---

# Feature documents

A feature is one observable outcome with accepted scope and verifiable criteria. Each feature has one
document that is both its specification and its plan. Do not create a companion spec, plan or notes file
for the same feature.

Enforcement: the `vh-adlc` binary reads the [rules block](#rules) at the repository's pinned revision of
this page and decides every status change with `vh-adlc gate`. Until that binary is released, these rules
are checked by hand, and a report says so.

## Location

A repository declares its feature root with one line in its root `AGENTS.md`:

```markdown
Feature documents: docs/specs/
```

Without that line, documents live under `docs/internal/plans/`, as `<slug>.md` or grouped in category
folders as `<category>/<slug>.md`. Do not move existing documents to
reach a default. A repository that keeps its own document format declares
`Feature document format: local` instead; this standard and its tooling then do not apply there.

## Frontmatter

```yaml
---
status: draft
status_description: "One line on the current state and what it waits for."
issue: https://github.com/OWNER/REPO/issues/42
goal: "One observable outcome."
covers:
  - path/to/implementation/
---
```

`issue: null` marks local-only work; never invent a link. `covers` lists every path whose change can
affect the feature; the document itself is never covered. A document gains `branch` when implementation
starts and keeps it until the feature is closed.

## Statuses

| Status | Meaning | Set by |
| --- | --- | --- |
| draft | Being specified or revised | Authoring, or a normative revision |
| planned | Accepted by the owner and ready to build | The spec review step, after acceptance |
| in-progress | Being implemented on its feature branch | Implementation, as its first commit |
| complete | Every criterion met or residualised, reviewed | Implementation or shipping |
| blocked | Waiting on a named owner decision or external fix | Any step, naming the blocker |
| parked | Deliberately paused | The owner |
| abandoned | Will not be built | The owner |
| superseded | Replaced by another feature, which it links | The owner |
| archived | Closed history | The owner |

`complete` is terminal for its scope; new scope is a new feature. A blocked feature names the smallest
decision that clears it.

## Sections

Required, in this order: Context, Scope, Design, Acceptance Criteria, Test Plan, Tasks, Open Questions and
Review Log. Implementation Phases (before Tasks), Deferred (after Open Questions) and Sources (last) are
optional. Delete a section that does
not apply rather than leave it empty, except the required ones, which may say "None.".

Scope, Design, Acceptance Criteria, Test Plan and the `covers` frontmatter form the normative baseline. A
change to any of them is a revision. Before the change is applied, a `planned` or `in-progress` document
moves to `draft` (on its feature branch when it has one); earlier reviews become stale, the owner accepts
again, and the document moves `draft` to `planned` before implementation re-enters through its branch.

Context and Design cite their claims: a `file:line`, or a command and its output, gathered when the claim
was written. Sources lists every external page read, each with the claim it supports.

### Owner summary in Context

New documents and documents undergoing a normative revision start Context with `### Owner summary`.
Use a few short paragraphs to explain the problem and outcome, scope, approach, important defaults,
permissions, trade-offs, validation state and owner decisions. Include migration or recovery where it
matters. Usually 250 to 400 words is enough; a small feature can be shorter. This is guidance for a
readable explanation, not a word-count gate.

The detailed normative sections remain authoritative. The summary must agree with them and distinguish
planned checks from observed proof. Refresh it when scope, proof or decisions change and before asking
for acceptance. Explain material changes since the last accepted scope. The reviewer checks for
contradictions, consequential omissions and unsupported claims through the existing finding records.
Keep the owner-facing conversation summary before acceptance as well.

Historical documents remain valid without this subsection. A summary-only prose correction does not
change the normative baseline or accept a feature. Keep stored review records verbatim; do not shorten
them to make the summary easier to find. The required top-level sections and machine-readable rules
below are unchanged.

## Acceptance criteria

```markdown
- [ ] AC-01: The end state, observable without reading the code.
```

State the end state, never a measurement of the problem. A criterion whose subject is a report, a count
or a warning can go green while the problem remains. IDs are never reused, and a failed criterion is
never deleted to make a result look complete.

A criterion is ticked only with evidence beneath it, or left unticked with a residual that names its
tracker:

```markdown
- [x] AC-01: The end state.
      Evidence: <command or action>, <target commit>, <observed result>, <limitations>
- [ ] AC-02: Another end state.
      Residual: https://github.com/OWNER/REPO/issues/43
```

A residual needs the owner's decision. On a normative revision, every criterion tick, evidence line and residual
is reset; their history stays in Git and in the Review Log.

## Test plan

One table with exactly the header `| Criterion | Proof |`. Every criterion ID appears in its first column;
a cell may list several IDs separated by commas. Proof names a real check: a test, a scenario with a pass
condition, or a written manual procedure.

A proof that judges free text with a pattern lists its must-pass and must-fail examples in the row. A row
has passed review once a clean pass whose reviewed commit already held the row's current text has no
finding whose `WHERE` names that row or the Test Plan as a whole; a later change to the row starts over.
After that, a finding that only widens the pattern to catch more wrong output is a nit, and it is listed
rather than applied, even when the same pass changes the baseline for other findings. A finding that shows
the pattern rejects a correct output is blocking, because the proof then fails a correct implementation.

## Tasks

```markdown
- [ ] T1 `path/to/file_test.go` - the failing test for the new behaviour; fails because it does not exist (AC-01)
- [ ] T2 `path/to/file.go` - the change; T1 passes (AC-01)
```

An implementation that flounders for want of judgment means the document is underspecified: return it to
spec review and fix the document, rather than reaching for a stronger model.

One commit per task. Each names the file it touches, a done condition that is a test or check, and the
criteria it advances. Order by dependency, failing test first. Re-planning keeps checked tasks and changes
only the unchecked tail; new requirements get new task IDs.

## Open questions

Only the owner answers them. Write each for a decision in under a minute:

```markdown
### Q1: The question, as one plain sentence

**Recommendation:** A. The option, and one line on why.

| Option | You get | It costs |
| --- | --- | --- |
| **A. Name** | Benefit | Cost |
| **B. Name** | Benefit | Cost |

**Why this is yours:** what makes it a judgement call.
```

Raise an open question only where the owner could plausibly choose differently. This is the
plausible-choice rule: a question is raised only where the options differ in something the goal and the
owner's recorded rules do not decide, such as scope, a public contract, security posture, permissions or
cost to users. The owner's recorded rules are the product profile plus the instruction files and project
procedure the operations read before acting. The author records every other choice in Design with a
one-line reason. Each option offered meets the goal in full: a stopgap, a cheaper-now partial option or a
lock to one dependency version is not offered. With no recorded rules, every judgement call the goal does
not decide is an open question. A review finding rated nit is the exception: it follows the nit rule in
[Review log](#review-log) and is never raised as an open question. A section that weighs options and keeps
one, such as a simplification check, raises that choice here only under the plausible-choice rule.
User-facing terms the feature introduces or changes appear in a glossary row and are held to it by a
criterion.

An answered question is folded into the document and removed. "None." means every question has been
answered, not that none was asked.

## Deferred

The optional `## Deferred` section sits after Open Questions and before Review Log. It is the document's
deferred list: one line for each item the document defers, with where it came from and its verdict. It is
outside the normative baseline, so adding or editing an entry never makes a review stale. Each entry reads
`- D-<nn>: <the item>. From: <source>. Verdict: pending.`, where the source is exactly one of:

- `R-<n> F-<nn>, stated limit` for a stated limit the author adds; the Scope line stays the normative
  statement;
- `R-<n> F-<nn>, deferred at acceptance` for a finding the owner defers when accepting;
- `owner cut on <date>` for an item an owner-directed cut removes;
- `author cut` for an extra the author removes on its own initiative;
- `drift re-review R-<n>` for extra work the owner defers in a drift re-review.

IDs are never reused. An entry answers its finding the way a stated limit does: a later pass does not raise
the entry's substance again, unless it leaves an always-blocking defect, makes a criterion unmeetable or
leaves the stated problem unsolved; then the finding is blocking against Scope and its `EVIDENCE` quotes
the entry. Once the feature is merged, a pending entry's verdict may replace `pending`.

## Review log

One table row per review pass, then one `### R-<n>` subsection per pass holding the reviewer's returned
records verbatim:

```markdown
| Date | Review | Kind | Commit | Model | Isolation | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-17 | R-1 | spec | `0123abc` | <model that ran> | procedural | One line |
| 2026-10-17 | R-1 | spec | `0123abc` | n/a | n/a | accepted by owner |
```

`Kind` is `spec` or `implementation`. `Commit` is the exact reviewed commit; a `+dirty` suffix marks a
diagnostic review of uncommitted work, which never counts as current. `Isolation` is `structural` only
where the host enforces the reviewer's restrictions, otherwise `procedural` or `unknown`. A row with
`Outcome` exactly `accepted by owner` is an acceptance: it names the review it accepts, uses `n/a` for model
and isolation, and has no subsection.

A spec review returns complete finding records, or exactly `NO FINDINGS`:

```text
FINDING: F-01
KIND: factual | judgement
SEVERITY: blocking | should-fix | nit
WHERE: <section>
EVIDENCE: <file:line, command and output, or quote>
PROPOSAL: <one or two sentences>
```

Rate each finding by its consequence. This is severity by consequence: what the finding would do to the
product the repository describes in the `## Product profile` section of its root `AGENTS.md`, which says
what the product is, who uses it, its stage, and what is at stake. Without a product profile, rate as for
production software with users whose data matters.

- blocking: a stated fact is false and that changes what is built, what a proof checks or how the
  binary reads the document; an implementer following the document would build something that does not
  solve the stated problem; a criterion cannot be met; a proof fails a correct implementation or cannot
  be executed; a concrete failure that a user, tenant or operator of the profiled product would plausibly
  hit, with serious harm; or an always-blocking defect.
- should-fix: a concrete failure that the profiled product's users would plausibly hit, with limited
  harm; two careful implementers would build things whose difference a user or operator would notice; or
  a proof could pass on a wrong implementation, except widening a free-text pattern row that has passed
  review to catch more wrong output, which is a nit (see [Test plan](#test-plan)).
- nit: wording, style, redundancy, or a citation slip that changes nothing an implementer builds or a
  proof checks, or an undefined path that nobody using the profiled product would plausibly hit. Widening
  a free-text pattern row that has passed review to catch more wrong output is also a nit.

An always-blocking defect is blocking on every product, whatever its profile: a security defect lets
someone read or act beyond their authorization, or exposes a credential or secret; a data-loss defect
loses or corrupts data a user or tenant owns and cannot regenerate; a tenant-isolation defect lets one
tenant read or affect another tenant's data, runs or configuration.

A repository may declare review lenses, extra checks its reviews apply, each with its own severity. A finding a declared lens raises takes that lens's severity; these definitions rate every other finding.

An author may answer a finding with a stated limit instead of a new mechanism: a Scope line
`Not handled: <the case>, <why> (R-<n> F-<nn>).` Adding one changes the baseline and is reviewed like any
other change. It is the author's call, unless the limit excludes a case the goal, a criterion or a
behavior Scope promises names; then it is an open question. A later pass does not raise the substance of a
stated limit again, unless the limit leaves an always-blocking defect, makes a criterion unmeetable or
leaves the stated problem unsolved; then the finding is blocking and its `EVIDENCE` quotes the limit.

A spec review after the first is a scoped re-review: it covers the document diff since the previous spec
review and every section that states a rule, ID or term the diff changes, and outside that scope it
reports only blocking findings. The previous spec review is the latest spec review row whose commit is an
ancestor of the reviewed commit, acceptance rows aside. The pass is full when there is no previous spec
review, or when a `covers` path outside the document or a docs pin bridge file changed between the two
reviewed commits; a bridge file is one a repository pins its conventions revision in, such as
`AGENTS.md`.

A nit on the normative baseline never causes a revision on its own. When the author applies a pass's
blocking or should-fix findings to the baseline, the same commit fixes every nit of that pass, in any
section and of either kind, without raising a judgement nit as an open question. The one exception is a
free-text widening nit, which stays listed even when the baseline changes for other findings. Every nit
the author does not apply, from every pass it handled in that invocation, is listed with its ID and one
line in its report, not in the document. The owner-facing conversation summary may apply owner-list
triage: it shows only the unapplied nits the owner's recorded rules do not settle, with a count of the
rest, when the full list follows in a section headed `All unapplied nits` at the end of the same reply. A finding confined to
sections outside the normative baseline may be applied at any time, because it does not make the review
stale. A nit left unapplied stays in the document until a later revision touches it or the owner asks for
one.

Only the reviews that still decide something must be in record form: the latest spec review, the latest
implementation review, and the review the latest acceptance row names. Older subsections, including
earlier acceptances, are history.

An implementation review returns one record for every current criterion, with its exact accepted text:

```text
CRITERION: AC-01 <exact accepted text>
VERDICT: met | not met | untested | not verified
EVIDENCE: <command or action>, <target>, <observed result>, <limitations>
```

Criterion text is the text after `AC-NN: ` plus each following indented line, up to the next list item,
`Evidence:` line or `Residual:` line, with whitespace runs folded to one space and the ends trimmed. The record's text after
`CRITERION: AC-NN ` is folded the same way, and the two must be equal.

`met`: executed evidence observed in this review establishes the criterion. `not met`: executed evidence
contradicts it. `untested`: no adequate check covers it. `not verified`: a check exists but its execution
was not observed. A passing subset never upgrades a composite criterion.

## Acceptance

1. Fold the owner's answers into the document and commit. Call that commit X.
2. Run an independent spec review at X. Blocking findings are fixed and reviewed again by a new pass; a
   blocking pass is never relabelled clean.
3. The owner accepts in session.
4. Append the acceptance row naming that review.
5. Move the document to `planned` once the gate passes.

A request to investigate or draft is not permission to build, and an issue comment never changes a
status. A re-review caused only by changes on the default branch keeps the acceptance when the normative
baseline is unchanged.

## Rules

`vh-adlc` reads this block at the pinned revision. Exactly one block with this info string exists on this
page.

```yaml vh-adlc-rules
schema: 1
statuses: [draft, planned, in-progress, complete, blocked, parked, abandoned, superseded, archived]
transitions:
  draft: [planned, blocked, parked, abandoned, superseded]
  planned: [in-progress, draft, blocked, parked, abandoned, superseded]
  in-progress: [complete, draft, blocked, parked, abandoned, superseded]
  blocked: [draft, planned, in-progress, abandoned]
  parked: [draft, planned, abandoned]
  complete: [archived, superseded]
  superseded: [archived]
  abandoned: [archived]
feature_root:
  default: docs/internal/plans
  declaration: '^Feature documents: `?([^`\s]+)`?$'
required_frontmatter: [status, status_description, issue, goal, covers]
required_frontmatter_from: { in-progress: [branch] }
required_sections: [Context, Scope, Design, Acceptance Criteria, Test Plan, Tasks, Open Questions, Review Log]
normative_sections: [Scope, Design, Acceptance Criteria, Test Plan]
normative_frontmatter: [covers]
ids: { criterion: '^AC-\d{2,}$', task: '^T\d+$', review: '^R-\d+$' }
criterion_line: '^- \[( |x)\] (AC-\d{2,}):'
task_line: '^- \[( |x)\] (T\d+) '
evidence_line: '^\s+Evidence: '
residual_line: '^\s+Residual: (https://\S+|#\d+)'
open_question: '^### Q\d+: '
test_plan: { columns: [Criterion, Proof], criterion_cell: '^AC-\d{2,}(, AC-\d{2,})*$' }
review_log_columns: [Date, Review, Kind, Commit, Model, Isolation, Outcome]
review_commit: '^`?[0-9a-f]{7,40}(\+dirty)?`?$'
review_kinds: [spec, implementation]
isolation: [structural, procedural, unknown, n/a]
acceptance_row: { kind: spec, model: n/a, isolation: n/a, outcome: accepted by owner, subsection: false }
verdicts: [met, not met, untested, not verified]
record_criterion: '^CRITERION: (AC-\d{2,}) '
criterion_continuation: '^\s+\S'
record_verdict: '^VERDICT: (met|not met|untested|not verified)$'
record_finding: '^FINDING: F-\d{2,}$'
record_severity: '^SEVERITY: (blocking|should-fix|nit)$'
record_no_findings: '^NO FINDINGS$'
local_format_declaration: '^Feature document format: local$'
gates:
  planned: [no_open_questions, test_plan_complete, spec_review_fresh, spec_review_clean, accepted, on_feature_branch_if_set]
  in-progress: [no_open_questions, test_plan_complete, spec_review_fresh, spec_review_clean, accepted, tasks_populated, on_feature_branch_if_set]
  complete: [no_open_questions, test_plan_complete, spec_review_fresh, spec_review_clean, accepted, all_met, impl_review_fresh, impl_review_clean, feature_tree_clean, on_feature_branch_if_set]
next:
  - { status: [draft, planned, in-progress], when: not no_open_questions, do: owner decision }
  - { status: [draft, planned, in-progress], when: not on_feature_branch_if_set, do: owner decision }
  - { status: [draft, planned, in-progress], when: not test_plan_complete, do: spec }
  - { status: [draft, planned, in-progress], when: not spec_review_fresh, do: spec review }
  - { status: [draft, planned, in-progress], when: not spec_review_clean, do: spec }
  - { status: [draft, planned, in-progress], when: not accepted, do: owner acceptance }
  - { status: draft, do: spec }
  - { status: planned, when: not tasks_populated, do: tasks }
  - { status: planned, do: implement }
  - { status: in-progress, when: tasks_open, do: implement }
  - { status: in-progress, when: not feature_tree_clean, do: implement }
  - { status: in-progress, when: not impl_review_fresh, do: review }
  - { status: in-progress, when: not impl_review_clean, do: tasks }
  - { status: in-progress, when: not all_met, do: tasks }
  - { status: in-progress, do: ship }
  - { status: [blocked, parked], do: owner decision }
  - { status: [complete, abandoned, superseded, archived], do: none }
```

Every gate also checks the transition, except a gate whose target is the current status: that re-checks
the conditions only. The first matching `next` rule names the one next step. Lines in the block are
regular expressions where they start with `^`.

## Conditions

The block composes these conditions; `vh-adlc` implements them, and `vh-adlc fresh` decides staleness from
Git. A review bound to a changed normative baseline, a `+dirty` target, a missing review row or an
unreachable reviewed commit is stale.

| Condition | Holds when |
| --- | --- |
| `no_open_questions` | No line in Open Questions matches `open_question` |
| `test_plan_complete` | Every criterion ID appears in the Test Plan table |
| `spec_review_fresh` | The latest spec review exists and is not stale |
| `spec_review_clean` | The latest spec review is well formed and has no blocking finding, or is exactly `NO FINDINGS` |
| `accepted` | The latest acceptance row names a clean spec review whose commit has the current normative baseline |
| `tasks_populated` | At least one line matches `task_line` |
| `tasks_open` | At least one task is unticked |
| `on_feature_branch_if_set` | The document has no `branch`, or the current branch equals it |
| `all_met` | Every criterion is ticked with evidence, or unticked with a residual |
| `impl_review_fresh` | The latest implementation review exists and is not stale |
| `impl_review_clean` | That review has exactly one record per current criterion with its exact text, and each is `met` or residualised |
| `feature_tree_clean` | No staged, unstaged or untracked change matches `covers`, apart from the document itself |
