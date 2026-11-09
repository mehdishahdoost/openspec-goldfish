# Design

## Context

See proposal.md for the incident. `adjudicate()` already validates role results and cross-role coverage, returning incomplete/undetermined for failures. `finalize()` currently computes this verdict and then exclusively creates results.json, report.json, and report.md regardless of completion. `tool.js` forwards no finalization options and parses arguments as `--key value` pairs. Workflow steps 8 and 9 imply ordering but do not explicitly prohibit finalizing a pending background role.

The main spec inventory is empty. The existing unarchived `proposal-review` delta requires durable incomplete reports for failures, so removing incomplete persistence would conflict with that contract. The new `review-finalization` capability narrows when persistence is authorized, leaving verdict calculation intact. Design is warranted because core API, CLI, report metadata, and installed instructions must agree.

## Goals / Non-Goals

**Goals:** Enforce coverage preconditions at the shared runtime boundary; preserve a deliberate terminal-failure path; allow the same unsealed run to finish after a rejected premature attempt; make diagnostics and coordinator presentation agree.

**Non-Goals:** Tracking native subagent lifecycles inside the runtime, changing dispatch profiles, altering revision eligibility, retroactively repairing sealed reports, implementing automatic retries, or redesigning multi-file crash atomicity.

## Decisions

### Validate before exclusive writes

Extend `finalize(dir, results, currentInputs, options = {})` with optional `incompleteReason`. Compute the candidate using the existing adjudication checks. If completion is incomplete and no explicit reason was provided, throw before the first output write. Include coverage limits and guidance to await pending roles or intentionally record a terminal failure. If a reason is provided, require a trimmed nonempty string and an incomplete candidate; reject invalid combinations before writing. Complete candidates remain compatible with existing three-argument callers, including stale and revise verdicts.

Keep `adjudicate()` a pure classification helper: it continues to classify incomplete results rather than throw. A missing role and a malformed role are both incomplete; diagnostics should distinguish absence clearly, without weakening validation. Reusing adjudication avoids a weaker role-count-only check that could seal omitted findings or malformed evidence. Instruction-only changes were rejected because they cannot prevent recurrence reliably.

### Explicit terminal-failure command

Expose `finalize --run <dir> --results <temporary-file> --incomplete-reason "<reason>"`. Its presence selects intentional incomplete reporting and maps to the core option. A value-bearing option fits the existing parser and couples intent with explanation; a bare boolean bypass flag would permit unreasoned sealing. Whitespace reasons fail. A complete candidate with this option fails with guidance to use normal finalization, avoiding contradictory metadata.

Persist the trimmed reason as additive `incompleteReason` in report.json and a labeled explanation in report.md. Preserve supplied raw results unchanged in results.json and all existing validation coverage limits. Do not synthesize successful results or suppress errors. Existing records without this field remain readable; complete reports need no new field. Report completion remains incomplete and readiness undetermined.

### Coordinator owns waiting and terminal-failure evidence

Update workflow steps 7–10 and the result contract: collect terminal reviewer outcomes; if both succeed, start and await adjudication. Background-start receipts are not results. Do not call finalize while an expected role is pending within its budget. On timeout, denial, unavailable isolation, or malformed output, retain available results, record failure as already specified, and use the explicit incomplete command with a concrete reason. Do not retry failed roles automatically. Validation rejection for a pending role permits later finalization of that same run when the already-running role returns; it does not authorize a new review.

The runtime cannot verify a model's assertion that work has terminated. Requiring explicit intent makes this observable, while instructions supply the lifecycle discipline. Adding a persistent agent registry would require harness-specific integration and is outside this bounded fix.

### Preserve the reservation boundary

Keep exclusive output creation and immutable history. No writes to results.json/report.json/report.md occur on precondition rejection; inputs.json and cold-packet.json are unchanged. Once any output has been reserved, retain existing overwrite refusal, including partial filesystem failures. Late results cannot upgrade a sealed incomplete report. Do not claim durable completion after persistence failure.

## Risks / Trade-offs

- Older callers expecting implicit incomplete persistence will fail → mark this as a breaking helper behavior, document the new option, and ship protocol and runtime together through the existing installer.
- A coordinator can still deliberately misuse the failure option → require a visible reason and prohibit it for pending work in protocol instructions; do not imply runtime lifecycle verification.
- Multiple output writes can still fail partway → preserve exclusive creation and honest error reporting; transaction recovery is separate work.
- Documentation cannot prove native scheduling compliance → use deterministic runtime and installed-resource checks plus a manual Devin smoke run when authenticated execution is available.

## Migration Plan

Update core, CLI, protocol, and docs in the same release. Verify the bundled runtime in a temporary installed project, then use the documented installer update path for existing installations. Preserve existing runs and native evidence fixtures. A sealed incomplete run still needs a new explicit invocation. Rollback reinstalls the previous matching runtime/protocol bundle; it does not rewrite review history. No data migration or new dependency is required.
