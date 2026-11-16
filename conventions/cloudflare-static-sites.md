---
title: "Static sites on Cloudflare"
type: standard
description: "Deploy static Cloudflare sites from pipelines through the official Wrangler action."
status: active
---

# Static sites on Cloudflare

Use the official `cloudflare/wrangler-action` for pipeline-driven deployment of
static sites to Cloudflare Workers Static Assets or Cloudflare Pages. The
consumer repository owns its build, tests, hosting configuration and deployment
workflow. Reuse the upstream action directly. Record a concrete capability gap
before proposing a shared deployment wrapper. [Official action](https://github.com/cloudflare/wrangler-action)

## Pipeline

Run the site's verification on pull requests and its deployment branch. Deploy
the checked-out source after those checks pass. Keep the Cloudflare credential
in the deployment job's GitHub environment and make the deployment job eligible
only on the selected trusted branch or an explicitly authorised dispatch.
Pull-request verification runs with read-only GitHub permissions.

Pin actions to full commit SHAs with their release tags in comments. Install
Wrangler from the consumer's exact development dependency and committed lockfile.
The official action can use that installed version. Its `wranglerVersion` input
also supports an explicit version when the consumer installs the tool through
the action. Keep one authoritative tool version. [Action configuration](https://github.com/cloudflare/wrangler-action#configuration)

For Workers Static Assets, supply the repository's Wrangler configuration and
the native deployment command. For Pages, use its native `pages deploy` command
with the built directory and selected project. The same official action handles
both. [Wrangler deployment commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)

Use a deployment concurrency group for each site target. Run a public HTTP smoke
check after deployment. Use Cloudflare's deployment history or a source
redeploy for site recovery. The site follows Git commits and hosting deployment
records. Software artifacts published alongside it keep their own release
versions and provenance. [Cloudflare deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)

Provision domains, routes and hosting permissions through the consumer's
infrastructure configuration. Give the deployment credential the permissions
its selected command needs. Worker creation, existing-Worker deployment and
route changes have different native permission requirements. [Workers permissions](https://developers.cloudflare.com/workers/authorization/workers/)

## Adopt and verify

Start from the [complete Workers Static Assets example](../examples/cloudflare-static/README.md)
and adapt its build commands and target configuration. The consumer's normal
verification command must include its applicable lint, build and browser checks
under the [frontend testing standard](frontend-testing.md).

Validate the workflow with `actionlint`. Check the action's inputs against its
selected release when updating the pin. Verify that pull-request checks can
finish without deployment credentials and that a failed check prevents
deployment. After an authorised initial deployment, verify the actual URL,
assets and a normal redeploy or rollback. Consumers enforce this standard in
their checked-in workflow, workflow lint and deployment checks.

The shared docs checker validates this page's metadata and links. Consumer
pipeline adoption and live hosting verification belong to each site.
