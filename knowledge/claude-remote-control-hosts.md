---
title: "Claude Code Remote Control hosts"
type: architecture
description: "Keep a machine available as a Claude Code Remote Control environment with a per-user service, and know which steps only the owner can take."
status: active
---

# Claude Code Remote Control hosts

`claude remote-control` makes a machine appear as an environment where sessions
can be started from claude.ai/code and the Claude apps. Each process serves one
working directory. The connection runs through
Anthropic's cloud, so the host needs outbound internet access and no inbound port.

Host a bridge when sessions need what only that machine has: its checkouts, its
tools, its credentials or its hardware. A cloud session is enough for work that
needs only a repository.

## Run it as a service

The bridge has to outlive the terminal that started it. A tmux window works,
but it dies with the process and hides why it stopped, and on a workstation
nobody keeps a terminal open. Run it as a per-user service instead:

| Host | Service | Survives logout |
| --- | --- | --- |
| macOS workstation | A LaunchAgent in the `gui/<uid>` domain, loaded with `launchctl bootstrap` | No. It runs while the owner is logged in. |
| Linux workstation | A `systemd --user` unit | No. It stops with the last login session. |
| Linux server | A `systemd --user` unit with `loginctl enable-linger` | Yes. |

On macOS the LaunchAgent must run in the GUI domain. The CLI reads its login
from the Keychain, which a process in the GUI session can reach and an SSH
session cannot.

Two tools set the service up:

- On a workstation, vh-adlc's
  [`remote-control.sh`](https://github.com/michielvha/vh-adlc/pull/159), a POSIX
  shell script with `install`, `status` and `uninstall`. It writes the
  LaunchAgent or unit, restarts the bridge within 60 seconds after it exits,
  checks the traps below and prints the steps that are left. Sessions start in
  their own Git worktree by default, the mode the owner uses; `--spawn same-dir`
  starts them in the folder itself. Its user guide,
  `docs/user-guides/remote-control-host.md` in vh-adlc, lists the options. On 2026-11-23 the script was still in review in that pull
  request, and its Linux path had run only against stubs.
- On a lab server, the `claude_remote_control` Ansible role in
  [vhco-pro/lab](https://github.com/vhco-pro/lab), which sets up the
  `systemd --user` unit with linger. It is separate from the script.

## Traps

These stopped the first hand-built bridge, in this order:

1. `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` in the `env` block of a Claude
   settings file makes Remote Control fail with
   "requires feature-flag evaluation". Remove it from the file. Unsetting it in
   the shell does not help, because settings `env` overrides the shell.
2. On macOS the CLI reports "Not logged in" in an
   SSH session even when a login exists, because the Keychain is out of reach.
   The LaunchAgent can read it. Check the bridge's log, or run
   `claude auth status` at the Mac itself.
3. The bridge refuses a directory the owner has not trusted, with "Workspace not
   trusted".
4. The first `claude remote-control` asks
   "Enable Remote Control? (y/n)" once. A background service cannot answer it.
5. A terminal `claude remote-control` that still serves the folder, often the
   one used to answer that prompt, stops the service with "This folder is
   already served by a terminal `claude remote-control` on this device". Stop
   the terminal bridge, and the service takes over at its next retry.

## Steps only the owner takes

Trust and consent are the owner's decisions. An agent must not set
`hasTrustDialogAccepted` or answer the prompt for them, and neither tool
does. At a terminal on the host, in the working directory, the owner:

1. Runs `claude`, signs in if asked and accepts the workspace trust dialog.
2. Runs `claude remote-control` once and answers `y`.
3. Stops that terminal bridge with Ctrl+C. While it runs, the service cannot
   serve the folder.

The service retries every minute, so it starts by itself after these steps.

## Capacity

On 2026-11-23 the owner observed a limit of about 20 concurrent workers per
bridge. This is an observation, not a documented limit. Run several bridges,
each for its own working directory, when one is not enough.
