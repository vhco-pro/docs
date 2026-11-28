---
title: "Terraform and OpenTofu conventions"
type: guideline
description: "Write reproducible Terraform and OpenTofu configurations and verify them with the engine each root supports."
status: active
---

# Terraform and OpenTofu conventions

Use this guide with [coding](coding.md) and [test strategy](test-strategy.md).

## Upstream skills

Read the task-specific skill at the linked source revision. Follow this convention for local
checks and CI. Apply upstream examples where they match the project's engine, runtime and
permissions. Reading a reference grants no permission to install tools or access infrastructure.

| Task | Upstream guidance |
| --- | --- |
| Write or review Terraform HCL | HashiCorp's [terraform-style-guide](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/terraform-style-guide/SKILL.md) <!-- renovate: source-ref=main -->. |
| Write Terraform module tests | HashiCorp's [terraform-test](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/terraform-test/SKILL.md) <!-- renovate: source-ref=main -->. |
| Change a Terraform Plugin Framework resource | HashiCorp's [provider-resources](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/provider-resources/SKILL.md) <!-- renovate: source-ref=main --> and [provider-test-patterns](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/provider-test-patterns/SKILL.md) <!-- renovate: source-ref=main --> for implementation and acceptance tests. |

For OpenTofu, use the [OpenTofu language and CLI documentation](https://opentofu.org/docs/) and
verify examples borrowed from Terraform against the selected OpenTofu version.

## Configuration and modules

- **Choose the engine for each root.** Declare the supported version and run its own
  formatter, validator and test command. A repo that promises both engines checks both
  on its supported versions. Commit dependency lock files for deployable roots. Pin
  external module revisions and scope each root to the state it owns.
- **Use stable resource identities.** Key repeated objects by stable names or IDs. Review
  address changes with the corresponding move or import and verify the exact plan.
  Keep state, saved plans and secret values out of Git and out of ordinary CI artifacts.
  A value marked sensitive can still be present in state.
- **Check every affected root or module.** Run the selected engine's `fmt -check -recursive`.
  Initialize deployable roots with `init -backend=false -lockfile=readonly`, then run
  `validate`. Initialize fixtures and reusable modules with the dependencies they
  actually declare. Select dependent roots when a shared module changes. Run TFLint
  with the repo's pinned rules and only relevant provider plugins.
- **Scan source for misconfiguration.** Start with one maintained scanner. Trivy is
  the proposed default because it includes the former tfsec checks. Prove it scans
  the intended files by checking a clean fixture and a known violation. Record the
  checks that apply to the selected providers. Add another policy scanner only for an
  identified coverage gap. Scope exceptions to the specific check and resource, with
  a reason and review date.
- **Exercise module behavior.** Use engine-native plan tests with mocked providers where
  the selected engine and provider support them. Assert resource shapes, derived values
  and input refusals. Use Go integration tests when a behavior needs an actual provider
  or cross-system proof. Keep defaults and outputs documented. Generate module references
  with `terraform-docs` when the module already depends on generated input/output docs or
  has enough of a public interface to warrant it.
- **Review reusable module changes against the base revision.** Check input and output
  compatibility, changed defaults, resource address moves, and version floors. Inspect affected
  callers and examples, and record any behavior the checks could not verify. The [modules.tf reviewer](https://github.com/modulestf/modulestf/blob/fd0b81bd6d5f8f3983b7c5bba354b76591cfd84b/.agents/skills/terraform-module-reviewer/SKILL.md) <!-- renovate: source-ref=master -->
  is an optional reference for rule-by-rule review. Its bundled profile is specific to
  `terraform-aws-modules`. Apply the rules of the module under review.

Backend-free validation checks configuration structure. Plan tests check fixture behavior.

## Local checks and GitHub Actions

Follow the [shared infrastructure checks](delivery.md#infrastructure-checks) for local commands,
Git hooks, and CI. The engine's format check and cached, scoped lint suit a quick hook.
Keep remote state out of check jobs. Run real plans and applies through the separately authorized
deployment path.

## Sources

- [Terraform validate](https://developer.hashicorp.com/terraform/cli/commands/validate),
  [OpenTofu validate](https://opentofu.org/docs/cli/commands/validate/),
  [Terraform test provider mocks](https://developer.hashicorp.com/terraform/language/tests/mocking)
  and [Terraform sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data).
- [TFLint](https://github.com/terraform-linters/tflint),
  [tfsec migration to Trivy](https://github.com/aquasecurity/tfsec/blob/master/tfsec-to-trivy-migration-guide.md)
  and [Trivy misconfiguration scanning](https://trivy.dev/docs/latest/scanner/misconfiguration/).
