# Review protocol

Run the skill manually after a complete proposal package and before implementation. Goldfish asks for a change if selection is ambiguous. It follows OpenSpec's artifact dependency graph, custom names, stores and declared skips. It does not create an OpenSpec root or review an incomplete package.

The cold reader reconstructs intent using only artifact text and explicit constraints. The grounded reviewer independently reads relevant code/specs. The adjudicator verifies every finding, retaining dismissals and duplicate links. There is no finding quota. Models can still miss issues; readiness is advisory.

Reports live at `<resolved-change>/.goldfish/reviews/<run-id>/`:

- `inputs.json`: planning contents, inventory, hashes, schema context and versions.
- `cold-packet.json`: bounded cold-read input without author chat or repository code.
- `results.json`: raw role results, including failures.
- `report.json` / `report.md`: validated findings and identical verdict semantics.
- `revision-<id>.json`: separately recorded accepted edits and deferred decisions.

Each role has ten minutes. Required role failure, invalid output or unavailable isolation produces incomplete/undetermined. A complete review is ready only without accepted critical/major findings or blocking questions. Minor findings do not block. Evidence is reviewed by the adjudicator; helpers validate its structure, not semantic truth.

Only explicit acceptance authorizes revision. The coordinator names proposed edits, allows a subset, and asks about product choices. It rereads before editing and preserves unrelated changes. Old reports remain immutable. Changed inputs make the verdict stale; another review requires manual invocation. No implementation or automatic re-review occurs.

For deterministic helper commands and JSON examples, see [workflow](../resources/protocol/workflow.md) and [result contract](../resources/protocol/result-contract.md). Installed copies live alongside SKILL.md. Use absolute runtime paths when running from a project. The helpers never call model APIs.

Finalization requires validated complete coverage by default. Missing or invalid roles, failed roles, and incomplete adjudication are rejected before results.json or either report is written. Await pending roles and supply their results to the same unsealed run. Complete ready/revise verdicts and stale freshness remain valid outputs.

For terminal failure only, use `node "<runtime/tool.js>" finalize --run "<run-dir>" --results "<temporary-results-file>" --incomplete-reason "Adjudicator exceeded its ten-minute budget"`. The core API accepts the same intent as `finalize(dir, results, currentInputs, { incompleteReason: "..." })`. A reason must be a nonempty string and the candidate must actually be incomplete. Raw results and coverage diagnostics are retained; the trimmed reason appears as `incompleteReason` in report.json and as an explanation in report.md. Completion stays incomplete and readiness undetermined. Existing records without this additive field remain readable.

This changes the helper's former implicit incomplete-persistence behavior. Never use the failure option merely because a background role is still running. Once a run is sealed, late results cannot overwrite it; preserve its history and request a new explicit review. Rejected preconditions leave the run unsealed, whereas filesystem failures can leave reserved output and must not be bypassed by deleting records.

Update an existing installation by rerunning the installer with the same harness and scope from the desired project directory, for example `npx openspec-goldfish@<fixed-version> --harness devin --local` after a release containing this fix is published. For a source checkout before publication, run `node /absolute/path/to/openspec-goldfish/bin/openspec-goldfish.js --harness devin --local` from the target project. Substitute `claude` or `codex` and `--global` as appropriate. The installer updates unmodified owned files together and refuses conflicts; preserve customizations before resolving them. Restart the harness session to load the updated skill. Updating files does not repair sealed reports or automatically rerun review.
