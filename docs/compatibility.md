# Compatibility

Configuration references checked 2026-11-08. Claude native agent listing and Devin native skill loading passed. Native end-to-end review validation remains pending; installed binary versions below are observed, not claims that reviews passed.

| Harness | Observed version | Local skill / agents | Global configuration root |
| --- | --- | --- | --- |
| Claude Code | 2.1.116 | `.claude/skills/openspec-goldfish` / `.claude/agents` | `CLAUDE_CONFIG_DIR` or `~/.claude` |
| Codex CLI | 0.167.0 | `.agents/skills/openspec-goldfish` / `.codex/agents` | `CODEX_HOME` or `~/.codex` |
| Devin CLI | 3000.11.234 | `.devin/skills/openspec-goldfish` / `.devin/agents` | `$XDG_CONFIG_HOME/devin` or `~/.config/devin`; `%APPDATA%/devin` on Windows |

Goldfish uses Claude's `disable-model-invocation`, Codex's `policy.allow_implicit_invocation: false`, and Devin's `triggers: [user]` for manual-only skill invocation. The shared protocol also requires explicit invocation. Codex global skills use its supported legacy `skills/` directory to avoid collisions with Devin's shared `.agents` discovery.

Claude and Devin reviewers allow only native read/search tools. Codex agents inherit parent permissions; instructions prohibiting edits do not constitute an isolated read-only sandbox. No adapter changes permissions, API credentials, or model defaults. Cold reading requires fresh contexts without author history; if unavailable, report incomplete. No role-playing fallback is provided. Reviewers can run sequentially when concurrency is limited.

Devin custom agents are experimental. Devin Cloud is outside scope. OpenSpec must expose `context`, `list`, `status`, and `instructions apply` JSON with resolved roots, concrete artifact paths and dependencies. Missing metadata produces a compatibility error rather than guessed paths. Tested local CLI metadata: 1.16.1; custom schemas and stores are covered by fixtures.

Primary references:

- [Claude subagents](https://code.claude.com/docs/en/sub-agents) and [skills](https://code.claude.com/docs/en/skills)
- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) and [skills](https://learn.chatgpt.com/docs/build-skills)
- [Devin subagents](https://docs.devin.ai/cli/subagents) and [skills](https://docs.devin.ai/cli/extensibility/skills/overview)

Run `npm test` for installation, protocol-helper and packaging fixtures. Native smoke reviews must separately confirm agent loading, fresh contexts, review quality, unchanged artifacts, report output and accepted revisions.

Devin imports Claude skills too. When both adapters are installed, use `/devin:openspec-goldfish` to select the native Devin workflow; an unqualified name can select the Claude provider. `devin skills show devin:openspec-goldfish` confirms the intended provider.

See [acceptance record](acceptance.md) for native loading results, blocked model smoke checks, and remaining verification steps.

### Codex dispatch capability

Inspect the exposed spawn schema. If it supports custom-agent selection, use the installed TOML definitions. Otherwise, when native spawning explicitly supports excluding parent history, send the canonical principles, role instructions, result contract and bounded input as the initial message of a fresh native subagent (`fork_turns: "none"`). A task label does not select a TOML definition. Record the actual dispatch mode in coverage. No model overrides are needed; the parent model and permissions are inherited. If fresh execution cannot be established, report incomplete. This mode does not promise that TOML-specific settings were applied.
