---
title: "GitHub Actions"
type: guideline
description: "Build actions and workflows the shared way: where they live, how toolchains are installed, and the security, execution and release rules every workflow follows."
status: active
---

# GitHub Actions

These rules apply to every action, reusable workflow and workflow in a personal repository. They add
to [coding](coding.md), which covers scripts and action inputs, and [delivery](delivery.md), which
covers pinning, versioning and CI placement. [Shared delivery](../knowledge/shared-delivery.md) lists the
components that already exist.

## Shared components

- **Create new shared actions and workflows in the `vhco-pro` organization.** Existing `michielvha`
  components keep serving their pins until they move. Never create a second component for a job an
  existing one already does, in either account.
- **Install a toolchain once, through a setup action.** A tool that more than one action or workflow
  needs is installed by one setup action that owns its version pin and checksum. Every consumer calls it
  by full SHA and never copies the download or the pin. Use the upstream `actions/setup-<tool>` where one
  is maintained; create `vhco-pro/setup-<tool>-action` only when none is. A tool that one action alone
  uses may stay inside it, as git-cliff does in `gh-release-action`.
- **A setup action returns what it installed.** It exposes the resolved version as an output, so later
  steps read it from there instead of restating it.
- **Write composite actions that call scripts.** Steps in `action.yml` only order the work; the logic
  lives in scripts in the action repository, as [coding](coding.md) describes. Do not write a Docker
  action, which runs only on Linux runners, or a JavaScript action, which needs a committed bundle, unless
  the repository records why.
- **Validate inputs in the script.** GitHub does not enforce `required: true`, and composite inputs
  arrive as strings. The script checks every required input and every boolean-like input (exactly
  `true` or `false`) and fails naming the input.
- **Choose third-party actions by publisher.** Use another party's action only when GitHub (`actions/*`),
  a verified Marketplace creator or the tool's own vendor publishes it and keeps it maintained. Otherwise
  build the component yourself, under the rules on this page.

## Workflow files

Keep logic out of YAML, where it can be neither tested nor read in one place.

- **Move a long `run:` block to a script.** A `run:` block longer than a few lines becomes a script in the
  repository, as [coding](coding.md) describes for substantial logic.
- **Use `if:` only to gate jobs and steps.** A condition checks the event, the fork guard or an earlier
  job's output. Any other decision is made in a script, which returns its result as an output.
- **Let expressions only read values.** An expression reads a context value, an input or an output. A
  value that needs computing, such as a combination of conditions, comes from a script output instead.
- **Do not use YAML anchors or aliases.** Each job states its own steps, so a reader and a reviewer see
  the whole job where it is defined.
- **Pass values between steps as outputs.** Write to `$GITHUB_OUTPUT` and read `steps.<id>.outputs`, not
  `$GITHUB_ENV`. An output shows where a value comes from, while an environment write silently changes
  every later step in the job, which also makes it an injection path.

Tools are installed by setup actions or verified downloads, not baked into a runner image. These
repositories use GitHub-hosted runners, whose images they do not control and whose preinstalled
versions drift. If they ever run their own runner images, revisit this.

## Security

- **No `${{ }}` expression in a `run:` block.** Every value reaches shell code through `env:`, trusted or
  not. This is the bright line under the injection rule in [coding](coding.md).
- **Grant permissions per job.** Every workflow sets `permissions: {}` at the top, and each job grants
  only the scopes its steps use.
- **Pass secrets by name.** A called workflow receives no secret unless the caller passes it by name.
  Never use `secrets: inherit`; it also fails across accounts, such as a `michielvha` caller of a
  `vhco-pro` workflow. A reusable workflow declares each secret it reads under
  `on.workflow_call.secrets`. Check jobs receive no secret.
- **Do not keep checkout credentials.** Check out with `persist-credentials: false` unless a later step
  in the same job pushes.
- **Never run PR code with privileges.** Do not use `pull_request_target`, and do not let a
  `workflow_run` workflow check out or run PR code. A job that can write, tag or receive a secret runs on
  a PR event only when the PR comes from the same repository.
- **Prefer OIDC to stored keys.** Where a cloud or registry accepts GitHub's OIDC token, authenticate with
  it and store no long-lived credential.
- **Lint workflows.** Every repository with workflows runs `actionlint` over `.github/workflows/` and
  any `examples/` in its checks, or in its local command when it is private.

## Execution

- **Choose what a concurrency group may drop.** With the default queue, only the newest waiting run in a
  group survives, whatever `cancel-in-progress` says. Use `queue: max` with `cancel-in-progress: false`
  where every run must complete, such as one publication per tag. Use `cancel-in-progress: true` only for
  check runs off the default branch. actionlint 1.7.12 does not recognise `queue` yet; until it does, ignore exactly that message
  for the affected workflow in `.github/actionlint.yaml` and nothing else.
- **Key caches by their content.** A cache key changes whenever the cached content should, for example a
  hash of the lockfile. Never cache state that accumulates across runs under a fixed key: an exact key hit
  saves nothing, so the state freezes at its first save. One step per job owns restoring and saving each
  cache.
- **Set the shell.** Every workflow sets `defaults.run.shell` to `bash`, or `pwsh` for a PowerShell job,
  so inline steps fail on a broken pipeline as scripts do. Without it, Linux steps run `bash -e` with no
  `pipefail`.
- **Set a timeout.** Every job sets `timeout-minutes` to a few times its normal duration, not the
  360-minute default.
- **Check environment policies when a job moves.** A deployment environment can limit which branches
  and tags deploy. When a job moves to another trigger or ref, check the policies of every environment it
  uses and change them in the same plan.

## Release triggers and recovery

- **Match the tag filter to the releases it may start.** `v*.*.*` also matches prerelease tags such as
  `v1.2.0-rc.1`. A workflow that must publish only stable versions filters on stable tags and also checks
  `github.ref` in its first job, because a dispatch ignores the filter.
- **Every publishing workflow can be dispatched for an exact tag.** It runs on `workflow_dispatch` for an
  existing exact tag and validates that tag, so a failed release can be finished after GitHub's 30-day
  re-run limit. Within that limit, re-run the failed jobs.
- **Make publication safe to repeat.** A publish step run twice for one exact tag finds what already
  exists, completes only what is missing, and fails rather than replace a published file, package or
  image.
- **Release exact tags only.** GitHub recommends moving major tags such as `v1`; these repositories
  deliberately publish exact versions and pin by SHA instead ([delivery](delivery.md#git-and-versioning)).
  Do not add major or minor aliases.

## Sources

- [Metadata syntax for GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/metadata-syntax):
  `required` is not enforced; composite inputs; `action.yml` keys.
- [About custom actions](https://docs.github.com/en/actions/concepts/workflows-and-actions/custom-actions):
  Docker actions run only on Linux; JavaScript actions ship their dependencies.
- [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use): intermediate
  environment variables, least-privilege tokens, `pull_request_target` and `workflow_run`, OIDC.
- [Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows): secrets
  reach a called workflow only when passed; `secrets: inherit` works only within one organization.
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax):
  `concurrency.queue`, `defaults.run.shell` and its `pipefail` behaviour, `timeout-minutes`, filter
  patterns.
- [Control workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency):
  waiting runs are cancelled by default; `queue: max` keeps up to 100.
- [Dependency caching](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
  and the [actions/cache README](https://github.com/actions/cache/blob/main/README.md): a cache cannot
  change, and an exact hit saves nothing.
- [Re-run workflows and jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs):
  re-runs are allowed for 30 days.
- [Manage custom actions](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/manage-custom-actions):
  GitHub's major-tag advice this page diverges from.
