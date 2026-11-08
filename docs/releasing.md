# Releasing Goldfish

Release from a clean checkout of the reviewed main revision. Node 22+ is supported for consumers; the OIDC publishing runner uses Node 24 and npm 11 (trusted publishing requires npm >=11.5.1 and Node >=22.14.0).

## Candidate checks

1. Verify the package name and candidate version with `npm view openspec-goldfish --json`. E404 means no public package was found; it does not guarantee permission to register the name. Stop on ownership conflicts; do not rename silently.
2. Set the intended version in `package.json` through a reviewed PR. Verify MIT licensing and repository/homepage metadata. Keep availability qualifications until npm publication is verified.
3. Merge to main and wait for the Test workflow's Node 22/24 Linux/macOS/Windows matrix to pass. Fetch main and tags, check out that exact main revision, and require `git status --porcelain` to be empty.
4. Run `npm test`, `npm run check`, and `npm pack --dry-run`. The package test installs a tarball into temporary roots for all three harnesses and both scopes. Inspect the published-file list for LICENSE, CLI, protocol/runtime, and absence of native evidence/site source.
5. Create `v<version>` at that exact revision, push the tag, and run `node scripts/check-release.mjs v<version>`. The guard rejects mismatches, unmerged revisions, wrong tag targets, and dirty checkouts. The publish workflow repeats it.

## First publication

If no package exists, authenticate locally with `npm login` and check `npm whoami`. Never put tokens or OTP values in repository files or logs. Run the candidate checks above, then `npm publish --access public` from the clean candidate checkout. Complete any npm interactive authentication in the terminal. If authentication or publication fails, stop and record the remaining step; do not claim success.

Create the matching GitHub release after publishing, using its already-pushed version tag. The release workflow runs the full matrix and recognizes an existing bootstrap version only when its registry `gitHead` and MIT license match the checked revision; it does not republish that version. A local bootstrap is not an OIDC/provenance verification.

## Later releases with trusted publishing

In the npm package settings, configure GitHub Actions as trusted publisher:

- Owner: `mehdishahdoost`
- Repository: `openspec-goldfish`
- Workflow filename: `publish.yml` (not a full path)
- Environment: leave blank; this workflow does not specify an npm environment
- Allowed action: enable direct `npm publish`

Configure trust close to the next real release: a new configuration currently expires unless its first successful publish happens within two days. Do not make a synthetic release just to exercise it. Record whether setup is merely saved or has actually published. Review these requirements against [npm's current instructions](https://docs.npmjs.com/trusted-publishers/) when releasing.

Publish a stable GitHub release for the reviewed `v<version>` tag. `.github/workflows/publish.yml` runs the cross-platform matrix, checks tag/main membership, inspects the package, and publishes from the same revision with a GitHub-hosted runner and `id-token: write`. No repository npm write token is required. Pull requests and ordinary pushes cannot publish. npm supplies provenance for supported public OIDC publications. A pre-existing version from a different revision is an error, never overwritten.

## Verify the public release

Run `npm view openspec-goldfish@<version> version license gitHead repository homepage dist --json`. Confirm the registry revision and license, then run `npx --yes openspec-goldfish@<version> --harness <harness> --<scope>` in temporary directories for claude/codex/devin and local/global. Redirect global config to temporary roots with CLAUDE_CONFIG_DIR, CODEX_HOME, and XDG_CONFIG_HOME (APPDATA on Windows); never smoke-install over a user's configuration. Verify skill, agents, protocol, runtime and no unintended `openspec/` directory.

Record version, revision, CI outcomes, authentication mode, and smoke results in `docs/releases/<version>.md`. After verification, update README/site to remove pending wording in a follow-up PR. npm's registry README comes from the published tarball: update it in the next real package version, as described in [npm's README guidance](https://docs.npmjs.com/about-package-readme-files/); the GitHub README/site can be current immediately.

## GitHub Pages

Enable Pages in repository Settings -> Pages -> Source: GitHub Actions. The Pages workflow deploys only `website/` and the required logo from main or manual dispatch; PRs validate without deployment. Preview locally with `node scripts/build-site.mjs` then stage `.site/` beneath `/tmp/goldfish-preview/openspec-goldfish/` and run `python3 -m http.server 4173 --directory /tmp/goldfish-preview`. Verify the `/openspec-goldfish/` path, desktop/mobile layout, keyboard focus, clipboard success/failure, and readable content without JavaScript.

Verify https://mehdishahdoost.github.io/openspec-goldfish/ after deployment, including logo/styles, npm/repository/docs links and availability wording. Record the deployment revision and URL.

## Recovery

If publication has not happened, fix the candidate and repeat checks. A published version is immutable: release a corrected new version rather than relying on unpublish. If Pages fails, the npm release remains available; repair and redeploy the site or revert its source commit. Never overwrite earlier release records or claim an untested OIDC path has passed.
