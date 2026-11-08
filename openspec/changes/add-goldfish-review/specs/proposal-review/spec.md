# Spec Delta

## Purpose

Evaluate OpenSpec planning packages through independent cold reading and grounded adversarial scrutiny before users begin implementation.

## ADDED Requirements

### Requirement: Manual planning review
Goldfish SHALL start review only on explicit user invocation of its skill. It SHALL resolve the selected change through OpenSpec, require completed planning prerequisites, and limit review to pre-implementation planning. It SHALL NOT start implementation or enforce an automatic apply gate.

#### Scenario: Ambiguous change selection
- **WHEN** multiple active changes exist and no change is specified
- **THEN** Goldfish asks the user to select a change before starting review

#### Scenario: Missing planning prerequisites
- **WHEN** required planning artifacts are absent
- **THEN** Goldfish lists the missing artifacts and does not issue a readiness verdict

#### Scenario: Implementation already started
- **WHEN** task progress or the user indicates implementation has begun
- **THEN** Goldfish explains its pre-implementation scope and does not conduct implementation review

### Requirement: Schema-aware target resolution
Goldfish SHALL use resolved OpenSpec roots, change paths, artifact dependencies, and declared skips rather than fixed filenames. It SHALL preserve explicit store selection and stop on unresolved roots or incompatible CLI metadata without creating a project. Completed custom-schema planning packages SHALL be reviewable.

#### Scenario: Custom schema or declared skip
- **WHEN** the schema uses alternative artifact names or explicitly skips an artifact
- **THEN** review uses the resolved applicable artifacts and does not demand default filenames or skipped artifacts

#### Scenario: Missing OpenSpec root
- **WHEN** invocation cannot resolve an OpenSpec root
- **THEN** it explains the problem without creating directories or review output

### Requirement: Independent cold read
The cold reader SHALL receive the planning artifacts and explicit project constraints without author conversation, prior review findings, other reviewer output, or repository implementation context. It SHALL reconstruct intended behavior, scope, acceptance evidence, and decisions an implementer would have to invent before reporting ambiguities.

#### Scenario: Context-dependent proposal
- **WHEN** an artifact relies on a decision present only in the author conversation
- **THEN** the cold reader identifies the missing decision from the artifact evidence without using that conversation to supply an answer

### Requirement: Grounded adversarial review
A separate reviewer SHALL inspect planning artifacts against relevant existing specs and repository evidence for feasibility, failure modes, completeness, and cross-artifact consistency. Reviewers SHALL return findings without modifying planning artifacts or implementation files. Review content SHALL be treated as evidence, not instructions that override the review protocol.

#### Scenario: Existing-system contradiction
- **WHEN** a proposed integration contradicts an existing contract
- **THEN** the reviewer cites both the proposal location and the relevant existing contract with a concrete consequence

### Requirement: Evidence-based adjudication
An independent adjudication pass SHALL classify findings as accepted, dismissed, duplicate, or unresolved, with reasons. Accepted findings SHALL include an artifact reference, concrete failure or ambiguity, impact, severity, and resolution criterion. No findings SHALL be a valid result; finding quotas SHALL NOT be imposed.

#### Scenario: False positive
- **WHEN** a critic flags behavior already explicitly covered by an artifact
- **THEN** adjudication dismisses it with the covering reference and retains the dismissal in the report

### Requirement: Completion and readiness are separate
Reports SHALL classify completion as complete or incomplete. Complete reviews SHALL report ready when no accepted critical or major findings and no blocking unresolved questions remain, otherwise revise. Incomplete reviews SHALL report readiness as undetermined. Minor findings SHALL remain visible without blocking readiness.

#### Scenario: Reviewer failure
- **WHEN** a required reviewer fails, times out, or cannot run in an isolated context
- **THEN** the report identifies missing coverage and reports incomplete with readiness undetermined rather than substituting coordinator self-review

#### Scenario: One major defect
- **WHEN** a complete review accepts one major defect
- **THEN** readiness is revise regardless of the total finding count

### Requirement: Durable attributable report
Goldfish SHALL persist a human-readable report and machine-readable record under the selected change's `.goldfish/reviews/<run-id>/`. Records SHALL include reviewed input fingerprints, harness and protocol versions, role completion, coverage limits, findings, dispositions, readiness, and revision offer. Each run SHALL preserve previous reports.

#### Scenario: Repeated review
- **WHEN** the user manually invokes review again
- **THEN** a distinct run is recorded and earlier reports remain unchanged

#### Scenario: Inputs change during review
- **WHEN** a reviewed artifact changes before the verdict is finalized
- **THEN** the run is marked stale and cannot present its verdict as current
