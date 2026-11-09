# Proposal

## Why

A Devin review finalized its immutable report before the adjudicator returned, permanently recording incomplete/undetermined despite later adjudication. The runtime currently accepts missing roles and seals the run, so workflow sequencing mistakes require an entirely new review.

## What Changes

- Require the coordinator to collect both reviewers and await adjudication before normal finalization, with explicit terminal failure handling for timeouts, denial, or invalid output.
- **BREAKING**: Reject incomplete finalization by default before writing any immutable output. Introduce an explicit incomplete-report option with a nonempty reason so genuine failures remain durably reportable.
- Preserve immutable records, verdict semantics, and valid complete-call compatibility. Make rejection actionable so the coordinator can supply completed results to the same unsealed run.
- Record intentional incomplete-finalization reasons in machine and human reports; never describe those runs as complete.
- Cover premature finalization, intentional failures, retry after rejection, and immutable history with regression tests and document the revised installed workflow.

## Capabilities

### New Capabilities

- `review-finalization`: Preconditions and explicit failure reporting for sealing a review run, including recovery from rejected premature attempts.

### Modified Capabilities

None. No main specs exist yet. The unarchived `add-goldfish-review` change defines `proposal-review`; this capability refines its durable-report and incomplete-verdict behaviors without changing those verdict semantics.

## Impact

Affected: `src/review/core.js`, `src/review/tool.js`, shared protocol files under `resources/protocol/`, `docs/review.md`, and review/runtime/installation tests. Installed skills for Claude, Codex, and Devin receive the shared fix when updated. No dependencies, dispatch-profile changes, automatic reruns, modifications to old reports, or repairs to the user's sample run are included.
