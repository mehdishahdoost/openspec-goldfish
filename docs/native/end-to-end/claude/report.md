# Goldfish review: sample

Completion: **complete**
Readiness: **revise**
Freshness: **current**

Readiness is advisory, not an implementation gate.

## Coverage

- cold-reader: complete; design.md; proposal.md; specs/export/spec.md; tasks.md
- adversarial-reviewer: complete; proposal.md and design.md; specs/export/spec.md; tasks.md; contract.md
- adjudicator: complete; proposal.md; design.md; specs/export/spec.md; tasks.md; contract.md; reviewer result 1 (cold-reader) findings C1-C7; reviewer result 2 (adversarial-reviewer) findings A1-A5

## Findings

### C1: major / accepted

Location: specs/export/spec.md: ADDED Requirements and Scenario 'Request succeeds'; tasks.md: 1.1
Scenario: tasks.md 1.1 requires verifying authenticated success, retries, terminal failure, and user retry, and design.md line 3 defines auth-failure, expiry, and access-restriction behavior. The spec has one requirement and one success scenario (spec.md lines 8-13).
Impact: Retry, terminal-failure, auth-failure, expiry, and access-restriction behavior have no normative requirement or testable scenario, so acceptance cannot be checked against the spec.
Resolution: spec.md contains a requirement and at least one WHEN/THEN scenario each for bounded retry, terminal failure with retry button, authentication failure, user retry creating a new request, one-hour link expiry with file deletion, and requesting-customer-only access.
Decision: Verified: spec.md lines 8-13 contain only the success path, while design.md line 3 and tasks.md line 4 require the other behaviors. This canonical finding also absorbs A4, which has the same evidence and resolution.

### C2: major / accepted

Location: design.md line 3: 'Retry timeouts twice with one second between attempts'
Scenario: An implementer cannot tell whether 'twice' means two total attempts or one initial attempt plus two retries. The per-attempt timeout duration is not stated anywhere in the packet.
Impact: Implementations will make different numbers of calls and wait different durations before failing, so retry tests cannot assert one correct attempt count or timing.
Resolution: design.md states the total attempt count, the per-attempt timeout duration, and the delay schedule.
Decision: Verified: design.md line 3 says 'twice' with no attempt-count or timeout definition, and no other packet file defines them. This is a consequential missing decision.

### C3: major / accepted

Location: design.md line 3: 'Retry timeouts twice' and 'Authentication failures are terminal'
Scenario: A failure that is neither a timeout nor an authentication failure, such as a 5xx response, a network reset, or a malformed response, occurs. design.md line 3 does not say whether it is retried or terminal.
Impact: Implementers will classify errors differently, so retry behavior and terminal-failure display will vary.
Resolution: design.md lists every error class that is retried, every class that is terminal, and the handling for any unlisted class.
Decision: Verified: design.md line 3 names only timeouts (retried) and authentication failures (terminal). Unlisted classes are unaddressed, which is a consequential missing failure path. It is distinct from J1, which concerns the display of the auth-failure state.

### C4: major / duplicate

Location: design.md line 3 ('Retry timeouts twice' with 'User retry creates a new logical request'); contract.md line 2
Scenario: A timeout occurs after the first attempt has already created an export on the server. Because no request ID is sent, the automatic retry cannot be tied to the original request.
Impact: Duplicate server-side exports can result from one user action. The design does not state whether duplicates are acceptable or whether the user sees one link or several.
Resolution: design.md states the duplicate-export policy for automatic retries and whether the user sees one link or several.
Decision: Same root cause as A2: design.md line 3 omits the request ID, and contract.md line 2 requires one per logical request reused on timeout retries to avoid duplicate writes. A2 is canonical because it is grounded in the repository contract. Residual: A2's resolution should also state whether the user sees one link or several, which C4 raised. (duplicate of A2)

### C5: major / accepted

Location: specs/export/spec.md line 9 ('JSON export of the authenticated customer profile') versus design.md line 3 ('JSON fields are customer ID and display name')
Scenario: The spec describes the full authenticated customer profile, while the design lists two fields. An implementer cannot tell whether the export must contain every profile field or only these two.
Impact: The export payload may over-include personal data or omit fields that acceptance tests expect.
Resolution: spec.md or design.md enumerates the exact JSON fields included in the export, and the spec and design agree on that list.
Decision: Verified: spec.md line 9 and design.md line 3 disagree on the scope of the payload. The payload is the primary deliverable and carries personal-data exposure risk, so major is kept. A5 reports the same conflict at minor severity; C5 is canonical.

### C6: minor / accepted

Location: design.md line 3: 'links expire after one hour and files are deleted then'
Scenario: A customer opens a link after one hour. The packet does not define the response for an expired link, or whether deletion happens exactly at expiry or in a later cleanup job.
Impact: Expiry behavior cannot be tested precisely, and the client does not know whether to offer a new export.
Resolution: design.md or spec.md defines the response for expired links and whether deletion occurs at exactly one hour or within a stated grace period.
Decision: Verified: design.md line 3 gives the one-hour expiry and deletion timing but not the expired-link response. This is a localized gap that does not change the core design, so it is minor and non-blocking.

### C7: minor / duplicate

Location: design.md line 3 ('GET /exports/create') versus proposal.md line 14 ('Use existing export API') and spec.md line 9
Scenario: The design specifies a GET request that creates a resource. The reviewer states the packet does not confirm the existing API's endpoint or method.
Impact: If the existing API uses a different method or path, the implementer must choose between the design and the existing API.
Resolution: design.md confirms that GET /exports/create is the existing export API endpoint and method, or it names the correct endpoint and method.
Decision: A1 is canonical. contract.md line 2 is repository evidence that POST /exports creates exports and GET /exports/create is unsupported, which resolves C7's open question and raises its severity through A1. C7's minor severity is not retained. (duplicate of A1)

### A1: critical / accepted

Location: design.md line 3: 'Use GET /exports/create with no request ID'; /tmp/goldfish-e2e-claude/contract.md line 2
Scenario: Implementation follows design.md and issues GET /exports/create. contract.md line 2 states that GET /exports/create is unsupported and that POST /exports creates an export.
Impact: Every export request fails against the existing API, so the core capability cannot work. The planning premise conflicts with the documented contract.
Resolution: design.md names the method and path that contract.md documents as supported (POST /exports), or the packet cites an authoritative source showing the contract has changed and contract.md is updated. The spec and tasks reference the same endpoint.
Decision: Verified: design.md line 3 specifies GET /exports/create, and contract.md line 2 says GET /exports/create is unsupported. This is an infeasible premise, so critical is supported. C7 is folded into this finding.

### A2: major / accepted

Location: design.md line 3 ('no request ID' and 'Retry timeouts twice'); /tmp/goldfish-e2e-claude/contract.md line 2
Scenario: A timeout occurs and the design retries. Because design.md sends no request ID, each attempt is a new logical request. contract.md line 2 requires a unique request ID per logical request, reused on timeout retries.
Impact: Timeout retries can create duplicate writes, which the contract is designed to prevent. The retry policy is unsafe under the documented contract.
Resolution: design.md specifies that a request ID is generated once per logical request, reused across timeout retries, and regenerated only for user retry. The spec or design states this, and tasks.md 1.1 verifies that retries reuse the same ID.
Decision: Verified: contract.md line 2 requires request-ID reuse on timeout retries and a new ID for user retry, and design.md line 3 specifies neither. This is a consequential contract violation in the failure path. It is canonical for C4.

### A3: minor / dismissed

Location: design.md line 3 ('Synchronous response returns the link on success'); specs/export/spec.md lines 11-13
Scenario: The reviewer says the response model is unclear, because the contract does not document a response shape and the spec's success scenario states no sync or async behavior.
Impact: Claimed: implementers may assume an asynchronous job model and poll, or may not handle an in-progress state.
Resolution: The spec states the response model (synchronous or not) and the success and timeout response shape, cross-referenced to the existing export API contract.
Decision: Already covered in part: design.md line 3 states that the response is synchronous and returns the link on success, so the sync model is decided. The remaining gap, the response shape on timeout, is already captured by C2 and C3 (timeout and failure-path definition). contract.md line 2 documents no response shape, so the cross-reference cannot be satisfied by the repository alone, but that is not a separate blocking defect.

### A4: major / duplicate

Location: specs/export/spec.md lines 8-13; tasks.md line 4
Scenario: tasks.md 1.1 requires verifying retries, terminal failure, and user retry, and design.md line 3 defines auth failure, retry affordance, expiry, and access control. The spec has only a success scenario.
Impact: The verified and designed behaviors have no normative requirement or scenario, so they can be implemented or tested inconsistently.
Resolution: specs/export/spec.md contains requirements and scenarios for timeout retry count and interval; terminal failure and retry affordance; user retry as a new logical request; authentication failure as terminal; link expiry of one hour with file deletion; and access restricted to the requesting customer.
Decision: Same evidence and same resolution as C1 (spec.md lines 8-13 versus tasks.md line 4 and design.md line 3). C1 is canonical. A4 adds no unique requirement beyond C1's resolution. (duplicate of C1)

### A5: minor / duplicate

Location: design.md line 3 ('JSON fields are customer ID and display name'); specs/export/spec.md line 9 ('customer profile')
Scenario: design.md limits the JSON export to customer ID and display name, while the spec says the export contains the authenticated customer profile without enumerating fields.
Impact: The spec permits exporting the full profile, which could include fields beyond ID and display name, with privacy consequences.
Resolution: specs/export/spec.md lists the exact exported fields consistently with design.md, or design.md and the spec both reference the same field definition.
Decision: Same conflict as C5 (spec.md line 9 versus design.md line 3). C5 is canonical and carries the major severity because the payload scope affects personal data. A5's minor severity is not retained. (duplicate of C5)

### J1: minor / accepted

Location: design.md line 3 ('show a terminal failure and a retry button' and 'Authentication failures are terminal')
Scenario: Design line 3 says the retry button appears after timeout exhaustion, and separately that authentication failures are terminal. It does not say whether the authentication-failure state shows the retry button or what error message text is displayed.
Impact: Two implementers could render the auth-failure state differently, with or without a retry button and with different messages. The effect is localized to UI state.
Resolution: design.md states whether the authentication-failure terminal state shows the retry button and what user-facing message is shown for each terminal state.
Decision: New finding. Verified against design.md line 3: the retry-button rule is tied to timeout exhaustion, and the auth-failure display is unspecified. C3 covers unlisted error classes, not display of a listed class. The gap is localized and does not change the retry or auth logic, so it is minor and non-blocking.


## Next step

Offer specific artifact revisions and wait for explicit acceptance.
Re-review requires a new explicit invocation.
