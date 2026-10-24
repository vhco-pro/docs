# React and TypeScript conventions review, 2026-10-24

The proposed [React](../conventions/react.md) and [TypeScript](../conventions/typescript.md)
guidelines correct unsupported runtime and enforcement claims. The follow-up inspection also rejects
a blanket effect-import ban as a shared correctness rule. The corrected draft is ready for review.
This change installs no frontend lint rules and does not establish compliance in a consumer repository.

## Review scope

The source inspection used Stackweaver commit `12addcbe3a605ca083308a0df1b7647cdfb48600`.
The first shared draft was commit `99ed12a8e579b03a14604634448b8270c337f0bf` in this repository.

A separate GitHub Copilot CLI 1.0.56 session reviewed anonymized policy text and abstracted technical
claims. The session reported model `claude-haiku-4.5`. It read the draft text and fetched public React,
TanStack Query, TypeScript, and typescript-eslint documentation. It received no source application files,
repository identifiers, or agent instructions. Its tool permissions allowed reading and public
documentation fetching, with shell and file writes denied.

Copilot did not inspect the source repository, execute its application, or verify its effective
configuration. The author checked the source and resolved the review findings separately. The review's
severity labels were not adopted: several findings requested clarification of guidance already present,
and some supporting assertions were incorrect.

## Source findings

| Source detail | Evidence and disposition |
| --- | --- |
| The mount helper's comment promises exactly-once execution | [Helper](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/src/hooks/useMountEffect.ts) calls `useEffect(effect, [])` and suppresses dependency checking. Shared guidance rejects the guarantee, requires repeated setup/cleanup to be safe, and prefers purpose-specific synchronization hooks. |
| A deferred highlighter is started from rendering | [Renderer](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/src/components/docs/MarkdownRenderer.tsx) queues work through refs and a microtask. Shared guidance does not adopt that pattern as a general alternative to effects. |
| Direct effects are described as banned | [ESLint configuration](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/eslint.config.js) sets the import restriction to warning and disables it in hooks, contexts, tests, and several component directories. The shared preference needs consumer enforcement; current source configuration does not prove a universal ban. |
| Query-result selectors are described as detecting the migration bug | The same configuration rejects two result-discard syntax shapes. These checks neither establish query-function behavior nor prove that every discarded-result pattern is a bug. Shared guidance requires inspection and cache-reuse verification. |
| A cached remount can render empty after query-based state updates | The [corrected bug report](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/docs/internal/bug-reports/frontend/useeffect-migration-setstate-in-queryfn.md) explains that the cache stores `null` while useful data lives in the previous component instance. Shared guidance renders the query's returned data and keeps editable drafts separate. |
| A successful type-check command may cover fewer files than expected | The [solution config](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/tsconfig.json) has `files: []` and references. The [application config](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/tsconfig.app.json) explicitly excludes one page. Shared guidance requires checking resolved projects, file coverage, and exclusions. |

These are source-specific findings, not proposed changes to Stackweaver in this branch. File-specific
type exemptions, design-system names, and historical migration counts were not promoted into shared
requirements.

## Copilot finding dispositions

The numbers below match the first independent review. Each disposition describes the corrected draft.

| Finding | Disposition |
| --- | --- |
| 1. Render purity wording | Clarified that scheduling external work during rendering is itself a side effect and that queued work can survive an abandoned render or unmount. The earlier prohibition was correct; this was not a critical behavioral defect. |
| 2. Mount helper and repeated setup | Kept the existing Strict Mode/remount caveat and strengthened the requirement that setup tolerate repeated execution even with correct cleanup. |
| 3. Query-function verification | Kept the distinction between syntax checks and behavioral review. Rejected the review's claim that returning `null` fails a query: `null` is a valid successful result. The defect is storing the useful server response only in component state. |
| 4. Import-rule coverage | Kept warning/exemption limitations and verified the rule locally. Rejected claims that aliases and namespace imports inherently bypass `importNames`: both were reported by the installed ESLint rule. Default React import access was not reported by that rule in the isolated probe. |
| 5. Cancellation | Added default completion/cache behavior when the signal is unused and clarified that removing one observer need not make a shared query unused. Completing into the correct cache is expected behavior, not automatically a stale-data bug. |
| 6. Promise handling | Kept the requirement for local rejection handling and stated that `void` may suppress lint without catching failures. Rejected the suggested use of a global rejection listener as a substitute for handling the action's failure. |
| 7. Type-check coverage | Kept the compiler-configuration caveat and added resolved configuration, file lists, and exclusions. Did not adopt build-info timestamps as proof of coverage or an unverified build-mode command combination. |
| 8. Claimed source inspection | The original draft's source-inspection statement described the author's inspection. Anonymization introduced an awkward sentence and the reviewer confused its own limited scope with the author's. Moved revision-specific enforcement facts into this dated report. |

A second separate Copilot session checked the corrected anonymized policy text and reported no
substantive defects. Its summary still repeated the incorrect alias/namespace claim and inaccurately
suggested that lint suppression by `void` depends on error handling. Neither assertion was added to the
guidelines. The author's source checks and primary references govern those dispositions. Final prose
editing removed redundant warnings about global rejection listeners and build-info timestamps from the
guidelines; their review dispositions remain above.

## Follow-up: upstream skills and checks in Stackweaver

React's own documentation repository contains a `react-expert` research skill. Its scope is researching
documentation through source, tests, and history; it is not a general application coding standard.
Vercel publishes a separate performance skill with React and Next.js recommendations. Neither was
installed or invoked as a complete skill workflow here. Their contents were inspected as references;
React's documentation and tests remain the evidence for React behavior.

The shared draft now allows legitimate direct effects, preserves dependency linting, and recommends
purpose-specific hooks where they help. A mount-only wrapper is not a replacement for reactive
synchronization. Query-library choice remains a preference. Adoption rules require a primary source,
the failure a correctness rule prevents, and its regression check; a new preference alone does not
justify rewriting an existing application.

A bounded source audit found 40 `useMountEffect` calls and 143 `queryFn` property declarations. Five
query functions directly call local state setters, matching five sites already documented in the
source repository. This syntax scan does not establish the behavior of every helper called indirectly.
Working listener, observer, and interval-cleanup patterns do not need a blanket migration.

Two scratch component tests imported the actual source helper and `useVcsRepoBrowser` hook, with network
calls mocked. Both passed while asserting the problematic behavior:

- With Strict Mode at the root, the mount helper ran setup twice and cleanup once before unmount,
  followed by a second cleanup on unmount.
- The VCS browser selected its sole connection after the first fetch. On remount with the same query
  client and the application's 30-second stale window, the cached connections were present but the
  selection was empty. There was still only one list request.

The installed React and React DOM versions used in those tests were 19.3.0, and Vitest was 5.0.3.
The package manifest specifies compatible version ranges, not these exact versions. An initial test
placed Strict Mode below a wrapper and observed one setup; placing Strict Mode at the root through the
test library's `reactStrictMode` option matched the application and exercised replay. The distinction
is documented by React and must not be hidden by a test harness.

OAuth authorization and email/SMS challenge creation also have request paths that can execute again
under replay. Duplicate delivery, callback mismatch, and production impact were not reproduced. These
remain code-path risks pending focused tests, not demonstrated user-visible bugs. No application code,
authentication state, or live server was changed. A separate read-only review of the revised guideline
reported no substantive findings.

## Pre-publication review

At the owner's request, a fresh Copilot CLI session reviewed the final React and TypeScript policies
and the new upstream-skill guide. It reported Claude Haiku 4.5 and a READY verdict with no defects.
The session read anonymized policy text and public primary documentation, with shell and file writes
denied. It did not receive source application files or inspect consumer configuration. Local document
checks verify the relative report link the reviewer could not inspect in its isolated packet.

## Verification

The author evaluated the installed ESLint configuration for a feature page, the mount helper, and the
Markdown renderer. The import restriction resolved to warning on the page and off in both infrastructure
files. Dependency checking remained warning in all three. A separate isolated `Linter.verify` probe
using the source rule configuration reported named imports, aliased named imports, and namespace
imports at warning severity. Default React import access produced no diagnostic from that rule.

Parsing the application tsconfig with the installed TypeScript API produced 433 root files and did not
include the explicitly excluded page as a root file. That measurement does not prove that an excluded
file can never enter a program through an import, or that a full type-check succeeds.

No Stackweaver application source files were changed. The follow-up used the two scratch component
tests above; no full application suite or browser checks ran. `npm run check` passed for 26 Markdown files and the feature rules block;
`git diff --check` passed. These checks cover document structure, local links, metadata, and whitespace;
they do not prove runtime behavior or consumer adoption.

## Primary references used to resolve findings

- [React render purity](https://react.dev/reference/rules/components-and-hooks-must-be-pure) and
  [Strict Mode](https://react.dev/reference/react/StrictMode): render side effects and repeated setup.
- [React custom lifecycle hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#avoid-custom-lifecycle-hooks):
  dependency risks hidden by mount wrappers.
- [TanStack Query functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions):
  successful data can be `null`; `undefined` is rejected.
- [TanStack Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation):
  default cache completion and consuming the abort signal.
- [ESLint restricted imports](https://eslint.org/docs/latest/rules/no-restricted-imports#importnames):
  named-export restrictions include aliased and namespace imports.
- [typescript-eslint promise handling](https://typescript-eslint.io/rules/no-floating-promises/):
  `void` does not handle rejection.
- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html):
  solution configurations and build-mode traversal.
- [React documentation research skill](https://github.com/reactjs/react.dev/blob/ae5e48074d4f73f1e349eda2a66841f9a959023e/.claude/skills/react-expert/SKILL.md):
  purpose and research workflow of the upstream skill.
- [Vercel React skill](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/SKILL.md),
  [event logic](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/rules/rerender-move-effect-to-event.md),
  and [dependencies](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/rules/rerender-dependencies.md):
  supplementary guidance that retains legitimate effects.
- [React 19.3 effect replay test](https://github.com/react/react/blob/1d34f91dfde6bba84d08b683aaba164c7194dacb/packages/react-reconciler/src/__tests__/StrictEffectsMode-test.js):
  upstream setup/cleanup/setup assertion for the locally installed version.
