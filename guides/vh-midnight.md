---
title: "VH Midnight"
type: guide
description: "Reuse the Postbode midnight-blue gradient and translucent surfaces for dark interfaces."
status: active
---

# VH Midnight

VH Midnight is the owner's reusable dark visual style: a deep blue gradient, pale blue text
and restrained translucent surfaces. It comes from
[Postbode's HTML interface](https://github.com/vhco-pro/postbode/blob/99dfd65b2cf44411d6ef8a920fe95e874b1adf0f/internal/webui/templates/index.html#L13-L25).
Use this name when the owner asks for the Postbode look. Apply the
[frontend design procedure](use-frontend-design-skills.md) when adapting it to a product.

## Palette and surfaces

| Role | Value | Use |
| --- | --- | --- |
| Background start | `#020814` | Top of the page gradient |
| Background middle | `#061229` | 48% gradient stop |
| Background end | `#0b1f45` | Bottom of the page gradient |
| Main text | `#eaf0ff` | Headings and reading content |
| Secondary text | `#9fb2d8` | Supporting descriptions and labels |
| Surface | `rgba(255,255,255,.045)` | Grouped content over the gradient |
| Surface border | `rgba(255,255,255,.10)` | Quiet content dividers |
| Blue accent | `#4f8cff` | Postbode links and emphasis |

Use `linear-gradient(160deg, #020814 0%, #061229 48%, #0b1f45 100%)` on a
viewport-height background. Keep it fixed while reading so scrolling does not change its
position. Text should remain readable over every stop and nested surface. Postbode's faint
text and low-opacity borders are references, not proof of adequate contrast for another use.
Use a stronger border for interactive controls and check their actual composited colour.

The blue gradient identifies this style. A product can retain its own accent hue; for example,
Crossplane documentation uses a lighter teal in dark mode while keeping its existing light
palette. Adapt accent and semantic colours for contrast instead of copying their light values.
Never distinguish a required field, error or selection by colour alone.

## Type and layout

Use the product's system sans-serif stack for reading and monospace for code and identifiers.
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

This guide records a design option, not a mandatory theme for every product. Consumer agents
receive it when their shared-docs pin includes this guide.
