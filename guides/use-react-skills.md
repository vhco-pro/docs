---
title: "Use upstream React skills"
type: guide
description: "Consult pinned upstream React research and performance skills for the tasks they actually cover."
status: active
---

# Use upstream React skills

Apply the [React](../conventions/react.md) and [TypeScript](../conventions/typescript.md) conventions
first. The upstream skills below supplement those conventions. They are references to maintained
sources, not copies distributed by this repository.

## Research React behavior

The [react-expert research skill](https://github.com/reactjs/react.dev/blob/ae5e48074d4f73f1e349eda2a66841f9a959023e/.claude/skills/react-expert/SKILL.md)
lives in React's documentation repository. Use it when an API's lifecycle, guarantees, or edge cases are
uncertain. It is a documentation-research workflow, not a general application coding standard.

Read the pinned skill before applying it. Its full workflow examines React source, tests, history,
issues, and types through six research agents. Follow the workflow when invoking that skill, or report
which parts could not run. Do not describe a documentation lookup as a completed skill run. Check the
application's installed React version and inspect matching upstream tests before generalizing behavior
from another version.

## Review React performance

The [React performance skill](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/SKILL.md)
is maintained by Vercel Engineering. Use its relevant rule files when implementing a performance-sensitive
path or investigating a measured performance problem. It covers React and Next.js; Next.js server
components, server actions, and hosting recommendations do not automatically apply to a client-only SPA.

Read the relevant rule and its cited primary sources. Preserve React's correctness contracts and the
application's existing data layer. A recommendation to use SWR, memoization, or a framework-specific API
does not require migrating a working application. Verify the result through the affected behavior and
appropriate performance measurements. Do not adopt a timing or improvement claim without its context.

## Access and updates

Consumers reference this guide at their selected shared-docs revision. Retrieve upstream content at the
full commits linked above; reading a reference does not install it in an agent host. If installing a
skill is part of the task, use that host's supported installation mechanism and verify the installed
files match the reviewed revision. If a required source or capability is unavailable, report the gap.

Update these source pins through a reviewed change. An upstream skill's location does not make every
example a universal rule. When guidance conflicts with React's documented behavior, verify the behavior
against source and tests and resolve the conflict before changing application code.
