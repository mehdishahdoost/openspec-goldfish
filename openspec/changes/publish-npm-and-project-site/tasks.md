# Tasks

## 1. Package and MIT licensing

- [x] 1.1 Check npm package name ownership, existing versions, and authenticated maintainer identity without exposing credentials; record the candidate version and stop for a decision if the current name/version cannot be published.
- [x] 1.2 Add MIT LICENSE and package metadata for license, repository, bugs, homepage, and discovery; verify metadata consistency and the copyright holder against repository maintainer information.
- [x] 1.3 Refine package contents to retain runtime resources and useful docs while excluding native evidence and website source; extend `test/package.test.js` for metadata/license/resource inclusion and exclusions, repair affected shipped-doc links, and verify `npm test` and `npm pack --dry-run`.

## 2. Release workflow and runbook

- [x] 2.1 Add `.github/workflows/publish.yml` for published stable GitHub releases, rejecting tag/version mismatches and commits outside main; require the cross-platform tests before publishing the checked revision and validate guards with passing/failing local fixtures or workflow checks that do not publish.
- [x] 2.2 Configure the publish job for a supported npm/Node toolchain and GitHub-hosted OIDC with limited permissions and no stored write token; verify workflow syntax, exact trusted publisher identity requirements, and exclusion of PR/push publishing.
- [x] 2.3 Write `docs/releasing.md` covering clean-revision checks, first-package bootstrap authentication, tag/release creation, trusted publisher setup and expiry, registry verification, and recovery by a new version; verify all documented commands and distinguish bootstrap from later OIDC publishing.

## 3. README explanation and installation

- [x] 3.1 Expand README with the motivation for fresh-context planning reviews, each role's evidence boundaries, verdict/coverage semantics, no-findings behavior, stale reports, and accepted revisions; compare claims against canonical protocol and link to deeper docs.
- [x] 3.2 Add npm quick-start commands for supported harnesses and scopes while retaining pending-publication wording and checkout installation; preserve optional change-name selection, prerequisites, and shell-versus-skill distinction, and verify examples against CLI options.
- [x] 3.3 Add a concise illustrative report example and project/license links; verify that it labels illustrative content, separates completion from readiness, and does not claim guaranteed correctness.

## 4. Focused landing page and Pages workflow

- [x] 4.1 Build the static `website/` page with existing logo, restrained modern styling, install section, three-role flow, illustrative report, and repository/npm/doc links; verify content against README/protocol and retain registry availability qualifications.
- [ ] 4.2 Implement progressive copy controls with accessible success/failure feedback and selectable commands; verify keyboard use, clipboard success/denial, no-JavaScript readability, visible focus, contrast, mobile layout, and reduced motion if applicable.
- [x] 4.3 Add `.github/workflows/pages.yml` deploying only the staged website and required assets from main or manual dispatch; verify workflow permissions/environment/concurrency and that PRs cannot deploy or leak repository evidence into the artifact.
- [ ] 4.4 Preview at `/openspec-goldfish/` in desktop and mobile browsers; verify logo, styles, controls, overflow, links, and page metadata, recording visual QA and any fixes.

## 5. Public release and deployed integration

- [x] 5.1 Merge the reviewed release candidate and identify its clean main revision; verify required CI results and repeat package checks on that exact revision before any actual publication.
- [ ] 5.2 Publish the candidate version through the applicable documented bootstrap/OIDC path and create its matching tag/release record; verify registry version/license/source metadata and record the actual authentication mode without credentials.
- [ ] 5.3 Run the exact published version via npx in temporary environments for all three harnesses and both scopes; verify installed skills, roles, protocol, runtime, and absence of unexpected OpenSpec initialization.
- [ ] 5.4 Record trusted publisher setup for subsequent releases, including exact workflow identity and first-publish expiry; verify saved settings when configured and explicitly record whether OIDC has actually been exercised, avoiding a synthetic release just for that check.
- [ ] 5.5 After registry verification, remove pending-publication qualifiers from README and site, promote npm-first guidance, and merge the update; verify public installation commands and document how the registry README is refreshed.
- [ ] 5.6 Enable repository Pages with Actions and deploy the verified site; check the public project URL, logo/styles, all external links, mobile layout, and npm availability wording, and record the live URL and deployment revision.
- [ ] 5.7 Record version, release revision, registry smoke results, CI status, public website URL, and any external setup limits in the release record; confirm every capability scenario has automated or observed verification before marking the change complete.
