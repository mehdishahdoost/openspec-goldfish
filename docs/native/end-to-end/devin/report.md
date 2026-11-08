# Goldfish review: sample

Completion: **complete**
Readiness: **revise**
Freshness: **current**

Readiness is advisory, not an implementation gate.

## Coverage

- cold-reader: complete; dispatch: explore-role-message; constraints; proposal.md; design.md; specs/export/spec.md; tasks.md
- adversarial-reviewer: complete; dispatch: explore-role-message; /tmp/goldfish-e2e-devin/openspec/changes/sample/proposal.md — Why, What Changes, Capabilities, Impact; /tmp/goldfish-e2e-devin/openspec/changes/sample/design.md — full design paragraph; /tmp/goldfish-e2e-devin/openspec/changes/sample/tasks.md — Export task; /tmp/goldfish-e2e-devin/openspec/changes/sample/specs/export/spec.md — Purpose and ADDED Requirements; /tmp/goldfish-e2e-devin/contract.md — Existing API contract; /tmp/goldfish-e2e-devin/openspec/config.yaml — schema; /tmp/goldfish-e2e-devin/openspec/changes/sample/.openspec.yaml — schema and created metadata; /tmp/goldfish-e2e-devin/goldfish-constraints.txt — repo-local and API constraints; /tmp/goldfish-e2e-devin/openspec/changes/sample/.goldfish/reviews/c6e51339-6320-458b-916b-f0833e347111/cold-packet.json — constraints and bundled artifacts
- adjudicator: complete; dispatch: explore-role-message; goldfish-reviewers-c6e51339.json; proposal.md; design.md; tasks.md; specs/export/spec.md; contract.md; goldfish-constraints.txt; openspec/config.yaml; prior report history: reviews/72e25a49-1eaf-4456-9894-94763b83fccf/report.json, goldfish-results.json (correlation only)

## Findings

### C1: major / duplicate

Location: design.md: first sentence versus constraints: Existing export API contract
Scenario: An implementer follows design.md literally and calls GET /exports/create without a request ID, while the project constraint states that GET /exports/create is unsupported, exports are created with POST /exports, and a unique request ID is required per logical request and reused on timeout retries.
Impact: The export feature cannot work against the existing API, and timeout retries may create duplicate exports or violate the API contract.
Resolution: Revise the design to specify the supported method and endpoint, generation of a unique request ID per logical request, reuse of that ID on timeout retries, and creation of a new request ID only for user retries; acceptance evidence should verify those behaviors.
Decision: Verified at design.md line 3 versus contract.md line 2 and goldfish-constraints.txt line 2; the defect is real, but it is the same endpoint-plus-request-ID contradiction already captured by A1 (unsupported GET endpoint) and A2 (missing request-ID/idempotency semantics). Canonical finding is A1; A2 retains the idempotency aspect. Prior run adjudicator likewise treated the no-request-ID defect as part of the same contract contradiction. (duplicate of A1)

### C2: major / duplicate

Location: design.md: 'Retry timeouts twice with one second between attempts'
Scenario: The phrase can be read as two retries after an initial attempt (three total attempts) or as two total attempts, and it does not define which errors besides timeouts and authentication failures are retryable or terminal.
Impact: Implementers may choose different retry counts, delays, and failure classifications, causing inconsistent behavior and making the required retry and terminal-failure verification ambiguous.
Resolution: State the total number of attempts or retries, the delay schedule, the exact retryable and terminal failure classes, and whether user retry resets the attempt count; add acceptance scenarios covering each class.
Decision: Verified at design.md line 3: 'Retry timeouts twice with one second between attempts' is ambiguous between two retries and two attempts, and non-timeout failure classes are unclassified. A5 identifies the identical wording ambiguity and missing error classification; the spec-coverage consequence is separately captured by A3. Canonical finding is A5. (duplicate of A5)

### C3: major / duplicate

Location: design.md access/expiry statements versus specs/export/spec.md and tasks.md:1.1
Scenario: The design adds customer-only access, one-hour link expiry, and file deletion, but the only spec scenario covers a successful authenticated request and task 1.1 lists verification only for authenticated success, retries, terminal failure, and user retry.
Impact: These security and lifecycle requirements may be omitted or left unverified because it is unclear whether they are normative acceptance criteria or incidental design detail.
Resolution: Add explicit spec scenarios or task verification for requesting-customer-only access, link expiry after one hour, and file deletion at expiry, or remove those statements from the required design.
Decision: Verified: spec.md lines 8-13 contain only the success scenario and tasks.md line 4 omits access/expiry verification, while design.md line 3 asserts those obligations. This is the same missing-acceptance-coverage defect as A3, which already requires spec scenarios and task mapping for access restriction, expiry, deletion, and the other design behaviors. Canonical finding is A3. (duplicate of A3)

### A1: critical / accepted

Location: design.md line 3 vs contract.md line 2 and goldfish-constraints.txt line 2
Scenario: An implementer follows the design literally and calls GET /exports/create for export creation.
Impact: The documented contract states that GET /exports/create is unsupported, so export requests fail before creation and the proposed feature cannot succeed.
Resolution: Planning must specify POST /exports as the creation endpoint, and tasks or tests must verify that method; no implementation path may rely on GET /exports/create.
Decision: Verified directly: design.md line 3 says 'Use GET /exports/create' while contract.md line 2 and goldfish-constraints.txt line 2 state 'GET /exports/create is unsupported' and 'POST /exports creates an export'. proposal.md line 14 requires using the existing export API. This is a fundamental contradiction and an infeasible premise if implemented literally; severity critical is warranted.

### A2: critical / accepted

Location: design.md line 3 ('no request ID' and 'Retry timeouts twice') vs contract.md line 2
Scenario: A creation attempt times out after the server may already have created the export; the planned automatic retry has no request ID or ID-reuse rule.
Impact: Duplicate exports or files can be created, timeout retries cannot be correlated with the original logical request, and the API's required idempotency contract is violated.
Resolution: Design, spec, and tasks must require a unique request ID per logical request, reuse that ID across automatic timeout retries, and generate a new ID only for a user-initiated retry; tests must cover timeout-retry deduplication.
Decision: Verified: design.md line 3 explicitly says 'no request ID' and prescribes automatic timeout retries, while contract.md line 2 requires a unique request ID per logical request reused on timeout retries to avoid duplicate writes. Although 'user retry creates a new logical request' aligns with the contract, the absence of any request-ID mechanism for automatic retries makes duplicate writes on ambiguous timeouts a concrete failure path. Critical severity is justified as a direct violation of the documented contract.

### A3: major / accepted

Location: specs/export/spec.md lines 8-13 vs design.md line 3 and tasks.md line 4
Scenario: A timeout, non-authentication server error, expired link, or cross-customer access attempt occurs; the spec delta defines only successful creation and link return.
Impact: An implementation can satisfy the written spec while omitting bounded retry, terminal authentication handling, user retry, exact JSON fields, customer-only access, one-hour expiry, deletion, and synchronous-link behavior; the broad task then lacks normative acceptance criteria.
Resolution: Add spec requirements and scenarios for retry bounds and request-ID reuse, user retry, authentication failures, payload fields, customer-only access, expiry and deletion, and the synchronous response; map implementation and verification tasks to those requirements.
Decision: Verified: spec.md lines 8-13 contain a single requirement and a single WHEN/THEN success scenario, while design.md line 3 specifies retry bounds, terminal failure, auth-failure handling, field set, access restriction, expiry/deletion, and synchronous response. tasks.md line 4 is one unchecked item with no scenario-level verification. This is a consequential missing decision in acceptance criteria; major is appropriate.

### A4: major / accepted

Location: design.md line 3 vs contract.md lines 1-2
Scenario: The design requires JSON customer fields, customer-only access, one-hour link expiry and file deletion, and a synchronous link response, but the documented existing contract only establishes POST /exports creation and request-ID requirements.
Impact: Implementation may be planned against an assumed API payload, authorization model, response shape, and lifecycle. If POST /exports does not support those semantics, the change needs unplanned API modifications or will fail during implementation.
Resolution: Document the actual POST /exports request, response, authorization, and lifecycle contract, or add explicit requirements and tasks for any necessary API changes; until verified, mark these semantics as assumptions with concrete acceptance checks.
Decision: Verified: contract.md lines 1-2 document only the creation method, the unsupported GET endpoint, and request-ID rules; nothing in the supplied evidence documents the POST /exports payload, response shape, authorization model, or link lifecycle. proposal.md line 14 commits to 'Use existing export API', so design.md line 3's additional semantics are unverified assumptions against that API. This is a consequential missing decision (major), not speculative, because the packet asserts compatibility without evidence.

### A5: minor / accepted

Location: design.md line 3, phrase 'Retry timeouts twice with one second between attempts'
Scenario: The wording does not establish whether 'twice' means two retries after the initial attempt or two attempts total, and it does not classify non-timeout failures.
Impact: Implementations and tests may use different attempt counts, retry the wrong error classes, or disagree about when the terminal failure and retry button appear.
Resolution: State the exact attempt sequence, eligible error classes, delay behavior, and transition to terminal failure; add a scenario covering the expected number of automatic attempts.
Decision: Verified at design.md line 3. The ambiguity is real and localized to retry wording; the broader spec-coverage consequence is already captured by A3 and the endpoint/request-ID contradiction by A1/A2, so the residual defect is a clarity improvement that does not independently block implementation once those are resolved. Minor severity retained as filed.


## Next step

Offer specific artifact revisions and wait for explicit acceptance.
Re-review requires a new explicit invocation.
