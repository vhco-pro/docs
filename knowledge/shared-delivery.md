---
title: "Shared templates and delivery components"
type: architecture
description: "Find the actual public templates, actions, and workflows used by personal repositories."
status: active
---

# Shared templates and delivery components

The knowledge home is `vhco-pro/docs`. New shared actions and workflows are created in `vhco-pro`;
existing `michielvha` components keep working and move later. The rules for building them are in
[GitHub Actions](../conventions/github-actions.md).

## Find the implementation

| Need | Authoritative repository | Boundary |
| --- | --- | --- |
| Start a Go application | [michielvha/template-go-app](https://github.com/michielvha/template-go-app) | Template files are a starting point; apply the bootstrap guide. |
| Compute a version and tag | [michielvha/gitversion-tag-action](https://github.com/michielvha/gitversion-tag-action) | The selected action ref and its bundled/custom GitVersion config decide behavior. |
| Check Go source | [michielvha/go-ci-action](https://github.com/michielvha/go-ci-action) | The new pilot action owns blocking Go CI checks. Shared workflows compose it; they do not duplicate its commands. |
| Publish Go binaries | [michielvha/goreleaser-action](https://github.com/michielvha/goreleaser-action) | Inspect its selected metadata and signing requirements before wiring it. |
| Build and publish containers | [michielvha/docker-release-action](https://github.com/michielvha/docker-release-action) | Use the required [container security profile](container-release.md); inspect the selected ref. |
| Deploy static content to Cloudflare | [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action) | Follow the [static-site standard](../conventions/cloudflare-static-sites.md) for Workers Static Assets or Pages. |
| Tag and publish a GitHub Release for a repository whose tag is the release | [vhco-pro/gh-release-workflow](https://github.com/vhco-pro/gh-release-workflow), composing [vhco-pro/gh-release-action](https://github.com/vhco-pro/gh-release-action) | Tests run first; copy its example folder. Replaces `reusable-release.yml` in `vhco-pro/.github`. |
| Tag after checks, with labelled PR previews | [vhco-pro/version-workflow](https://github.com/vhco-pro/version-workflow) | Decides when a run tags and calls `gitversion-tag-action`; copy its example folder. |
| Check and publish a Go release for an exact tag | [vhco-pro/go-release-workflow](https://github.com/vhco-pro/go-release-workflow) | Composes `go-ci-action` and `goreleaser-action`; one example folder per arrangement. |
| Reuse org workflows | [vhco-pro/.github](https://github.com/vhco-pro/.github) | CodeQL and Scorecard workflows under `.github/workflows/`; discover the actual file before pinning it. [Repository security](../conventions/repository-security.md) says which repositories use them. |

These are source locations, not a promise that their default branches already
implement every convention. Existing references can be older than the reviewed
implementation. Always inspect the revision a consumer will execute.

## Anatomy of an action and a workflow

Copy these shapes rather than inventing new ones:

- **Action.** A composite `action.yml` whose steps call scripts, with `name`, `description` and
  `branding`. Credentials arrive as named inputs that the script reads from environment variables, and
  the README names the token permissions the caller grants. A value that can hold newlines, such as
  release notes, passes between steps as a file path output. [go-ci-action](https://github.com/michielvha/go-ci-action)
  is the reference.
- **Action tests.** A `test.yml` callable through `workflow_call` runs the action with `uses: ./`
  against a fixture, including at least one case that must fail, and `release.yml` needs it before
  `gh-release-workflow` tags. Copy [gh-release-workflow's action-repo example](https://github.com/vhco-pro/gh-release-workflow/tree/main/examples/action-repo).
- **Reusable workflow.** It sees the caller's `github` context and none of its `env`, and returns values
  through job outputs mapped to `on.workflow_call.outputs`.

Two GitHub features are not adopted yet. [Immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases)
would make a release job create a draft, attach every file and then publish, because files cannot be
added afterwards. [Workflow dependency lockfiles](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles)
cover transitive actions but have no documented Renovate support, so SHA pins with tag comments stay.

## Release contract

The shared release design uses GitVersion once, pushes only an exact version
tag, and renders Conventional Commit notes with verified `git-cliff`. A public
reusable workflow uses the caller's repository context and token. A dry run
computes and renders without publishing. Version outputs remain available when
tagging is skipped, and a publication retry must stay bounded to the exact tag.

`gh-release-workflow` implements this contract for repositories whose tag is
the release. Pin a released commit; do not claim behaviour that exists only in
an unreleased one.

The notes-only release workflow does not build or attach Go binaries or images.
A Go application using GoReleaser must have one release owner, not a second
parallel job creating the same GitHub Release. Read the selected component's
contract before combining flows; extend the shared flow deliberately when
artifact publication needs it.

The [tag-driven Go releases](tag-driven-go-releases.md) compose the Go CI,
GitVersion tag, and GoReleaser actions through `version-workflow` and
`go-release-workflow`. GitVersion is called directly, never through its internal
scripts. A branch publishes a prerelease only while its open PR has the
`release:preview` label. The release-only GoReleaser action is v2, a major
that existing v1 consumers adopt deliberately.

The [Cloudflare Worker email pattern](cloudflare-worker-email.md) uses a
shared CI action and release workflow to publish one version for multiple
independently activated site Workers.

## Separate implementation from convention

Dependency refs are maintained by the
[managed Renovate process](managed-renovate.md). Where App access is confirmed,
the hosted service updates SHA pins through PRs; repositories do not run their
own updater workers. Existing Dependabot coverage stays until that handover.

Use [delivery](../conventions/delivery.md) for pinning and publication rules,
[containers](../conventions/containers.md) for image rules, and the component's
own action/workflow file for its inputs. A public workflow can be consumed from
another account when the caller's Actions policy permits it. Private workflow
sharing is a different permission model; membership alone does not make an
internal workflow callable from a public repository.
