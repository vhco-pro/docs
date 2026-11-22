---
title: "VH Midnight"
type: guide
description: "Default style for the owner's user-facing interfaces: Postbode's midnight-blue gradient, translucent surfaces and controls."
status: active
---

# VH Midnight

VH Midnight is the owner's dark visual style: a deep blue gradient, pale blue text
and restrained translucent surfaces. It comes from
[Postbode's HTML interface](https://github.com/vhco-pro/postbode/blob/99dfd65b2cf44411d6ef8a920fe95e874b1adf0f/internal/webui/templates/index.html#L13-L25).
Apply the [frontend design procedure](use-frontend-design-skills.md) when adapting it to a product.

## When to use it

Use VH Midnight by default for any new or restyled user-facing interface in the owner's
repositories: web applications, browser extensions, VitePress documentation sites and local
tool pages. Keep a product's established identity instead, and follow the owner's brief when
it asks for a different look. The [interface colour guideline](../conventions/interface-colour.md)
still decides which elements get colour.

README banners use the separate VH & Co palette described in the
[documentation conventions](../conventions/documentation.md#public-project-readme-banners).
VH Midnight does not replace it.

## Tokens

Copy this block as a starting point. The names and values come from Postbode, except the
`--control-*`, `--on-*`, `--radius-*` and `--font-sans` names, which give Postbode's inline
values a name, and `color-scheme`, which Postbode does not set.

```css
:root {
  color-scheme: dark;
  /* Page gradient stops */
  --bg-0: #020814; --bg-1: #061229; --bg-2: #0b1f45;
  /* Grouped content over the gradient */
  --card: rgba(255,255,255,.045); --card-line: rgba(255,255,255,.10);
  /* Text: main, secondary, faint (see contrast notes) */
  --ink: #eaf0ff; --ink-dim: #9fb2d8; --ink-faint: #7487ae;
  /* Links, focus and selection; semantic states */
  --accent: #4f8cff; --ok: #34d39c; --warn: #f5b544; --danger: #ff6b6b;
  /* Buttons and inputs */
  --control-bg: rgba(255,255,255,.07); --control-bg-hover: rgba(255,255,255,.13);
  --control-line: rgba(255,255,255,.18); --input-bg: rgba(0,0,0,.22);
  --on-ok: #04241a; --on-accent: #04122e;
  --radius-card: 12px; --radius-control: 8px; --radius-badge: 6px;
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
}
body {
  min-height: 100vh; margin: 0; color: var(--ink);
  font: 15px/1.55 var(--font-sans);
  background: linear-gradient(160deg, var(--bg-0) 0%, var(--bg-1) 48%, var(--bg-2) 100%);
  background-attachment: fixed;
}
```

Buttons are translucent: `--control-bg` with a `--control-line` border, `--control-bg-hover`
on hover and a 2px `--accent` focus outline. The primary action is solid `--ok` with
`--on-ok` text. A destructive button turns a translucent `--danger` on hover. Status badges
use the semantic colour at about 15% opacity for the fill, about 40% for the border and a
light tint of the same hue for the text, such as `#ffdd9e` for `--warn`. Neutral badges use
white at 9% with `--ink-dim` text.

A product can keep its own accent hue; for example, Crossplane documentation uses a lighter
teal in dark mode while keeping its existing light palette. Adapt accent and semantic colours
for contrast instead of copying their light values. Never distinguish a required field, error
or selection by colour alone.

## Contrast notes

Postbode's faint text and low-opacity borders are references, not proof of adequate contrast
for another use. Composited over a card on the darkest gradient stop, `--ink-faint` measures
about 4.0:1 and `--accent` about 4.5:1, so neither suits small body text there. The card
border and the control border measure under 2:1 against the card. Use a stronger border for
interactive controls and check their actual composited colour. Text should remain readable
over every stop and nested surface.

## Type and layout

Use the system sans-serif stack for reading and monospace for code and identifiers.
Keep headings modest, text left aligned and controls close to the content they affect. Thin
dividers and small radii can separate useful groups. The style does not require cards, summary
metrics, blur, animation or a particular page layout. Preserve a working product's hierarchy.

Code uses a quiet blue surface, readable text and actual line breaks. Dense desktop references
must adapt to readable field definitions or inspection views on phones. Keep long identifiers
and program lines accessible without page-wide scrolling or truncation.

## Theme behavior and review

When a product offers light and dark modes, preserve its light identity. Follow the OS colour
preference until a reader chooses a mode, remember that choice where storage is available and
handle denied storage. Apply the chosen theme before the first paint. Give the toggle an
accessible name and state, visible keyboard focus and a usable touch target. Set native control
colours and `color-scheme` explicitly; match browser theme-colour metadata to the active mode.

Check normal text at a contrast ratio of at least 4.5:1, large text at 3:1, and meaningful
control boundaries and focus indicators at 3:1 against adjacent colours. Test the actual
composited surfaces, selected, disabled, hover and focus states, native selects, placeholders
and code. Inspect mobile and desktop screenshots, keyboard interaction, long content and
empty states. Verify both themes without network dependencies where offline output is part
of the product contract. Printed references use a legible light palette.

Consumer agents apply this default when their shared-docs pin includes this version of the
guide. An older pin keeps its earlier guidance.
