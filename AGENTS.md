# Agent entry point

This file is the harness-neutral entry point. Keep harness-specific files as
pointers here, not copies of these instructions.

1. Read [README.md](README.md) and follow its task route.
2. Read [coding](conventions/coding.md) before implementation and
   [documentation](conventions/documentation.md) before writing documents.
3. For a new Go application, follow the
   [bootstrap guide](guides/bootstrap-go-project.md). Start from the actual
   `michielvha/template-go-app`, not an invented scaffold.
4. For a consumer repo, follow the [onboarding guide](guides/onboard-a-repository.md).
5. To specify, plan, implement or ship a feature, follow the
   [feature-document standard](conventions/feature-documents.md) and
   [feature delivery](conventions/delivery.md#feature-delivery).

Read only the documents relevant to the task. There is no pack manifest, mapper,
or required agent framework. If a required source cannot be read, report that
and stop instead of inventing its rules.

Existing local repository instructions apply. Report conflicts with central
conventions; do not silently choose one. Do not expand scope, create remote
repositories, publish changes, merge PRs, or release software without the user's
authorization. A correction is not permission to publish.

Check component behavior against code at the selected ref, not a README alone.
Never invent tags, SHAs, checksums, secrets, project names, or accepted decisions.
Keep private credentials and unrelated organization details out of this repo.