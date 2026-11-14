---
title: "Remote macOS development with Codemagic"
type: guideline
description: "Run iOS verification on hosted Xcode and handle private runner access and signing."
status: draft
---

# Remote macOS development with Codemagic

Use the project's existing macOS CI for repeatable checks when it supplies
the required Xcode and simulator. Use Codemagic when the work needs a private
Mac runner, an interactive Simulator session, or another capability the
existing CI cannot supply. Confirm the gap before adding a service or spending
build minutes. Follow the project's [delivery conventions](delivery.md) for
any publication or distribution that follows the check.

## Prepare and run

1. At intake, identify each required observation and the cheapest authorized
   environment that can produce it. Assign routine builds, fixture tests and
   repeatable UI checks to automation. Reserve the owner for account access,
   release decisions and observations that require their physical device.
   Gather missing access and decisions together before implementation.
2. Verify the authorized Codemagic account and project. For scripted runs,
   use the configured association and a protected API token. Use authenticated
   browser control for dashboard steps when available. Ask the owner to
   authenticate only when required. Confirm the current balance or spending
   limit, machine class, pinned Xcode build and required simulator runtime
   before dispatch. [API authentication](https://docs.codemagic.io/rest-api/codemagic-rest-api/)
   · [Machine types](https://docs.codemagic.io/knowledge-codemagic/machine-type/)
   · [Pricing](https://docs.codemagic.io/billing/pricing/)
3. Use the project's reviewed `codemagic.yaml`. Check the workflow ID in the
   source and verify the intended ref and immutable commit before dispatch.
   Bind the run to that commit again on the runner. Set a time limit sized
   for the work. Before retrying a dispatch with an ambiguous response, look
   for an existing build. The REST API can start and query builds, but its
   application inventory may omit workflows defined in YAML.
   [Builds API](https://docs.codemagic.io/rest-api/builds/)
4. Build with the pinned tooling, create a disposable simulator and install
   the exact test artifact. Run the project's UI tests with synthetic
   accounts, data and a test backend. Keep runtime identity, source commit,
   artifact digest, outcomes and limitations in the receipt. Collect diagnostics
   without credentials or private fixture data. Stop the owned runner and
   remove its temporary data when the check is done.
   [Codemagic test workflows](https://docs.codemagic.io/yaml-testing/testing/)

## Temporary SSH or VNC

Use a scripted workflow for routine checks. Enable remote access for a
specific build when you need the shell or GUI for diagnosis. Verify the build
ID, workflow and commit before opening its remote-access details. The
documented dashboard route is **Start new build → Enable SSH/VNC access**,
then **Explore build machine via SSH or VNC/RDP client** on the running build.
Use an approved provider integration if it supports the same scoped operation.
Treat connection commands and temporary credentials as secrets. Establish
SSH host trust from an authenticated source for that build before sending
private inputs. When the workflow records a host fingerprint, match it to the
authenticated log for the exact build. Stop on an identity or host-key mismatch. Verify the active
checkout and tool versions after connecting. [Codemagic remote access](https://docs.codemagic.io/troubleshooting/accessing-builder-machine-via-ssh/)

Keep ordinary simulator jobs independent of signing credentials and release
permissions. In the approved private signing workflow, verify the certificate,
provisioning profile, exported IPA digest and signed app entitlements. Clean
up temporary signing material. Upload and tester assignment have their own
authorization. If the approved scope is owner-only TestFlight, verify the exact
processed build, sole authorized tester, automatic distribution off and no
public link. [Apple internal TestFlight testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/)

## Match the test to the evidence

| Check | Evidence |
| --- | --- |
| Notification payload, delivery rules and retry behavior | Synthetic fixtures and provider contract tests. Capture the payload and verify privacy and send counts. |
| Installed app handles a notification and opens the right screen | Use a fresh simulator and drive the visible app where practical. `xcrun simctl push` injects a notification into Simulator. A fixture that supplies a tap reference directly checks app routing from that point. Record which path ran and assert the rendered destination. |
| Actual Apple sandbox push | On a runner and runtime that support sandbox APNs, observe registration, provider acceptance and receipt independently. Keep sandbox credentials and devices scoped to testing. |
| Production APNs and the distributed build | Use an authorized physical device and the exact signed build. Record permission, backend registration, provider acceptance, receipt and tap as separate observations. |
| Accessibility | Use automated layout and semantics checks and run installed UI checks in Simulator. Record whether the test used WebView font scaling, the OS text setting or spoken screen-reader output. |

[Simulator push injection](https://developer.apple.com/documentation/xcode-release-notes/xcode-11_4-release-notes)
· [Apple sandbox APNs support in Simulator](https://developer.apple.com/documentation/xcode-release-notes/xcode-14-release-notes)
· [APNs environment entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/aps-environment)

If the owner says the device is ready and the backend shows no registration,
record both observations. Check the build, account, backend origin, reachability,
permission state and registration request where evidence exists. Use a
simulator to reproduce the controllable parts while the phone is unavailable.
For a planning reminder, verify that tapping it opens the expected week and
shows the existing meal without starting a planning operation.

Bundle any remaining physical checks into one handoff. Confirm the build and
network access, test a temporary account page with disposable data, and give
its expiry in the owner’s time zone. Include the exact controls, expected
result and stop condition. Keep prior results with their exact build and test
conditions. Store project-specific repository references, workflow versions and
run receipts with the project.
