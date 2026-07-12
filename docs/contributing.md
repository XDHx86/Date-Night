# Contributing

Thanks for considering a contribution! This guide covers how to set up
a development environment, the standards we use, and how to submit
changes.

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project is released under the Contributor Covenant Code of Conduct.
By participating you agree to its terms. The full text is in the
project root as `CODE_OF_CONDUCT.md` (if not yet present, refer to
https://www.contributor-covenant.org/).

## How to Contribute

### Reporting Bugs
1. Search existing issues to avoid duplicates.
2. Open a new issue with:
   - Clear, descriptive title
   - Reproduction steps (and expected vs actual behaviour)
   - Environment: OS, browser, device, package manager (bun/npm)
   - Screenshots / screen recordings when relevant

### Suggesting Features
- Title that captures the proposal
- Detailed motivation and target user
- Mock-ups or sketches (optional)
- Potential drawbacks

### Your First Code Contribution
Issues labelled `good first issue` are scoped to be approachable.

### Improving Documentation
- Fixes to typos / grammar
- Clarifications, examples, additional diagrams
- New translations

## Development Setup

1. Fork & clone
   ```bash
   git clone https://github.com/your-username/datenight.git
   cd datenight
   git remote add upstream https://github.com/original-owner/datenight.git
   ```

2. Install dependencies (Bun is the canonical PM)
   ```bash
   bun install
   # or: npm install
   ```

3. Copy the env file and edit values
   ```bash
   cp .env.example .env
   ```
   The app boots without any env vars; TMDb, Spotify and the
   love-letter category are optional gating values.

4. Start the dev server
   ```bash
   bun run dev
   ```
   Defaults to <http://localhost:8080>.

## Making Changes

1. Branch off `main`
   ```bash
   git checkout -b feature/your-feature
   # or
   git checkout -b fix/issue-description
   ```

2. Keep commits focused — one logical change per commit.

3. Synchronise with upstream
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. Run the gate locally
   ```bash
   bun run check        # typecheck + lint + test
   bun run test:e2e
   bun run build
   ```

## Pull Requests

1. Open a PR against `main`.
2. Use a Conventional Commit title (e.g. `feat(movie): add PM time
   filter`).
3. In the PR description describe:
   - **What** changed and **why**
   - **Screenshots** for UI deltas
   - **Tests** run (unit / e2e / visual)
   - Any follow-ups

4. Ensure CI passes: typecheck, lint, vitest, build, e2e.

5. After review, squash-merge (the project's history prefers tidy
   Conventional Commits).

## Coding Standards

### Language & Formatting
- **TypeScript** (`.tsx`, `.ts`)
- **Prettier** (configured via `.prettierrc`)
- **ESLint** (with React, hooks, refresh and Prettier plugins)
- `bun run format` and `bun run lint:fix` keep things tidy

### File Layout
- Components go under `src/components/`
- Hooks under `src/hooks/`
- Cross-cutting logic under `src/lib/`
- Static data under `src/data/`
- Tests mirror the path:
  - `tests/unit/<area>/...`
  - `tests/integration/components/...`
  - `tests/e2e/user-journeys/...`

### Components
- Use `export function ComponentName({ ...props })` or
  `export const ComponentName = (...)`
- Destructure props in the function signature
- Prefix event handlers with `handle*`
- Avoid inline objects inside render — wrap with `useMemo`
- Use Radix primitives wrapped in `src/components/ui/...` when possible

### Tailwind
- The project uses Tailwind v4 utilities (`text-gradient`,
  `border`, `bg-card`, etc., all defined in `src/styles.css`).
- Dark mode is driven by the `.dark` class on `<html>` (mirrored from
  the store's `isDarkMode` in `src/routes/__root.tsx`).

### TypeScript Guidelines
- **Strict** mode is enabled
- Use `interface` for object shapes; `type` for unions / computed types
- Avoid `any` — prefer `unknown`
- Use `@/` path alias for clean imports
- Prefer exhaustive `Map` / `Record` types for static lookups

### Naming Conventions
- **Components**: PascalCase (`AnimatedButton`, `MovieCard`)
- **Functions & variables**: camelCase (`handleSubmit`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Files**: kebab-case-ish (`AnimatedBackground.tsx`,
  `useUrlSync.ts` — the codebase favours descriptive filenames in
  the existing style)
- **Tests**: `*.test.{ts,tsx}` matching the file under test

### Comments & Documentation
- Use JSDoc for non-trivial exports
- Mark TODOs with `// TODO(<area>): ...` and a tracking issue
- Don't comment the trivial; explain *why* over *what*

### Git Practices
- One logical change per commit
- Imperative mood: "Add search filter", not "Added"
- Conventional Commits: `feat`, `fix`, `docs`, `style`, `refactor`,
  `perf`, `test`, `chore`, `revert`, with an optional scope.
- Branch names: `feature/...`, `fix/...`, `docs/...`, `refactor/...`,
  `test/...`

## Testing Guidelines

The project ships a full test pyramid. New features should land with
appropriate coverage:

| Concern          | Test with                                  |
| ---------------- | ------------------------------------------ |
| Pure helper / lib | Vitest (`tests/unit/lib/...`)              |
| Hook             | Vitest + Testing Library (`tests/unit/hooks/...`) |
| Component        | Vitest + Testing Library (`tests/integration/...`) |
| Page / route     | Playwright (`tests/e2e/user-journeys/...`) |
| Visual change    | Update baseline + run `tests/e2e/visual/...` |
| Accessibility    | Add / extend an axe scan (`tests/e2e/accessibility/a11y-scan.test.ts`) |

Mock external services via MSW (`tests/__mocks__/`)
and reset the Zustand store in `beforeEach`.

## License

By contributing, you agree your contributions are licensed under the
project's MIT license.

---

*Happy coding, thanks for helping! 💖*
