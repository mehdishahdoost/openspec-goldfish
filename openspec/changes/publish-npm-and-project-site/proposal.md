# Proposal

## Why

Goldfish currently requires a checkout to install, and its short README does not fully explain why independent planning reviews help. A public npm release and a focused website will make installation and the review model easier to discover and understand.

## What Changes

- Release `openspec-goldfish` publicly on npm, retaining its existing CLI and harness/scope behavior; add MIT licensing, package metadata, release checks, and a repeatable publishing workflow.
- Expand the README with npm-first installation, the reasoning behind fresh-context reviews, each review role's evidence boundaries, report semantics, and explicitly accepted revisions.
- Publish a minimal, modern, responsive GitHub Pages landing page using the existing Goldfish logo, copyable commands, the three-role flow, an illustrative report, and GitHub/npm/documentation links.
- Verify actual registry installation and the deployed website before declaring the release complete. Coordinate public installation claims with successful publication.
- Keep existing review behavior unchanged; no full documentation portal, custom domain, automatic reviews, or implementation gating.

## Capabilities

### New Capabilities

- `npm-distribution`: Public MIT-licensed package availability, installable release contents, and verifiable repeatable releases.
- `project-landing-page`: Accessible branded landing page explaining installation and the review model, hosted on GitHub Pages.

### Modified Capabilities

None. Main specs are currently empty. Existing installer and review requirements in `add-goldfish-review` remain unchanged; the README describes those behaviors rather than introducing a new review contract.

## Impact

Affected areas are `package.json`, a new `LICENSE`, README and release documentation, packaging assertions, GitHub Actions publishing/Pages workflows, and a dedicated static website directory. External setup includes npm package ownership/authentication, trusted publishing configuration, and repository Pages settings. No runtime model credentials, new service backend, or runtime dependencies are needed. npm name ownership and registry state must be verified during release preparation; a name conflict must be resolved with the maintainer rather than silently renaming the package.
