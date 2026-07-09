# Contributing to Datenight

Thank you for considering contributing to the Datenight project! We welcome contributions from the community to help improve this date-planning application.

Please take a moment to review this document to understand how to make your contribution effective and aligned with our project goals.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Improving Documentation](#improving-documentation)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Community](#community)

## Code of Conduct

Please note that this project is released with a Contributor Covenant Code of Conduct. By participating in this project, you agree to abide by its terms. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report, please check if the issue has already been reported by searching the [Issues](https://github.com/your-username/datenight/issues) page.

If you're unable to find an open issue addressing the problem, [open a new issue](https://github.com/your-username/datenight/issues/new) with the following information:

- **Clear and descriptive title**
- **Detailed description** of the problem
- **Steps to reproduce** the behavior
- **Expected behavior** and what you actually observed
- **Screenshots** or screen recordings if applicable
- **Environment details**:
  - OS and version (e.g., macOS 14.0, Windows 11)
  - Browser and version (e.g., Chrome 125.0, Firefox 127.0)
  - Device type (desktop/mobile/tablet)
  - Whether you're using npm, bun, or another package manager

### Suggesting Features

Feature requests are welcome! Please open an issue with:

- **Clear title** describing the feature
- **Detailed explanation** of the feature and its benefits
- **Use cases** that would be enabled by this feature
- **Any potential drawbacks** or considerations
- **Mockups or examples** if applicable (optional but helpful)

### Your First Code Contribution

Unsure where to start? Look for issues labeled [`good first issue`](https://github.com/your-username/datenight/issues?q=is%3Aissue+is%3Aopen+label%20%22good+first+issue%22).

These issues typically have:
- Clear scope and acceptance criteria
- Minimal dependencies on other parts of the codebase
- Well-defined steps to implement
- Opportunity to learn about the codebase

### Improving Documentation

Documentation improvements are always appreciated! This includes:
- Fixing typos or grammatical errors
- Improving clarity of existing documentation
- Adding examples or clarifying complex sections
- Translating documentation to new languages
- Adding diagrams or visual explanations

Documentation contributions can be made by editing files in the `/docs` directory or improving inline code comments.

## Development Setup

Follow these steps to set up your development environment:

### 1. Fork the Repository
Click the "Fork" button on the top-right of the repository page to create your own copy.

### 2. Clone Your Fork
```bash
git clone https://github.com/your-username/datenight.git
cd datenight
```

### 3. Set Upstream Remote
```bash
git remote add upstream https://github.com/original-owner/datenight.git
```

### 4. Install Dependencies

Using npm:
```bash
npm install
```

Using Bun (recommended):
```bash
bun install
```

### 5. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` as needed for your development environment (most values can be left as defaults for local development).

### 6. Start the Development Server
```bash
# Using npm
npm run dev

# Using Bun
bun run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173)

## Making Changes

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```
or for bug fixes:
```bash
git checkout -b fix/issue-description
```

### 2. Make Your Changes
- Follow the [coding standards](#coding-standards) below
- Write clear, descriptive commit messages
- Keep changes focused on a single issue or feature

### 3. Test Your Changes
- Run the application locally to verify your changes work as expected
- Test edge cases and error conditions
- Ensure existing functionality still works
- Check for accessibility issues (use browser dev tools or extensions like axe)

### 4. Keep Your Branch Updated
Periodically update your branch with changes from the main repository:
```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout your-feature-branch
git rebase main
```

### 5. Run Linter and Formatter
```bash
# Check for linting errors
npm run lint

# Auto-fix formatting issues
npm run format
```

## Pull Request Process

### 1. Ensure Readiness
Before submitting your PR:
- Your code follows the [coding standards](#coding-standards)
- You've tested your changes thoroughly
- You've updated any relevant documentation
- You've run `npm run lint` and `npm run format` successfully
- Your branch is up-to-date with `upstream/main`

### 2. Open the Pull Request
Go to your fork on GitHub and click "Compare & pull request" or navigate to:
https://github.com/your-username/datenight/pull/new/your-branch-name

### 3. Fill Out the PR Template
Provide:
- **Clear title** summarizing your changes
- **Detailed description** explaining what and why
- **Reference to related issue** (if applicable): `Fixes #123` or `Related to #123`
- **Screenshots or screen recordings** for UI changes
- **Testing performed** description
- **Any special instructions** for reviewers

### 4. Address Feedback
- Respond to reviewer comments promptly
- Make requested changes by pushing to your branch
- Keep the conversation focused and constructive
- If maintainers request changes, apply them and request another review

### 5. Merge Requirements
A pull request can be merged when:
- It has received approval from at least one maintainer
- All CI checks pass (if applicable)
- There are no merge conflicts with the base branch
- It complies with the project's licensing requirements

### 6. After Merging
- Delete your branch (GitHub usually offers to do this automatically)
- Consider keeping your fork updated with upstream for future contributions

## Coding Standards

### Language & Formatting
- **Primary Language**: TypeScript (.tsx, .ts)
- **Formatter**: Prettier (configured in .prettierrc)
- **Linter**: ESLint with React and TypeScript plugins
- **Command to format**: `npm run format`
- **Command to lint**: `npm run lint`

### File Organization
- Follow the existing structure in `src/`
- Group related functionality together
- Use descriptive, lowercase filenames with `.tsx` extension for React components
- Place styles in:
  - Tailwind classes (preferred)
  - Component-specific CSS modules if absolutely necessary
  - Global styles in `src/styles.css` only for true globals
- Export components as `export default function ComponentName() {}` unless there's a specific reason for named exports

### Component Guidelines
- **Props Destructuring**: Destructure props in the function signature
  ```typescript
  // Good
  function Button({ variant, size, children, onClick }) {
    // ...
  }
  
  // Avoid
  function Button(props) {
    const { variant, size, children, onClick } = props;
    // ...
  }
  ```
- **Default Props**: Use default parameters in function signature
- **Early Returns**: Handle edge cases early to reduce nesting
- **Inline Functions**: Avoid defining objects/functions in render unless necessary (use `useCallback`/`useMemo`)
- **Event Handlers**: Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)
- **Component Size**: Aim for small, focused components (< 100 lines ideally)
- **Reusability**: Make components configurable via props rather than hardcoding behavior

### Styling
- **Primary Method**: Tailwind CSS utility classes
- **Component Variants**: Use `class-variance-authority` (cva) for component variants
- **Custom CSS**: Only when necessary (complex animations, gradients, etc.)
- **Dark Mode**: Not currently implemented; if added, use `dark:` variants
- **Responsive Design**: Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Hover/Focus States**: Always provide clear interactive feedback

### TypeScript Guidelines
- **Strict Mode**: Enable `strict` in `tsconfig.json` (already enabled)
- **Interface vs Type**: Use `interface` for object shapes that may be extended, `type` for complex types
- **Naming**: Prefix interfaces with `I` only if necessary for clarity (generally avoid in modern TS)
- **Generics**: Use when appropriate for reusable components
- **any Type**: Avoid; use `unknown` instead when type is truly uncertain
- **Type Assertions**: Use sparingly; prefer proper typing
- **Enum Usage**: Prefer union types over enums for simpler cases
- **Path Aliases**: Use `@/` prefix for imports (e.g., `import { useDateStore } from '@/lib/store'`)

### Naming Conventions
- **Components**: PascalCase (e.g., `AnimatedButton`, `MovieCard`)
- **Functions & Variables**: camelCase (e.g., `handleSubmit`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Files**: kebab-case (e.g., `animated-button.tsx`, `movie-card.tsx`)
- **Tests**: Same name as file with `.test.` or `.spec.` suffix (`movie-card.test.tsx`)
- **Events**: `onEventName` (e.g., `onClick`, `onChange`)

### Comments & Documentation
- **JSDoc**: Use for exported functions and complex components
- **TODO Comments**: Use sparingly and include ticket/reference if possible
- **Explanatory Comments**: For non-obvious business logic or algorithms
- **File Headers**: Not required; rely on version control for authorship
- **License Headers**: Not needed; project uses MIT license

### Git Practices
- **Atomic Commits**: Each commit should represent a single logical change
- **Clear Messages**: Use imperative mood ("Add feature" not "Added feature")
  - Format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`
  - Examples:
    - `feat(movie): add search filtering by genre`
    - `fix(date): prevent selection of past dates`
    - `docs(readme): clarify installation steps`
- **Branch Naming**:
  - `feature/description`
  - `fix/description`
  - `docs/description`
  - `refactor/description`
  - `test/description`
- **Pull Request Size**: Keep PRs focused; if large, consider splitting into multiple PRs

## Testing Guidelines

While the project doesn't currently have a comprehensive test suite, we encourage testing practices for new contributions:

### Types of Tests to Consider
1. **Unit Tests**: For utility functions and complex logic
2. **Component Tests**: For interactive components using React Testing Library
3. **E2E Tests**: For critical user flows (using Cypress or Playwright)

### Testing Libraries (if adding tests)
- **Jest** or **Vitest** for unit testing
- **React Testing Library** for component testing
- **Cypress** or **Playwright** for end-to-end testing
- **MSW** (Mock Service Worker) for API mocking

### Test File Organization
- Place tests alongside the file they test: `component.test.tsx`
- Or in a `__tests__` directory: `__tests__/component.test.tsx`
- Match naming convention: `[name].test.[ts|tsx]`

### What to Test
- **Pure Functions**: All edge cases and expected outputs
- **Components**:
  - Rendering with different props
  - User interactions (clicks, inputs, etc.)
  - State changes and UI updates
  - Accessibility basics (roles, labels)
- **Custom Hooks**: Various input scenarios and return values
- **Error Handling**: Both expected and unexpected error conditions

### Test Writing Practices
- **Descriptive Test Blocks**: Use `describe` to group related tests
- **Clear Test Names**: Explain what is being tested and expected outcome
- **Arrange-Act-Assert** pattern
- **Custom Matchers**: Create for complex assertions if needed
- **Mocking**: Mock external dependencies (APIs, timers, etc.)
- **Cleanup**: Use `afterEach` to clean up mocks and timers
- **Snapshot Testing**: Use sparingly; prefer explicit assertions for UI

## Community

### Getting Help
If you need help with your contribution:
1. Check the [existing discussions](https://github.com/your-username/datenight/discussions)
2. Look for similar questions in [issues](https://github.com/your-username/datenight/issues)
3. Ask in the project's discussion forum
4. For urgent matters, tag a maintainer in a comment

### Communication
- **Be Respectful**: Remember that contributors are volunteers
- **Be Clear**: Provide context and details in your communications
- **Be Patient**: Maintainers may be in different time zones
- **Follow Up**: If you don't get a response in a few days, politely bump the conversation

### Recognition
Contributors will be acknowledged in:
- Pull request merges
- Release notes (for significant contributions)
- The project's README (if desired)
- Our heartfelt thanks 🙏

## License

By contributing to Datenight, you agree that your contributions will be licensed under the project's MIT license.

---

*Happy coding, and thank you for helping make Datenight better! 💖*

*Last updated: July 2026*