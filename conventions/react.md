---
title: "React conventions"
type: guideline
description: "Use query-owned server state, pure rendering, and reviewed effects with explicit dependencies and cleanup."
status: active
---

# React conventions

Apply [coding](coding.md) and [TypeScript](typescript.md). Preserve React's rendering, dependency, and
cleanup contracts. The choice of query library and component organization are owner preferences,
not requirements imposed by React. Repository-local design systems and routing still apply.
For uncertain React behavior or performance work, follow the
[upstream skill guide](../guides/use-react-skills.md).

## Choose where work belongs

| Work | Preferred place |
| --- | --- |
| Values calculated from props or state | Calculate during render; use `useMemo` when memoization is useful |
| Work triggered by a user's click, submission, or navigation | An event handler |
| Reading server state in a client application | TanStack Query through the repository's API client |
| A server write caused by a user action | A mutation/event action with explicit cache updates or invalidation |
| Polling server state | Query `refetchInterval` with explicit enable and stop conditions |
| Synchronizing a widget, subscription, timer, or browser API | An effect with dependencies and cleanup, extracted into a purpose-specific hook when useful |

Preserve an existing application's established data-loading boundary and cache. TanStack Query is the
default for a new client-rendered application, not a reason to migrate an existing one. Do not introduce
a second cache or fetch the same server state again in a component effect.

## Server state and the query cache

A query function returns the data the UI consumes. Render from the query result. Do not populate
component state inside `queryFn` or keep a second state copy as the authoritative server response.
A cached remount can skip `queryFn`; that local copy then remains empty even though the query succeeded
earlier. Returning `null` is valid when it represents the requested data; it does not repair a query that
stores its useful response only in component state. Editable form drafts are separate local state with
an explicit initialization and reset boundary.

Query keys include every input that changes the requested data: account or workspace identity, resource
ID, filters, and pagination as applicable. Gate dependent queries until their prerequisites exist.
Pass the provided abort signal through the API client to cancellable requests. Without consuming it,
an unused in-flight query can still complete and populate its cache. Unmounting one observer does not
necessarily make a shared query unused. Verify the client's cancellation behavior. A cache key separates
requests; cancellation prevents obsolete work where supported. Neither substitutes for server-side
authorization. Keep credentials out of cache keys and remove or separate account-scoped caches when the
authenticated identity changes.

After a successful write, update or invalidate the relevant cache entries. Keep query loading,
polling, and error state in the query layer; keep user selections and editable drafts in local UI state.
Derive displayed values from query data. Distinguish initial loading from background refresh, and
provide empty, error, and retry states without replacing a failure with fabricated successful data.

## Effects are reviewed boundaries

Use effects for external synchronization. A direct `useEffect` with correct dependencies and cleanup is
valid. Extract a hook named for the external system or behavior when it improves reuse or makes that
synchronization easier to understand. Do not add a generic wrapper merely to avoid importing `useEffect`.

An effect is appropriate when an external system must stay synchronized with reactive inputs. Keep
those inputs in its dependency list. Do not omit dependencies, suppress `exhaustive-deps`, or move
changing values into refs just to stop the effect running. Fix the ownership or synchronization model.
Use event handlers for event-driven work and calculate derived state without an effect/setState chain.

If a repository already provides a reviewed `useMountEffect`, use it only for mount-scoped external
setup that does not depend on changing props, state, identity, or configuration. Its callback must return
the required cleanup. It is not an exactly-once guarantee: development Strict Mode can exercise another
setup/cleanup cycle, and remounting runs setup again. Setup must tolerate repeated execution even when
cleanup is correct. Do not introduce a generic lifecycle wrapper in a new repository to conceal
dependency requirements; prefer a purpose-specific hook.

Unsubscribe listeners, clear timers, dispose widgets, and cancel or ignore obsolete async results when
synchronization ends. Write cleanup so repeated setup and cleanup are safe. Keep an effect's callback
synchronous; put asynchronous work inside it with an explicit cancellation and failure strategy.

Cleanup cannot undo a request the server has already accepted. Authentication exchanges, challenge
creation, and other non-idempotent operations need an explicit strategy for repeated execution. Test
that one logical operation produces the intended result under replay and remounting, including late
responses. A flag that skips setup can also suppress the only result after cleanup has ignored it.

## Keep rendering pure and components reusable

Rendering calculates the UI. Do not start requests, subscriptions, timers, or queued asynchronous work
while rendering. Scheduling external work through `queueMicrotask`, a promise, or a mutable ref batch
during render is itself a side effect. Deferring execution does not remove that side effect; queued work
can survive an abandoned render or unmount.

Define reusable component types outside the parent render so React can preserve their identity. Reuse
the application's existing flows, controls, page layouts, and design tokens. Extend an established
actions menu or shared picker rather than constructing a parallel interaction for a new feature.
Follow the local theme and accessibility rules, including keyboard access, focus, labels, and visible
loading/error states. Component names, styling tokens, and vendor paths remain repository-local.

## Enforcement and verification

Keep Rules of Hooks and dependency checking enabled. Configure supported purpose-specific effect hooks
for dependency linting as their signatures require. Use the React lint rules supported by the chosen
plugin version to check purity, ref access, state updates, immutability, and component identity. Pin and
verify the actual configuration; the presence of these instructions does not install enforcement.

For new applications, make hook-order and dependency violations fail lint. Check the effective severity,
file coverage, and hook-call forms. Existing warning baselines need bounded remediation before promotion
to errors. A repository-local import restriction is a style choice; it must not force hidden dependencies
or render side effects. Keep exceptions narrow without disabling dependency checks. Do not use the count
of `useEffect` imports as a correctness measure.

Query-result-discard selectors catch particular syntactic forms; they do not prove every query function
returns useful data or avoids component-state side effects. Review query functions and test cache reuse.
Check the effective configuration and behavior before claiming a ban is enforced. The dated
[source and independent review](../reports/2026-10-24-react-typescript-conventions-review.md) records the
source application's enforcement gaps.

Run the local type-check, lint, relevant tests, and production build. Verify UX changes in a real
browser: inspect rendered data, navigate away and back, exercise loading/failure states, and check the
console. Test query-cache reuse and changing account/resource inputs, including late responses.
Exercise external synchronization under Strict Mode and unmount/remount. For authentication, storage,
redirects, clipboard, file transfer, or reported engine-specific behavior, include Chromium and Firefox.
Verify deployment-sensitive behavior against the production build or container. Report what ran and
what remains unverified.

## Adopt changes without repeated migrations

Adopt these rules for new work. Change existing code when a demonstrated defect, security requirement,
or measured performance problem justifies it. Keep working code unless changing it is needed for that
correction. A new preferred wrapper or query library alone does not justify a repository-wide rewrite.

For a proposed correctness rule, record its primary source, the failure it prevents, and the check that
would detect a regression. Verify the rule against the repository's actual React and tooling versions.
Label an untested claim as a risk. Keep preferences distinct so a style decision cannot silently become
a claim that working software is broken.

## Sources

Adapted from Stackweaver at `12addcbe3a605ca083308a0df1b7647cdfb48600`:

- [Agent frontend rules](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/CLAUDE.md): effect policy, component reuse, browser verification, and cross-engine checks.
- [ESLint configuration](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/eslint.config.js): warning/error severities, exemptions, and query-result selectors.
- [Mount-effect helper](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/src/hooks/useMountEffect.ts): existing empty-dependency wrapper; its exactly-once comment is not a runtime guarantee.
- [Query-state migration bug](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/docs/internal/bug-reports/frontend/useeffect-migration-setstate-in-queryfn.md): cached-remount failure when a query writes component state instead of returning data for rendering.
- [Markdown renderer](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/src/components/docs/MarkdownRenderer.tsx): existing render-triggered microtask pattern, not adopted as a shared convention.
- [React: unnecessary effects](https://react.dev/learn/you-might-not-need-an-effect): derived state, event handling, and external synchronization.
- [React: render purity](https://react.dev/reference/rules/components-and-hooks-must-be-pure): side effects belong outside rendering.
- [React: custom lifecycle hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#avoid-custom-lifecycle-hooks): avoid wrappers that obscure reactive dependencies.
- [React's research skill](https://github.com/reactjs/react.dev/blob/ae5e48074d4f73f1e349eda2a66841f9a959023e/.claude/skills/react-expert/SKILL.md): documentation research process, not an application coding standard.
- [Vercel React skill](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/SKILL.md): supplementary performance guidance; framework-specific recommendations are not universal React requirements.
- [React: effect dependencies](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps): complete dependency lists and stale closures.
- [React Strict Mode](https://react.dev/reference/react/StrictMode): development setup/cleanup checks.
- [TanStack Query functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions), [keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys), and [cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation): returned query data, input-scoped caching, and abort propagation.
