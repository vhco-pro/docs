---
title: "Write for agents"
type: guide
description: "Write skills, agent entry points and the references they load so the agent takes the same process on every run."
status: active
---

# Write for agents

Apply this guide to every document an agent consumes: a skill, an agent entry point (`AGENTS.md`,
`CLAUDE.md` or a host's equivalent), a reviewer or subagent prompt, and a reference an agent reaches
through a pointer. The packaging differs; the writing does not. The aim is a predictable *process*:
the agent takes the same path through the document every run, even when the output differs.

Prose a person reads still goes through the [humanize prose guide](humanize-prose.md). Most agent
documents are read by people too, so apply both. Where they pull apart, this guide wins inside
agent-loaded text: repeat a leading word on purpose even though the humanize guide would vary it, and
keep a terse step list even where a person might prefer flowing prose.

## Context pointers

A **context pointer** is text held in the agent's context that names some out-of-context material and
encodes the condition for reaching it. A skill's description is one; a line in an entry point naming a
document is the same object. The pointer's *wording*, not its target, decides when and how reliably the
agent reaches the material. A must-have target behind a weakly worded pointer is a variance bug:
sharpen the wording first, and inline the material only if sharpening fails.

A pointer states what the material is and lists the **branches** that should trigger it. A branch is a
distinct case the document handles, so different runs take different paths through it. Every word of
an always-loaded pointer costs on every turn, so prune it harder than the body:

- Put the leading word first: that is where the pointer does its triggering work.
- Give one trigger per branch. Synonyms that rename one branch are one branch written twice.
- Cut identity the body already carries.

## The two loads

Every document and pointer spends one of two budgets:

- **Context load** is the cost on the agent's window of anything that sits in context every turn: an
  entry-point line, a skill description. It spends tokens and attention whether or not it fires.
- **Cognitive load** is the cost on the person, who has to know which documents exist and when to
  reach for each. Spend it where human judgement matters and remove it where it does not.

Material reached only through a pointer escapes context load at the price of the pointer's own line.
Material with no pointer at all rides entirely on cognitive load.

## Information hierarchy

A document holds **steps** (ordered actions the agent performs) and **reference** (definitions, rules
and facts consulted on demand), in any mix. Place each piece on a ladder ranked by how immediately the
agent needs it:

1. **In-file step**: what the agent does, in order.
2. **In-file reference**: consulted on demand. A flat peer set, such as every rule of a review on one
   rung, is a fine arrangement.
3. **Disclosed reference**: moved to a separate file and loaded only when its pointer fires.

**Progressive disclosure** moves material down the ladder so the top stays legible. Branching is the
test: inline what every branch needs, and disclose what only some branches reach. In a document with
steps, reference that should have been disclosed buries the steps, and whether the agent attends to
them becomes a coin flip.

**Co-location** decides what sits beside a piece once placed. Keep a concept's definition, rules and
caveats under one heading so reading one part brings its neighbours. Scattering fragments one meaning
across many places; duplication, covered under [Pruning](#pruning), repeats it.

**Sprawl** is a document too long even when every line is live and unique. Attention thins across the
excess. Disclose reference behind pointers and split by branch or sequence so each path carries only
what it needs.

## Steps and completion criteria

End every step on a **completion criterion**: the condition that tells the agent the step is done.

- **Clarity.** A vague bound such as "understanding reached" invites premature completion: the agent
  ends the step early because the steps after it pull its attention. Sharpen the bound first. Only if
  it stays fuzzy *and* you observe the rush, hide the later steps by splitting the sequence across a
  real context boundary: a hand-off or a subagent dispatch. An inline call clears nothing.
- **Demand.** "Every modified model accounted for" forces thorough work where "produce a change list"
  does not. Demand drives the digging the agent does inside a step, and it binds flat reference too:
  "every rule applied" carries an exhaustiveness bar for a review document.

The strongest criteria are both checkable and exhaustive.

## When to split

Splitting a document spends one of the two loads, so split only when the cut earns it:

- **By sequence**: split steps whose later steps tempt the agent to rush the current one. The reverse
  also holds: merging two sequences exposes each step to the pull of everything after it.
- **By invocation**: see [Skill mechanics](#skill-mechanics).

## Leading words

A **leading word** is a compact concept the model already knows, used as a token the agent thinks with
(*tight*, *red*, *tracer bullet*, *fog of war*). Repeated as a word, never re-explained as a sentence,
it anchors a region of behaviour in few tokens by recruiting priors the model holds. A coined word works
if you define it, but it recruits no priors, so reach for an existing word first.

It anchors twice. In the body it steers execution: the agent reaches for the same behaviour each time
the word appears. In a pointer it steers invocation: when the same word lives in prompts, documents and
code, the agent links the shared language to the material.

Hunt for restatements a leading word can retire: a triad spelled out at three sites, a sentence spent
gesturing at one idea.

- "fast, deterministic, low-overhead" becomes *tight* (a *tight* loop).
- "a loop you believe in" becomes *red*: a fuzzy gate turned into an observable state (the loop goes
  *red* on this bug, or it does not).

## Positive targets

Steering by prohibition makes the forbidden behaviour *more* available: the strongly activated concept
overruns the weak "do not". State the target behaviour ("write one-line comments") so the banned one
is never spoken.

These repositories keep many hard guardrails: never delete a volume, never force-push a reviewed
branch, never credit an assistant. Keep each one that cannot be phrased positively, and pair it with
the positive target, so attention lands on what to do: "Sync with `git fetch` and
`git merge --ff-only`; never `git reset --hard` over changes you did not make." A stack of bare
prohibitions with no target is the shape to rewrite.

## Pruning

- Keep each meaning in one **source of truth**, so changing a behaviour is a one-place edit.
  Duplication costs maintenance and tokens and inflates a meaning's prominence past its real rank.
- The **environment** is a source of truth too: scripts, configuration, the directory layout, `--help`
  output. A document that restates it is a cache, and earns its load only when the lookup is expensive.
  Cache what the agent cannot find by looking: an unwritten convention, the reason behind a choice, a
  gotcha no configuration admits.
- Check every line for **relevance**. A line loses it by never bearing on the task, or by going stale.
  Without a pruning habit the default is sediment: stale layers that settle because adding feels safe
  and removing feels risky.
- Hunt **no-ops** sentence by sentence: an instruction the model already obeys by default pays load to
  say nothing. The test is whether it changes behaviour against the default, which is model-relative;
  settle disagreements by running the document, not by debate. Delete the whole failing sentence rather
  than trimming words. A leading word too weak to beat the default (*be thorough*) is also a no-op; the
  fix is a stronger word (*relentless*).

A rule written after a real failure is not a no-op until a run shows the failure no longer happens
without it. Before deleting a guardrail, check whether a lesson, incident note or review record
explains it, and keep the reason in that record when the rule goes.

## Skill mechanics

What changes when the document is a skill.

### Invocation

- A **model-invoked** skill keeps a description the agent sees, so it can fire on its own and other
  skills can reach it. A person can still invoke it by name. The description is its always-loaded
  pointer, so the pointer rules above apply in full.
- A **user-invoked** skill hides its description from the agent: only a person can invoke it, and no
  other skill can. It costs no context load but spends cognitive load: the person must remember it
  exists. In Claude Code this is `disable-model-invocation: true`; other hosts name the switch
  differently or lack it, so check the host before relying on it.

Choose model invocation only when the agent, or another skill, must reach the skill without a person.

Reference that two user-invoked skills both need can live in neither, because neither can fire the
other. Put it in a plain file both point at.

### Splitting by invocation

Split off a model-invoked skill when a distinct leading word you actually use should trigger it on its
own, or another skill must reach it. The new description is permanent context load, so the independent
reach has to be worth it.

### Router skills

When user-invoked skills multiply past what a person remembers, one user-invoked **router skill** can
name the others and when to reach for each. It can only point; it cannot fire them.

## Provenance

Adapted from Matt Pocock's `writing-for-agents` skill,
[`SKILL.md`](https://github.com/mattpocock/skills/blob/5863806dd4e15c63174bee4e7515a4256792ecfa/skills/productivity/writing-for-agents/SKILL.md)
and [`SKILL-MECHANICS.md`](https://github.com/mattpocock/skills/blob/5863806dd4e15c63174bee4e7515a4256792ecfa/skills/productivity/writing-for-agents/SKILL-MECHANICS.md),
at commit `5863806dd4e15c63174bee4e7515a4256792ecfa`. Changes from the original:

- Both files are merged into one guide, the skill frontmatter is replaced, and the wording is edited.
- The relationship to the humanize prose guide is stated, with leading-word repetition taking
  precedence inside agent-loaded text.
- Negation becomes [Positive targets](#positive-targets), which keeps these repositories' hard
  guardrails and requires each to carry its positive target.
- No-op pruning gains the rule that a guardrail with a recorded failure behind it stays until a run
  shows it is unneeded.
- Invocation switches are described per host instead of assuming one harness.

Update this page by re-reading the upstream files at a new commit and recording that commit here.
Use the [upstream update reference](https://github.com/mattpocock/skills/tree/5863806dd4e15c63174bee4e7515a4256792ecfa/skills/productivity/writing-for-agents) <!-- renovate: source-ref=main -->
to review new revisions. Change the provenance when the adaptation changes.

The original is distributed under the MIT License:

```text
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
