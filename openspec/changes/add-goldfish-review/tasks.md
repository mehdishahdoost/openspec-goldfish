# Tasks

## 1. Package and installation contract

- [x] 1.1 Create npm package metadata, executable entrypoint, resource inclusion rules, and Node test setup; verify `npm pack --dry-run` includes the CLI and all required templates without development-only artifacts.
- [x] 1.2 Implement harness/scope argument parsing and interactive selection; verify tests for each explicit harness, missing selections, local default, cancellation, invalid flags, conflicting scopes, and noninteractive errors.
- [x] 1.3 Implement installation planning, path containment, ownership hashes, idempotent upgrades, staged writes, and rollback; verify temporary-directory tests for modified/unowned conflicts, symlink escapes, second-harness coexistence, write failure, and interrupted installation detection.
- [x] 1.4 Document installation, local/global scope, safe reruns, conflict recovery, and no automatic activation; verify examples against the CLI parser and temporary-home installations.

## 2. Harness adapters and native agents

- [x] 2.1 Verify current official configuration formats and skill/agent discovery paths for Claude Code, Codex, and Devin CLI; encode adapter fixtures and a compatibility matrix with source links, tested versions, permission limits, and context-isolation expectations.
- [x] 2.2 Implement Claude skill/agent rendering and local/global destination resolution; verify rendered metadata, packaged resource references, and both scope installations with fixtures.
- [x] 2.3 Implement Codex skill/TOML agent rendering and documented configuration-root handling; verify parseable definitions, both scopes, and preservation of parent permission settings using fixtures.
- [x] 2.4 Implement Devin CLI skill/profile rendering and scope resolution; verify fixture conformance and both scopes without implying Devin Cloud support.
- [x] 2.5 Define manual-only skill triggers and adapter-specific delegation instructions; verify generated output contains no proposal hooks or OpenSpec skill replacements and document invocation syntax for each harness.

## 3. Review input and report helpers

- [x] 3.1 Implement OpenSpec target discovery and planning prerequisite checks; verify fixtures for one/multiple/no changes, unresolved roots/stores, declared skips, custom artifact names, incompatible metadata, and known implementation progress.
- [x] 3.2 Implement sorted input inventories, content fingerprints, safe run directories, and report freshness checks; verify additions, edits, deletions, mid-review changes, repeated runs, and symlink containment without overwriting previous reports.
- [x] 3.3 Define and validate role-result/report schemas, evidence fields, dispositions, severity rules, and completion/readiness calculation; verify clean, minor-only, major, critical, unresolved, duplicate, malformed-output, and failed-role cases.
- [x] 3.4 Render human-readable reports from validated machine records and document their location and semantics; verify Markdown and JSON agree on verdict, coverage, findings, and freshness.

## 4. Independent review protocol

- [x] 4.1 Author shared cold-reader instructions and input-packet construction; verify a fixture with an author-only decision exposes missing artifact information and excludes author conversation, repository code, and previous findings from the packet.
- [x] 4.2 Author grounded reviewer instructions and evidence collection conventions; verify a seeded planning/repository contradiction produces references to both sources while a clean fixture permits no findings.
- [x] 4.3 Author adjudicator instructions and coordinator orchestration with bounded role execution; verify fixture runs retain dismissal reasons, canonical duplicate links, unresolved questions, and incomplete/undetermined results on timeout or missing isolation.
- [x] 4.4 Document review roles, manual invocation, pre-implementation scope, model variability, and unsupported-capability behavior; verify a walkthrough follows the generated skill without an automatic review or implementation step.

## 5. Accepted revisions

- [x] 5.1 Implement revision offers and selection of accepted finding IDs in the skill workflow; verify transcripts for decline, no answer, subset acceptance, and material product decisions leave unapproved artifacts untouched.
- [x] 5.2 Implement planning-path checks, rereads before revision, separate revision records, and stale-verdict presentation; verify artifact changes preserve historical reports and concurrent edits trigger reconciliation rather than overwrite.
- [x] 5.3 Document revision outcomes and manual re-review; verify end-to-end fixtures record applied/deferred findings, offer another review, and never invoke it or implementation automatically.

## 6. Integrated acceptance

- [x] 6.1 Install the packed tarball into isolated local/global destinations for all three harnesses; verify executable availability, agent/skill discovery assets, resource resolution from a different working directory, and multiple-harness coexistence.
- [x] 6.2 Run native harness smoke reviews using temporary projects for Claude Code, Codex, and Devin CLI; record actual versions, independent context behavior, no reviewer edits, report generation, and revision acceptance. If a runtime is unavailable, record the unverified target explicitly and do not claim this task complete.
- [x] 6.3 Run the full automated suite and strict OpenSpec validation; verify all capability scenarios have test or documented native acceptance coverage and record remaining limitations without publishing the package.
