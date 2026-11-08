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
