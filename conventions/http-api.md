---
title: "HTTP API conventions"
type: guideline
description: "Status codes for duplicates and invalid payloads, and response, pagination and timestamp shapes for JSON:API services."
status: active
---

# HTTP API conventions

Apply this page when you design or change an HTTP API. Where the API mirrors another product's API for
compatibility, verify that product's real behavior and mirror it; a house rule never overrules a status
or shape a client depends on.

## Status codes for failed writes

- **409 Conflict** answers a write that fails because the resource already exists, as RFC 9110 defines a
  conflict with the current state of the target resource. Name the colliding field in the error.
- **422 Unprocessable Content** answers a well-formed request whose content is invalid: a malformed
  value or a missing required attribute.
- Both branches of a duplicate check answer the same status. The guard that finds an existing record
  and the insert that loses a race to a concurrent request both answer 409, because the caller cannot
  observe which request won.

## JSON:API services

For an API that speaks JSON:API, every response takes one of four forms:

| The endpoint returns | Form | Status |
| --- | --- | --- |
| One resource | `{"data": {"type", "id", "attributes", "relationships"?}}` | 200, or 201 on create |
| A collection | `{"data": [resource, ...], "meta": {"pagination": {...}}}` | 200 |
| A value with no identity of its own | `{"meta": {...}}` with no `data` member | 200 |
| Nothing | No body | 204 |

`data` holds resource objects only: never a bare string, a list of strings or a message object. A value
has an identity when the server can address it again; a value the next request would compute afresh,
such as a generated URL or an enrolment secret, goes in `meta`. Never invent a synthetic identifier to
fit `data`. Errors use the JSON:API error object.

A request body binds a document whose `data` member is required, so a flat body fails instead of binding
silently to zero values. Answer a missing `data`, or a `data.type` that names another resource, with an
error that names the member. Spell request attributes exactly as the resource's responses spell them.

Every collection carries one pagination block with the same members throughout the API, such as current
page, page size, previous and next page, total pages and total count. When the source reports no total,
the totals are `null` and the next page is set only when more results can exist. Clients page on the
next page until it is `null`.

A body that a protocol defines, such as a log stream, a file download or a webhook payload, keeps that
protocol's format. Record each such exception in one list in code, with the protocol as its reason.

## Timestamps

Every timestamp in a body is a UTC instant in RFC 3339 with whole seconds, ending in `Z`
(`2026-10-17T18:04:05Z`), written by one shared helper. Format the value after converting it to UTC; a
layout that prints a literal `Z` after the local wall clock names a different instant in a process
outside UTC. Requests accept any RFC 3339 offset.
