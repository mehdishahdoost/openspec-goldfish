# Design

## Context

See proposal.md for motivation and capability boundaries. This is a greenfield repository: no package, source, tests, or existing durable specs are present. The local OpenSpec CLI exposes resolved roots, artifact paths, dependencies, and declared skips. These are the integration boundary; the installer must not patch generated OpenSpec skills.

Research established native subagents for Claude Code, Codex, and Devin CLI. The reference project's README was available, but implementation retrieval failed; no implementation compatibility or code reuse is assumed.

Primary references for adapter implementation and compatibility fixtures:
- https://code.claude.com/docs/en/sub-agents
- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://docs.devin.ai/cli/subagents
- https://docs.devin.ai/cli/extensibility/skills/overview
- https://github.com/VirtualMaestro/openspec-adversarial-multi-agent

## Goals / Non-Goals

**Goals:** A common review contract, isolated reasoning roles, native harness execution, safe installation, and traceable revisions. Keep model selection and authentication with the host.

**Non-Goals:** A model execution service, automatic hooks, enforcement of implementation gates, post-implementation review, package publication, or a universal agent runtime. Initial support is Claude Code, Codex, and Devin CLI; Devin Cloud is not implied by the Devin CLI adapter.

## Decisions

### 1. Small npm package with separate installer and protocol

Use a Node.js CLI, built-in filesystem/path/crypto facilities, packaged templates, and Node's test runner. A supported Node LTS minimum will be declared in package metadata and tested in CI. Proposed layout: `bin/` entrypoint, `src/install/`, `src/adapters/`, `src/review/` deterministic helpers, `resources/protocol/`, `templates/`, and `test/fixtures/`.

The default CLI action installs. It accepts one `--harness` per invocation and mutually exclusive scope flags. Prompts run only on an interactive terminal; no arguments means select harness then scope. Cancellation writes nothing. Local means the current directory, not an inferred parent repository. Global paths use the harness's documented configuration root, including documented overrides.

Alternative: an MCP service or custom model runner. Rejected because native harnesses already execute agents and the user requested npm installation into those harnesses.

### 2. Adapter-owned rendering and installation manifest

Each adapter defines scope paths, skill rendering, agent rendering, native invocation instructions, and capability checks. Claude uses Markdown agent definitions and its skill directory; Codex uses TOML agents and its supported skill directory; Devin CLI uses documented native profiles and skill discovery. Adapter tests pin supported configuration formats and document tested versions. Recheck vendor documentation during implementation before encoding exact paths and fields, especially Devin profile placement.

Install a skill named `openspec-goldfish` and namespaced cold-reader, adversarial-reviewer, and adjudicator agent definitions. Share canonical prompt sources in the package; render harness-specific wrappers. Resources must be reachable at both local and global scope without depending on the invoking process's working directory. Harness-specific copies are acceptable when needed to avoid discovery ambiguity; do not install duplicate discoverable skills for one harness.

A manifest per harness/scope records version, relative owned paths, and content hashes. Preflight every destination before writing. Reject symlink escapes and existing unowned or modified destinations. Stage writes, back up overwritten owned files, write the manifest last, and roll back on errors. Unchanged reruns are idempotent; upgrades replace only matching owned content. A second harness does not replace the first manifest. Uninstall is deferred; this version supports installation and safe rerun/upgrade only.

Alternative: copy a whole configuration directory or merge arbitrary user configuration. Rejected because file ownership and conflict reporting must be predictable.

### 3. OpenSpec discovery before agent execution

Resolve context and selected change through the CLI; retain explicit store identifiers on subsequent calls. If selection is ambiguous, ask. Require the transitive planning prerequisites of apply to be complete or explicitly skipped; this first version does not offer partial-package reviews. A missing root, unresolved store, unsupported metadata, or known implementation progress stops review with an explanation. Do not initialize or scaffold anything.

Treat the CLI's resolved change root as the report destination. Validate report paths against that root after resolving symlinks. For custom schemas, pass artifact IDs, dependencies, and their actual files to reviewers. If scope cannot be inferred, ask instead of silently reviewing another repository. Evidence of implementation progress includes checked task progress where available and user disclosure; Goldfish cannot prove that no implementation exists elsewhere.

### 4. Three isolated roles, with bounded execution

The coordinator resolves inputs and delegates, but does not replace failed independent reviewers with its own assessment. The cold reader receives artifacts and explicit constraints only; it starts without author history, code, previous reports, or other reviewers' output. It reconstructs intent before criticism. The grounded reviewer independently receives the same planning package and can inspect existing specs and relevant code. They can run concurrently or serially according to harness capacity, provided contexts remain separate.

The adjudicator runs after both and receives their outputs plus evidence access. It checks misunderstandings, duplicate issues, speculative claims, and already-covered behavior. Initial review uses one instance of each role rather than five fixed artifact critics: every role can reason across artifact boundaries while keeping cost bounded. Review lenses remain shared resources, so later specialization does not require a new protocol.

Use a documented default time budget of ten minutes per role; a timeout, malformed result, or missing isolation capability produces incomplete coverage. No automatic retries or repair loops. Fresh review invocation creates fresh reviewer contexts; previous finding history is supplied only to adjudication for tracking resolutions. Role prompts prohibit edits; native restrictions are used where available. Codex custom agents inherit parent permissions, so this is not advertised as a separate enforced sandbox.

Alternative: a single agent role-playing all reviewers. Rejected because it cannot provide the intended cold-read separation. For Codex interfaces without a custom-agent selector, explicit fresh native subagents receive the canonical role instructions and bounded packet in their initial message. Record this dispatch mode; do not claim TOML configuration was applied. Devin likewise uses registered Goldfish profiles when available; if absent, its built-in read-only `subagent_explore` profile receives canonical role instructions in a new independent conversation. Record `explore-role-message` without claiming custom profile configuration was applied. Isolation remains required. Unsupported isolation capabilities produce an explicit incomplete result instead of a silently weaker review.

### 5. Structured findings and deterministic report rules

Each review run gets a unique ID and a directory `.goldfish/reviews/<run-id>/` under the resolved change. Persist `inputs.json`, role results, `report.json`, and `report.md`. Input metadata includes the sorted planning file inventory and SHA-256 contents, schema/skip metadata, explicit constraints, package/protocol/harness versions, and identifiers or hashes for grounded evidence actually consulted. Do not copy author chat, credentials, or unrelated files into reports.

A finding contains an ID, originating role, location, concrete scenario, consequence, severity, resolution criterion, and adjudication disposition/reason. Critical means a fundamental contradiction or infeasible premise; major means a consequential implementation decision or failure path is missing; minor means a localized clarity improvement that does not block implementation. Unresolved questions carry an explicit blocking flag and rationale.

Deterministic helpers validate role output shape, coverage, input freshness, and verdict calculation. Complete plus no accepted critical/major issues or blocking questions yields ready; otherwise complete yields revise. Failed required roles yield incomplete/undetermined. Duplicate findings retain a canonical link; dismissals retain evidence. Counts do not outweigh severity. Fingerprints are checked again before finalization; changes yield a stale report whose historical verdict is not current.

No findings is valid. A report is advisory, never proof of correctness or a gate installed into OpenSpec apply. Markdown is rendered from the validated record so human and machine verdicts agree.

### 6. Revision is a separate accepted action

After reporting, the coordinator lists actionable finding IDs and proposed artifact edits and offers revision. Acceptance can cover all proposed fixes or a subset. Revision occurs in the author/coordinator context, not by retaining a cold reader as an editor. Re-read changed files before edits; material changes to the accepted fix require renewed agreement. Product decisions and scope changes require user input.

Only selected change planning artifacts can be edited. Record applied, deferred, and unresolved findings with changed paths in a separate revision record referencing the original run. Keep original report files immutable; calculate freshness against current inputs and store revision outcomes separately. Additions and deletions invalidate fingerprints too. Offer a new review, but wait for explicit invocation. Do not automatically re-review, start implementation, or label a fix verified.

## Risks / Trade-offs

- Harness formats and context inheritance vary -> pin adapter fixtures, verify native loading and fresh contexts in each supported harness, publish a tested compatibility matrix.
- Prompt instructions are not uniform permission enforcement -> configure native restrictions where supported and disclose inherited permission behavior.
- Model judgments vary -> validate structure and verdicts deterministically; evaluate seeded defects, clean proposals, and false-positive dismissals separately from unit tests.
- Cold readers lack repository context -> use a second grounded reviewer and adjudicate contradictions rather than treating every misunderstanding as a defect.
- Reports can become stale outside Goldfish -> compare input inventory and hashes whenever reporting current status or proposing revisions; no background watcher is installed.
- Install transactions cannot guarantee recovery after process termination -> stage files and keep recoverable backups; report interrupted state on the next run rather than claiming success.

## Migration Plan

No existing product data needs migration. Build and test the package tarball in temporary project and home directories, then smoke-test native loading and a sample review in each supported harness. Document manual commands and compatibility limits before a separate release decision. Rollback during installation restores overwritten owned files; testers can remove newly created files listed by the installation manifest. No publishing or modifications to user-wide harness configuration are part of implementing this change's automated tests.
