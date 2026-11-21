---
title: "Hosting, service access and domains"
type: architecture
description: "Use Tailscale for private services, Cloudflare Tunnel for public self-hosted services, and the owner's active domain names."
status: active
---

# Hosting, service access and domains

The owner selected these defaults for VHCO and personal projects on 2026-11-13.
Choose the service's audience before configuring its hostname and ingress.

## Service access

Private services use Tailscale with access restricted to their intended clients.
OpenBao for the Homelab is a private service.
Its operator recovery path includes home-source-restricted public SSH and local service forwarding, as specified in the private Homelab guide.

Use Cloudflare Tunnel when a self-hosted web service needs public reachability.
The tunnel connects the origin to Cloudflare through an outbound connection.
Each public service defines its audience and application authentication.
Cloudflare Access can supply an identity gate where the selected audience requires one. [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

Cloudflare-native Workers use their own reviewed routes and deployment workflow.
The [contact email architecture](cloudflare-worker-email.md) records that existing pattern.

## Active domains

The owner confirmed these as the currently used domains on 2026-11-13.

| Domain | Intended use |
| --- | --- |
| `vhco.pro` | VHCO's portfolio and documentation site, with subdomains for project services, demonstrations and private Homelab services. |
| `stackweaver.sh` | The public Stackweaver product website and product documentation. |

Keep each concrete hostname's application route in its owning repository.
The existing [Stackweaver tunnel example](https://github.com/michielvha/stackweaver/blob/main/deploy/cloudflared-config.example.yml) describes project subdomains under `vhco.pro`.
The [Stackweaver site](https://stackweaver.sh) hosts the public product site and documentation.
Repository examples establish configured uses, while live route state needs its own readback.

## Private names and HTTPS

A hostname under an owned domain can resolve to a private Tailscale address.
Use private DNS or a DNS-only record, with the visibility of address records selected for the deployment.
DNS resolution and certificate issuance are separate from application reachability.
Cloudflare's proxy status determines whether HTTP traffic passes through its edge. [Cloudflare DNS proxy status](https://developers.cloudflare.com/dns/proxy-status/)

DNS-01 validation can issue a publicly trusted certificate for a private service by proving control of a DNS TXT record.
Keep the DNS API credential scoped to the necessary zone and stored in the deployment's protected credential location.
Record certificate renewal and the service's reload procedure in the owning operator guide. [ACME DNS validation](https://letsencrypt.org/docs/challenge-types/)

For an OpenBao service, native TLS can terminate at OpenBao while a private Tailscale TCP forward supplies reachability.
This is a deployment pattern to validate against the selected client version and existing Serve routes. [Tailscale Serve TCP forwarding](https://tailscale.com/docs/reference/tailscale-cli/serve)

## Source ownership

This page owns the shared access defaults and domain purposes.
Service repositories own manifests, application routes, tests and deployment instructions.
The private VitePress repository owns Homelab-specific configuration and operator procedures outside `app/`.
Keep credentials, tunnel tokens, certificate private keys and recovery material in their protected stores outside Git.
Changes to a domain's purpose or the selected access model need the corresponding owner decision recorded here and in the affected deployment.
