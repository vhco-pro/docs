---
title: "Claude Code Remote Control hosts"
type: architecture
description: "Keep a machine available as a Claude Code Remote Control environment with a per-user service, let its sessions use the host's browser, and know which steps only the owner can take."
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
  [`remote-control.sh`](https://github.com/michielvha/vh-adlc/blob/main/plugins/vh-adlc/scripts/host/remote-control.sh),
  a POSIX shell script with `install`, `status` and `uninstall`. It writes the
  LaunchAgent or unit, restarts the bridge within 60 seconds after it exits,
  checks the traps below and prints the steps that are left. Sessions start in
  their own Git worktree by default, the mode the owner uses; `--spawn same-dir`
  starts them in the folder itself. Its
  [user guide](https://github.com/michielvha/vh-adlc/blob/main/docs/user-guides/remote-control-host.md)
  lists the options. On 2026-11-23 its Linux path had run only against stubs.
- On a lab server, the `claude_remote_control` Ansible role in vhco-pro/lab,
  tracked in [lab issue #16](https://github.com/vhco-pro/lab/issues/16). It sets
  up the `systemd --user` unit with linger and is separate from the script.

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

## Browser access

A Remote Control session runs on the host, so it can drive a browser there
through the [Claude in Chrome](https://code.claude.com/docs/en/chrome)
extension. It then acts with the owner's sign-ins in that browser, for example
in a portal that has no API. A cloud session runs in a container and cannot
reach the host's browser this way.

The Claude Code documentation lists Chrome, Edge and other Chromium browsers
such as Brave, Arc, Vivaldi and Opera. Firefox-based browsers such as Zen are
not on that list.

Turn the browser on for every session in the `env` block of the user settings
file, `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_CFC": "1"
  }
}
```

The "Enabled by default" option in `/chrome` does not reach these sessions. In
Claude Code 2.1.330 a Remote Control or Cowork session ignores it and logs that
such a session "connects Chrome at start-up only with --chrome or with
CLAUDE_CODE_ENABLE_CFC=1". A project settings file cannot set the variable:
Claude Code ignores it there and shows a warning. With the variable set, every
session on the host loads the browser tools, which uses more context.

The owner sets up the browser once per host:

1. Installs the extension, version 1.0.36 or later, from the
   [Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
   and signs it in to the same claude.ai account and organization as Claude
   Code.
2. Signs in to the sites agents should use, in that browser.
3. Restarts the browser after the first session that has Chrome on. That
   session writes the native messaging host file, and the browser reads it only
   at startup.

A session connects only while the browser is running. Run `/chrome` in a
session to see the connection status, and choose "Reconnect extension" when the
connection drops after the browser has been idle.

On 2026-11-24 this setup was taken from the 2.1.330 binary and the Claude Code
documentation. It had not yet been run end to end.

## Capacity

On 2026-11-23 the owner observed a limit of about 20 concurrent workers per
bridge. This is an observation, not a documented limit. Run several bridges,
each for its own working directory, when one is not enough.
