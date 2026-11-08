# Design

## Context

See proposal.md for motivation and the two delta specs for observable behavior. The current package is version 0.1.0, uses Node.js >=22, has no runtime dependencies, and exposes an installer rather than a shell review runner. `test/package.test.js` already packs and installs all six harness/scope combinations in temporary roots. CI exercises Node 22/24 on three operating systems. Only the test workflow exists; there is no release workflow or website. `package.json` says UNLICENSED and has no project links. Existing PNG logo and cover assets are available. Main specs are empty; the previous completed change contains the review and installer contracts.

## Goals / Non-Goals

**Goals:** Keep release contents reproducible from a named commit, reuse existing package verification, and publish a lightweight site independently of npm packaging. Keep README and website explanations aligned with the canonical protocol.

**Non-Goals:** No change to review algorithms, installer selection semantics, harness dispatch, or acceptance gates. No frontend framework, backend, analytics, custom domain, new logo generation, or full documentation portal.

## Decisions

### Package identity and MIT license

Retain `openspec-goldfish` and target the existing 0.1.0 only if registry checks confirm it is available and publishable by the maintainer. Inspect registry ownership/version and authenticated npm identity during apply, without displaying tokens. Stop for a maintainer decision if the name is owned by someone else or the candidate version is already published. Add the standard MIT text with the repository maintainer as copyright holder, verify that identity from repository metadata, and set the SPDX license value. Add repository, bugs, homepage, and relevant discovery keywords. A scoped rename is not an automatic fallback because it changes installation commands.

### Release contents and publishing

Keep the current runtime/resource layout to preserve checkout-independent installation. Retain useful user docs and attribution, but exclude native acceptance transcripts, website source, and development evidence from the tarball; inspect links so shipped docs do not promise missing relative files. Extend the existing packaging test to check required metadata/license/resources and exclusions rather than duplicating installer tests.

Use `.github/workflows/publish.yml` on published GitHub releases with `v<version>` tags. Require the release commit to belong to main, reject tag/package mismatches and prerelease events for this initial stable channel, run the existing test matrix before the publish job, and publish the checked package from the same revision. Use a current supported npm CLI for OIDC on a GitHub-hosted runner, with narrowly scoped `id-token: write` and `contents: read`, and record version/source identity. Do not publish on pull requests or ordinary pushes.

For the first publication, check whether the registry supports configuring trust before package creation. If not, bootstrap with the maintainer's authenticated local npm session and required interactive authentication, after running the same release checks on a clean main revision; do not introduce a repository token to automate bootstrap. Then configure the exact repository/workflow as npm trusted publisher and use OIDC for later releases. Document the bootstrap exception, release tag creation, and subsequent flow in `docs/releasing.md`. Keep these external setup steps explicit and report unavailable authentication as an unfinished task, not a successful release.

Trusted publishing is preferred to a stored npm token because it binds publishing to the workflow identity. Reference: https://docs.npmjs.com/trusted-publishers/ .

The current npm documentation requires npm >=11.5.1 and Node >=22.14.0 for trusted publishing. New trusted publisher configurations expire if their first successful publish does not occur within two days. Document this timing and configure trust near the next real release rather than publishing an unnecessary version solely to validate setup. Distinguish saved configuration from successfully exercised OIDC in the release record.

### README as the concise product guide

Expand the README around the problem of assumptions trapped in author conversation. Explain each role's allowed evidence, independent initial reviewers followed by adjudication, and helper-calculated verdicts. Cover complete/incomplete separately from ready/revise/undetermined, no findings as valid, immutable reports, stale inputs, and explicit acceptance before revision. Preserve optional change selection, both installation scopes, prerequisites, and installer-versus-skill invocation. Link to deeper protocol/compatibility docs rather than copying acceptance history. Label the report example illustrative and remove any implication of guaranteed correctness.

Prepare npm commands in the release candidate README with an explicit pending-publication qualification, retaining checkout installation. Once registry verification succeeds, remove the qualification in a follow-up documentation commit and deploy the updated site. Later package releases will include the updated README; refresh the registry README through npm's supported process if needed. This sequence favors truthful availability over claiming success in an unpublished candidate.

### Standalone static landing page

Use `website/` with semantic HTML, CSS, small progressive-enhancement JavaScript, and the existing logo copied into its deploy artifact. This needs no framework or build dependency. Use a restrained neutral palette with a Goldfish accent, generous spacing, clear typography, and a single-column mobile layout. Sections: logo/value proposition, install commands, the three-role flow, illustrative report, and project links. Copy buttons report success only after clipboard completion and expose a manual-copy fallback. Preserve core content with JavaScript disabled, visible focus, meaningful alt text, sufficient contrast, and reduced-motion preferences if animation is introduced.

Use relative asset paths and explicit repository documentation URLs so `/openspec-goldfish/` works without a custom domain. Stage the static artifact separately from npm, including required logo assets; do not upload the repository root or evidence files. The anticipated URL is `https://mehdishahdoost.github.io/openspec-goldfish/`, subject to verification of repository Pages settings.

### Pages deployment and verification

Use `.github/workflows/pages.yml` to deploy main changes affecting the website/assets/workflow and allow manual redeployment. Pull requests validate only. Use the official Pages configuration, artifact upload, and deployment actions with a `github-pages` environment, deployment concurrency, and only the required permissions. Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages .

Verify the page locally at a project subpath in desktop/mobile layouts, with keyboard navigation, clipboard success/failure, and JavaScript disabled. After enabling Pages and deploying, verify the public URL, logo/styles, links, and installation wording. Keep visual checks proportional to this single-page site; no screenshot snapshot suite is required.

## Risks / Trade-offs

- Registry name, version, or authentication unavailable -> stop publication, retain checkout guidance, and report the exact missing external setup; do not rename silently.
- A public npm version cannot be corrected in place -> inspect the tarball and install it before publishing; fix defects with a new version rather than treating unpublish as rollback.
- Release and Pages availability can diverge -> retain availability qualifiers until registry checks pass, then update docs/site explicitly.
- README/site explanations can drift -> compare both with the existing canonical protocol during validation and link to detailed docs.
- Static content is manually maintained -> acceptable for this focused page; avoid a generator and dependency chain until scale justifies them.
- Native evidence files expand the package and expose irrelevant detail -> exclude them from npm/site artifacts while retaining repository links for interested readers.

## Migration Plan

1. Prepare MIT metadata, package exclusions, publishing workflow/runbook, expanded README, and locally verified landing page in a reviewable PR. Keep publication-pending wording.
2. Merge the reviewed candidate and run release checks on its clean identified revision. Verify registry state and maintainer authentication, then bootstrap or publish 0.1.0 as applicable.
3. Verify registry metadata and run the exact released package in temporary environments for every harness/scope combination. Configure and document trusted publishing for future releases; identify any untested future-only workflow step.
4. Enable Pages Actions deployment, remove pending wording after npm verification, merge those documentation updates, deploy, and verify the public project URL.
5. Record release version, revision, CI outcomes, registry smoke results, and Pages URL in the release record. If publication succeeds but Pages fails, retain the npm release and fix/redeploy the site. Revert site/docs commits to restore a previous site if needed; npm defects require a new package version.
