---
title: "Private tailnet DNS access"
type: guide
description: "Diagnose private DNS failures and admit an approved device without broadening service access."
status: active
---

# Private tailnet DNS access

A connected Tailscale device may still lack access to a restricted nameserver. A
browser name-resolution error tells you the lookup failed. Check the device
resolver and the application separately before changing access.

With per-device access rules, each device that needs private DNS must be admitted
once. Joining the tailnet delivers the split-DNS route. The tailnet grant,
firewall rules and resolver ACL determine which devices can send queries through
it. On the client, keep **Use Tailscale DNS settings** enabled. Apply device
admissions in the deployment repository and on the resolver side.

## Check a new device

Run the system lookup from the affected device with the private hostname:

| System | Lookup |
| --- | --- |
| macOS | `dscacheutil -q host -a name <private-hostname>` |
| Windows | `Resolve-DnsName <private-hostname> -DnsOnly` |
| Linux | `getent ahosts <private-hostname>` |

If the same lookup works on an admitted device, check the failing device's
route and permissions. If the system lookup succeeds but the browser still
reports a DNS error, open a fresh tab and check the browser separately.

## Admit a device

1. Identify the failing device by its current tailnet identity and assigned
   IPv4 and IPv6 addresses. Verify that it accepts Tailscale DNS and that the
   private suffix points to the intended restricted nameserver.
2. Test the normal lookup and a direct lookup to the private resolver from that
   device. Compare with a known authorized client. Test HTTPS using the original
   hostname and the known service IP, for example with `curl --resolve`. Keep
   certificate verification enabled. Check the app hostname and its sign-in
   hostname.
3. If the device is excluded, get approval for its identity and the exact
   access it needs. Use the normal authenticated provider console or an
   authorized, scoped API credential. Retain a protected current snapshot and
   compare it again before writing.
4. Grant the exact device access to UDP and TCP port 53 on the intended
   resolver. Match the same source addresses in the resolver ACL and any
   intervening firewall. Keep existing deny rules, router administration, and
   the application's own permissions in place. If HTTPS also fails, assess
   and approve that access separately. Keep hostnames private and retain the
   existing split-DNS route.
5. Keep the device-specific change and its rollback procedure in the deployment
   repository. Validate the native policy before saving. Add positive DNS and
   negative administration tests, preserve existing tests and compare live
   readback with the approved change. Probe normal DNS and HTTPS on the
   affected device. If the change fails, remove the exact grant and matching
   firewall and resolver entries. Reconcile concurrent edits before rollback.

[Tailscale DNS](https://tailscale.com/docs/reference/dns-in-tailscale) · [Device selectors and protocol grants](https://tailscale.com/docs/reference/syntax/grants) · [Policy tests](https://tailscale.com/docs/reference/syntax/policy-file)
