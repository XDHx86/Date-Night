# CI/CD Documentation

How the Datenight project's automation is wired together.

## Overview

Continuous integration is built on GitHub Actions (`.github/workflows/`).
Every push and PR runs lint + type-check + unit/integration tests;
E2E, visual regression, accessibility, build verification and security
scans run on `main` (or are triggerable manually). Releases are produced
by a manual workflow that publishes GitHub Releases (draft by default).

Goals:

- Prevent regressions via automated tests
- Maintain code quality via linting, formatting and type-checks
- Guarantee a green production build on every PR
- Catch security issues via dependency auditing and CodeQL
- Provide safe, manual releases with versioning controls

## Workflows Overview

| Workflow                  | Trigger                | Purpose                                       |
| ------------------------- | ---------------------- | --------------------------------------------- |
| `ci.yml`                  | push + PR to `main`    | Setup + Lint + Tests + E2E + Build + Security |
| `lint.yml`                | push + PR              | ESLint, Prettier and TypeScript checks        |
| `test.yml`                | push + PR              | Vitest unit / integration                     |
| `e2e.yml`                 | push + PR / dispatch   | Playwright (chromium, firefox, visual, a11y)  |
| `build.yml`               | push + PR              | Production build verification                 |
| `coverage.yml`            | push + PR              | Coverage reporting                            |
| `security.yml`            | push + PR + schedule   | `bun audit` / `npm audit` / CodeQL            |
| `release.yml`             | manual (`workflow_dispatch`) | Version bump + draft release             |
| `reusable/*`              | composed into others   | setup-bun, setup-npm, cache-deps              |

## Pipeline Stages

The main pipeline (`ci.yml`) runs:

1. **Setup** — checkout, compute lockfile hashes, install Bun + npm.
2. **Lint & Format** — ESLint, Prettier `--dry-run`, `tsc --noEmit`.
3. **Unit & Integration Tests** — `bun run test:coverage`, uploades
   coverage as an artifact and to Codecov.
4. **E2E Tests** — only on `main` or when explicitly requested
   (label `run-e2e` or manual dispatch).
5. **Build Verification** — `bun run build`, optional bundle-size
   analysis, uploads artifact on `main`.
6. **Security Scan** — `bun audit`, `npm audit --audit-level=critical`.
7. **Release Artifacts** — only on `main` (not for PRs); builds and
   uploads a tag + tarball.

## Branch Strategy

- `main` — always deploy-ready.
- Feature / bug / docs / refactor / test / chore branches.
- PRs required for any merge to `main`.
- Recommended branch protection:
  - Require one review
  - Require status checks: `Lint & Format Check`, `Unit & Integration
    Tests`, `Build Verification`, `E2E Tests` (when applicable)
  - Require branches up-to-date before merging

## Caching Strategy

- **OS-level cache** via `actions/cache@v4` keyed on the lockfile hash.
  Caches `node_modules/` plus the lockfiles.
- **Tool-level cache** for `oven-sh/setup-bun` and `actions/setup-node`.
- **Reusable setup**: `.github/workflows/reusable/setup-bun.yml` and
  `setup-npm.yml` are the canonical setup steps.

Cache keys:
```
ubuntu-latest-bun-${hashFiles('**/bun.lock')}
ubuntu-latest-node-${hashFiles('**/package-lock.json')}
```

## Local CI Equivalents

```bash
bun install --frozen-lockfile
bun run lint
bun run format --dry-run
bun run typecheck
bun run test:coverage
bun run playwright:install --with-deps chromium firefox webkit
bun run test:e2e
bun run build
```

A one-shot script for parity:

```bash
#!/usr/bin/env bash
set -euo pipefail

bun install --frozen-lockfile
bun run lint
bun run format --dry-run
bun run typecheck
bun run test:coverage
bun run test:e2e:chrome
bun run build

echo "✅ All CI checks passed"
```

## Releases

The release workflow (`release.yml`) is **manual** (no auto-deploys):

1. Trigger the workflow under "Run workflow".
2. Pick `version-type` (`patch`, `minor`, `major`, `custom`).
3. Default behaviour creates a **draft** GitHub Release.
4. Optional release notes override the auto-generated bullet list.
5. The workflow:
   - Bumps `package.json`
   - Builds production artefacts
   - Bundles a source tarball
   - Creates the GitHub release with attached assets
6. Review the draft release on GitHub and publish when ready.

> Releases push directly to `main` if not marked as draft; tags follow
> semantic versioning.

### Why Manual?

- Explicit control over when releases happen
- Aligns naturally with PR-based collaboration
- Plays nicely with whatever deploy target the consumer uses
  (Vercel, Netlify, Cloudflare Pages, self-hosted)

## Secrets

Required:

| Secret           | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `GITHUB_TOKEN`   | Auto-provided workflow token              |
| `CODECOV_TOKEN`  | Uploads the `coverage` report to Codecov  |

Optional (used for richer integration tests):

| Secret                          | Purpose                              |
| ------------------------------- | ------------------------------------ |
| `VITE_TMDB_API_KEY`             | Live TMDb integration                |
| `VITE_TMDB_READ_ACCESS_TOKEN`   | Live TMDb integration                |
| `VITE_SPOTIFY_PLAYLIST_ID`      | Spotify embed inside E2E             |

## Monitoring

- **Actions tab** — every run, with logs and artifacts.
- **Pull request checks** — the same checks block merges.
- **Artifacts** — coverage reports, Playwright reports, build outputs
  all persist for 7-30 days.

## Troubleshooting

### Workflow fails on dependency install
- Try `Settings → Actions → Caches → Delete` and re-run.
- Verify lockfiles were committed; recent CI uses Bun even when
  triggering through npm (the `setup-bun` step).

### Tests pass locally, fail in CI
- Node 20 is the standard runner — match it locally with `nvm use 20`.
- Playwright browsers install via the Workflow's `bunx playwright install`
  step; locally you can run `bun run playwright:install --with-deps`.

### Build size too large
- Inspect `bun run build` output; the workflow's `du -sh dist/` shows
  the size.
- Consider dynamic imports (`React.lazy`) for rarely used surfaces.

### Visual regression diffs
- Review the produced `tests/e2e/visual/baselines/` update.
- Accept intentional changes by re-running with `UPDATE_SNAPSHOTS=true`
  in CI, or `bun run playwright:update-snapshots` locally.

## Security Considerations

- Never commit secrets — `.env` is in `.gitignore`.
- CodeQL runs weekly via the security workflow.
- Dependabot is enabled and configured via `.github/dependabot.yml`.
- Permissions on release / write workflows are scoped explicitly.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright on CI](https://playwright.dev/docs/ci-intro)
- [Codecov Action](https://github.com/codecov/codecov-action)
- [Dependabot configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates)
