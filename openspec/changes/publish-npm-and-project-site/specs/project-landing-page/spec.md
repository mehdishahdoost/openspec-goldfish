# Spec Delta

## Purpose

Help prospective users understand Goldfish and begin using it through a focused branded website with accurate installation and review guidance.

## ADDED Requirements

### Requirement: Focused branded presentation
The site SHALL present a minimal, modern landing page using the existing Goldfish logo, a concise value proposition, installation guidance, the review flow, an illustrative report, and links to the repository, npm package, and detailed documentation.

#### Scenario: First visit
- **WHEN** a visitor opens the landing page
- **THEN** they can identify Goldfish as an independent pre-implementation OpenSpec planning review tool and find installation and source links

### Requirement: Explain review boundaries
The landing page and README SHALL distinguish the cold reader's planning-only context, the adversarial reviewer's repository evidence, and adjudication of individual findings. They SHALL explain completion versus readiness, valid zero-findings outcomes, advisory verdicts, and explicit acceptance before revisions without promising guaranteed correctness.

#### Scenario: Inspect the example
- **WHEN** a visitor reads the review explanation and example report
- **THEN** the example is labeled illustrative, shows completion and readiness separately, and explains that revisions require user acceptance

### Requirement: Accessible installation interaction
Installation commands SHALL be selectable text with keyboard-operable copy controls and visible success or failure feedback. The page SHALL remain readable on narrow and wide screens, support keyboard navigation and visible focus, and provide meaningful image alternatives and sufficient text contrast. Core content SHALL remain available without JavaScript.

#### Scenario: Copy fails
- **WHEN** a visitor activates a copy control and clipboard access is unavailable
- **THEN** the page reports the failure and leaves the command selectable for manual copying

#### Scenario: Mobile or keyboard visit
- **WHEN** a visitor uses a narrow viewport or navigates by keyboard
- **THEN** content and controls remain usable without page-wide horizontal overflow or inaccessible actions

### Requirement: Working project-site deployment
The site SHALL be publicly hosted on GitHub Pages and load its assets and navigation correctly beneath the repository's project path. Pull requests SHALL NOT deploy to the public site. Public installation claims SHALL match verified npm availability.

#### Scenario: Deployed project URL
- **WHEN** a visitor opens the deployed project URL and follows its links
- **THEN** the logo, styles, command controls, and documentation links resolve correctly under the project path

#### Scenario: Unreleased package
- **WHEN** the package is not yet verified on npm
- **THEN** the site clearly qualifies registry availability and offers the checkout installation path instead of claiming npm installation is available
