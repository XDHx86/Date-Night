# CI/CD Documentation

How Datenight's automation is wired together.

## Overview

Continuous integration is built on GitHub Actions under
`.github/workflows/`. Every push and PR triggers the linear `ci.yml`
pipeline; targeted actions (`security`, etc.) are opt-in via separate
workflows.

### Goals

- Prevent regressions via the full test pyramid.
- Maintain code quality via linting, formatting, and type checks.
- Guarantee a green production build on every PR.
- Deploy the static SPA to **GitHub Pages** on every merge to `main`.
- Always CI-ready locally (`npm run check:full` mirrors the pipeline).

## Workflows Overview

| Workflow                  | Trigger                                | Purpose                                                            |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `ci.yml`                  | push to `main`, PR to `main`, dispatch | Install → lint → typecheck → test → build → deploy to GitHub Pages |
| `security.yml` (optional) | push, PR, weekly cron, dispatch        | `npm audit`, CodeQL, dep-review (kept slim)                        |

The previous shape — eight workflow files, `reusable/setup-bun*` /
`reusable/setup-npm*`, Cloudflare Pages preview deploy, Newman + API
contract workflow, lockfile parity job, coverage-summary PR comment, and
release workflow — has been removed/replaced. They were all tied to the
TanStack Start / Vinxi / Nitro build pipeline that's gone now that the
project is a Vite SPA.

## Pipeline Stages

`.github/workflows/ci.yml` runs three jobs in sequence:

1. **`install-lint-typecheck-test`** — checkout, `setup-node@v4`, `npm ci`,
   `npm run lint`, `npm run typecheck`, `npm run test`.
2. **`build`** (needs 1) — checkout, `setup-node@v4`, `npm ci`,
   `npm run build:gh-pages` (which sets `BASE_PATH=/Date-Night/`),
   `actions/upload-pages-artifact@v3`.
3. **`deploy`** (needs 2) — `actions/deploy-pages@v4`, gated by the
   `github-pages` environment with `pages: write` and `id-token: write`.

Concurrency on the same ref cancels in-flight runs so re-pushes never
queue stale builds.

## Branch Strategy

- `main` — auto-deploys to GitHub Pages on push.
- Feature / bug / docs / refactor / test / chore branches.
- PRs required for any merge to `main`.
- Recommended branch protection:
  - Require one review.
  - Require these status checks:
    `Lint`, `Typecheck`, `Tests (unit + integration + api + smoke)`,
    `Production build (Pages artifact)` (the deploying job).
  - Require branches up-to-date before merging.

## Caching Strategy

- **npm**: `actions/setup-node@v4` with `cache: npm` keyed on
  `package-lock.json` and `package.json`.
- **Playwright** — not required for the main path. Optional local runs
  can use `npx playwright install`; CI does not need the browsers yet
  (the suite is run in dev workflow on a host that has them if it is
  re-enabled later).

```
node/npm: package-lock.json, package.json
```

## Local CI Equivalents

```bash
# Fastest loop
npm run check

# Full pipeline (mirrors CI)
npm run check:full
```

The `check` script covers typecheck + lint + format + unit tests; the
combination of `check:full` and the build step is the local analogue of
the full CI matrix.

## GitHub Pages Setup (one-time)

In the repository settings:

1. **Settings → Pages** → set source to **GitHub Actions** (the first
   `actions/deploy-pages@v4` invocation will write this for you).
2. **Settings → Environments → `github-pages`** — confirm
   `Deployment branches and tags` is set to `main` (or accept the
   default that allows from the latest deploy job).

After this is in place, every push to `main` publishes the SPA at
`https://<owner>.github.io/Date-Night/`.

## SPA Routing on Pages

`scripts/copy-404.cjs` runs as part of `npm run build` and copies
`dist/index.html` to `dist/404.html`. GitHub Pages serves `404.html`
whenever a request path can't be resolved to a static file, so deep
links like `/Date-Night/success` automatically boot the SPA shell.
The shell mounts, TanStack Router reads `window.location.pathname`, and
the correct route renders client-side.

## Future Work

- A preview environment can be reintroduced (e.g. Cloudflare Pages or a
  Pages preview action) when team review requires URL access per PR.
- A release workflow can be re-added for tagged releases when there's
  value in shipping artefacts outside the live Pages URL.
