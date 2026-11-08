# Goldfish review: sample

Completion: **complete**
Readiness: **revise**
Freshness: **current**

Readiness is advisory, not an implementation gate.

## Coverage

- cold-reader: complete; named-agent dispatch; Supplied cold packet only: design.md, proposal.md, specs/export/spec.md, tasks.md
- adversarial-reviewer: complete; Dispatch mode: named-agent; independent grounded review; Planning packet: proposal.md, design.md, specs/export/spec.md, tasks.md; Repository evidence: contract.md; Read-only inspection; no project code executed
- adjudicator: complete; Dispatch mode: named-agent; Both completed reviewer results independently adjudicated; Planning packet: proposal.md, design.md, specs/export/spec.md, tasks.md; Repository evidence: contract.md; Every original finding retained; Read-only inspection; no project code executed

## Findings

### C1: major / duplicate

Location: design.md: automatic timeout retries and logical request semantics
Scenario: Creation succeeds but its response times out, and the client retries without a request ID.
Impact: Automatic retries lack the identity required by the existing service to avoid duplicate writes.
Resolution: Require the same unique request ID for the initial attempt and automatic timeout retries, with a new ID for each user retry, and verify these identities.
Decision: A2 identifies the same missing request identity and timeout-recovery consequence, grounded in contract.md line 2. Its resolution covers this scenario. Explicitly permitting duplicates, as suggested as one possible C1 resolution, would not satisfy the existing contract. (duplicate of A2)

### C2: minor / accepted

Location: design.md: failure handling; tasks.md: Task 1.1
Scenario: The API returns an HTTP 500 response without timing out or reporting an authentication failure.
Impact: The plan does not specify whether this response is retried or which terminal state and retry control appear.
Resolution: Define the retry and terminal-state policy for non-timeout, non-authentication API errors and include an acceptance case.
Decision: The design paragraph specifies timeout retries and terminal authentication failures; contract.md line 2 addresses request identity but supplies no other error policy. Task 1.1 asks to verify terminal failure without resolving this localized gap.

### A1: major / accepted

Location: design.md: endpoint selection
Scenario: Implementation uses the planned GET /exports/create endpoint.
Impact: The existing service does not support that endpoint, preventing successful export creation.
Resolution: Specify POST /exports in the plan and verify that export creation uses that method and path.
Decision: The embedded design explicitly chooses GET /exports/create. Contract.md line 2 explicitly rejects it and requires POST /exports. This contradicts the proposal and specification's use of the existing export API.

### A2: major / accepted

Location: design.md: request identity and timeout retries
Scenario: The initial creation and its automatic timeout retries omit request IDs, including when creation completed before its response timed out.
Impact: Requests violate the existing API contract and cannot use its required protection against duplicate writes.
Resolution: Require one unique request ID per logical request, reuse it across all automatic timeout retries, generate a fresh ID for user retry, and verify both behaviors.
Decision: The embedded design explicitly says no request ID. Contract.md line 2 requires a unique ID per logical request, reuse on timeout retries, and a new ID on user retry. The design's statement that user retry creates a new logical request does not supply the required IDs.


## Next step

Offer specific artifact revisions and wait for explicit acceptance.
Re-review requires a new explicit invocation.
