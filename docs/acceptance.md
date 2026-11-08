# Acceptance record

## Automated checks

Run `npm test`. Tests cover CLI selections, install ownership/conflicts/recovery, both scopes and every adapter, shared-project coexistence, packaged resource resolution, custom OpenSpec discovery, dependency closure, skipped artifacts, input fingerprints, report validation/verdicts, immutable reports, and accepted revision preparation/outcomes.

The packaging test builds a local tarball, installs it into a temporary npm prefix without lifecycle scripts or registry dependencies, then installs every harness at both scopes. No publication or user-global installation occurs.

## Native checks on 2026-11-08

- Claude Code 2.1.116: `claude agents --setting-sources project` recognized all three project agents. The model-backed cold-reader smoke request returned no review before it was interrupted. Review quality and isolation remain unverified.
- Codex CLI 0.167.0: model smoke failed during initialization: `failed to initialize in-process app-server client: Read-only file system`. Custom TOML definitions pass generated-format tests; actual native execution remains unverified.
- Devin CLI 3000.11.234: with temporary XDG state/data/cache directories, `devin skills show devin:openspec-goldfish` loaded the native skill and showed user-only triggers. Model smoke failed with `Not logged in`. Native agent execution remains unverified.

Devin imports Claude skills; the qualified command selects the intended native provider. Test installations used temporary project/config roots, preserving actual user installations.

## Pending native acceptance procedure

Use an authenticated writable environment for each harness. Install into a temporary OpenSpec project and complete a sample planning package without implementing it. Invoke the native Goldfish command explicitly.

1. Use `test/fixtures/review-quality/ambiguous.md` as planning text. Keep an answer about retry count only in the author conversation. Confirm the cold reader does not receive that answer, reconstructs intent, and reports the missing retry policy with an artifact reference.
2. Give the grounded reviewer `contradiction.md` and the existing `contract.md`. Confirm it cites both sides of the method/request-ID mismatch. With `clean.md` and the matching existing contract, confirm the workflow permits no findings rather than inventing a quota.
3. Confirm adjudication retains every original ID, dismisses already-covered behavior with references, and returns structured output. Simulate unavailable isolation and a role timeout; confirm incomplete/undetermined, never coordinator self-review.
4. Hash artifacts before and after review. Confirm no review-time edits. Inspect JSON and Markdown verdict agreement and source evidence. Confirm a second invocation produces a separate run.
5. Decline revisions and confirm no edits. Accept one offered fix; confirm only its planning artifact changes, history remains immutable, freshness becomes stale, and no re-review starts automatically. Exercise a material product decision and a concurrent edit before acceptance.

These checks are required before claiming native review support is fully verified. Tasks 4.1, 4.2 and 6.2 remain open until their model-backed acceptance observations are recorded.

## Scenario coverage

| Capability | Automated evidence | Native evidence still required |
| --- | --- | --- |
| Installation | options.test.js, install.test.js, adapters.test.js, package.test.js | Native agent execution in each harness |
| Target selection, planning completion, schemas/stores | review.test.js discovery and prerequisite fixtures | Full skill selection walkthrough |
| Cold reading | review.test.js packet exclusion and fingerprints | Author-only decision withheld and ambiguity found |
| Grounded review | Protocol and quality fixtures above | Contract contradiction found; clean fixture permits no findings |
| Adjudication and reporting | review.test.js severity, duplicates, failures, malformed output, immutable/stale reports | Evidence judgments and role isolation |
| Accepted revisions | review.test.js no acceptance, subset, material decision, concurrent edit, outcomes | Native author-context editing and confirmation behavior |

Automated fixtures validate deterministic behavior. They do not establish model judgment quality or prove the harness obeys every instruction.

## Retry after filesystem restrictions were lifted

On 2026-11-08, all three CLIs were retried in a fresh temporary workspace with current Goldfish adapters and the seeded quality fixtures.

- Claude reached the API but returned HTTP 401: its OAuth access token has expired. A logged-in status alone did not establish a usable session; reauthentication is required.
- Codex initialized successfully, but its available native `collaboration.spawn_agent` tool had no selector for installed custom agents. Fresh contexts were supported, but the named agent dispatch required by this adapter was unavailable. It correctly reported all three quality checks as not run rather than simulating reviewers.
- Devin authenticated successfully. Its first attempt rejected a tool requiring confirmation in noninteractive mode. With explicit `--permission-mode auto`, it read the skill and fixtures, but all three native `goldfish-*` profile launches failed before starting. Further inspection also required confirmation unavailable in print mode. No reviewer findings were returned, so quality checks did not pass.

Tasks 4.1, 4.2, and 6.2 remain pending until actual independent reviewer results and the full workflow are observed. Codex needs an adapter compatibility decision or a runtime exposing native custom-agent selection; lifting filesystem restrictions alone does not resolve that limitation.

## Codex dispatch fix verified

Codex CLI 0.167.0 completed four fresh native role-message subagents: cold reader, contradiction reviewer, clean reviewer and adjudicator. Parent history was excluded with `fork_turns: "none"`. The cold reader identified missing retry bounds without receiving the hidden author decision; the contradiction reviewer cited both planning and API contract; the clean reviewer returned no findings. The adjudicator retained C1, C2 and A1 with reasoned dispositions. Fixture hashes remained unchanged. Actual returned JSON and dispatch receipts are retained in [native evidence](native/codex-0.167.0.json).

The adapter now chooses named dispatch only where the native schema exposes a selector; otherwise it supplies the canonical role instructions in a fresh native agent message and records that mode. This verifies tasks 4.1 and 4.2. Task 6.2 remains open: full report persistence, accepted native revisions and all three harnesses have not been verified end to end.
