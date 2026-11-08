# Spec Delta

## Purpose

Install the Goldfish review workflow into supported coding harnesses at an explicit project or user scope without damaging existing configuration.

## ADDED Requirements

### Requirement: npm CLI installation
The package SHALL expose `openspec-goldfish` through npm with `--harness claude`, `--harness codex`, and `--harness devin` targeting Claude Code, Codex, and Devin CLI respectively. It SHALL install the review skill, native review agents, and supporting resources for the chosen harness.

#### Scenario: Explicit installation
- **WHEN** a user runs `npx openspec-goldfish --harness claude --local`
- **THEN** the selected workflow is installed for Claude Code in the current project and the CLI reports installed paths and manual invocation instructions

#### Scenario: Invalid harness
- **WHEN** an unsupported harness value is supplied
- **THEN** installation exits nonzero with supported choices and writes no files

### Requirement: Scope and interactive selection
The CLI SHALL accept mutually exclusive `--local` and `--global` flags. Local scope SHALL target the current directory and global scope SHALL target the selected harness's user configuration. Missing harness or scope selections SHALL prompt in interactive terminals, with local scope the default. Noninteractive execution SHALL require explicit selections.

#### Scenario: Missing scope interactively
- **WHEN** an interactive user supplies a harness without a scope flag
- **THEN** the CLI asks current project or all projects before writing, with current project selected by default

#### Scenario: Missing selections without a terminal
- **WHEN** noninteractive execution omits harness or scope
- **THEN** it exits nonzero naming the required flags without writing files

#### Scenario: Conflicting flags
- **WHEN** both scope flags are supplied
- **THEN** it exits nonzero before writing

### Requirement: Safe repeated installation
The installer SHALL track package version and owned file contents, permit reruns and upgrades of unmodified owned files, and preserve unrelated or user-modified files. Conflicting files SHALL abort the installation before changes are applied. Installing a second harness SHALL preserve the first installation.

#### Scenario: User customization conflict
- **WHEN** installation would replace a modified owned file or an unrelated existing file
- **THEN** it reports conflicting paths and leaves the installation unchanged

#### Scenario: Rerun and additional harness
- **WHEN** installation is repeated without edits and then another harness is installed at the same scope
- **THEN** both harness installations remain usable without duplicate shared resource entries

### Requirement: Installation does not activate workflow
Installation SHALL NOT start review, add automatic review hooks, change OpenSpec workflow skills, initialize OpenSpec, or require an existing OpenSpec project. Review availability SHALL follow the selected scope, while each review resolves its target project separately.

#### Scenario: Global installation outside a project
- **WHEN** the user installs globally from a directory without OpenSpec
- **THEN** installation succeeds without creating an OpenSpec root or running review

### Requirement: Failed installation recovery
The installer SHALL report filesystem failures and restore any overwritten owned files when a write fails. It SHALL NOT report a successful installation or leave a success manifest for an incomplete installation.

#### Scenario: Write failure during installation
- **WHEN** a destination becomes unwritable after preflight
- **THEN** installation exits nonzero, attempts rollback, and reports any paths requiring manual recovery
