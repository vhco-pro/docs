---
title: "Frontend development fixtures and browser verification"
type: standard
description: "Require reproducible development data and an automated Playwright suite for every TypeScript browser frontend."
status: active
---

# Frontend development fixtures and browser verification

Every TypeScript project that ships a browser interface must provide an automated
Playwright suite and a reproducible development fixture. An agent must be able to
prepare useful application state, run the affected journeys and inspect failures
without asking the owner to populate the interface by hand. Apply this to React,
Vue, Svelte and other TypeScript browser frontends. Libraries and command-line
programs without a browser interface use their own relevant test layers.

Existing projects adopt this requirement through explicit repository changes.
This page does not establish that every current consumer has adopted it, and a
repository pinned to an older convention revision keeps that pin until upgraded.

## One documented verification path

The repository's README and agent instructions name the commands to bootstrap,
seed, run, verify and clean its development/test environment. A documented
aggregate verification command runs the actual TypeScript projects, lint,
relevant unit/integration tests, production build and browser scenarios. CI must
run the applicable automated checks before merge. State which dependencies and
services are needed and how an agent detects readiness.

Support a fresh isolated environment and a quick loop against an existing owned
one. Use the existing package manager and pinned tools. Verification must check
real application files, including solution tsconfig references; a successful
command that checks no files is not evidence. Follow [TypeScript](typescript.md)
and [coding](coding.md#tests-and-changes) for type checks and focused reruns.

## Useful, owned seed data

Provide an explicit seed/bootstrap command that creates or identifies a stable
nonproduction test identity and meaningful application data. Document the login
or supported identity-provider setup. A freshly started development stack must
have a way to show its primary populated journeys immediately after sign-in.
Synthetic fixtures must be distinguishable from real customer data.

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
Exercise the primary populated journey through the browser and its real API:
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
one real backend/persistence path for the primary journey. Identify mocked
boundaries and keep any credentialed live checks separate. A successful mocked
view does not establish that an external provider or deployment works.

Run the baseline journeys in Chromium. Include Firefox for engine-sensitive
behavior such as sign-in, redirects, cookies/storage, navigation reuse, browser
APIs and reported browser-specific layout failures. Check changed responsive
views at representative mobile and desktop sizes, including keyboard access,
labels, console errors and horizontal overflow. Test supported themes where the
change affects them. Use the built frontend or final application/container for
deployment-sensitive paths; a Vite-only pass cannot prove its production server.

## Evidence and completion

Retain failed-test traces, useful screenshots and bounded application logs in an
ignored artifact directory. Redact credentials and session material before
sharing artifacts. Keep failures and skipped/environment-dependent checks
visible. Retries do not turn a repeatably broken flow into a verified one.

After a fix, rerun the failing scenario and affected neighbours first. Run the
applicable final suite on the final code, preserving its environment when that
makes the run reproducible. Report the command, target commit/environment,
fixture profile, browsers and observed results, plus mocked or unverified
boundaries. Neither an owner walkthrough nor an agent's code inspection replaces
the automated suite.

## Source examples

Stackweaver provides concrete patterns at
`4e14bd50d0b751ad34509f0bc503dea09f8f90b1`:

- [Demo seeder and ownership rules](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/docs/internal/testing/demo-data-seeding.md): populated history, explicit cleanup and inert worker states.
- [Playwright configuration](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/e2e/playwright.config.ts): setup dependencies, separate auth/rate-limit cases and cross-engine coverage.
- [Fixture scenarios](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/e2e/tests/fixtures.spec.ts): assertions against prepared application data.
- [Testing rules](https://github.com/michielvha/stackweaver/blob/4e14bd50d0b751ad34509f0bc503dea09f8f90b1/CLAUDE.md#testing-before-merge-critical): real-browser checks and deployment-sensitive verification.

These examples establish patterns, not a requirement to copy Stackweaver's
identity provider, Kubernetes harness, database, exact commands or fixture sizes.
