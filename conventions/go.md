---
title: "Go conventions"
type: guideline
description: "Structure, test, and build personal Go applications with a small standard toolchain."
status: active
---

# Go conventions

## Layout and modules

- `cmd/<name>/main.go` is the entry point and contains wiring, not domain logic.
- `internal/<package>/` contains implementation that other modules must not import.
- Keep tests beside the implementation as `*_test.go`; use table-driven cases and
  `t.Run` where several inputs exercise the same behavior.
- Commit `go.mod` and any generated `go.sum`. Do not invent an empty checksum file.
- Anchor binary ignores to the repository root: `/<name>`, not `<name>`. The latter
  can accidentally ignore `cmd/<name>/` while library-only builds still pass.

The Go compiler enforces the `internal/` import boundary. Keep the Go version,
any `toolchain` directive, local tooling, and CI compatible. Resolve an actual
supported stable release when bootstrapping; do not copy a stale version from
this documentation.

## Standard toolchain

Use `go build`, `go test ./...`, `go vet ./...`, and `gofmt`. Use `goimports`
where import organization needs it. The lint configuration uses `golangci-lint`
v2 with `version: "2"`; validate it with `golangci-lint config verify` and run it
with `golangci-lint run`. Keep formatter settings under `formatters` and linter
settings under `linters.settings`, not obsolete v1 keys.

Prefer the standard library. Use `net/http`, `http.ServeMux`, and
`net/http/httptest` when suitable. Add a dependency for a concrete need, not a
default architecture. Put test, vet, and lint gates before publication in CI.

## Runtime contracts

Use `log/slog` with structured JSON logs in production. Pass context through
operations that can block, cancel, or time out. Use bounded HTTP client/server
timeouts and graceful shutdown for long-running services. Treat timestamps
crossing a service boundary as UTC.

Configuration comes from environment variables or a thin typed loader. Validate
required values at startup and keep secrets out of error messages and logs.
Wrap errors with useful context while preserving the cause; do not log and
return the same error at every layer.

## Binaries and containers

Build a static Linux service with `CGO_ENABLED=0` when its dependencies support
that model. Select `GOARCH` for the target platform rather than hardcoding one
architecture for all images. Use `-trimpath`; only inject version fields that
actually exist in the application.

A static Go service uses the required digest-pinned distroless static Debian
`nonroot` runtime, such as `gcr.io/distroless/static-debian13:nonroot`, running
as its non-root user. A CGO dependency needs a compatible runtime and an explicit
reason for the exception, not a broken static-image assumption. See
[containers](containers.md).

For a new application, start with the public
[Go template](https://github.com/michielvha/template-go-app) and follow the
[bootstrap guide](../guides/bootstrap-go-project.md). A template is a starting
point; its current choices do not override these conventions.