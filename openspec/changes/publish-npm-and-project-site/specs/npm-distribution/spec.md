# Spec Delta

## Purpose

Make Goldfish available as a public MIT-licensed npm package with verifiable installation and repeatable releases tied to repository revisions.

## ADDED Requirements

### Requirement: Public licensed package
Goldfish SHALL be distributed publicly as `openspec-goldfish` with MIT license text, matching package license metadata, supported Node.js versions, and repository, issue tracker, and homepage links.

#### Scenario: Inspect published metadata
- **WHEN** a user inspects the released package and its registry metadata
- **THEN** the package contains the MIT license and identifies the supported runtime and project links consistently

### Requirement: Complete registry installation
The published package SHALL provide the existing installer through `npx openspec-goldfish` and include all resources needed for Claude Code, Codex, and Devin installations in local and global scopes without a repository checkout.

#### Scenario: Install from npm
- **WHEN** a user runs the released version through npx with an explicit supported harness and scope in a clean temporary environment
- **THEN** installation succeeds with the bundled skill, role instructions, protocol, and runtime available at the selected destination

### Requirement: Verifiable releases
Each public version SHALL correspond to an identified repository revision and pass automated checks and packaged-install verification before publication. A version/tag mismatch or failed required check SHALL prevent publication. Release instructions SHALL cover initial package creation and subsequent authenticated publishing without committed credentials.

#### Scenario: Invalid release candidate
- **WHEN** the requested release version differs from package metadata or required checks fail
- **THEN** the release process stops without publishing that candidate

#### Scenario: Published version verification
- **WHEN** a release is reported complete
- **THEN** its registry version and clean-environment installation have been verified and the source revision is recorded

### Requirement: Truthful installation guidance
The README SHALL promote npm installation only after the documented version is available. It SHALL explain runtime and harness prerequisites, local/global scope, interactive selection, and the distinction between installing through the shell and invoking the review skill with an optional change name.

#### Scenario: Publication has not succeeded
- **WHEN** registry publication is pending or fails
- **THEN** public documentation retains an explicit availability qualification and a usable checkout installation path

#### Scenario: User follows the quick start
- **WHEN** a user follows the post-release README for a supported harness
- **THEN** the documented commands install the skill and explain how to invoke review without treating the installer as the review command
