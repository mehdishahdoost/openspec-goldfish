# Compatibility

Configuration references checked 2026-11-08. Claude native agent listing and Devin native skill loading passed. Full native fixture review and separately approved revision passed for the versions below; see the end-to-end evidence linked at the bottom.

| Harness | Observed version | Local skill / agents | Global configuration root |
| --- | --- | --- | --- |
| Claude Code | 2.1.319 | `.claude/skills/openspec-goldfish` / `.claude/agents` | `CLAUDE_CONFIG_DIR` or `~/.claude` |
| Codex CLI | 0.167.0 | `.agents/skills/openspec-goldfish` / `.codex/agents` | `CODEX_HOME` or `~/.codex` |
| Devin CLI | 3000.12.28 | `.devin/skills/openspec-goldfish` / `.devin/agents` | `$XDG_CONFIG_HOME/devin` or `~/.config/devin`; `%APPDATA%/devin` on Windows |

Goldfish uses Claude's `disable-model-invocation`, Codex's `policy.allow_implicit_invocation: false`, and Devin's `triggers: [user]` for manual-only skill invocation. The shared protocol also requires explicit invocation. Codex global skills use its supported legacy `skills/` directory to avoid collisions with Devin's shared `.agents` discovery.

Claude and Devin reviewers allow only native read/search tools. Codex agents inherit parent permissions; instructions prohibiting edits do not constitute an isolated read-only sandbox. No adapter changes permissions, API credentials, or model defaults. Cold reading requires fresh contexts without author history; if unavailable, report incomplete. No role-playing fallback is provided. Reviewers can run sequentially when concurrency is limited.

Devin custom agents are experimental. Devin Cloud is outside scope. OpenSpec must expose `context`, `list`, `status`, and `instructions apply` JSON with resolved roots, concrete artifact paths and dependencies. Missing metadata produces a compatibility error rather than guessed paths. Tested local CLI metadata: 1.16.1; custom schemas and stores are covered by fixtures.

Primary references:

- [Claude subagents](https://code.claude.com/docs/en/sub-agents) and [skills](https://code.claude.com/docs/en/skills)
- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) and [skills](https://learn.chatgpt.com/docs/build-skills)
- [Devin subagents](https://docs.devin.ai/cli/subagents) and [skills](https://docs.devin.ai/cli/extensibility/skills/overview)

Run `npm test` for installation, protocol-helper and packaging fixtures. Native smoke reviews must separately confirm agent loading, fresh contexts, review quality, unchanged artifacts, report output and accepted revisions.

Earlier tested Devin 3000.11.234 imported Claude skills and exposed `/devin:openspec-goldfish` to disambiguate providers. Devin 3000.12.28 exposes the native skill as `/openspec-goldfish`. Use `devin skills list` and `devin skills show` to confirm the provider in your version.

See [acceptance record](https://github.com/mehdishahdoost/openspec-goldfish/blob/main/docs/acceptance.md) for native loading results, blocked model smoke checks, and remaining verification steps.

### Codex dispatch capability

Inspect the exposed spawn schema. If it supports custom-agent selection, use the installed TOML definitions. Otherwise, when native spawning explicitly supports excluding parent history, send the canonical principles, role instructions, result contract and bounded input as the initial message of a fresh native subagent (`fork_turns: "none"`). A task label does not select a TOML definition. Record the actual dispatch mode in coverage. No model overrides are needed; the parent model and permissions are inherited. If fresh execution cannot be established, report incomplete. This mode does not promise that TOML-specific settings were applied.

### Devin version-specific verification

Devin 3000.12.28 recognizes the native skill as `/openspec-goldfish` (without the earlier version's provider prefix). Native Goldfish profile dispatch currently fails: the project `.devin/agents` files are present but absent from the session's available profiles, both with and without a Git root. This initial failure is resolved by the native explore-role-message compatibility path verified below. See [initial test evidence](https://github.com/mehdishahdoost/openspec-goldfish/blob/main/docs/native/devin-3000.12.28.json).

### Devin dispatch compatibility path

Select registered Goldfish custom profiles when available. Where project profiles are missing from the registry, create a new `subagent_explore` conversation for each role, supplying canonical principles, role instructions, result contract and the bounded role input. Devin documents separate subagent conversation chains without parent history; the built-in explore profile enforces its own read-only tools. Record `explore-role-message` in coverage. Do not resume previous reviewer contexts or use unrelated plugin profiles. If native dispatch is denied or unavailable, report incomplete.

Current CLI 3000.12.28 uses `/openspec-goldfish`; for earlier versions or collisions, use the command shown by `devin skills list` and confirm its provider with `devin skills show`.

The explore-role-message path completed all four native roles on Devin 3000.12.28. See [verified dispatch evidence](https://github.com/mehdishahdoost/openspec-goldfish/blob/main/docs/native/devin-3000.12.28-fixed.json). The clean fixture produced four candidate findings, so clean-case calibration and full workflow acceptance remain open.

### Claude native verification

Claude 2.1.319 completed cold reading, both grounded-review fixtures and adjudication through named custom agents with plan permissions. Keep normal user authentication settings enabled when testing; project-only setting sources can exclude the working token configuration. The clean fixture produced one minor finding, so zero-findings calibration remains unverified. See [native evidence](https://github.com/mehdishahdoost/openspec-goldfish/blob/main/docs/native/claude-2.1.319.json).

Full native fixture report persistence and separately approved revisions passed for all three current versions. See [end-to-end evidence](https://github.com/mehdishahdoost/openspec-goldfish/blob/main/docs/native/end-to-end/summary.json) and [acceptance details](https://github.com/mehdishahdoost/openspec-goldfish/blob/main/docs/acceptance.md#full-native-review-and-revision-workflow-verified).
