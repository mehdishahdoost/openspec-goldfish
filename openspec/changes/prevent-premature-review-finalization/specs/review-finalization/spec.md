# Spec Delta

## Purpose

Ensure review runs are sealed only after validated role completion or an explicit decision to record incomplete coverage, while preserving immutable review history.

## ADDED Requirements

### Requirement: Complete coverage required by default
Normal finalization SHALL require all three role results to pass validation and adjudication coverage checks. An incomplete candidate SHALL be rejected before any immutable output is written, with coverage diagnostics and instructions to await pending roles or explicitly record failure. Ready and revise SHALL both be valid complete verdicts; stale freshness SHALL NOT alone prevent finalization.

#### Scenario: Adjudicator still pending
- **WHEN** normal finalization receives both reviewer results but no adjudicator result
- **THEN** it fails with a missing-role diagnostic and writes none of results.json, report.json, or report.md
- **AND** existing input records remain unchanged

#### Scenario: Invalid coverage despite three supplied roles
- **WHEN** normal finalization receives malformed output, a failed role, omitted reviewer findings, colliding reviewer IDs, or invalid duplicate links
- **THEN** it rejects the candidate without writing immutable output and identifies the coverage limits

#### Scenario: Completed results arrive after rejection
- **WHEN** a premature finalization was rejected and completed valid results are later supplied to that same unsealed run
- **THEN** finalization succeeds and persists matching human and machine verdicts

#### Scenario: Complete review with blockers or changed inputs
- **WHEN** all roles pass coverage checks but accepted findings require revision or reviewed inputs have changed
- **THEN** finalization succeeds with the computed readiness and freshness rather than treating those values as missing coverage

### Requirement: Explicit incomplete report
Finalization SHALL support an explicit incomplete-report request with a nonempty reason. It SHALL persist available raw results, coverage limits, and that reason, reporting incomplete/undetermined. It SHALL reject an empty reason or an incomplete-report request for an otherwise complete candidate before writing outputs. The option SHALL NOT suppress validation diagnostics or manufacture successful role results.

#### Scenario: Terminal reviewer failure
- **WHEN** a reviewer times out or cannot run and the coordinator explicitly requests an incomplete report with a reason
- **THEN** available results and failure coverage are durably recorded as incomplete/undetermined
- **AND** the reason is visible in both report.json and report.md

#### Scenario: Invalid explicit request
- **WHEN** the incomplete-report reason is empty or whitespace, or the candidate passes every completion check
- **THEN** finalization rejects the request and writes no immutable output

### Requirement: Coordinator waits for terminal outcomes
The coordinator SHALL await both reviewers and, when both succeed, adjudication before normal finalization. It SHALL use explicit incomplete reporting only after terminal failure, timeout, denied dispatch, or invalid output, retaining the existing role time budget and no-automatic-retry rule. It SHALL NOT present late conversational findings as a completed persisted review.

#### Scenario: Background adjudication is running
- **WHEN** the adjudicator has started but has not returned and has not reached its time limit
- **THEN** the coordinator continues waiting instead of sealing an incomplete report

#### Scenario: Invalid or timed out adjudication
- **WHEN** adjudication returns invalid output or exceeds its allowed time
- **THEN** the coordinator records the terminal failure through explicit incomplete reporting and presents completion as incomplete and readiness as undetermined

### Requirement: Sealed reports remain immutable
Successful finalization SHALL retain exclusive creation of run outputs. Later results SHALL NOT overwrite a sealed run. Recovery from an already sealed incomplete run SHALL preserve its history and require a new explicit review invocation for a new report.

#### Scenario: Results arrive after intentional incomplete finalization
- **WHEN** another finalization is attempted for a run with existing immutable output
- **THEN** it fails without altering those records and the coordinator explains that a new explicit review is needed
