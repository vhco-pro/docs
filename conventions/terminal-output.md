---
title: "Terminal output and status symbols"
type: standard
description: "Require labelled Unicode CLI status, plain output controls and stable machine-readable contracts."
status: active
---

# Terminal output and status symbols

This standard applies to human-readable CLI output and interactive terminal views
in any language. Preserve the program's existing command, stream and exit-code
contracts. Existing tools adopt it through explicit repository changes; a shared
docs update does not change a consumer's pin or released output automatically.

Enforcement belongs to each adopting repository: its documented verification
command and CI run reporter/output tests for the modes below. Interactive views
also have terminal or pseudoterminal scenarios. The shared docs checker validates
Markdown structure; it does not establish consumer CLI compliance.

## A shared status vocabulary

Use these plain Unicode text symbols with explicit outcome words. Keep the
categories consistent; the outcome word distinguishes skipped work from an empty
result:

| Symbol | Meaning | Example | ASCII alternative |
| --- | --- | --- | --- |
| `✓` | Work completed successfully | `✓ Passed: apps/base` | `OK Passed: apps/base` |
| `✗` | Work failed | `✗ Failed: apps/prod` | `FAIL Failed: apps/prod` |
| `∅` | Skipped work or an empty result, stated explicitly | `∅ Skipped: no changes` or `∅ No results: filter` | `SKIP` or `NONE`, with the same words |
| `›` | A current step or command context | `› Building apps/base` | `> Building apps/base` |

A skipped check is not a passed check. State why it was skipped, and distinguish
an empty result from work that did not run. Keep failures and partial completion
visible in summaries. Symbols and colour supplement the words so output remains
understandable with an unfamiliar font or a screen reader.

Use the ordinary text glyphs without emoji presentation selectors or a special
icon font. Provide a documented ASCII or text alternative where supported
terminals need one; the project's existing plain mode may already cover it.
Do not change user-provided Unicode paths or data when rendering ASCII status.

## Colour, streams and interaction

Use colour sparingly for status and emphasis. Respect a nonempty `NO_COLOR` value
when deciding whether to add colour by default; `NO_COLOR=0` is also nonempty.
An absent or empty value does not request colour suppression under that
convention. A documented, explicit colour flag or user configuration may override
this environment default. Record that precedence in the tool's usage documentation.
`NO_COLOR` controls colour. A selected plain mode removes terminal styling and
cursor control.

Detect terminal capabilities on the stream being styled. Default to append-only
plain output for a non-TTY stream. An explicit forced-colour option may add colour
to human output, but must never decorate machine-readable output. A selected plain
mode removes terminal styling. Avoid spinners, cursor rewrites and interactive
prompts on non-TTY streams. Keep progress and diagnostics on the
program's documented diagnostic stream so stdout remains usable as data.

Interactive views must provide noninteractive arguments for the operation where
it supports automation. Handle cancellation and narrow windows without leaving
partial escape sequences or corrupting subsequent shell output. Show the final
status after a spinner stops, and keep the operation's existing exit semantics.

Machine-readable formats keep their declared schemas and stable status values.
Do not prefix JSON records with presentation symbols or add ANSI escapes to
machine output. Changing the human renderer must not change data fields, exit
codes or stream selection that scripts consume.

## Libraries and verification

The output contract is required; the implementation library is optional. A Go
application may use Lip Gloss for shared terminal styling or Huh for interactive
forms when those requirements justify them. A small reporter can print fixed
status lines directly. Keep the project's existing framework when it already
fits; adopting this standard does not require a full TUI application.

Test successful, failed, skipped and partial outcomes with representative paths
and messages. Capture the human output in Unicode and any supported ASCII mode,
with colour enabled and disabled where supported, and with stdout or stderr
redirected as applicable. Include absent, empty and nonempty `NO_COLOR` values,
including `0`. Assert that
plain captures have no ANSI styling or cursor-control bytes and that machine
output still parses against its contract. Exercise interactive-only behaviour in
a real terminal or a supported pseudoterminal, including cancellation and resize.

These symbols are a shared project convention. The sources below show related
choices, with different exact glyphs and terminal implementations.

## Sources

- [GitHub CLI foundations](https://github.com/cli/cli/blob/a6cb3e8572f2c147b86bd94fd61e80b0ed5b9ab2/docs/primer/foundations/README.md) uses Unicode status icons with textual meaning and describes unstyled pipe output. Its iconography includes `✓` and `✗`.
- [NO_COLOR](https://no-color.org/) defines the nonempty environment-variable convention and distinguishes colour from other styling.
- [Dagger symbols](https://github.com/dagger/dagger/blob/7e9eaacc376e5c3bed3efdca9e1ba750bc8d9233/dagql/idtui/symbols.go) uses `✔`, `✘` and `∅` at the inspected revision.
- [Dagger init view](https://github.com/dagger/dagger/blob/7e9eaacc376e5c3bed3efdca9e1ba750bc8d9233/internal/cmd/dagger/init_tui.go) uses Lip Gloss styling and a Tuist live view; its [init command](https://github.com/dagger/dagger/blob/7e9eaacc376e5c3bed3efdca9e1ba750bc8d9233/internal/cmd/dagger/init.go) constructs a Huh form. Those imports do not require consumers to adopt the same stack.
