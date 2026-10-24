---
title: "TypeScript conventions"
type: guideline
description: "Keep TypeScript boundaries typed, promises handled, and verification tied to the actual projects."
status: active
---

# TypeScript conventions

Apply [coding](coding.md) as well. For React, also read [React](react.md).

## Types and boundaries

Enable strict type checking. Use `unknown` for external input and caught errors, then narrow or validate
before use. A type assertion does not validate a response at runtime. Keep API response parsing and
domain conversion at named boundaries so components receive useful types.

Avoid `any`. An exception belongs at a documented interoperability boundary with the narrowest possible
scope; it is not a reusable exemption for every API client, test, or complex page. Keep the exception and
its reason in that repository's configuration or beside the affected code. Do not copy another
application's file-specific exemptions.

Prefer inferred types inside an implementation and explicit types for public interfaces and external
data contracts. Preserve null, absence, and failure as distinct states when the domain distinguishes
them. Do not force a value through the checker with an unchecked cast or non-null assertion.

## Async calls and callbacks

Await promises, return them to a caller that handles them, or handle rejection explicitly. A `void`
expression marks intentional non-awaiting and may suppress a floating-promise lint warning; it does
not catch an error. Use it only when the invoked function handles its own failure or the call attaches
a rejection handler.

UI callbacks are functions, not calls performed while constructing JSX. Use an arrow around navigation
or another invocation when arguments must be supplied. For a promise-returning event action, use a
synchronous wrapper such as `onClick={() => { void handleSave(); }}` only when `handleSave` owns error
handling. Do not pass a promise in place of an event handler.

## Tooling and verification

Keep the compiler, lint configuration, bundler, and test runner compatible. Preserve an existing
repository's runtime and package manager; new JavaScript tooling follows [coding](coding.md).

Use type-aware ESLint rules where the project supports them, including unsafe-value and promise
handling checks. Confirm that application and test files are included in the intended checks. A
suppression must state the particular reason and affect only the relevant rule and code.

Run the repository's type-check script, lint, relevant tests, and production build. For a solution-style
tsconfig with `files: []` and project references, use the configured build-mode check, such as
`tsc -b --noEmit`, when supported by that project's compiler setup. A bare `tsc --noEmit` at that root
can check no application files. Verify which projects and files the command includes before reporting
success. Inspect resolved configuration and file lists, including exclusions. Do not copy a
repository-specific command without its configuration.

## Sources

Adapted from Stackweaver at `12addcbe3a605ca083308a0df1b7647cdfb48600`:

- [Agent TypeScript rules](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/CLAUDE.md#typescript-rules): typing and event-handler policy.
- [ESLint configuration](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/eslint.config.js): type-aware linting and existing file-specific exemptions.
- [Frontend package scripts](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/package.json) and [solution tsconfig](https://github.com/michielvha/stackweaver/blob/12addcbe3a605ca083308a0df1b7647cdfb48600/frontend/tsconfig.json): build-mode type verification.
- [TypeScript strict configuration](https://www.typescriptlang.org/tsconfig/strict.html): strict checking behavior.
- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html): solution configuration and build mode.
- [typescript-eslint promise handling](https://typescript-eslint.io/rules/no-floating-promises/): `void` does not handle rejection.
