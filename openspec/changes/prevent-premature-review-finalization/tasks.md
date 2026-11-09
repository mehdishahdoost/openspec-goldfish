# Tasks

## 1. Runtime finalization contract

- [x] 1.1 Add pre-write completion enforcement and the optional `incompleteReason` argument in `src/review/core.js`, retaining pure adjudication and clear missing-role diagnostics. Extend `test/review.test.js` to reject missing, malformed, failed, omitted-finding, ID-collision, and invalid-duplicate candidates with zero output writes and unchanged input hashes; verify completed results can finalize the same run after rejection.
- [x] 1.2 Persist trimmed intentional-incomplete reasons in JSON and Markdown while retaining raw results and coverage diagnostics. Test empty/whitespace/non-string reasons, explicit incomplete mode on complete candidates, terminal failure persistence, normal ready/revise/stale behavior, and byte-for-byte immutability after sealed-run retry; verify with `node --test test/review.test.js`.
- [x] 1.3 Document the core option, default rejection behavior, additive report field, and unchanged old-record compatibility in `docs/review.md`; verify descriptions match the passing core test cases and existing native fixtures remain unchanged.

## 2. CLI and coordinator workflow

- [x] 2.1 Forward the value-bearing `--incomplete-reason` option in `src/review/tool.js` and provide actionable rejection diagnostics. Add CLI integration tests using a temporary OpenSpec fixture or controlled metadata provider: verify nonzero/no-output rejection, later success on the same run, explicit incomplete persistence, invalid option values, and refusal to overwrite existing outputs.
- [x] 2.2 Update `resources/protocol/workflow.md` and `result-contract.md` to require terminal role outcomes, explicit waiting for background adjudication, finalization once results are collected, and the explicit incomplete command only for terminal failure. Include recovery guidance for rejected unsealed attempts versus sealed runs and truthful completion presentation; verify examples against CLI integration tests without changing time budgets, automatic-retry rules, or revision acceptance.
- [x] 2.3 Extend adapter installation tests to verify updated protocol and runtime resources ship together for Claude, Codex, and Devin; verify with `node --test test/adapters.test.js` and document the existing-installation update procedure in `docs/review.md` using the supported installer command.

## 3. Integration validation

- [x] 3.1 Exercise the installed bundled runtime in a temporary consumer project with premature rejection followed by successful finalization, plus a separate deliberate-incomplete run; extend the package integration test and verify with `node --test test/package.test.js` so source-only fixes cannot pass accidentally.
- [x] 3.2 Run `npm test`, `npm run check`, and `openspec validate prevent-premature-review-finalization --strict`; verify native-record replay still passes and no historical reports or sample-project artifacts were modified. Record any unavailable native Devin smoke coverage honestly rather than claiming deterministic tests prove native scheduling behavior.

## Verification record

- `npm test`: passed (including core, CLI, six packed installation scenarios, and existing native-record replay).
- `npm run check`, strict OpenSpec validation, and `git diff --check`: passed.
- Existing `docs/native/` records and the user's sample project were not modified.
- No fresh native Devin smoke review was performed. Controlled OpenSpec metadata tests exercise the actual bundled CLI and filesystem, but do not establish native model scheduling compliance.
