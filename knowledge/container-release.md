---
title: "Shared container release and security profile"
type: architecture
description: "Use the personal Docker action with explicit scanning, signing, SBOM, and attestation controls."
status: active
---

# Shared container release and security profile

The container build and publication path is
[`michielvha/docker-release-action`](https://github.com/michielvha/docker-release-action).
Its [inspected implementation](https://github.com/michielvha/docker-release-action/blob/c499e52a1a05e5bdd8cf03ba19a423d4c7ec25e3/action.yaml)
establishes the behavior below. Recheck the selected ref when upgrading; the
action metadata owns its full input/output contract.

## Required personal security profile

Configure these settings explicitly on a publication call. Several are disabled
by default for compatibility; calling the action alone does not enable the profile.

```yaml
trivy-scan: 'true'
trivy-severity: 'HIGH,CRITICAL'
trivy-exit-code: '1'
cosign-sign: 'true'
sbom: 'true'
attest-provenance: 'true'
attest-sbom: 'true'
```

This is a security-input excerpt, not a complete action invocation. Supply the
actual registry, credentials, project, computed version, context, and platforms
required by the selected action. Do not use its default `dev` version for a release.

| Control | What the inspected action does |
| --- | --- |
| Trivy | Scans the pushed version tag for the configured severities; exit code `1` fails the job on findings. |
| Cosign | Signs the final release digest with Sigstore keyless signing. |
| SBOM | Generates SPDX-JSON with Syft and uploads it as a workflow artifact. |
| Provenance | Attests build provenance bound to the final image digest and pushes the attestation to the registry. |
| SBOM attestation | Attests the generated SBOM against that same image digest; requires `sbom: 'true'`. |

When an authored OpenVEX document is available, supply its real path through
`vex` and enable `attest-vex: 'true'`. Never invent a VEX statement just to
suppress a scanner result. The action binds the document to the released digest.

The caller needs `contents: read` for checkout, `packages: write` for permitted
GHCR publication, `id-token: write` for keyless signing, and `attestations: write`
for GitHub attestations. SARIF reporting additionally needs `security-events:
write` and a repository/account that supports that upload. Unsupported features
need an explicit exception or implementation change, not silently disabled inputs.

## Build and matrix modes

The default mode builds and pushes a tagged image, then performs the enabled
security steps. Native matrix builds use `matrix-mode: build` for each platform
and `matrix-mode: merge` for the final image index. The build legs push by digest
and skip the scan/sign/attestation stages. Apply the full security profile to the
merge call so controls cover the final multi-platform artifact.

Use `release-digest` for the final default-mode image or merged image index.
`image-digest` in a matrix build leg identifies only that leg, not the final
release. A build leg's `release-digest` is empty. Sign, attest, and consume the
final digest rather than reconstructing an identity from mutable tags.

Build-time secrets use the action's `secret-files` forwarding and Dockerfile
BuildKit secret mounts, not `build-args`. Its `username` is used both for registry
login and the image namespace; verify those agree with the intended package owner
and token permissions. Do not assume a caller token can publish to another account.

## Boundaries and known gaps

The inspected action scans after pushing. A failed scan fails the job but does
not remove or quarantine the already-pushed image. Consumers must wait for the
security gates; do not describe this as a pre-push vulnerability barrier.

The inspected defaults are report-only Trivy and opt-in signing/SBOM/attestations.
The required profile above overrides them. SBOMs are workflow artifacts and
attestations, not automatically assets on a GitHub Release.

The action also publishes a `latest` image alias. That is not a deployment pin:
use the final digest or the exact version according to
[container conventions](../conventions/containers.md). Git release tags remain
exact-only; this image alias is a separate implementation detail.

Several nested actions at the inspected ref still use moving major refs. Pinning
the wrapper SHA does not fix that transitive supply-chain gap. Harden those refs
in the action itself rather than claiming this revision is fully immutable.

The shared action does not select or validate a distroless Dockerfile for the
caller. The caller remains responsible for the required runtime, pinned base
images, non-root startup, and filesystem smoke tests in
[container conventions](../conventions/containers.md).