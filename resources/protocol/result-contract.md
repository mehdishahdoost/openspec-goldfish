# Result contract (protocol version 1)

Each role returns one JSON object. Empty findings are valid. Do not wrap JSON in prose.

```json
{
  "role": "cold-reader",
  "status": "complete",
  "reconstruction": "Intended behavior, scope, acceptance evidence, and missing decisions.",
  "coverage": ["proposal.md and design.md"],
  "evidence": [{"path": "proposal.md", "reference": "Scope section"}],
  "findings": [{
    "id": "C1",
    "location": "design.md: Failure handling",
    "scenario": "A concrete trigger or ambiguous interpretation",
    "impact": "What goes wrong",
    "severity": "major",
    "resolution": "Observable criterion for resolving the issue"
  }]
}
```

Role is cold-reader, adversarial-reviewer, or adjudicator. Reconstruction MUST be a nonempty string for a complete cold read; objects and arrays are invalid. Evidence records only actually consulted sources with paths and sections/lines (or URLs). Coverage is an array of strings. A failed role uses status failed, error explaining why, and the same arrays (possibly empty). The coordinator can synthesize a failed result on timeout, never a successful critique.

Adjudicator findings additionally contain disposition (accepted/dismissed/duplicate/unresolved) and reason. Unresolved findings require boolean blocking and a reason explaining it; duplicates require duplicateOf pointing to a nonduplicate finding ID. Retain every original finding ID. New adjudicator findings use J-prefixed IDs. Use C and A prefixes for reviewer IDs. Critic findings must not be discarded before adjudication.

The coordinator persists a results object keyed by each role name. Malformed or missing results produce incomplete coverage and undetermined readiness. Critical or major accepted findings and blocking unresolved questions produce revise. Only complete review without those blockers produces ready. Minor accepted findings remain visible. Freshness is independent: stale verdicts are historical, not current.

Finalization requires complete validated coverage by default. Collect terminal reviewer outcomes and await adjudication before normal finalization; background-start receipts are not results. Missing, malformed, or failed results reject normal finalization before immutable output is written. For terminal failure only, the coordinator uses `--incomplete-reason "<concrete reason>"` to preserve available raw results and coverage limits as incomplete/undetermined. The reason must be a nonempty string; it is recorded as `incompleteReason` in report.json and an explanation in report.md. This option cannot be used with a complete candidate or merely to stop waiting for a pending role. A rejected unsealed run can later receive completed results; sealed records remain immutable, and late findings cannot upgrade their verdict. A new review requires explicit invocation. Never claim an incomplete persisted run is complete.
