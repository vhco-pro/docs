---
title: "Container conventions"
type: guideline
description: "Build minimal non-root images with verified inputs and explicit publication."
status: active
---

# Container conventions

## Distroless application runtimes

Application service images use a digest-pinned distroless runtime, not Alpine
or a general-purpose distribution as the final stage. This is the required
runtime model, not an optional optimization. A tool/build-agent image or an
application that cannot satisfy it needs an explicit documented exception.

| Application | Runtime family |
| --- | --- |
| Static Go service | `gcr.io/distroless/static-debian13:nonroot` |
| Python service with a separately built interpreter and runtime | `gcr.io/distroless/cc-debian13:nonroot` |

These names identify runtime families, not complete Dockerfile pins. Resolve a
real digest for the selected version and target platforms before generating the
Dockerfile. Do not copy an undigested reference from this table into a build.

Use a multi-stage build. For dynamically linked runtimes, use `ldd` on the built
executable in the builder and harvest only the required shared libraries into
the compatible runtime. A static Go binary needs no libc harvest.
Keep the builder and runtime ABI compatible; test the actual final image.

For Python, stage the chosen interpreter, standard library, dependencies, and
required shared libraries. Remove `pip`, `ensurepip`, their metadata, and other
build/install tools from the staged runtime. Do not use a language convenience
image to choose an uncontrolled interpreter version.

Run as `USER nonroot:nonroot`; the named distroless variants provide UID 65532.
Use exec-form `ENTRYPOINT` because distroless has no shell. Do not add a shell
or package manager to work around a startup script; fix the entry point instead.

## Build inputs

Pin every external image in `FROM` and external-image `COPY --from` to a digest,
with a readable version tag where available: `image:version@sha256:<digest>`.
Resolve the real digest from the registry; never invent it or commit a placeholder.
`COPY --from=build` naming a stage in the same Dockerfile needs no image digest.
Do not use `latest` as a build or deployment dependency.

Keep compilers, package managers, credentials, and test tools out of the runtime
image. Copy only the application and its required runtime files. Static Go
services also follow [Go](go.md).

Separate dependency download layers from source layers to reuse the build cache.
Use an allowlist `.dockerignore`: exclude by default, then include the actual
source, module files, build configuration, and runtime assets required by the
build. New files must not enter the context accidentally. Keep `.git`, local
output, credentials, and unrelated files out of that allowlist.

## Runtime and secrets

Run as a non-root user. Use exec-form `ENTRYPOINT` so signals reach the process.
Support a read-only root filesystem where possible and document required writable
paths. Do not add a shell merely to make startup scripting convenient.

Use BuildKit secret mounts for build-time credentials. `ARG`, `ENV`, copied
secret files, and committed `.env` files are not secret delivery mechanisms.
Never print the secret or copy its mount into another layer.

## Publication and consumption

Container build/publication jobs use
[`michielvha/docker-release-action`](https://github.com/michielvha/docker-release-action)
at a verified full commit SHA, with the required security profile in
[container release](../knowledge/container-release.md). Do not replace it with
direct `docker build` or `docker/build-push-action` steps in release workflows;
that bypasses the shared scan, signing, SBOM, and attestation path.

Local development and runtime smoke checks can use Docker directly. If a release
needs a feature or environment the shared action cannot support, request an
extension or an explicit exception. Do not silently turn controls off or bypass
the action. An outer SHA pin does not make its transitive action refs immutable;
inspect those too when assessing the selected revision.

Default personal publication to GHCR when a container is needed. Configure package
ownership and visibility intentionally. Use the caller's token with `packages:
write` for its own permitted publication; do not assume a token from one repo can
write every package in another account. No private registry is required.

Tag published artifacts with the computed exact version and record the image
digest. Deploy by digest when reproducible identity matters. Multi-platform
images need the digest of their image index, not just one architecture's image.
Verify the scan, signature, and attestation results before allowing consumers to
use a published image. Prove it starts under its declared user with the expected
filesystem restrictions; a successful build does not establish runtime compatibility.
Automated dependency updates should
move the readable tag and digest together for review.