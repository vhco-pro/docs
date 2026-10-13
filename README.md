# vhco-pro/docs

Personal engineering conventions and shared knowledge for repositories owned by
`vhco-pro` and `michielvha`. This is a solo-developer software factory, not a
company platform. Keep the structure small and the guidance usable.

## Start here

Agents read [AGENTS.md](AGENTS.md). Humans and agents use these task routes:

| Task | Read |
| --- | --- |
| Change code or scripts | [Coding](conventions/coding.md) |
| Write Go | [Go](conventions/go.md) |
| Build a container | [Containers](conventions/containers.md) and the [shared Docker security profile](knowledge/container-release.md) |
| Change CI, dependencies, or releases | [Delivery](conventions/delivery.md) and [shared delivery](knowledge/shared-delivery.md) |
| Bootstrap a new Go application | [Bootstrap a Go project](guides/bootstrap-go-project.md) |
| Apply these conventions to an existing repo | [Onboard a repository](guides/onboard-a-repository.md) |
| Write or reorganize documentation | [Documentation](conventions/documentation.md) |

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
