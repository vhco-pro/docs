---
title: "Pilot a remote coding-agent interface"
type: guide
description: "Check native agent behavior and remote continuity before adopting a shared chat client."
status: draft
---

# Pilot a remote coding-agent interface

This is the evaluation procedure for the
[remote coding-agent setup](../knowledge/remote-coding-agents.md). The owner
authorized a Paseo trial on 2026-11-02. That trial does not adopt the client as
the shared setup. Start with Copilot CLI and a disposable repository. Claude and Codex remain separate acceptance targets before any claim
that one application replaces all three clients.

## Gather the host facts

The first trial server runs Fedora Linux 43 on x86_64 with systemd. Before
copying its setup to another server, record that server's distribution,
architecture, libc, init system and service account.
Check the account's repository paths, native agent installation paths, effective
versions, authentication and required environment. Do not copy credentials into
this public repository or onto the Mac.

Record the Mac's architecture and macOS version, the intended desktop artifact,
and whether its packaging satisfies the application requirement. Confirm the
Mac, phone and server have the required tailnet access. Capture existing Serve
routes and choose an unused endpoint. Do not reset routes or enable Funnel.

Make the feature inventory specific to the installed CLI builds. Use their
current command references and the owner's actual configuration. Mark each
required capability as untested, passed, failed or unavailable; do not count
an untested capability as preserved. File rewind is outside the
requirements. Missing conversation rewind does not imply missing chat; test
ordinary follow-up messages and session continuation directly.

## Choose a candidate and freeze the trial

Review the known capability gaps before installing anything. Cogpit's known
Copilot gaps already prevent full replacement under the current requirement.
Stop that path unless the owner explicitly changes the scope to a limited UX
measurement or confirms, with evidence, that each missing function is outside
the required workflow. A limited experiment does not accept the full setup.

For an eligible candidate, record the client release, immutable source revision,
server release and native CLI version under the adapter's exact launch flags.
Verify executable artifacts against upstream integrity evidence, following the
[delivery convention](../conventions/delivery.md#pinning-and-updates).
Do not reuse the earlier moving installer commands as a frozen deployment plan.
Prevent automatic upgrades during the measured trial, or invalidate the result
when an input changes.

Start in an isolated pilot account with its own authenticated native CLI and
fixture history. The account's filesystem permissions, not a folder-browser
starting path, define its access. `COGPIT_PROJECTS_ROOT` is not a sandbox.
Before using a day-to-day agent account, inventory and control
startup writes to agent homes, helpers, symlink targets and plugin instructions.
Compare files before and after startup. A disposable repository alone does not
isolate global skill changes. Limit the pilot account's filesystem access to
the trial repositories. Prepare the matching supervisor for the actual init
system, with an explicit executable path and environment. An assumed systemd
user unit is not a portable Linux installation guide.

Before attaching the Mac, test a known protected API endpoint through the
actual HTTPS proxy without credentials, then with the intended login. A public
discovery endpoint is not an authentication test. Check whether other local
accounts can reach Cogpit's trusted loopback path. Resolve that trust boundary
before exposing an existing agent account. Record where hub device credentials
are stored and which account can read them.

Inspect the actual Mac artifact's signing and notarization state. Do not infer
it from a workflow variable or bypass Gatekeeper as a default install step.
Test clean-Mac onboarding and the updater through a quit/relaunch cycle. A
change of client or CLI version invalidates the previous measurement. Confirm
that clean-Mac onboarding creates no local agent session and does not default
new sessions to the Mac. Installing a local CLI is not an accepted substitute
for remote-only onboarding.

## Establish the baseline

In a disposable repository, collect native-agent behavior before attaching a
client. Use the same effective CLI binary and version that the adapter will
launch, accounting for flags such as `--no-auto-update`; separately record and
test its headless protocol handshake. A newer interactive runtime is not a
valid baseline for an older bundled headless runtime. Use deterministic markers
to check instruction loading, a harmless hook, a test skill, a custom agent and an MCP tool. Record which configuration files
and versions produced the result. Keep fixture credentials and personal
instructions out of the public evidence.

Select an approval-requiring mode. Verify an allowed read, a denied modification,
a subsequently approved modification, a question and a plan approval. A client
must not silently switch the baseline to full access or auto-approve denied work.
Check the permission mode for every new session; do not assume a global
selection applies to all hosts or agents. Check that model and effort choices
actually reach the agent, rather than only changing a label in the client.

## Check the chat interface

Run the same probes through the macOS application's chat. Complete every required
interaction without opening a terminal interface. An embedded terminal panel
inside the client also counts as terminal fallback and fails that step.
Inspect tool output, errors, questions, permissions and subagent activity. Include the specific slash
commands, context controls and history operations from the feature inventory.

For each case, record the native baseline, client behavior, session ID, source
revision and result. Keep file-hook execution separate from SDK callback hooks.
A visible configuration file or a request flag is not an execution trace. Record
enabled plugins, their workspace scope and plugin safe-mode state so additional
instructions have an identifiable source.

Test a previously idle native session by its original ID and verify its history
and new messages. Separately test what happens when another process already owns
that ID. A clear refusal can protect the session while still failing a required
live-control workflow. Never work around the refusal by creating concurrent
writers or treating a replayed conversation as the same native session.

## Check client and host lifecycles

| Case | Evidence to collect |
| --- | --- |
| Mac app closes during work | The operation continues on the host; reopen the same session and verify output and pending inputs. |
| Network disconnect | Reconnect without duplicate prompts, repeated tools or silently approved requests. |
| Phone with Mac powered off | Open the same session, send a message and answer an approval without the Mac serving as a gateway. |
| Second remote host | Switch hosts and verify hostname, working directory and session identity before a harmless write in each fixture. |
| Similar session names on both hosts | Messages, approvals and file changes reach the selected host only. |
| Agent or client service restarts | Distinguish task interruption, durable history and explicit session continuation. Do not claim transparent recovery from a history reload. |
| Copilot child exits during a turn | Check all sessions sharing that child; distinguish lost live work from recoverable transcripts. |
| Host reboot | Verify service startup, authentication availability and session recovery under the real supervisor. |

Repeat the required interface and continuity cases for Claude and Codex before
claiming the setup replaces their clients too.

## Decide from the results

A candidate passes only when all required capabilities and remote access paths
have evidence for the selected versions. An unavailable required feature fails
the candidate; the owner must explicitly change the requirement before a reduced
configuration can be selected. Record the remaining unknowns and reject an
unsupported claim of complete parity.

The pilot report must distinguish source inspection, documented support,
observed runtime behavior and owner acceptance. Link the measurement from the
knowledge page. Prepare the actual onboarding guide only after the host facts
and candidate choice are settled.

## Roll back

Before the trial, record the services, binaries, configuration and routes that
already exist. Stop new trial sessions, then remove only the trial's supervisor
and reserved Serve endpoint. Preserve native session history and authentication.
Retain the prior client and CLI configuration so normal work can resume.

Compare the pre-trial inventory before removing helper skills or application
state. Do not delete a `cogpit*` directory, a marker directory, a data root or a
symlink target merely because its name matches the client. Restore only files
whose prior contents and ownership were recorded. Include the Mac app bundle,
application-support data and device registry, staged updates, bootstrap markers
and the isolated pilot account in that inventory. Remove a pilot account only
after retaining any required trial evidence. Remove linger only if the pilot added it and no other user service relies on it.

A failed trial does not authorize deleting an existing repository, resetting
Tailscale Serve or upgrading an agent used by other sessions. Record changes
to CLI auto-update settings and restore their previous values on rollback.


## First Paseo server

These commands reproduce the measured package and directory separation on a
Linux account with Node 24 and its native Copilot login already working. The
trial uses the existing account, so it does not provide filesystem isolation.
Choose unused listener and tailnet ports before exposing it.

```sh
trial_root="$HOME/.local/share/paseo-pilot"
mkdir -p "$trial_root/runtime" "$trial_root/state" "$trial_root/workspace"
chmod 700 "$trial_root/state"
npm install --prefix "$trial_root/runtime" --save-exact @getpaseo/cli@0.14.0
paseo_bin="$trial_root/runtime/node_modules/.bin/paseo"
git init "$trial_root/workspace"
"$paseo_bin" daemon config set daemon.listen 127.0.0.1:6867 --home "$trial_root/state"
"$paseo_bin" daemon config set daemon.relay.enabled false --home "$trial_root/state"
"$paseo_bin" daemon config set pluginsEnabled false --home "$trial_root/state"
"$paseo_bin" daemon config set agents.skills.selection '{"mode":"custom","skills":[]}' --home "$trial_root/state"
"$paseo_bin" daemon config set features.webUi.enabled true --home "$trial_root/state"
"$paseo_bin" daemon set-password --home "$trial_root/state"
"$paseo_bin" daemon start --home "$trial_root/state"
```

Keep the password in a password manager. Do not put it in a command URL or this
repository. Before adding a private HTTPS proxy, add the actual tailnet DNS name
to `daemon.hostnames` and restart the trial daemon. Preserve existing Tailscale
Serve routes and leave Funnel disabled. A proxy can serve the bundled web app
and its WebSocket connection from one HTTPS origin. Configure the client's
direct connection with that hostname, its chosen HTTPS port, SSL enabled and
the trial password. The current trial's private address is shared separately.

For macOS, obtain the matching architecture's DMG from the
[Paseo 0.14.0 release](https://github.com/getpaseo/paseo/releases/tag/v0.14.0).
Check the downloaded artifact's digest against the release asset metadata,
then inspect its signature and Gatekeeper assessment on the Mac. Complete
application onboarding and add the Fedora host before creating an agent.
The arm64 installation, signature and notarization checks passed in the trial.
The installed app connected directly over Tailscale HTTPS, sent a chat message,
approved an edit on Fedora and restored its connection and conversation after
quit/relaunch. Disable built-in daemon management in desktop settings when using
remote hosts only. The desktop client needs its own saved connection and trial
password; a browser login does not automatically configure the app.

For remote installation over SSH, first run `whoami` on the Mac and use that
account name. The display name is not necessarily the SSH login. Use an existing
trusted host key, create a dedicated client key if needed, authorize its public
key once on the Mac, and save `HostName`, `User`, `IdentityFile` and
`IdentitiesOnly yes` in a scoped SSH host entry. Verify with `BatchMode=yes` so
a password prompt cannot masquerade as unattended access. The trial established
this key-based path without sharing a Mac password.

The initial managed daemon continued after the launching command exited, but
it did not restart after a host reboot. A user systemd service was subsequently
configured for the trial. A further reboot test has not been performed. For a
managed instance that is not owned by that service, stop only its selected home:

```sh
"$paseo_bin" daemon stop --home "$trial_root/state"
```

Disable only the trial's selected Serve port when removing its private endpoint.
Retain native Copilot histories until their owner decides otherwise; stopping
Paseo does not remove those sessions.


## Add a phone over the private tailnet

Install the mobile app using the links on the
[official Paseo download page](https://paseo.sh/download), then connect Tailscale
on the phone to the server's tailnet. The phone connects to the Fedora daemon
directly. The Mac is not a gateway and does not need to stay on.

Choose **Direct connection**, or **Settings → Add host → Direct connection**
if the app is already configured. Enter the private HTTPS endpoint's DNS name,
its chosen Serve port and the daemon password. Enable **Use SSL** when using
the HTTPS proxy. The trial uses Serve port `8956`, forwarding to the loopback
daemon on `6867`; enter the external HTTPS port on the phone. Do not copy the
upstream example's plaintext port and SSL setting into this HTTPS setup.

Retrieve the trial password privately from its owner-approved storage or the
existing desktop connection. Keep the password and personal tailnet hostname
out of this public guide. The relay pairing button is a different transport
that asks to enable a relay; it is not needed for the existing Tailscale path.

Open **Copilot trial → Copilot remote trial**. Send a message that asks for
the earlier test codeword, then confirm the response appears in the same
conversation on the Mac. Next close the Mac app, send another phone message
and answer a harmless permission request in the disposable repository. Finally,
background and reopen the phone app to check reconnection. Record these as
physical-phone results only after the owner has completed them.

At preparation time, the private HTTPS origin returned the web client and the
daemon was reachable. One status-details request exceeded its 1.5-second
deadline, so endpoint readiness alone is not a complete phone acceptance test.
The owner has confirmed that phone access and an approval mode work. The
Mac-offline, phone background/reopen and network-switch checks remain pending.


## Phone QR pairing through the encrypted relay

Paseo 0.14.0 uses the relay for its built-in device-pairing QR. This is a
separate connection choice from direct Tailscale access. Enable it only when
the owner has approved that transport. The existing direct connection can remain.

The upstream flow is **Settings → your host → Pair a device → Enable relay**,
or `paseo daemon pair --relay --home <selected-home>` on the host. Open the
Paseo mobile app, select **Scan QR code** and scan the code on the trusted
desktop. Enter the daemon password if requested, then open the existing
workspace and conversation. See [upstream connectivity](https://paseo.sh/docs/connectivity).

The pilot QR includes the trial password in a supported relay connection link
so phone onboarding does not require typing it. That image and its pairing
payload are private login material and stay outside this documentation repository.
The code was generated and displayed on the Mac. The owner confirmed working
phone access on 2026-11-02 and reaffirmed it on 2026-11-03. This does not replace
the remaining lifecycle checks below.

After the first chat succeeds, close the Mac app and send another phone message.
Answer an approval in the disposable repository and check background/reopen
behavior on the phone before marking the mobile pilot accepted.


## Keep the Fedora daemon running

On systemd hosts, supervise `paseo daemon run --home <selected-home>` as a user
service. Use an explicit Node executable and installed CLI entry point, a PATH
that includes the native agent executables, the selected home and
`Restart=on-failure`. Keep passwords in the existing protected configuration.
Verify the unit with `systemd-analyze --user verify` before enabling it.

The trial service is `paseo-trial.service`. Check it with:

```sh
systemctl --user status paseo-trial.service
systemctl --user is-enabled paseo-trial.service
loginctl show-user "$USER" -p Linger
```

Lingering must be enabled for the user manager to start without an interactive
login. The Fedora trial account already had it enabled; it was not changed.
Check the actual HTTPS endpoint and relay connection after service activation.
Perform any later restart during an owner-approved maintenance window because
active agent processes can be interrupted. A real reboot and conversation
recovery test is still required before claiming boot continuity.

Stop this supervised trial through `systemctl --user stop paseo-trial.service`.
Disable its future startup with `systemctl --user disable paseo-trial.service`.
Keep service configuration and the selected state directory together in the
host runbook so a second daemon cannot accidentally start against the same home.


## Onboard another server

Additional servers are onboarded from the operator host, not by hand on each
server. The operator host keeps a private helper and a registry outside this
repository. Each server needs a key-based SSH alias, Node and npm, Git,
Tailscale, user lingering and at least one authenticated agent CLI.

The helper repeats the first-server layout under
`~/.local/share/paseo/{runtime,state,workspace}` with the same pinned release.
It binds the daemon to loopback, disables the relay and plugins, and installs a
`paseo.service` user unit with an explicit Node path and the agents' PATH. It
publishes one unused tailnet-only Serve port and refuses a port that another
route already uses.

`paseo daemon set-password` needs a terminal, and `daemon config set` refuses
the password key. The helper therefore generates the password on the operator
host and hashes it with the package's `hashDaemonPassword`. It writes only the
hash through the package's persisted-config API. The plaintext stays in a mode
600 file on the operator host; the server never receives it.

Verification covers HTTPS health, rejection without a password and acceptance
with the stored one. The WebSocket returns 503 until daemon bootstrap
finishes, so retry briefly before treating it as a failure. Run one minimal
agent turn to prove the agent CLI starts and is authenticated. A provider
usage-limit error still proves the transport but blocks acceptance.

To link the Mac, copy the password from the operator host straight to the Mac
clipboard over SSH and add a **Direct connection** with SSL on and the Serve
port. Clear the clipboard afterwards.
