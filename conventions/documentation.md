---
title: "Documentation conventions"
type: guideline
description: "Write small authoritative documents that people and agents can navigate directly."
status: active
---

# Documentation conventions

Use plain English, literal statements, and one main idea per sentence. Keep the
current or intended state, not the conversation that produced it. No em dashes.
Do not invent owners, dates, statuses, alternatives, or implementation claims.

## Prose a reader sees

Edit every piece of prose a reader will see with the [humanize prose guide](../guides/humanize-prose.md)
before it is committed or posted. That covers documents and their prose sections, READMEs, commit
messages, PR and issue bodies, review summaries and replies. Text that must stay verbatim is not
rewritten: stored review records, quotations, code, commands and generated output.

## Document distinctions

A principle explains intent. A guideline recommends an approach. A standard is
mandatory and names its deterministic enforcement. A decision records a choice
and its reasoning. A guide is a procedure. An architecture page describes a
shared capability and its boundaries. These distinctions do not need separate
top-level folders for every type.

The active conventions state the expected working approach. A page called a
guideline is not proof that every consumer has adopted or enforces it. Name
the actual check when claiming enforcement; never infer compliance from this repo.

## Public project README banners

When creating or refreshing a README for a public open-source project, offer to
generate a project-specific banner as an alternative to using the VH & Co logo
as the header. The banner is optional. A project logo or a plain text heading
can also suit the repository.

Use the shared colour palette with the project's name and relevant artwork so
each project has its own identity. Show a preview before adopting the banner.
Keep tags optional and preserve existing README content when changing the header.

Use `readme-assets-gen` when available and keep its project config with the
generator. Commit the exported SVG or PNG assets to the public project repository;
the README must not require access to a private generator or a live rendering
service. Provide light and dark variants through GitHub's supported
[`<picture>` markup](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github#adding-an-image-to-suit-your-visitors)
and give the image meaningful alt text. Keep the project description and usage
instructions readable as text below it.

## Findings and issues

Findings live in documents. An investigation, measurement or root cause goes into
the repository's analysis or feature document with its evidence. An issue states
the work in a few lines and links that document; do not paste the reasoning into
issue comments, where it cannot be reviewed or kept current.

## Metadata and placement

Content pages under `conventions/`, `knowledge/`, `guides/`, and `decisions/` have
YAML frontmatter with `title`, `type`, `description`, and `status`. Root entry
points and harness bridges have no content frontmatter.

Types are `principle`, `guideline`, `standard`, `decision`, `guide`, or
`architecture`. Non-decision statuses are `draft`, `active`, or `deprecated`.
Decision statuses are `proposed`, `accepted`, `superseded`, or `deprecated`.
A superseded decision points to its replacement with `superseded_by`.

No mandatory team-owner, author list, review date, catalog, or pack metadata.
Filenames are stable kebab-case. Decisions use one flat `NNNN-title.md` sequence;
create a record only for a real choice with consequences across repositories.
Do not create a record for every ordinary implementation change.

## Authority and retrieval

A fact has one authoritative home. Link to code for values and to shared
conventions for rules; do not copy component input tables into these docs. Repo
READMEs explain using the component; they do not repeat the org's coding rules.

A component's usage examples are complete files under `examples/<scenario>/`,
linked from the README, not YAML blocks in its prose. A caller copies a file
whole instead of assembling fragments. A test or linter checks each example
against the component's current inputs, outputs and secrets, so an example
cannot drift from the interface it shows.

Use relative links inside this repo and verified public URLs outside it. Read
code at the selected ref before describing behavior. An unreachable source is
an unknown, not an empty source. Keep current version readings in configuration
or a dated measurement, not normative prose that goes stale after the next merge.

Create folders only when they have content. Split a long page when a section
has an independent reader or task; do not require a folder around every topic.
Use Mermaid for a small source-controlled diagram when a diagram improves the
explanation. No docs site or generated mirror is required.
