# Proposal

## Why

OpenSpec proposals need independent scrutiny before implementation: author conversations can conceal ambiguity, and plausible designs can contradict existing systems. OpenSpec Goldfish provides a portable, manually invoked cold-read and adversarial review workflow across coding harnesses.

## What Changes

- Distribute an npm CLI invoked as `npx openspec-goldfish --harness claude|codex|devin --local|--global`, prompting for missing selections in interactive terminals.
- Install a Goldfish review skill and native reviewer/adjudicator definitions through harness adapters, with shared protocol resources and ownership metadata.
- Review completed planning packages after proposal and before implementation, discovering artifacts through OpenSpec rather than assuming fixed filenames.
- Run independent cold-reading and repository-grounded adversarial review, then adjudicate evidence into a durable report with explicit coverage and readiness.
- Offer revisions after reporting; edit planning artifacts only after explicit acceptance. Preserve the original report, mark changed inputs stale, and offer another manually invoked review.
- Exclude automatic review hooks, implementation/code review, implementation edits, automatic repair loops, Devin Cloud integration, and publishing the package from this change.

## Capabilities

### New Capabilities

- `harness-installation`: Local/global npm CLI installation and safe management of harness-specific skills, agent definitions, and shared resources.
- `proposal-review`: Manual, isolated cold-read and grounded adversarial review of OpenSpec planning artifacts with evidence-based adjudication and persistent reports.
- `proposal-revision`: Explicitly accepted planning revisions, unresolved decision handling, and review freshness tracking.

### Modified Capabilities

None. This project has no existing capability specifications.

## Impact

This is a greenfield npm package; the repository currently contains only OpenSpec configuration and generated workflow skills. Implementation introduces the CLI, packaged protocol/templates, three adapters (Claude Code, Codex, Devin CLI), fixture-based tests, and usage documentation. Installation writes selected harness configuration at project or user scope; review writes reports under the selected OpenSpec change. Host harnesses supply agent execution and authentication; no model API service or credentials are introduced.
