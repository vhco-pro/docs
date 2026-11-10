---
title: "Repository security features"
type: guideline
description: "Turn on the GitHub security features a repository's visibility allows, and record those a private repository cannot have."
status: active
---

# Repository security features

Which GitHub security features a repository can use depends on its visibility. `michielvha` is a
personal account and `vhco-pro` is an organization on the Free plan. Neither has a GitHub Secret
Protection or GitHub Code Security licence, so the private-repository rules below apply to both.
Revisit this page if either account's plan changes.

The [onboarding guide](../guides/onboard-a-repository.md#turn-on-the-security-features) has the
commands that check and change these settings.

## Public repositories

Turn on the dependency graph, Dependabot alerts, secret scanning and push protection.

Run CodeQL code scanning with the reusable CodeQL workflow in
[`vhco-pro/.github`](https://github.com/vhco-pro/.github) for each language in the repository.
GitHub Actions workflows count as a language. Run OpenSSF Scorecard with the reusable Scorecard
workflow from the same repository and set `publish_results: true`.

Scorecard is only for public open-source projects. It rates a project's supply-chain practices for
outside users, and the workflow can publish results only for a public repository.

Pin both workflows to a full commit SHA as [delivery](delivery.md#pinning-and-updates) requires.
Read the selected workflow for its inputs and the permissions its caller must grant.

## Private repositories

Turn on the dependency graph and Dependabot alerts. Both are free on private repositories.

Code scanning, secret scanning and push protection need a paid licence on a private repository.
Do not add CodeQL or Scorecard workflows to one. A maintenance or audit report lists these features
as unavailable for the plan, not as findings to fix.

When a private repository becomes public, turn on the public features in the same change of
visibility.

## Updaters and alerts

One updater owns each ecosystem in a repository: the managed Renovate App or Dependabot, as
[delivery](delivery.md#pinning-and-updates) describes. Dependabot alerts stay on with either
updater.

Renovate reads Dependabot alerts through its `vulnerabilityAlerts` setting. It opens a fix PR for
an alert immediately, ignoring its schedule and PR limits. The Renovate App needs read access to
Dependabot alerts for this. Where Renovate owns an ecosystem, leave Dependabot version updates and
Dependabot security updates off so both tools do not open PRs for the same fix.

## Container images

Every published image uses the [container security profile](../knowledge/container-release.md):
a blocking Trivy scan, Cosign keyless signing, an SBOM, and provenance and SBOM attestations.
Visibility does not change the scan, the signature or the SBOM. GitHub artifact attestations are
not available to a private repository on these plans; the profile's
[known gaps](../knowledge/container-release.md#boundaries-and-known-gaps) describe what a private
repository does instead.
