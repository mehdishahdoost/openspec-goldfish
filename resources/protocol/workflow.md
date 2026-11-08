# Coordinator workflow

## Resolve inputs

1. Confirm explicit user invocation of Goldfish. Work after proposal and before implementation only. If the user says implementation has begun, stop. Do not invoke OpenSpec apply or edit any artifact during review.
2. Run `openspec context --json` and `openspec list --json`, retaining `--store <id>` if explicitly selected. Stop on unresolved roots/stores; never initialize OpenSpec. Select the named change or the sole active change. Ask if ambiguous. Read status and apply instruction metadata solely to discover planning prerequisites and progress. Stop if planning is incomplete or implementation has started.
3. Read applicable explicit project constraints from the resolved OpenSpec configuration and project instructions; extract only constraints, never author discussion, rationale, prior findings or implementation details. Save the bounded constraints as a temporary UTF-8 file. Resolve the target repository if the planning home is a store; ask if unclear.
4. Obtain the actual harness version using its `--version` command or an explicit version measured by the caller. Do not infer it from documentation or prior reports. If unavailable, ask instead of guessing. Resolve this skill's absolute runtime/tool.js path. Run from the user's project:
   `node "<runtime/tool.js>" start --change "<name>" --harness "<harness>" --harness-version "<actual version>" --constraints "<constraints-file>"`
   Append `--store "<id>"` when selected. Omit --constraints if none exist. The helper discovers CLI paths, checks prerequisites and creates a unique run, inputs.json and cold-packet.json. It does not start any model.

## Independent review

5. Read result-contract.md. Start fresh native goldfish-cold-reader and goldfish-adversarial-reviewer agents, concurrently if capacity permits or serially with separate contexts. Do not fork author history. Supply the result contract in their invocation. Use the installed role definitions according to the harness adapter. Where the adapter explicitly supports fresh role messages, include the literal shared principles, role instructions and result contract in a native fresh subagent message. Do not let reviewers edit.
6. Give the cold reader only the literal cold-packet.json contents and contract, not its parent directory or repository instructions to explore. It must reconstruct intent before findings. Give the grounded reviewer the planning packet, target repository location and explicit constraints, allowing read-only existing spec/code exploration. Do not share either reviewer's output with the other.
7. Allow at most ten minutes per role from spawn. Use host wait/cancel controls; on expiration cancel if possible and record failed with the timeout reason. Record failed for unavailable supported dispatch modes, inherited author history, tool denial, or malformed output. No automatic retry, coordinator replacement critique, or silent downgrade.
8. If both reviewers succeed, start a fresh goldfish-adjudicator with both results, planning packet, contract, and repository evidence access. Only this role may receive earlier report history to correlate resolved findings. If a reviewer failed, mark adjudication failed because required coverage is missing; retain available raw findings. Apply the same time budget to adjudication.

## Report

9. Save the raw results object as a temporary JSON file; keys are the three role names. Run:
   `node "<runtime/tool.js>" finalize --run "<run-dir>" --results "<results-file>"`
   This re-discovers planning inputs, detects stale artifacts, validates coverage and evidence structure, computes readiness, and writes immutable results.json, report.json and report.md. Never alter those records to turn an incomplete review into ready. If persistence fails, report the error and do not claim a durable report exists.
10. Present report path, completion, readiness, freshness, accepted findings, dismissals and unanswered questions. Explain that stale readiness is historical. Offer specific revisions by finding ID and artifact path. Wait for explicit user acceptance; silence and the initial review invocation are not acceptance.

## Accepted revisions

11. Record the offered edits in an offer JSON: `{ "runId": "...", "edits": [{ "findingId": "C1", "path": "design.md", "description": "Add agreed failure behavior", "requiresDecision": false }] }`. Only accepted findings are eligible. Use revisionOffer from the runtime core module to validate an offer against report.json, or validate those same constraints before presenting it.
12. Ask the user before deciding new behavior or changing scope. Record accepted IDs in an acceptance JSON `{ "explicitAcceptance": true, "acceptedIds": ["C1"] }` only after actual acceptance. Decline or no answer means no edits. Run:
    `node "<runtime/tool.js>" prepare-revision --run "<run-dir>" --offer "<offer-file>" --acceptance "<acceptance-file>"`
    A changed artifact requires rereading and reconciling the accepted fix; ask again if scope changes. Do not bypass the error by replacing the original inputs.json. Instead present a newly based offer including beforeHash (SHA-256 of the reread current file) to the user, record renewed acceptance, and rerun prepare-revision against that offer.
13. In the author/coordinator context, edit only agreed planning artifacts within the resolved change. Reread immediately before each edit and preserve unrelated changes. Never edit implementation, main specs, config, or harness settings. Reviewers remain readers. Explicit user choices can authorize resolution of previously unresolved findings, but record that choice before offering the resulting edit.
14. Save outcomes JSON with acceptedIds and outcomes: each outcome has id, status (applied/deferred/unresolved), reason, and paths (relative planning paths). Run:
    `node "<runtime/tool.js>" record-revision --run "<run-dir>" --outcomes "<outcomes-file>"`
    Preserve old reports, state changed inputs make them stale, and offer another manual review. Do not call start again without explicit invocation. Never claim the revision is verified.

## Freshness

Before presenting a prior verdict as current, run `node "<runtime/tool.js>" freshness --run "<run-dir>"`. It re-enumerates CLI artifact outputs, so edits, additions and deletions affect freshness. No background watcher is installed. If discovery fails, current readiness is unknown; explain the failure rather than reusing old readiness.
