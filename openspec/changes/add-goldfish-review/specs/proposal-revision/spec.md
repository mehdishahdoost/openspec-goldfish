# Spec Delta

## Purpose

Let users act on Goldfish findings through explicitly accepted planning revisions while preserving review history and unresolved decisions.

## ADDED Requirements

### Requirement: Explicit revision acceptance
After reporting, Goldfish SHALL offer to revise actionable findings and identify proposed artifact edits. It SHALL wait for explicit acceptance, support acceptance of a subset, and leave artifacts unchanged if the user declines. Review invocation alone SHALL NOT authorize revision.

#### Scenario: Report without acceptance
- **WHEN** a report recommends revisions and the user has not accepted them
- **THEN** Goldfish offers the revisions without editing artifacts

#### Scenario: Selected fixes
- **WHEN** the user accepts only selected findings
- **THEN** revision addresses only that selection and records the remaining findings as unresolved or deferred

### Requirement: Resolve material decisions with the user
Revision SHALL ask the user before choosing new product behavior, changing scope, or resolving conflicting requirements. It SHALL distinguish applied fixes from deferred findings and unanswered decisions.

#### Scenario: Ambiguous behavior
- **WHEN** fixing a finding requires choosing between incompatible user-visible behaviors
- **THEN** Goldfish asks for that choice before making the dependent edit

### Requirement: Planning-only revision boundaries
Accepted revision SHALL edit only agreed planning artifacts in the resolved change, preserve unrelated user edits, and record affected finding IDs and files. It SHALL NOT modify implementation, main specs, harness configuration, or OpenSpec workflow configuration.

#### Scenario: Concurrent artifact edits
- **WHEN** artifact contents differ from those used to propose a revision
- **THEN** Goldfish rereads them and reconciles the proposed edit, asking again if the accepted scope or fix materially changes

### Requirement: Review freshness after revision
Goldfish SHALL retain original reports, record revision outcomes separately, and mark a review stale whenever its planning input set or contents changes. It SHALL offer another review without launching it automatically or declaring its own revision verified.

#### Scenario: Revision completed
- **WHEN** accepted edits change a reviewed artifact
- **THEN** Goldfish records the changes, identifies the old verdict as stale, and offers a fresh manually invoked review

#### Scenario: External edit
- **WHEN** Goldfish next checks a report after an external artifact edit, addition, or deletion
- **THEN** fingerprint comparison marks that report stale
