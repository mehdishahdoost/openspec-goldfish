<p align="center"><img src="assets/goldfish-cover.png" alt="OpenSpec Goldfish — Adversarial review system for OpenSpec" width="100%"></p>

# OpenSpec Goldfish

Independent eyes on your proposal, before implementation.

Goldfish gives your OpenSpec planning package a fresh-context cold read, a grounded adversarial review, and evidence-based adjudication. You invoke it manually, read the report, and choose whether to revise.

## Install

Requires Node.js 22+ and a supported coding harness. Review also requires OpenSpec with resolved artifact metadata. This package is in development and has not been published to npm.

From this checkout:

```bash
node bin/openspec-goldfish.js --harness claude --local
node bin/openspec-goldfish.js --harness codex --global
node bin/openspec-goldfish.js --harness devin --local
```

After publication, the equivalent installation will be:

```bash
npx openspec-goldfish --harness claude --local
npx openspec-goldfish --harness codex --global
npx openspec-goldfish --harness devin
```

Omit selections to choose interactively. The scope prompt defaults to the current project. In scripts, specify a harness and exactly one of `--local` or `--global`. Installation does not require or initialize an OpenSpec project.

## Review

Complete your OpenSpec proposal, then invoke in your harness:

```text
Claude Code: /openspec-goldfish <change-name>
Codex:       $openspec-goldfish <change-name>
Devin CLI:   /devin:openspec-goldfish <change-name>
```

```text
proposal --> manual Goldfish review --> report
                                         |
                                  offer revisions
                                         |
                                  user accepts edits
                                         |
                               offer manual re-review
```

- **Cold reader:** reconstructs intent without the author's conversation or implementation context.
- **Adversarial reviewer:** checks the plan against existing specs, code, and failure modes.
- **Adjudicator:** checks evidence, dismisses noise, and retains unresolved decisions.

Reports distinguish complete/incomplete coverage from ready/revise/undetermined readiness. One accepted major issue blocks readiness. No findings is a valid outcome. Reports are advisory; Goldfish does not gate OpenSpec apply.

## Revisions

Review only creates reports. Goldfish offers artifact edits and waits for your acceptance, including acceptance of a subset. Product decisions come back to you. Changed planning inputs make the previous verdict stale. Another review requires your explicit invocation; implementation never starts automatically.

## Installation safety

Local installation targets the current directory. Global installation uses the selected harness's user configuration. Rerun the same command to update unmodified Goldfish-owned files. Modified or unrelated files cause a conflict before changes are made; preserve your customizations before resolving that conflict. Multiple harnesses can coexist.

Ownership manifests live under `.goldfish-install/` in the selected configuration root. On a failed write, the installer attempts rollback. An interrupted transaction leaves a `.pending` recovery journal with original file contents encoded as base64 (`null` means newly created). Restore the listed paths and remove that journal only after recovery; the installer refuses to overwrite an interrupted installation. No uninstall command is provided yet.

See [compatibility](docs/compatibility.md), [acceptance status](docs/acceptance.md), and [review protocol](docs/review.md) for boundaries and validation status.

## Development

```bash
npm test
npm pack --dry-run
```

No runtime npm dependencies or separate model credentials are required. The selected harness runs the agents using its existing configuration.

<p align="center"><img src="assets/goldfish-logo.png" alt="Goldfish document mark" width="120"></p>

Inspired by the independent critique approach in [openspec-adversarial-multi-agent](https://github.com/VirtualMaestro/openspec-adversarial-multi-agent). Goldfish adds cold reading and a shared protocol across harness adapters.
