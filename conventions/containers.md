---
title: "Container conventions"
type: guideline
description: "Build minimal non-root images with verified inputs and explicit publication."
status: active
---

# Container conventions

## Build inputs

Pin every external image in `FROM` and external-image `COPY --from` to a digest,
with a readable version tag where available: `image:version@sha256:<digest>`.
Resolve the real digest from the registry; never invent it or commit a placeholder.
`COPY --from=build` naming a stage in the same Dockerfile needs no image digest.
Do not use `latest` as a build or deployment dependency.

Use multi-stage builds. Keep compilers, package managers, credentials, and test
tools out of the runtime image. Copy only the application and its required
runtime files. Prefer a distroless non-root runtime when the application supports
it; static Go services follow [Go](go.md). A build-agent image or another genuine
tool container can need a different runtime; document that requirement.

Separate dependency download layers from source layers to reuse the build cache.
Use a `.dockerignore` appropriate to the actual build context. Exclude `.git`,
local output, credentials, and files the build does not consume; prefer an
allowlist when the required files are small and well-defined.

## Runtime and secrets

Run as a non-root user. Use exec-form `ENTRYPOINT` so signals reach the process.
Support a read-only root filesystem where possible and document required writable
paths. Do not add a shell merely to make startup scripting convenient.

Use BuildKit secret mounts for build-time credentials. `ARG`, `ENV`, copied
secret files, and committed `.env` files are not secret delivery mechanisms.
Never print the secret or copy its mount into another layer.

## Publication and consumption

Prefer the existing public container action in
[shared delivery](../knowledge/shared-delivery.md) when its selected ref meets
the project's needs. Do not force a wrapper that lacks a required build feature;
extend it or record the exception rather than silently bypassing it.

Default personal publication to GHCR when a container is needed. Configure package
ownership and visibility intentionally. Use the caller's token with `packages:
write` for its own permitted publication; do not assume a token from one repo can
write every package in another account. No private registry is required.

Tag published artifacts with the computed exact version and record the image
digest. Deploy by digest when reproducible identity matters. Multi-platform
images need the digest of their image index, not just one architecture's image.
Scan the image and prove it starts under its declared user; a successful build
does not establish runtime compatibility. Automated dependency updates should
move the readable tag and digest together for review.