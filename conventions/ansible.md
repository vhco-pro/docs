---
title: "Ansible conventions"
type: guideline
description: "Write reproducible Ansible playbooks and roles and verify convergence and idempotence."
status: active
---

# Ansible conventions

Use this guide with [coding](coding.md) and [test strategy](test-strategy.md).

## Upstream skills

Read the task-specific skill at the linked source revision. Follow this convention for local
checks and CI. Apply upstream examples where they match the project's runtime and permissions.
Reading a reference grants no permission to install tools or access infrastructure.

| Task | Upstream guidance |
| --- | --- |
| Write or improve Ansible playbooks and roles | Ansible Community AI Forge's [write-content](https://github.com/ansible-community/ai-forge/blob/28a9a580b19e208e4c1bbd6146aa60e8aafe8a9f/ansible-content-development/module/skills/write-content/SKILL.md) <!-- renovate: source-ref=main -->. |
| Write functional tests for Ansible content | Ansible Community AI Forge's [write-content-tests](https://github.com/ansible-community/ai-forge/blob/28a9a580b19e208e4c1bbd6146aa60e8aafe8a9f/ansible-content-development/module/skills/write-content-tests/SKILL.md) <!-- renovate: source-ref=main --> for Molecule scenarios and assertions. |

The Ansible project also documents [DevTools agent skills](https://ansible.github.io/vscode-ansible/ai/skills/)
for tasks such as building a task and explaining a plugin. Use the catalog to find the skill for the task.
Check the installed collection's module documentation with `ansible-doc` before relying on example
parameters or behavior.

## Playbooks and roles

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
- **Verify convergence, idempotence and the result.** Test reusable roles or host changes
  whose behavior needs execution. Use Molecule or the repo's existing isolated fixture.
  Run against a fresh target, repeat and expect zero unexpected changes, then assert the
  resulting state. Choose a target representative of the effect, such as a disposable
  VM for boot and service-manager behavior. A syntax pass or check-mode run does not
  establish convergence. Keep fixture setup and cleanup within the test's ownership.

## Local checks and GitHub Actions

Follow the [shared infrastructure checks](delivery.md#infrastructure-checks) for local commands,
Git hooks, and CI. Cached, scoped lint suits a quick hook. Use fixture inventory in check jobs.
Run playbooks against managed hosts through the separately authorized deployment path.

## Sources

- [Ansible-lint profiles](https://docs.ansible.com/projects/lint/profiles/) and
  [Molecule configuration](https://docs.ansible.com/projects/molecule/configuration/).
