---
title: "Frontend development fixtures and browser verification"
type: standard
description: "Require reproducible state, browser scenarios and responsive visual verification for every browser frontend."
status: active
---

# Frontend development fixtures and browser verification

Every project that ships a browser interface must provide an automated
Playwright suite and a reproducible development fixture. An agent must be able to
prepare useful application state, run the affected journeys and inspect failures
without asking the owner to populate the interface by hand. This includes
plain JavaScript, TypeScript and framework applications, static sites and generated
documentation such as VitePress. Libraries without a browser interface use their
own relevant test layers. Command-line interfaces also follow
[terminal output](terminal-output.md).

Existing projects adopt this requirement through explicit repository changes.
This page does not establish that every current consumer has adopted it, and a
repository pinned to an older convention revision keeps that pin until upgraded.
The adopting repository enforces this standard through its fixture commands,
Playwright scenarios and CI. The shared docs checker validates Markdown structure;
it does not execute consumer browser suites.

## One documented verification path

The repository's README and agent instructions name the commands to bootstrap,
seed, run, verify and clean its development/test environment. A documented
aggregate verification command runs the applicable language checks, lint,
relevant unit/integration tests, production build and browser scenarios. CI must
run the applicable automated checks before merge. State which dependencies and
services are needed and how an agent detects readiness.

Support a fresh isolated environment and a quick loop against an existing owned
one. Use the existing package manager and pinned tools. Verification must check
real application files; a successful command that checks no files is not evidence.
For TypeScript projects, include solution tsconfig references and follow
[TypeScript](typescript.md). Follow [coding](coding.md#tests-and-changes) for
focused reruns.

## Useful, owned seed data

Provide an explicit seed/bootstrap command that prepares meaningful application
data or deterministic content/client state. Applications with accounts must
also create or identify a stable nonproduction test identity and document its
login or supported identity-provider setup. A freshly started development stack
must have a way to show its primary populated journeys immediately, after
sign-in where applicable. Anonymous or client-only frontends do not need to add
authentication or a backend to meet this standard. Synthetic fixtures must be
distinguishable from real customer data.

Seed through supported domain services or a dedicated fixture program that
satisfies application invariants. Do not use arbitrary SQL inserts or mock the
entire backend and call that end-to-end verification. Cover the states the
feature renders: populated and empty lists, multiple records, permissions,
loading, recoverable errors and relevant completed/in-progress/failed states.
These may be separate fixture profiles or targeted test setups; do not make the
default demo look broken just to cover an error path.

Seeding must be repeatable. Verify that rerunning it does not duplicate identities
or overwrite unrelated users, records or edits. Name the fixture's ownership
boundary explicitly, keep stable identifiers, and use exact owned keys for any
cleanup. A reset is a separate explicit action whose scope is documented.
Time-dependent screens need a documented date anchor: refresh the relevant period
when explicitly seeding, or freeze the test clock. Never let a fixed old fixture
silently turn the current-period screen empty.

Default seeds must be inert. They must not send real email, enqueue paid model
calls, dispatch infrastructure jobs, publish content or trigger background work.
Inspect the workers that consume seeded rows and satisfy their lifecycle
preconditions. Fixtures that deliberately exercise real external effects need a
separate opt-in scenario, authorized credentials and an explicit target.

Keep default fixture passwords and identities strictly nonproduction. Production
startup must not create a demo account or enable an authentication bypass.
Do not put runtime secrets, private user data or captured sessions into Git.
Mutating scenarios use dedicated owned identities/data so parallel tests and
persistent demonstrations cannot overwrite each other.

## Executable browser scenarios

Check application behavior, not merely screenshots or HTTP 200 responses.
Exercise the primary populated journey through the browser and, where the
application has one, its real API:
read seeded data, perform the relevant action, assert its result, reload and
navigate away/back. Where persistence, restart, ownership or service integration
is part of the change, verify those boundaries too. Keep an unseeded/empty-state
scenario alongside the populated one.

Authentication tests use the supported sign-in flow. Other scenarios may reuse
session state created specifically by their own authorized fixture setup. Do not
extract sessions from a person's existing browser profile. Keep temporary auth
state private and out of committed artifacts. Separate tests that consume
rate-limit or lockout budgets, and preserve production authentication controls.

Use deterministic fakes for paid or nondeterministic dependencies, with at least
one real backend/persistence path where the application uses those services.
Client-only frontends exercise their actual client state and storage. Identify mocked
boundaries and keep any credentialed live checks separate. A successful mocked
view does not establish that an external provider or deployment works.

Run the baseline journeys in Chromium. Include Firefox for engine-sensitive
behavior such as sign-in, redirects, cookies/storage, navigation reuse, browser
APIs and reported browser-specific layout failures. Check changed responsive
views at representative mobile and desktop sizes, including keyboard access,
labels, console errors and horizontal overflow. Test supported themes where the
change affects them. Use the built frontend or final application/container for
deployment-sensitive paths; a Vite-only pass cannot prove its production server.

## Responsive visual quality

Keep a project-owned viewport matrix that records both width and height in CSS
pixels. Include the affected reading and interaction flows at these kinds of
viewport, choosing dimensions that cover the supported devices and reported bugs:

| Context | Example width by height | What it exposes |
| --- | --- | --- |
| Small phone | 320 by 568 | Narrow text, wrapping and compact controls |
| Phone at different heights | 390 by 844 and 390 by 667 | Content that fits only on a tall phone |
| Phone landscape | 844 by 390 | Shallow dialogs, pinned content and navigation |
| Tablet portrait | 768 by 1024 | Intermediate columns and touch interaction |
| Tablet landscape | 1024 by 768 | Breakpoint changes and pointer/touch parity |
| Short laptop | 1280 by 720 | Large type, reserved space and unreachable actions |
| Desktop | 1440 by 900 | Content balance, line length and spacing |

These are starting points for coverage, not shared layout thresholds. Add the
reported failing viewport and cases around the application's own breakpoints.
Name the journeys, themes and browser projects exercised at each size so missing
combinations remain visible.

Assert reading and interaction invariants owned by the application. A headline
inside the viewport can still be too large or leave an empty line before its
description. Check useful line lengths, text size, content balance, overlap and
clipping, the gap between related content, and excessive reserved whitespace.
Verify that labels, navigation and primary actions remain readable and usable.
A demo must remain legible at its displayed size; shrinking a full application
into an unreadable thumbnail does not verify its content.

Use meaningful geometry assertions for these relationships. For example, an
action and its label must fit below navigation, a caption must stay associated
with its visible example, and a dialog's controls must stay reachable at short heights. Measure
actual rendered content and relevant gaps where a containing box hides the
defect. Put accepted line counts, minimum readable sizes, spacing bounds and
scroll budgets in the feature criteria or the repository's visual tests. Choose
those values for the product's design; this standard sets no common pixel limits
for every brand. Horizontal overflow is one assertion in this suite.

Exercise scroll-driven and staged interfaces at the initial state, transitions,
midpoints, completion and reverse traversal. Verify that the next section is
reachable after a pinned sequence releases. Resize and change orientation while
a scene or dialog is open, then navigate away and back. Check keyboard focus,
hover and touch paths, including overlays and visible scroll cues. When forms
use the on-screen keyboard, verify that their actions remain reachable.

Test reduced motion and 200 percent browser zoom on affected flows. Record the
actual zoom method and effective viewport. A narrow viewport verifies reflow;
claiming zoom coverage also needs observed zoom behavior. Where automation cannot
set browser zoom, retain a manual check alongside automated reflow coverage.
Include longer text or expanded copy when content length affects sizing. Test
no-JavaScript, offline or unavailable-embed behavior where the product promises
those fallbacks.

Capture representative viewport screenshots for each changed layout and
important transition state, then inspect them before declaring the UI complete.
Use full-page captures where they expose section spacing, while checking pinned
and fixed content in viewport captures too. Review typography, reading order,
spacing, contrast and actual content, even when geometry assertions pass.
Use automated screenshot comparisons where the repository has an accepted stable
baseline, and review intentional baseline changes. Tests and reviewed captures
serve different purposes; record both results.

## Evidence and completion

Retain failed-test traces, useful screenshots and bounded application logs in an
ignored artifact directory. Keep the first failing artifacts when a later run
passes, and identify what changed between those runs. Redact credentials and
session material before sharing artifacts. Keep failures and skipped/environment-dependent checks
visible. Retries do not turn a repeatably broken flow into a verified one.

After a fix, rerun the failing scenario and affected neighbours first. Run the
applicable final suite on the final code, preserving its environment when that
makes the run reproducible. Report the command, target commit/environment,
fixture profile, browsers and observed results, plus mocked or unverified
boundaries. Neither an owner walkthrough nor an agent's code inspection replaces
the automated suite. A failing visual review leaves the affected UI work open
even when the browser assertions pass. If a required environment or browser is
unavailable, report the missing evidence instead of marking it verified.

## Source examples

Stackweaver provides concrete patterns at
`4e14bd50d0b751ad34509f0bc503dea09f8f90b1`:

- [Demo seeder and ownership rules](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/docs/internal/testing/demo-data-seeding.md): populated history, explicit cleanup and inert worker states.
- [Playwright configuration](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/e2e/playwright.config.ts): setup dependencies, separate auth/rate-limit cases and cross-engine coverage.
- [Fixture scenarios](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/e2e/tests/fixtures.spec.ts): assertions against prepared application data.
- [Testing rules](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/CLAUDE.md#testing-before-merge-critical): real-browser checks and deployment-sensitive verification.

These examples establish patterns, not a requirement to copy Stackweaver's
identity provider, Kubernetes harness, database, exact commands or fixture sizes.

At `cbf39566021cf2fcbc8e58fd75335f506dcbb9e5`, Stackweaver also has
[landing tour scenarios](https://github.com/michielvha/stackweaver/blob/cbf39566021cf2fcbc8e58fd75335f506dcbb9e5/e2e/tests/landing.spec.ts)
that assert phone caption/screen geometry, tour order, horizontal overflow and
stacked fallbacks. Its
[Playwright projects](https://github.com/michielvha/stackweaver/blob/cbf39566021cf2fcbc8e58fd75335f506dcbb9e5/e2e/playwright.config.ts)
run the landing spec through `chromium-public`; only the tagged progress-selection
group also matches the general Firefox project. The
[landing loading scenarios](https://github.com/michielvha/stackweaver/blob/cbf39566021cf2fcbc8e58fd75335f506dcbb9e5/e2e/tests/landing-loading.spec.ts)
are tagged for both engines. These inspected tests do not establish approved
screenshot baselines, initial hero spacing checks or a complete viewport matrix.
