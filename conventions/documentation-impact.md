---
title: "Documentation impact"
type: standard
description: "Declare documentation coverage, select a change and review the affected documents against code."
status: active
---

# Documentation impact

A code change can affect several guides. Coverage metadata identifies candidates; a person or
agent then compares those documents with the implementation. A match is not a finding that prose
is wrong, and no match is not proof that documentation is complete.

This standard applies when a repository adopts documentation-impact checking. It does not require
every repository to annotate its documents or replace its current documentation review process.

## Adoption and inputs

Adoption is declared by one column-zero line in root `AGENTS.md`, outside fenced code:
`Documentation impact roots: ["docs/"]`. Its value is a YAML flow sequence of repository-relative
documentation roots. Read it with the checker's verified strict YAML reader. Empty, malformed, conflicting or
duplicate declarations are gaps. An indented look-alike outside fences is a gap too.

The roots command returns declared roots, absence or an incomplete diagnostic. A caller may skip
that command only when no raw line, after optional spaces or tabs, starts with the marker. This
presence check does not parse fences or YAML. A fenced example therefore goes through the shared
parser and yields absence if there is no actual declaration.

Integrated checks use the declaration. A direct check can take explicit roots without adopting the
workflow. Missing setup must not silently become a manual fallback for an adopted repository.
Resolve the required engineering pages before editing; an older pin stops the operation and reports
a pin-update handoff. A setup or roots gap supports no completion claim and grants no pin change.

The caller selects a Git base or explicit source paths. With a base, compare HEAD to its merge-base
with that base. Include both names of a rename and deleted paths. Add dirty or untracked paths only
when selected for this request. Path-only inputs match by their path strings, including deletions.
Report excluded dirty scope. Do not infer which agent owns a file from Git status.

## Coverage metadata

Read `covers` only from leading Markdown YAML frontmatter. It is a list of source paths or patterns,
such as `covers: ['deploy/**']`. Unrelated field names are allowed within the checker's strict subset.
Prose and fenced examples containing that name are not metadata.

Paths are repository-relative, case-sensitive POSIX paths. Reject absolute paths, traversal,
malformed patterns and unreadable input. Matching follows these rules:

| Form | Meaning |
| --- | --- |
| Exact path | That source path only. |
| Trailing `/` | The directory and its descendants. |
| `*` | Zero or more characters within a path segment. |
| `?` | One character within a path segment. |
| `[abc]`, `[a-z]`, `[^a]` | A character class, range or negated class within a segment. |
| `**` | Zero or more characters, including separators. A whole `**/` segment can match zero directories. |
| Backslash | Escape the next metacharacter. Preserve the backslash when quoting YAML. |

Characters with no operator meaning, including braces and exclamation marks, are literals. There
is no brace expansion or leading-pattern negation. Malformed brackets and dangling escapes fail
validation instead of being skipped.

Ordinary coverage matching is separate from the feature-review matcher in the
[feature-document standard](feature-documents.md). Existing feature matching and freshness rules
keep their meaning. Feature candidates can appear in an impact report, labelled as coverage-only;
the coverage match proves no lifecycle state. Never select a feature document because its own path
changed.

Classify those candidates from the committed `Feature documents:` declaration and its standard
default. `Feature document format: local` means documents are ordinary candidates. A default-root
attention label is not a claim that the document conforms to the shared standard. Read the retained
project procedure before deciding which metadata may be updated.

## Document and policy views

Use committed HEAD for tracked documentation and root `AGENTS.md` configuration. Dirty policy edits
do not change roots or feature classification. Configuration changes take effect after committing;
the current owner's restrictions still apply.

Only explicitly selected document metadata overlays use working-tree bytes or deletion. Metadata
selection is independent of source selection: a doc named as a changed source does not thereby
replace its HEAD metadata. Include selected new docs; report other dirty docs as excluded. An
unrelated half-edited header must not change the selected scan or turn it into an incomplete run.

Read Markdown directly from that view, without trusting a generated coverage index. Include tracked
Markdown under the declared roots; do not guess which tracked files are generated. Untracked and
ignored files require explicit selection. A symlinked root, tracked symlink document or symlink in
an overlay path is incomplete, including when its target remains inside the repository.

A document with no frontmatter, no `covers`, or an empty list is uncovered. List it in the coverage
report without treating that alone as an error. Malformed or unterminated frontmatter, null or
non-list `covers`, invalid list entries and strict-reader refusals are incomplete. A whole root
without usable coverage patterns is incomplete even if its documents are otherwise valid.

## Results and enforcement

Adoption requires a pinned checker implementing this contract. The enforcing component is
`vh-adlc-docs-impact` and its documentation-impact checker in
[vh-adlc](https://github.com/michielvha/vh-adlc); that repository owns installation, command inputs,
the versioned report schema and complete executable examples. This page is the prose home for
matching and result meanings. Missing tools are setup gaps, not compliance evidence.

The checker runs without an active agent session and performs no download, generation, screenshot
capture, repository edit or binary-cache write. Explicit setup prepares its runtime and verified
dependencies first. The implementation reuses vh-adlc's verified
[`settings read` reader](https://github.com/michielvha/vh-adlc/blob/main/docs/reference/cli.md#settings-read)
rather than requiring a parser from each consumer. Its documented subset requires one mapping with
string keys and rejects duplicate keys, anchors, aliases, merge keys and explicit tags. The linked
reader documentation also defines accepted scalar spellings and numeric limits.

| Outcome | Meaning | Check exit |
| --- | --- | --- |
| `candidates` | Required collection completed and identified documents to review. | 0 |
| `none` | Required collection completed with no matches in the declared coverage. | 0 |
| `incomplete` | A required input, root, dependency or metadata item could not be checked. | 2 |

JSON and human output have the same meaning. Keep known candidates visible when other inputs fail.
Reports identify the selected source/base, roots, HEAD, selected document bindings, uncovered docs,
excluded dirty inputs and unmatched source paths. Each candidate identifies its matched source
paths and patterns. Order results deterministically and make changed inputs visible.

Reviewing the known candidates does not clear an incomplete result. Resolve its gaps within the
authorized scope or report a handoff; the documentation obligation remains incomplete. The calling
operation retains its specific stop, commit and shipment rules.

The checker supplies no documentation-accuracy verdict or persistent verification receipt. An
adapter may preserve an older caller's exits and output, but must distinguish an incomplete check
from both a no-match and an affected-doc warning. A documented legacy empty-input no-op makes no
claim of complete coverage. Compatibility adapters delegate matching to the shared implementation.

## Reviewing and updating candidates

Read the relevant implementation and document before recording Accurate, Stale, Incomplete or
Unknown, with citations following local conventions. Search literal references and inspect new
visible behavior for missing documentation, since metadata cannot find everything. Report a
missing document with its proposed home and source evidence.

Update ordinary-document mappings when code moves. Preserve intended contracts and historical
records; a software bug is a software question, not a reason to rewrite the contract. Never delete
a document or drop coverage solely to silence a result. Standard feature-document `covers` changes
are normative revisions and go through its spec procedure. Attention-labelled or local-format
plans follow their retained local procedure; unknown applicability is reported without edits.

A report-only request permits inspection and reporting. Authorized updates may make the minimal
doc corrections and run required local checks. Settings, documents and checker output create no
commit, publication, merge or live-operation authority. Existing review-refresh requirements still apply when a
documentation fix changes a feature's covered paths.

## Project responsibilities and migration

Keep site/index generation, screenshots, style, local plan rules and delivery policy in the project.
Read-only collection never runs its generators. An authorized update follows those rules and reports
what was reviewed, changed, generated or left unknown.

Before replacing a local checker, inventory its callers and compare behavior at exact commits.
Build any legacy coverage index from the same committed source in disposable scratch; report drift
in an existing index separately. Preserve retained readers' interpretations when correcting metadata.
Incomplete collection of the actual cutover corpus blocks adoption. Use separately reviewed
meaning-preserving syntax corrections or leave the migration blocked.

Publish and verify the shared dependency before consumer cutover, test installed caller behavior,
and retain a scoped rollback path. A new engineering pin can also affect other adopted operations;
review its complete diff and verify their required knowledge, including offline caches.
