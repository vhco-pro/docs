---
title: "Terraform, OpenTofu and Ansible conventions"
type: guideline
description: "Write reproducible infrastructure configuration and check it with native tools, Git hooks and GitHub Actions."
status: draft
---

# Terraform, OpenTofu and Ansible conventions

Use this guide with [coding](coding.md), [test strategy](test-strategy.md) and
[GitHub Actions](github-actions.md).

## Upstream skills

Read the task-specific skill at the linked source revision. Follow this convention for local
checks and CI. Apply upstream examples only where they match the project's engine, runtime and
permissions. Reading a reference needs no plugin installation and grants no permission to run
an apply, access infrastructure or install tools.

| Task | Upstream guidance |
| --- | --- |
| Write or review Terraform HCL | HashiCorp's [terraform-style-guide](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/terraform-style-guide/SKILL.md) <!-- renovate: source-ref=main -->. |
| Write Terraform module tests | HashiCorp's [terraform-test](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/terraform-test/SKILL.md) <!-- renovate: source-ref=main -->. |
| Change a Terraform Plugin Framework resource | HashiCorp's [provider-resources](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/provider-resources/SKILL.md) <!-- renovate: source-ref=main --> and [provider-test-patterns](https://github.com/hashicorp/agent-skills/blob/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/provider-test-patterns/SKILL.md) <!-- renovate: source-ref=main --> for implementation and acceptance tests. |
| Write or improve Ansible playbooks and roles | Ansible Community AI Forge's [write-content](https://github.com/ansible-community/ai-forge/blob/28a9a580b19e208e4c1bbd6146aa60e8aafe8a9f/ansible-content-development/module/skills/write-content/SKILL.md) <!-- renovate: source-ref=main -->. |
| Write functional tests for Ansible content | Ansible Community AI Forge's [write-content-tests](https://github.com/ansible-community/ai-forge/blob/28a9a580b19e208e4c1bbd6146aa60e8aafe8a9f/ansible-content-development/module/skills/write-content-tests/SKILL.md) <!-- renovate: source-ref=main --> for Molecule scenarios and assertions. |

For OpenTofu, use the [OpenTofu language and CLI documentation](https://opentofu.org/docs/) and
verify examples borrowed from Terraform against the selected OpenTofu version. The Ansible project
also documents [DevTools agent skills](https://ansible.github.io/vscode-ansible/ai/skills/) for tasks
such as building a task and explaining a plugin. Use the catalog to find the skill for the task.
Check the installed collection's module documentation with `ansible-doc` before relying on example
parameters or behavior.

## Terraform and OpenTofu

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

Backend-free validation checks configuration structure. Plan tests check fixture behavior.
A real plan for a deployment root and its state is a separate, authorized operation.

## Ansible

- **Pin the runtime and collections.** Declare the supported `ansible-core` version and
  lock the controller tooling, roles and collections. Use fully qualified collection
  names in tasks. Define inputs and defaults in the role, and keep host or environment
  settings in inventory.
- **Describe desired state.** Prefer modules that manage resources idempotently. Send
  service restarts through handlers. For a command with no suitable module, give it
  explicit change and failure semantics. Elevate privileges only for tasks that need
  them. Use `no_log` on secret-bearing tasks, keep secret values out of task names and
  diagnostics, and use fixture inventory and credentials for checks.
- **Lint playbooks and roles.** Run ansible-lint with the `production` profile for new
  content. Existing code can adopt it by affected path with a recorded baseline and
  narrowly justified exceptions. Keep lint's syntax check enabled. Supply the inventory,
  variables, roles and collections that syntax validation needs. Run
  `ansible-playbook --syntax-check` directly when diagnosing a particular playbook or
  when its entry point needs an explicit syntax proof.
- **Verify converge, idempotence and the result.** Test reusable roles or host changes
  whose behavior needs execution. Use Molecule or the repo's existing isolated fixture.
  Run against a fresh target, repeat and expect zero unexpected changes, then assert the
  resulting state. Choose a target representative of the effect, such as a disposable
  VM for boot and service-manager behavior. A syntax pass or check-mode run does not
  establish convergence. Keep fixture setup and cleanup within the test's ownership.

## Local checks and GitHub Actions

1. **Document the native commands.** A developer can run the individual tools to
   diagnose a failure. If several commands routinely run together, expose one existing
   repo check entry point or a short script. It returns the tool's failure and never
   rewrites source during verification.
2. **Keep Git hooks fast.** An opt-in repository Git hook calls the quick local checks
   for the relevant staged paths. Engine format checks and cached, scoped lint are good
   candidates. Leave dependency downloads, expensive scans and fixture provisioning for
   the full check. A hook is early feedback. The same failure must be detectable by the
   repository's full verification.
3. **Use the shared Actions pattern for hosted checks.** Pin maintained setup actions
   and tools. Use thin workflow YAML, with separate composite actions for reusable
   Terraform and Ansible checks if the need is shared. Keep tool logic callable locally.
   Test an expected failure as well as a pass. Public reusable components test synthetic
   fixtures in their own CI. Private repo code stays in its usual local verification path
   unless the owner requests a hosted run under the [delivery](delivery.md) policy.
4. **Keep check jobs read-only.** Use no deployment credentials, production inventory or
   remote state. Keep real plan, apply and playbook runs in the separately authorized
   deployment path. Keep existing project secret scanning in place.

Make works where a repo already uses it. `just` and Task can group commands and offer
discovery, but add prerequisites. GitHub Actions provides CI status and orchestration
on GitHub, while the native commands or a short shared script let authors run the same
checks at their desks and from Git hooks. Use those entry points before adding another
task runner or toolchain container.

## Sources

- [Terraform validate](https://developer.hashicorp.com/terraform/cli/commands/validate),
  [OpenTofu validate](https://opentofu.org/docs/cli/commands/validate/),
  [Terraform test provider mocks](https://developer.hashicorp.com/terraform/language/tests/mocking)
  and [Terraform sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data).
- [TFLint](https://github.com/terraform-linters/tflint),
  [tfsec migration to Trivy](https://github.com/aquasecurity/tfsec/blob/master/tfsec-to-trivy-migration-guide.md)
  and [Trivy misconfiguration scanning](https://trivy.dev/docs/latest/scanner/misconfiguration/).
- [Ansible-lint profiles](https://docs.ansible.com/projects/lint/profiles/) and
  [Molecule configuration](https://docs.ansible.com/projects/molecule/configuration/).
