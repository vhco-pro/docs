---
title: "Bootstrap a Go project"
type: guide
description: "Start a Go application from the personal template and adapt it to the agreed conventions."
status: active
---

# Bootstrap a Go project

Use this guide when told to bootstrap a new Go application. Do not invent a new
scaffold while a suitable personal template exists.

## Establish scope

Confirm the application's name, purpose, repository owner, and visibility before
creating a remote repository. Decide whether it needs a service, CLI, binaries,
container, or several of these. Do not assume every Go project needs Kubernetes,
signing secrets, a container, or every supported platform.

Read [coding](../conventions/coding.md), [Go](../conventions/go.md), and
[shared delivery](../knowledge/shared-delivery.md). Read the container convention
when building an image. Private project details stay in the application repo.

## Inspect the actual template

The GitHub template is
[michielvha/template-go-app](https://github.com/michielvha/template-go-app).
Check its current files and record the source commit used for bootstrapping.
Inspect `.golangci.yml`, `.goreleaser.yml`, `Dockerfile`, and its workflow before
copying their behavior.

The inspected template provides delivery configuration, not an application:
it has no `go.mod` or Go source. Its workflow still has lint/test TODOs; its
GoReleaser configuration expects signing material, and its runtime image and
release wiring need review against these conventions. Its existing badges are
not authoritative for a new project. Recheck these facts at the selected commit.

After authorization, GitHub CLI can create a repo from the template:

```bash
gh repo create OWNER/NAME --template michielvha/template-go-app --public --clone
```

Replace `OWNER/NAME` with the agreed values and use `--private` when appropriate.
Do not execute a public creation command before visibility is agreed. For an
existing local project, adapt the template's relevant files instead of replacing
its repository or importing the template's history.

## Adapt, do not copy blindly

1. Initialize the actual module path with `go mod init github.com/OWNER/NAME`.
   Select a supported Go release and align local/CI tooling.
2. Add `cmd/NAME/main.go` and only the `internal/` packages the application needs.
   Implement the smallest runnable entry point and a meaningful behavior test.
3. Replace template names, binary paths, badges, platform lists, and metadata.
   Anchor binary ignores at the repository root. Commit generated module checksums.
4. Verify the v2 lint configuration and add real test, vet, and lint gates before
   publication. Template TODOs are work to finish, not functioning checks.
5. For a container, use the required digest-pinned distroless static non-root
   runtime for a static Go service, not the template's runtime by default. Follow
   [container conventions](../conventions/containers.md), resolve real digests,
   and prove startup under the declared user and filesystem restrictions. Build
   and publish through `michielvha/docker-release-action` with the required
   [security profile](../knowledge/container-release.md), including on the final
   merge when using native multi-platform build jobs.
6. Resolve real commit SHAs for the shared actions under their actual owners.
   Inspect selected inputs/outputs. Prefer bundled version configuration when it
   meets the project rules; do not perpetuate copied stale GitVersion config.
7. Choose one versioning and release path. A notes-only reusable release workflow
   does not replace a binary build. Do not independently create the same release
   through both it and GoReleaser. Discuss any required shared-flow extension.
8. Configure binary/checksum signing only when requested; never create an
   unexplained requirement for a private key. This is separate from the required
   keyless container signing profile. Document required secret names without values.
9. Follow [onboarding](onboard-a-repository.md) to add the pinned local `AGENTS.md`
   and harness bridges.

## Verify and hand over

Run `go test ./...`, `go vet ./...`, `go build ./cmd/NAME`,
`golangci-lint config verify`, and `golangci-lint run`. Add a race check when the
application's concurrency makes it relevant. Verify target builds and container
startup only for the platforms promised by the project.

Use snapshots or dry-run publication during validation. Inspect the final
workflow permissions and SHA pins. Document actual local commands and remaining
gaps in the application README, then open a PR only when authorized. Passing
checks do not authorize a merge or a release.