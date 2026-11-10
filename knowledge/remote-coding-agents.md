---
title: "Remote coding-agent interfaces"
type: architecture
description: "Evaluate one macOS chat interface for native coding agents on several remote hosts."
status: draft
---

# Remote coding-agent interfaces

The intended setup uses one macOS application to control Claude Code, Codex and
GitHub Copilot CLI on remote Linux hosts. Copilot is the first evaluation target.
The application presents conversations, tool output, questions and permission
requests as chat. Agent processes, repositories and credentials stay on the
selected server. A terminal interface does not meet this requirement.

No client has been adopted. A Paseo trial is running on the first Fedora server.
The earlier Cogpit installation recipe has not been validated end to end. Use
the [pilot guide](../guides/pilot-remote-coding-agents.md) for the procedure and
the dated runtime findings below for what has actually passed.

## What must be preserved

Using an installed CLI establishes which agent engine runs. It does not prove
that a client preserves the engine's defaults or exposes its whole interface.
Record the required native features and check each one against the same CLI
version used without the client. An unsupported required feature fails the
candidate. Changing that requirement is an owner decision.

The inventory includes instructions and configuration discovery, hooks, skills,
MCP servers, custom agents, model and effort selection, modes, approvals,
questions, subagent output, context controls and the native history operations
used in daily work. Scope goals, fork, rewind and other agent-specific functions
to the agents that actually provide them. A stored file being visible in a
configuration editor is not evidence that the running agent loads it.

File rewind is not required, as clarified on 2026-11-02. Normal two-way chat,
continued messages, tool output and approvals remain required. Conversation
rewind means rolling a transcript back to an earlier point; a missing rewind
control does not disable conversations or ordinary follow-up messages.

Keep four session operations distinct:

- Reading a stored transcript.
- Resuming an idle native session by its original ID.
- Steering the same process while another client owns it.
- Reconnecting to a session that the application already manages.

A client can support one operation and reject another. Do not run two writers
against the same session to test continuity.

## Cogpit source findings

The source measurement on 2026-11-01 used Cogpit `v3.5.3`, commit
`f492f811adb4fa9e71aadf4954f8745034eeb3e8`. These are source findings;
macOS installation and remote agent behavior have not been tested.

| Area | Finding | Consequence |
| --- | --- | --- |
| Agent process | Copilot runs as a headless CLI subprocess over JSON-RPC. | This is the Copilot engine, with a client-defined protocol surface. |
| Active native sessions | Resume checks whether another process owns the session and rejects an in-use session. | Existing history support does not establish live takeover. |
| Copilot interface | Its descriptor disables slash-command UI, MCP management, workflows, goals, subagent transcripts, image input and token streaming. Elicitation is disabled in session defaults; custom-agent selection is absent from the reviewed adapter. | Known UI gaps already prevent a claim of full Copilot parity. |
| Runtime version | Copilot is launched with `--no-auto-update`. | Measure the effective version under the launch flags. A normal version check can report a different runtime. |
| Configuration | Session defaults enable configuration discovery. They separately disable callback hooks and several callback/event surfaces. | Native file-hook inheritance remains a runtime check; `hooks: false` alone does not prove file hooks are disabled. |
| Remote hosts | Each Cogpit instance stores its own device registry and proxies the selected device. | The Mac's registry is not automatically the phone's registry. Test the phone while the Mac is offline. |
| Desktop | The macOS distribution uses Electron. First-run local configuration can gate access to device management. | Test a clean Mac and decide whether this desktop implementation meets the app requirement. |

Evidence: [Copilot transport](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/agents/copilotTransport.ts#L245),
[resume ownership](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/agents/copilotTransport.ts#L539),
[Copilot capabilities](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/shared/session/agent-descriptors.ts#L979),
[device registration](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/src/components/DevicesDialog.tsx),
and [configuration detection](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/config.ts#L222).

On the review host, normal `copilot --version` reported `1.0.105`, while
`copilot --no-auto-update --version` reported `1.0.51`. This establishes a local
version difference. It does not establish which version another server will use
or whether that version supports Cogpit's protocol.

The current Cogpit proposal fails the full-replacement goal on this evidence.
A limited UX measurement would need an explicit owner scope change before
installation. Do not proceed merely because the engine is the native CLI.
The descriptor's effort flag is also disabled, while the transport has an effort
RPC; resolve that discrepancy at runtime rather than declaring effort supported.
Native MCP loading and OAuth behavior need their own test, separate from the
missing MCP management and elicitation controls.

## Deployment findings

Cogpit startup calls `installBundledSkills`, which refreshes four helper skills
in existing native agent homes. An existing target file can resolve through a
symlink. This can change a dotfiles checkout or native sessions used outside
Cogpit. `COGPIT_SKILL_HOME` can change those targets, but isolating these writes
does not prove that all client-added instructions have been removed. Enabled
plugin skills can separately append instructions to Copilot's system message.
Inspect [startup](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/app-server.ts#L185),
[skill writes](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/agents/skills.ts),
and [plugin instructions](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/agents/copilotTransport.ts#L111)
before starting it against an existing agent account.

The direct-local authentication bypass requires a loopback socket, a trusted
local Host hostname and no forwarding headers. Validate both the proxy path and the host's local trust
boundary; a password file alone does not establish either. Hub device passwords
are stored as plaintext fields in an owner-only JSON file, rather than a
Keychain reference. The [usage guide](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/docs/usage.md)
also states that new sessions default to full access. These are properties of
the reviewed design, not results of an authentication or permission test.
See [request trust](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/security.ts#L38)
and [device credential storage](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/hub/registry.ts#L6).

One Copilot child serves the host's sessions. Shutdown destroys its active
sessions and shuts down the runtime. A child exit or connection loss clears the
transport's active sessions too. Durable transcript recovery therefore needs a
different acceptance case from keeping an in-flight task alive.
See [shutdown](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/server/agents/copilotTransport.ts#L1382).

The Mac updater can stage a release and replace the app on quit. A source tag
by itself does not freeze the running desktop client. The release workflow
includes a private edition checkout and disables automatic signing-identity
discovery. Those workflow readings do not establish the signature or exact
contents of a downloaded DMG. Check the actual artifact and the update policy
before treating it as an immutable, inspected client. See the
[updater](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/electron/updater.ts#L91)
and [release workflow](https://github.com/gentritbiba/cogpit/blob/f492f811adb4fa9e71aadf4954f8745034eeb3e8/.github/workflows/release.yml).

The reviewed Copilot settings descriptor targets `config.json`. Current
[CLI configuration documentation](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)
separates settings from application state. Validate the specific fields against
the effective CLI version before relying on the editor to change agent behavior.

## Paseo source precheck

A follow-up source reading on 2026-11-01 used the stable Paseo `v0.14.0`
release, commit `8c6de842a3157530c26a7a94c78a3d647fb96ce9`. Its Copilot
adapter launches `copilot --acp`, declares session listing and persistence,
and maps custom-agent selection and Agent, Plan and Allow All modes.
These are source findings, not successful runtime checks.

The same adapter explicitly sets conversation rewind, file rewind and combined
rewind support to false. The shared ACP implementation also declares those
capabilities false. This does not disable normal chat. File rewind is outside
the clarified requirements, so its absence is not a reason to reject a Paseo
trial. Conversation rewind is a separate history operation, not sending or
continuing messages. Check the required daily workflows rather than treating
every missing native control as a blocker. ACP alone still does not establish
full parity, and a successful chat trial would not prove every integration.

Evidence: [Copilot capabilities and launch settings](https://github.com/getpaseo/paseo/blob/8c6de842a3157530c26a7a94c78a3d647fb96ce9/packages/server/src/server/agent/providers/copilot-acp-agent.ts#L25),
[shared ACP capabilities](https://github.com/getpaseo/paseo/blob/8c6de842a3157530c26a7a94c78a3d647fb96ce9/packages/server/src/server/agent/providers/acp-agent.ts#L270),
and [release connectivity procedure](https://github.com/getpaseo/paseo/blob/8c6de842a3157530c26a7a94c78a3d647fb96ce9/public-docs/connectivity.md).

The documented desktop connection can use SSH to the remote daemon. Direct
Tailscale access is another path to test. The source precheck changed no running
services. The original Opus review predates this source reading and the later
runtime trial.

## Paseo runtime trial

The owner authorized a trial on 2026-11-02. The first host runs Fedora Linux 43
KDE Plasma on x86_64, with Node 24.19.0 and npm 11.17.0. Paseo CLI and server
0.14.0 were installed in a dedicated directory. The CLI package integrity
matched the npm registry SHA-512 value, and the dependency lockfile was retained.
Copilot reported 1.0.105 normally; Paseo launches it with `--acp`, without the
`--no-auto-update` flag that selected the older bundled runtime in the Cogpit
precheck. The live ACP runtime version was not independently captured.

The trial uses a separate Paseo home, a disposable Git repository, a loopback
listener and a new password. Plugins and bundled skill installation are disabled.
The relay was initially disabled. On 2026-11-02 the owner explicitly approved
enabling the encrypted Paseo relay for phone QR pairing. The direct Tailscale
connection remains configured. The trial reuses the existing account and Copilot login.
This is configuration separation, not an operating-system sandbox or a separate
pilot account. The agent retains that account's permissions and native settings.
Existing native sessions were not imported or taken over.

A private Tailscale Serve HTTPS endpoint proxies the trial listener. The
existing routes were retained and Funnel was not enabled. The exact HTTPS URL
returned the bundled web interface. A browser reached its welcome and direct
connection screens. The protected HTTPS API rejected an unauthenticated
request with 401 and accepted the trial password with 200. Authenticated browser
chat, a file-edit permission card and page reload with the same conversation
were subsequently tested through that HTTPS origin.

| Check | Observed result |
| --- | --- |
| Native Copilot session | Created through Paseo using Claude Opus 5.5 and the approval-requiring Agent mode. |
| Two-way chat | An initial response and a later response recalling a test codeword both completed. Each client command disconnected between turns. |
| Model and mode | The daemon reported `claude-opus-5.5`, medium reasoning and the ACP Agent mode. This is daemon state, not independent model-service attestation. |
| Tool permission | A shell request paused for approval. Denying it cancelled the turn and left the proposed test file absent. |
| Approved edit | A subsequent edit paused for permission. Allowing it created the fixture file with the exact expected bytes. |
| Daemon restart | After an idle worker restart, the same Paseo agent resumed and correctly recalled the original codeword. This does not test an interrupted turn or host reboot. |
| Browser chat and approval | Sent a message through the chat composer and received the expected reply with prior context. The Allow once button approved a fixture edit whose exact bytes were checked on the server. |
| Browser reconnection | Reloaded the page and recovered the same chat and its completed tool output. |
| Phone-sized layout | At a 390 by 844 browser viewport, the composer remained visible without horizontal page overflow. Sending with the Send button produced the expected response. This is desktop-browser resizing, not a physical-phone test. |
| macOS access | Key-based SSH works using the Mac account reported by `whoami`. A dedicated Ed25519 key and saved host alias avoid repeated username entry. |
| Mac installation | The arm64 DMG for 0.14.0 matched the upstream SHA-256 asset digest. Deep code-signature validation passed and Gatekeeper accepted it as Notarized Developer ID on macOS 26.6.2. The app is installed in the user Applications folder. |
| Desktop chat | The installed app connected directly to Fedora over Tailscale HTTPS, loaded the existing conversation and sent a message that correctly recalled its earlier context. Built-in local daemon management is disabled; only the remote host is registered. |
| Desktop approval | The Mac app displayed the proposed fixture edit. Clicking Allow once created the exact expected bytes on Fedora. The file was absent before approval. |
| Physical phone | The owner confirmed working phone access on 2026-11-02 and again on 2026-11-03, and reported that the approval mode works. Specific Mac-offline, phone background/reopen and network-switch cases are not independently verified. |
| Desktop relaunch | Quit and reopened the app. Its saved host, conversation and composer were restored without a fresh login. |

An initial desktop send attempt showed a connection timeout and retained the
unsent text. The connection recovered; retrying Send completed the chat turn.
No root cause was established, so longer-running connection reliability remains
a trial finding rather than an assumed pass. The native app completed the basic
chat and approval checks after recovery.

A second server, native hooks, skills, MCP, custom agents, and separate Claude
and Codex acceptance sessions remain unverified. Basic chat acceptance
does not establish full feature preservation. Private addresses,
passwords and personal connection details stay outside this public document.

The trial daemon was temporarily stopped during a host capacity investigation.
The measured host had eight CPUs, load near 90, full zram and about 13 GiB of
files in RAM-backed `/tmp`. Overlapping build/test processes and an unused
development server were stopped. After owner approval, 3.51 GiB of temporary
files were archived, compared against the originals and removed; one changed
directory was retained. The host still had other active workloads. These
findings do not establish the cause of every earlier connection timeout.

The daemon was subsequently restarted. Relay control connectivity was observed,
and a login QR was displayed privately on the Mac. Its copied image matched
the generated image's SHA-256 digest. The owner subsequently confirmed phone
access works. Background reconnection and phone operation while the Mac is
offline remain separate acceptance cases.

On 2026-11-03 a live check found that Fedora had rebooted and the original
managed trial daemon was stopped. The existing private HTTPS proxy returned
502. A scoped user systemd service was then installed for the same Paseo home
and pinned CLI, using foreground daemon mode and restart-on-failure. User
lingering was already enabled. The unit passed `systemd-analyze --user verify`,
was enabled and active, and the private HTTPS endpoint returned 200 after
startup. A real reboot and recovery test has not been performed.

## Alternatives to evaluate

This table records upstream documentation checked on 2026-11-01. It is not a
runtime compatibility matrix. Resolve an immutable release and inspect its
adapter before issuing installation commands.

| Client | Agent and remote interface | Requirement still to prove |
| --- | --- | --- |
| [Paseo](https://paseo.sh/docs/providers) | Existing CLIs through agent adapters, including Copilot through ACP; macOS app, mobile and web clients. [Connectivity](https://paseo.sh/docs/connectivity) documents desktop SSH and mobile Tailscale access. | Required Copilot controls, native configuration behavior, session identity and multi-host continuity. |
| [Happier](https://github.com/happier-dev/happier) | Desktop, mobile and browser clients with host daemons and a hosted or self-hosted relay. Its [Copilot integration](https://docs.happier.dev/agents/copilot) is experimental. | Exact-release Copilot feature coverage and transport. Its [capability guide](https://docs.happier.dev/agents/capabilities) distinguishes session listing from live takeover. |
| [HAPI](https://github.com/tiann/hapi) | Remote chat and approvals; [agent documentation](https://github.com/tiann/hapi/blob/main/docs/guide/agents.md) lists Claude, Codex and Copilot integrations. | A supported macOS desktop client, plus the required per-agent features. A PWA or phone app alone does not establish the Mac requirement. |
| [VS Code Agents window](https://code.visualstudio.com/docs/agents/run/agents-window) | Copilot and Claude SDK harnesses, experimental Codex Agent Host integration, and [remote agent connections](https://code.visualstudio.com/docs/agents/run/remote-agent-sessions) over SSH, dev tunnels or GitHub Environments (Preview). | Exact native CLI installation and history compatibility, required feature coverage, and a private phone path. This was added by the parent investigation and is outside the original Opus comparison. |
| [OpenCode](https://opencode.ai/v2/docs/cli/web/) | Its own agent with desktop, web and remote-service clients. | Using Copilot as a model provider does not preserve Copilot CLI as the agent engine. It does not satisfy that requirement on this evidence. |

A relay can remain private when self-hosted inside the tailnet. Happier should
not be excluded simply because its architecture includes a relay. HAPI
limitations documented for Cursor do not establish Copilot limitations. Neither
source inspection of Cogpit nor documentation-only readings of competitors
establish a reliable ranking of their feature depth. Paseo and Happier remain
candidates for a pinned adapter review, with every required Copilot capability
still to be verified. No alternative is an accepted replacement.

Cogpit remains an evaluated candidate, not an accepted default. None of these
readings establishes a client that preserves every required native feature.
Do not replace that claim with a terminal fallback in the acceptance path.

## Remote operation

A candidate must keep work on its selected host when the Mac app disconnects.
The phone must reach the same remote session without the Mac acting as its
only gateway. If a hub is needed, place it on an always-on host and document
which state belongs to the hub, the agent daemon and the native CLI.

Private Tailscale access is the preferred transport. Record existing Serve
configuration before adding a route, and reserve a free endpoint. Browser
access may need HTTPS even inside the tailnet. Use the client's own
authentication requirements; Tailscale reachability does not validate them.

A supervisor restarting a service is different from preserving an interrupted
agent operation. Test history recovery, explicit continuation and live task
continuity separately. Record which behavior the selected client guarantees.

## Review status

Claude Opus 5.5 reviewed the proposal through the installed Copilot CLI on
2026-11-01. The review model was confirmed as `claude-opus-5.5`; the bundled CLI
runtime was `1.0.51`. Its first disposition was a gated Copilot pilot, with no
adoption. The owner has not accepted reduced feature coverage or authorized
installation through this document.

The [original report](reviews/2026-11-01-remote-coding-agents-opus-5-5.txt) is
preserved unchanged. Read the [addendum](reviews/2026-11-01-remote-coding-agents-opus-5-5-addendum.txt)
and [final draft review](reviews/2026-11-01-remote-coding-agents-opus-5-5-final.txt)
with it: several original comparison, distribution, plugin-instruction and
rollback claims needed correction. The source findings above were checked independently by the parent
agent. Alternative client adapters and all Mac-to-server flows remain untested.
No client can be recorded as satisfying full required parity on this evidence.
The addendum's remaining draft findings were applied: known gaps block the full
replacement, effective versions must match the baseline, embedded terminals fail
the chat-only acceptance path, and state changes and rollback need inventories.
Opus reviewed byte-identical copies of the two draft pages, since its file
permissions denied direct access to this worktree. The parent checked the
README and record hashes. The final review found no blocker to draft status;
its recommended scoping, crash and rollback clarifications were then applied.
Raw reviews remain assessor records, with their qualifications and withdrawals;
this page is the corrected summary.

## Documentation and adoption

Keep this page as the shared requirement and evaluation record. Keep the pilot
procedure in its guide. After a candidate passes and the owner selects it,
record the consequential choice in `decisions/` and prepare a runbook for the
actual server distribution and init system. A completed source review is not
installation or operational acceptance evidence.
