---
title: "HTTP API conventions"
type: guideline
description: "API-first capabilities, recorded compatibility divergences, status codes for duplicate and invalid writes, and timestamp form, for HTTP APIs."
status: active
---

# HTTP API conventions

Apply this page when you design or change an HTTP API. Where the API mirrors another product's API for
compatibility, verify that product's real behavior and mirror it; a house rule never overrules a status
or shape a client depends on. Record each such divergence from the rules below, with how it was
verified, beside the code or in the API's compatibility notes. An unrecorded divergence reads as drift,
and the next consistency pass "fixes" it into a compatibility break.

## API first

Where a product has an HTTP API and other clients, such as a web UI, a CLI or an infrastructure provider,
every capability exists in the API first, and the clients use only that API. No setting or resource is
UI-only: if a person can configure it, the API can read and write it. Purely presentational state, such
as layout, theme or a collapsed panel, is exempt.

## Status codes for failed writes

- **409 Conflict** answers a write that fails because the resource already exists. RFC 9110 defines 409
  as a conflict with the current state of the target resource. This is a choice, not the only
  practice: some public APIs answer a duplicate with 422. A new API uses 409, and an existing API keeps
  the status its clients already handle.
- **422 Unprocessable Content** answers a well-formed request whose content the server cannot process:
  a malformed value or a missing required attribute.
- Name the colliding or invalid field in the error, so the caller can fix the request.
- Both branches of a duplicate check answer the same status. The guard that finds an existing record
  and the insert that loses a race to a concurrent request both answer 409, because the caller cannot
  observe which request won.

## Timestamps

Every timestamp in a response is a UTC instant in RFC 3339, ending in `Z` (`2026-10-17T18:04:05Z`), at
one precision throughout the API and written by one shared helper. Convert the value to UTC before
formatting it; a layout that prints a literal `Z` after the local wall clock names a different instant
in a process outside UTC. Requests accept any RFC 3339 offset.

## Sources

- [RFC 9110, 409 Conflict](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.10): "a conflict
  with the current state of the target resource", with content that lets the user recognize its source.
- [RFC 9110, 422 Unprocessable Content](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.21):
  the server understands the content type and syntax but cannot process the contained instructions.
