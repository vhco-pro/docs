# vhco-pro/docs

Personal engineering conventions and shared knowledge for repositories owned by
`vhco-pro` and `michielvha`. Keep the structure small and the guidance usable.

## Start here

Agents read [AGENTS.md](AGENTS.md). Humans and agents use these task routes:

| Task | Read |
| --- | --- |
| Choose the look of a new or restyled user-facing interface | [VH Midnight](guides/vh-midnight.md): the default style unless the product has its own identity |
| Change code or scripts | [Coding](conventions/coding.md) |
| Write Go | [Go](conventions/go.md) |
| Specify, write or review PHP | [PHP](conventions/php.md) |
| Diagnose a failure, write or change tests, or judge whether a run proves a change | [Testing](conventions/testing.md) |
| Design or change an HTTP API | [HTTP API](conventions/http-api.md): API first, status codes for failed writes and timestamps |
| Write TypeScript | [TypeScript](conventions/typescript.md) |
| Build, test or review any browser frontend, including plain JavaScript and VitePress | [Frontend testing](conventions/frontend-testing.md): owned fixtures, browser scenarios and responsive visual verification |
| Design or review colour in an interface | [Colour in interfaces](conventions/interface-colour.md): colour for status and identity, neutral descriptive content or coloured icons, never colour alone |
| Design command-line output or terminal interaction | [Terminal output standard](conventions/terminal-output.md): labelled Unicode status, plain modes and stable machine output |
| Design, implement or review a user-facing interface in any stack | [Use frontend design skills](guides/use-frontend-design-skills.md) |
| Design, build or review a browser extension (Chrome MV3, Firefox WebExtension) | [Design browser extensions](guides/browser-extension-design.md): platform sources, pinned skills and measured popup, shortcut and permission conventions |
| Build or change a React application | [React](conventions/react.md) and [TypeScript](conventions/typescript.md) |
| Research React behavior or review React performance | [Use upstream React skills](guides/use-react-skills.md) |
| Build a container | [Containers](conventions/containers.md) and the [shared Docker security profile](knowledge/container-release.md) |
| Write or change a GitHub action or workflow | [GitHub Actions](conventions/github-actions.md) and the components in [shared delivery](knowledge/shared-delivery.md) |
| Change CI, dependencies, or releases | [Delivery](conventions/delivery.md), [managed dependency updates](knowledge/managed-renovate.md), [shared delivery](knowledge/shared-delivery.md), the [Go release pilot](knowledge/tag-driven-go-releases.md), and [PowerShell releases](knowledge/tag-driven-pwsh-releases.md) |
| Deploy a static site to Cloudflare from a pipeline | [Cloudflare static sites](conventions/cloudflare-static-sites.md) and the [complete pipeline example](examples/cloudflare-static/README.md) |
| Run iOS checks or use a private hosted Mac with Codemagic | [Remote macOS development with Codemagic (draft)](conventions/codemagic-remote-macos.md) |
| Set up Dependabot alerts, secret scanning, CodeQL or Scorecard | [Repository security](conventions/repository-security.md) |
| Bootstrap a new Go application | [Bootstrap a Go project](guides/bootstrap-go-project.md) |
| Apply these conventions to an existing repo | [Onboard a repository](guides/onboard-a-repository.md) |
| Evaluate one chat client for remote coding agents | [Remote coding-agent interfaces](knowledge/remote-coding-agents.md) and the [pilot guide](guides/pilot-remote-coding-agents.md) |
| Write or reorganize documentation | [Documentation](conventions/documentation.md) and [humanize prose](guides/humanize-prose.md) |
| Write a commit message, PR, issue or review summary | [Humanize prose](guides/humanize-prose.md) |
| Write or edit a skill, agent entry point, reviewer prompt or a reference an agent loads | [Write for agents](guides/write-for-agents.md) and [humanize prose](guides/humanize-prose.md) |
| Specify, plan or implement a feature | [Feature documents](conventions/feature-documents.md) and [feature delivery](conventions/delivery.md#feature-delivery) |
| Ship a change | [Feature delivery](conventions/delivery.md#feature-delivery) and [delivery](conventions/delivery.md) |

## Where facts belong

- `conventions/`: how work is done across repositories.
- `knowledge/`: shared capabilities, their boundaries, and where to find them.
- `guides/`: concrete procedures.
- `decisions/`: durable choices affecting several repositories.

A component's implementation, inputs, and usage remain in that component's
repository. Write a fact in one place and link to it elsewhere. Do not create
empty categories, repository inventories, or a knowledge mapper.

Shared actions can remain under `michielvha`; the knowledge home is `vhco-pro/docs`.
Repository ownership does not decide where an agent looks for a component.

## Checking changes

Use Node 24 or newer, run `npm ci`, then `npm run check`. The checker validates
local Markdown links, content frontmatter, and decision status. It does not
prove that external components behave as documented; inspect their selected refs.
Personal engineering conventions, shared delivery knowledge, and agent onboarding for vhco-pro and michielvha repositories
