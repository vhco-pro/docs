---
title: "Shared templates and delivery components"
type: architecture
description: "Find the actual public templates, actions, and workflows used by personal repositories."
status: active
---

# Shared templates and delivery components

The knowledge home is `vhco-pro/docs`. Shared implementations can live under
`michielvha` or `vhco-pro`; no repository move is required for a common convention.

## Find the implementation

| Need | Authoritative repository | Boundary |
| --- | --- | --- |
| Start a Go application | [michielvha/template-go-app](https://github.com/michielvha/template-go-app) | Template files are a starting point; apply the bootstrap guide. |
| Compute a version and tag | [michielvha/gitversion-tag-action](https://github.com/michielvha/gitversion-tag-action) | The selected action ref and its bundled/custom GitVersion config decide behavior. |
| Publish Go binaries | [michielvha/goreleaser-action](https://github.com/michielvha/goreleaser-action) | Inspect its selected metadata and signing requirements before wiring it. |
| Build and publish containers | [michielvha/docker-release-action](https://github.com/michielvha/docker-release-action) | Use the required [container security profile](container-release.md); inspect the selected ref. |
| Reuse org workflows | [vhco-pro/.github](https://github.com/vhco-pro/.github) | Reusable workflows are under `.github/workflows/`; discover the actual file before pinning it. |

These are source locations, not a promise that their default branches already
implement every convention. Existing references can be older than the reviewed
implementation. Always inspect the revision a consumer will execute.

## Release contract

The shared release design uses GitVersion once, pushes only an exact version
tag, and renders Conventional Commit notes with verified `git-cliff`. A public
reusable workflow uses the caller's repository context and token. A dry run
computes and renders without publishing. Version outputs remain available when
tagging is skipped, and a publication retry must stay bounded to the exact tag.

The reusable release workflow is introduced through
[the shared workflow PR](https://github.com/vhco-pro/.github/pull/15), with the
action changes reviewed in
[the GitVersion action PR](https://github.com/michielvha/gitversion-tag-action/pull/5).
Until reviewed changes are merged and released, choose the reviewed commit
explicitly; do not claim these additions exist in an older released ref.

The notes-only release workflow does not build or attach Go binaries or images.
A Go application using GoReleaser must have one release owner, not a second
parallel job creating the same GitHub Release. Read the selected component's
contract before combining flows; extend the shared flow deliberately when
artifact publication needs it.

The [tag-driven Go release pilot](tag-driven-go-releases.md) separates GitVersion
tag creation from shared Go verification and signed artifact publication.
It retains read-only PR checks and allows manually requested trusted-branch
prereleases. Existing component interfaces remain unchanged.

## Separate implementation from convention

Use [delivery](../conventions/delivery.md) for pinning and publication rules,
[containers](../conventions/containers.md) for image rules, and the component's
own action/workflow file for its inputs. A public workflow can be consumed from
another account when the caller's Actions policy permits it. Private workflow
sharing is a different permission model; membership alone does not make an
internal workflow callable from a public repository.