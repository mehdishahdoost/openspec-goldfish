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

## Devin 3000.12.28 native test

The current Devin CLI authenticated and loaded `.devin/skills/openspec-goldfish` with user-only triggers. It exposes this skill as `/openspec-goldfish`; `devin skills show devin:openspec-goldfish` does not resolve in this version.

A bounded `run_subagent` call requesting `goldfish-cold-reader` failed with `Subagent failed to start.` The available profile inventory included built-in and installed plugin profiles, but no project-local Goldfish profiles. Repeating in a fresh session after initializing the temporary workspace as a Git repository produced the same failure. Thus Git-root discovery was ruled out as the sole cause. Project-profile dispatch needs a compatibility fix; no substitute reviewer was used and task 6.2 remains open. See [test evidence](native/devin-3000.12.28.json).

## Devin dispatch compatibility fix verified

Devin 3000.12.28 completed cold-reader, contradiction reviewer, clean reviewer and adjudicator roles through four new native `subagent_explore` conversations using explicit canonical role messages. Custom Goldfish profiles remain unregistered, but that no longer prevents native isolated review. Cold reading identified missing retry rules without the author-only count; grounded review cited both conflicting sources; adjudication retained all eight findings from the first two reviewers. Input fixture hashes remained unchanged. Actual outputs and receipts are saved in [fixed native evidence](native/devin-3000.12.28-fixed.json).

The clean reviewer returned four findings about retry/request-ID semantics and coverage. This probe therefore does not demonstrate a zero-findings result for Devin; these findings have not been adjudicated and are not automatically classified as false positives. Full report/revision execution and cross-harness task 6.2 remain pending. Automated tests: 33 passed; strict OpenSpec validation passed.

## Claude 2.1.319 retry

On 2026-11-08, a fresh temporary project was installed with the Claude adapter and quality fixtures. The native smoke request used plan permissions and prohibited edits. Claude returned `is_error: true` before review: `Failed to authenticate: this login reached its time limit and cannot be renewed.` The CLI requested `claude auth login`, or `claude setup-token` with `CLAUDE_CODE_OAUTH_TOKEN` for unattended jobs. Authentication status still reported logged in; repeating status without that environment variable selected the same OAuth-token authentication method. No reviewer execution or findings were observed. Native Claude acceptance remains pending reauthentication.

## Claude authentication test correction

A subsequent retry identified a test-configuration mismatch: using `--setting-sources project` excluded user settings containing the working authentication configuration, leaving an expired stored login selected instead. With normal user settings enabled, Claude 2.1.319 completed a minimal API request successfully. The earlier blanket recommendation to reauthenticate does not apply to this setup; native Goldfish testing must retain the user's normal authentication settings. No credential values were recorded or modified.

## Claude native execution verified

Claude Code 2.1.319 completed all four named native role instances with normal user authentication settings enabled and plan permissions. The cold reader identified missing retry rules without the hidden author count, the grounded reviewer cited both planning and API contract, and adjudication retained C1–C4 and A1–A3 with reasoned dispositions. The clean reviewer returned one minor request-ID reuse finding; this run does not demonstrate an empty finding set. No permission denials occurred and fixture hashes were unchanged. Actual role outputs are retained in [Claude evidence](native/claude-2.1.319.json).

No Claude adapter change or user reauthentication was required. The prior authentication failure was caused by the probe excluding user settings containing working authentication configuration. Task 6.2 remains open because full native report persistence and accepted revisions across all harnesses have not been exercised.
