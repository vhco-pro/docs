# Cloudflare static-site pipeline example

Copy [deploy.yml](deploy.yml) to `.github/workflows/deploy.yml` in the consumer
repository and adapt [wrangler.toml](wrangler.toml) at its root.

The example assumes a Bun project with a committed `bun.lock`, an exact
`wrangler` development dependency and these scripts.

- `verify` runs the project's applicable lint, tests, browser checks and build.
- `build` produces the static site in `dist/`.

The official action uses the installed, locked Wrangler version. The example's
action pins were checked against their published releases on 16 November 2026.
Read the [static-site standard](../../conventions/cloudflare-static-sites.md)
when selecting or updating them.

Replace `static-site-example` and `static.example.com` with the provisioned
Worker and owned hostname. Those example values are documentation placeholders.
For a shared hostname, adapt the route configuration to the paths this site owns.

Create the `cloudflare-static-production` GitHub environment with deployment
access restricted to `main`. Store `CLOUDFLARE_API_TOKEN` as its secret and set
the environment variables `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_SITE_URL`.
Grant the token the native permissions required by the configured deployment.
The example deploys on successful main-branch pushes and records deployment
results in the normal Actions run and Cloudflare history.

Run `actionlint .github/workflows/deploy.yml` in the consumer. The docs
repository validates this example with
`actionlint examples/cloudflare-static/deploy.yml`. Exercise pull-request
verification and the real deployment after configuring an authorised target.
