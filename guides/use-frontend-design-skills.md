---
title: "Use frontend design skills"
type: guide
description: "Apply design, critique and interface-review guidance to user-facing work in any frontend stack."
status: active
---

# Use frontend design skills

Use this guide when creating or changing a user-facing interface, including static HTML,
generated documentation, web applications and mobile layouts. Apply the repository's existing
design system and the owner's brief first. React work also follows the [React](../conventions/react.md)
and [TypeScript](../conventions/typescript.md) conventions.

Read the relevant pinned upstream skill before using it. These references make the procedure
available to any agent host; they do not install a plugin or run its tooling.

## Design the interface

Use [Anthropic's frontend-design guidance](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md)
before implementing a new interface or changing a layout. Identify the audience, the task and
the content readers need first. Inspect the existing interface, its real data, typography and
interaction patterns. Decide which parts of the existing identity the task preserves.

Choose hierarchy, type, spacing and layout for that task. Put reference content near its
examples, keep operational controls close to the work, and let marketing pages support their
actual decision. Summary cards, oversized headings and repeated boxes need a useful reading
or interaction purpose. Keeping content inside the viewport is only one check; people must
also be able to read and use it.

Use representative content during design, including long identifiers, nested data, sparse
states and errors. Documentation examples must remain readable. Show multiline programs as
code with actual line breaks, and structured settings in a suitable readable representation.
Preserve intentional escapes and scalar types. Do not globally replace backslash sequences
or present a serialized object as the finished interface.

## Critique and adapt

Use [Impeccable](https://github.com/pbakaus/impeccable/blob/7510e233b228864606888d252abacf5e7148bf87/.agents/skills/impeccable/SKILL.md)
for an explicit design critique, simplification, typography pass or responsive adaptation.
Read the relevant playbook and craft guidance at that same commit. Its Read and Operate modes
fit documentation and application screens; expression on a marketing page does not establish
the right hierarchy for an API reference.

Impeccable's full workflow uses a launcher and can download an executable, create design files
or enable hooks. Referencing it grants none of those actions. Use the host's supported setup
only within the task's authority. If the launcher is unavailable or declined, follow the
skill's documented fallback, report that context loading did not run, and inspect existing
project context directly. Distinguish applying inspected guidance from executing the full skill.

## Review the result

Use [Vercel's web-design-guidelines review procedure](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines/SKILL.md)
and the [selected interface rules](https://github.com/vercel-labs/web-interface-guidelines/blob/434b7f91364665f2f733b310ec54809bf8f37937/command.md)
to review the affected UI before handoff. This shared baseline selects the linked rule snapshot
instead of the skill's floating `main` URL. A full upstream invocation also fetches the live
rules as that skill requests; record the exact revision used and report material differences
from the shared baseline.

Check keyboard access, focus, semantic controls, labels, contrast, touch targets, overflow,
long content, empty states and reduced-motion behavior where applicable. On phones, inspect
the actual reading and interaction flow. A wide table may need stacked definitions, field
inspection or a separate example view. Do not hide content to make an overflow assertion pass.

Open the rendered result at mobile and desktop sizes, exercise its real controls, and inspect
screenshots. Verify any offline contract without network access. Test the relevant output
from its real generator or application, not only a hand-edited mockup. For a remote session,
give the owner a verified reachable private preview URL through the available host workflow.
Preserve unrelated routes and distinguish a design prototype from integrated product output.

## Access, updates and adoption

Retrieve the selected source files and their relative references at the full commits above.
If a required source cannot be read, report the gap. An upstream repository's popularity is
not a quality rating or evidence that an implementation passed review.

Installation, executable downloads, hook changes and persistent agent configuration remain
separate from consulting these sources. If installation is requested, use the host's supported
mechanism and verify the installed revision. Keep upstream license terms with redistributed
material; this guide links to the maintained sources rather than vendoring them.

Update source pins through a reviewed documentation change. Consumer repositories adopt this
guide when their shared-docs pin includes it. Adding the guide on a local branch does not
change an older pinned consumer or establish that every agent complied.
