---
title: "Colour in interfaces"
type: guideline
description: "Give colour to status, severity and outcome, keep descriptive content neutral, allow identity colour, and never rely on colour alone."
status: active
---

# Colour in interfaces

This guideline applies to browser and app interfaces in any stack. Command-line output follows the
[terminal output standard](terminal-output.md), which already keeps colour for status and emphasis.
A repository's own design system, palette and tokens still apply. This page decides when an element
gets colour; the design system decides which colour.

## Colour carries meaning

Use colour where it tells the reader something: the status of a run, the severity of an alert,
whether an action succeeded or failed, a destructive action. Selection, focus and the current item
are states too, so they may use the accent colour. Before colouring an element, name what the colour
means. If the only answer is that it makes the item look different from its neighbour, leave it
neutral and let its icon and label tell it apart.

When status is the only coloured content on a screen, the reader sees it first. Each extra colour
weakens that. Colour-coded metadata, such as an orange pull request, a purple branch and a blue
commit, competes with the status beside it and can read as a second status.

Show descriptive facts in neutral text or on a neutral surface: a version, an identifier, an author,
a branch, the machine that ran a job. When several such facts sit together, give them one shared
recipe of shape, spacing and muted icon instead of a colour each.

## Identity colour is allowed

Colour that tells the reader where they are, or which product or tool they are looking at, is a
separate use and is allowed. Examples are a product's accent, a per-section colour in page headers or
navigation, and a recognised brand mark such as a tool's logo next to its version. Keep identity
colour in its own places, such as headers, navigation and logos, so it is not mistaken for status
in the content.

## Colour is never the only signal

Pair every coloured state with a label or icon that carries the same meaning: a red status badge
also says "Failed". Links and other controls look interactive through underline, shape, an icon or
a hover change, without depending on hue alone. Check the contrast of coloured text, icons and
borders in every theme the product offers.

## Review

When reviewing a changed screen, list its colours and name what each one means. Neutralise any
colour that has no meaning, unless it is identity colour as described above.

## Sources

- [WCAG 2.2, Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
  states that colour "is not used as the only visual means of conveying information", which backs the
  rule against colour as the only signal. WCAG still allows colour coding when another visual cue
  complements it, so keeping descriptive content neutral is this guideline's design choice, not a
  WCAG requirement.
- [GitHub Primer, Color usage](https://primer.style/product/getting-started/foundations/color-usage/)
  says semantic colours "communicate status, action, or emphasis" and that each is "tied to a role
  with a specific meaning". Primer also gives its accent role to links, selection and focus, which
  matches the state use above.
