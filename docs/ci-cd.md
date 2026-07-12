# CI/CD Documentation

How Datenight's automation is wired together.

## Overview

Continuous integration is built on GitHub Actions under
`.github/workflows/`. Every push and PR triggers the `ci.yml`
orchestrator; targeted workflows (smoke, preview deploy, coverage
summary, Newman API) opt in via labels, `workflow_dispatch`, or branch
filters. Releases are produced by a manual workflow that publishes
draft GitHub Releases.

### Goals

- Prevent regressions via the full test pyramid.
- Maintain code quality via linting, formatting, and type checks.
- Guarantee a green production build on every PR.
- Catch security issues via dependency auditing, CodeQL, and dep-review.
- Provide safe, manual releases with semantic-version controls.
- Always CI-ready locally (`bun run check:full` mirrors the pipeline).

## Workflows Overview

| Workflow                       | Trigger                                   | Purpose                                                              |
| ------------------------------ | ----------------------------------------- | -------------------------------------------------------------------- |
| `ci.yml`                       | push to `main`, PR to `main`, dispatch    | Orchestrator: lint, format, build, unit, integration, SSR, API, smoke, E2E, security, deps |
| `format-check.yml`             | reusable (`workflow_call`)                | Standalone Prettier formatting check                                 |
| `lint.yml`                     | reusable (`workflow_call`)                | ESLint + Prettier + TypeScript (Bun + npm parity)                    |
| `test.yml`                     | reusable (`workflow_call`)                | Vitest (unit + integration + SSR + coverage)                         |
| `build.yml`                    | reusable (`workflow_call`)                | Production build (Bun + npm parity) + bundle-size report             |
| `api-tests.yml`                | reusable (`workflow_call`)                | Vitest + Newman API contract suite                                    |
| `smoke-tests.yml`              | reusable (`workflow_call`)                | Post-build Playwright smoke against the production bundle           |
| `e2e.yml`                      | reusable (`workflow_call`)                | User journeys + cross-browser + responsive + visual + a11y + perf + regression + smoke |
| `security.yml`                 | push, PR, weekly cron, reusable           | `bun audit`, `npm audit`, CodeQL, ESLint, dep-review                 |
| `dependency-validation.yml`    | reusable, push, PR                        | Lockfile parity (Bun + npm), supply-chain guard                      |
| `coverage-summary.yml`         | dispatch, PR labeled                      | Per-project coverage table as PR comment                             |
| `preview-deploy.yml`           | PR (Cloudflare Pages), dispatch           | Short-lived preview URL with smoke against the live URL             |
| `release.yml`                  | manual dispatch                           | Version bump → draft GitHub Release                                  |
| `reusable/setup-bun.yml`       | reusable                                   | Bun + deps installation                                              |
| `reusable/setup-npm.yml`       | reusable                                   | Node + npm installation                                              |
| `reusable/setup-bun-playwright.yml` | reusable                               | Bun + deps + cached Playwright browsers                              |

## Pipeline Stages

The orchestrator (`ci.yml`) fans out into:

1. **Static analysis** — lint (`lint.yml`), format (`format-check.yml`).
2. **Build** — `build.yml` (Bun + npm) produces `.output/`.
3. **Unit / Integration / SSR / API tests** — `test.yml`, `api-tests.yml`.
4. **Smoke + E2E** — `smoke-tests.yml`, `e2e.yml` (matrix: chromium,
   firefox, webkit, mobile-chrome, mobile-safari, tablet, visual,
   accessibility, performance, regression, error-boundary, security).
5. **Security** — `security.yml` (audits, CodeQL, dep-review).
6. **Dependency hygiene** — `dependency-validation.yml`.

Failures in any stage cancel in-flight runs of the same ref.

## Branch Strategy

- `main` — always deploy-ready.
- Feature / bug / docs / refactor / test / chore branches.
- PRs required for any merge to `main`.
- Recommended branch protection:
  - Require one review.
  - Require these status checks:
    `Lint & Type Check`, `Prettier Format Check`, `Production Build`,
    `Vitest (unit)`, `Vitest (integration)`, `SSR / Hydration`,
    `Coverage report`, `API contract (Vitest + MSW)`,
    `Build Smoke Tests`, `E2E User journeys`, `Cross-browser matrix`,
    `Responsive matrix`, `Visual regression`, `Accessibility (axe)`,
    `Performance budgets`, `Regression suite`, `E2E smoke`.
  - Require branches up-to-date before merging.

## Caching Strategy

- **Bun**: `oven-sh/setup-bun@v2` caches on lockfile hash.
- **npm**: `actions/setup-node@v4` with `cache: npm`.
- **Playwright**: `setup-bun-playwright.yml` caches `~/.cache/ms-playwright`
  on lockfile hash with `actions/cache@v4` keys.

Cache keys:

```
bun:        ${{ hashFiles('**/bun.lock', '**/package.json', '**/bunfig.toml') }}
node/npm:   ${{ hashFiles('package-lock.json', 'package.json') }}
playwright: pw-browsers-${{ runner.os }}-${{ hashFiles('**/bun.lock') }}
```

## Local CI Equivalents

```bash
# Fastest loop
bun run check

# Full pipeline (mirrors CI)
bun run check:full
```

The `check` script covers typecheck + lint + format + unit tests; the
`check:full` script adds integration, SSR, API, smoke and the full
Playwright matrix.

A one-shot parity script:

```bash
#!/usr/bin/env bash
set -euo pipefail

bun install --frozen-lockfile
bun run lint
bun run format:check
bun run typecheck
bun run test:unit
bun run test:integration
bun run test:ssr
bun run test:api
bun run test:smoke
bun run playwright:install --with-deps chromium firefox webkit
bun run test:e2e
bun run build

echo "✅ All CI checks passed"
```

## Releases

The release workflow (`release.yml`) is **manual** (no auto-deploys):

1. Trigger under "Run workflow".
2. Pick `version-type` (`patch`, `minor`, `major`, `custom`).
3. Default behaviour creates a draft GitHub Release.
4. Optional release notes override the auto-generated bullet list.
5. The workflow:
   - Bumps `package.json`.
   - Builds production artefacts.
   - Bundles a source tarball.
   - Creates the GitHub release with attached assets.
6. Review the draft release and publish when ready.

Preview deploys (`preview-deploy.yml`) use **Cloudflare Pages**. Each
PR receives a scoped preview URL; a smoke Playwright suite runs against
it before the URL is posted back to the PR. Required secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`

Optional for full integration:

- `VITE_TMDB_API_KEY`
- `VITE_TMDB_READ_ACCESS_TOKEN`
- `VITE_SPOTIFY_PLAYLIST_ID`

## Secrets

Required:

| Secret           | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `GITHUB_TOKEN`   | Auto-provided workflow token                  |
| `CODECOV_TOKEN`  | Uploads the `coverage` report to Codecov      |

Optional (richer integration tests):

| Secret                          | Purpose                             |
| ------------------------------- | ----------------------------------- |
| `VITE_TMDB_API_KEY`             | Live TMDb integration               |
| `VITE_TMDB_READ_ACCESS_TOKEN`   | Live TMDb integration               |
| `VITE_SPOTIFY_PLAYLIST_ID`      | Spotify embed inside preview/E2E    |
| `CLOUDFLARE_API_TOKEN`          | Preview deploys                     |
| `CLOUDFLARE_ACCOUNT_ID`         | Preview deploys                     |
| `CLOUDFLARE_PAGES_PROJECT`      | Preview deploys                     |

## Monitoring

- **Actions tab** — every run is preserved with logs and artifacts.
- **Pull request checks** — the same checks block merges.
- **Artifacts** (7-30 days retention by workflow):
  - `coverage-report` — Vitest coverage
  - `coverage-api` — API contract coverage
  - `playwright-*` — every Playwright job
  - `newman-report` — Newman JUnit
  - `production-build` — `.output/`
  - `release-artifacts-*` — release tarballs

## Troubleshooting

### Workflow fails on dependency install
- `Settings → Actions → Caches → Delete`, then re-run.
- Verify lockfiles (`bun.lock`, `package-lock.json`) were committed.

### Tests pass locally, fail in CI
- Match the runner's Node version locally: `nvm use 20`.
- Install Playwright browsers with `bun run playwright:install`.

### Build size too large
- Inspect `bun run build` output; the workflow's `du -sh .output/` is
  in the GitHub Actions summary.
- Dynamic imports (`React.lazy`) for rarely used surfaces help.

### Visual regression diffs
- Review `tests/e2e/visual/baselines/` updates.
- Accept intentional changes by running
  `bun run playwright:update-snapshots` locally and committing the
  diff.

### Newman failures on CI
- Confirm the workflow's curl-wait actually binds to the dev server.
- Increase `timeout-minutes` for the `api-tests.yml > newman` job.

## Security Considerations

- Secrets never reach git (`.env` is in `.gitignore`).
- `bun audit`, `npm audit`, and `dependency-review-action` run on every
  PR.
- CodeQL runs weekly (`security.yml` `schedule`).
- Dependabot is enabled via `.github/dependabot.yml`.
- Permissions on write-enabled jobs are scoped (e.g. `contents:
  write`, `security-events: write`).

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright on CI](https://playwright.dev/docs/ci-intro)
- [Codecov Action](https://github.com/codecov/codecov-action)
- [Dependabot configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates)
- [Cloudflare Pages Action](https://github.com/cloudflare/pages-action)
- [Newman CLI](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
