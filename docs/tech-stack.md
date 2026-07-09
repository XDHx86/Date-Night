# Technology Stack

## Overview

Datenight is built using a modern web development stack focused on developer experience, performance, and maintainability. The project leverages the TanStack Start framework (built on Vite) for full-stack capabilities, React for the UI, and a curated set of libraries for state management, styling, animations, and more.

## Frontend Dependencies

### Core Framework
- **[@tanstack/react-start](https://tanstack.com/start/latest)**: Full-stack React framework providing routing, data fetching, and server-side rendering capabilities (v1.168.26).
- **[@tanstack/router-plugin](https://tanstack.com/router/latest)**: File-based routing plugin for seamless integration with Vite (v1.168.18).
- **[@tanstack/react-query](https://tanstack.com/query/latest)**: Powerful state management for server state and asynchronous operations (v5.101.1).
- **[@tanstack/react-router](https://tanstack.com/router/latest)**: Type-safe, file-based routing library (v1.170.16).
- **React & React DOM**: Core UI library for building user interfaces (v19.2.0).
- **TypeScript**: Typed superset of JavaScript for enhanced code quality and developer experience (v5.8.3).

### State Management
- **Zustand**: Minimalist state management solution for client-state persistence (v5.0.14).
  - Used for storing date, time, and movie selections across the application flow.
  - Persisted to `sessionStorage` to survive page reloads.

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development (v4.2.1).
  - Configured via `tailwind.config.js` (inherited from `@lovable.dev/vite-tanstack-config`).
  - PostCSS setup handled by Vite.
- **Headless UI (via Radix)**: Accessible, unstyled UI components as the foundation for custom designs.
  - `@radix-ui/*` primitives for dialogs, menus, tooltips, toggles, and more.
- **Tailwind Merge**: Utility for efficiently combining Tailwind classes without style conflicts (v3.5.0).
- **Class Variance Authority**: Utility for creating variant-based component classes (v0.7.1).
- **Clsx**: Utility for conditionally joining classNames (v2.1.1).
- **Tw-animate.css**: Animate.css integration tailored for Tailwind CSS (v1.3.4).

### Animations & Motion
- **Framer Motion**: Production-ready motion library for React (v12.42.2).
  - Used for page transitions, button animations, and celebratory effects.
- **Embla Carousel React**: Touch-friendly carousel component for image sliders (v8.6.0).

### Forms & Validation
- **React Hook Form**: Performant, flexible form validation library (v7.71.2).
- **Zod**: TypeScript-first schema declaration and validation library (v3.24.2).
  - Integrated with React Hook Form via `@hookform/resolvers` (v5.2.2).
- **Cmdk**: Accessible, command/menu component inspired by Command palette (v1.1.1).

### Data & Utilities
- **Date-fns**: Modern date utility library (v4.1.0).
  - Used for date formatting, parsing, and manipulation.
- **Lucide React**: Beautifully simple, open-source icons (v0.575.0).
- **Sonner**: Toast notification system for pleasant user feedback (v2.0.7).
- **Vaul**: Accessible drawer component for mobile navigation (v1.1.1).
- **Input OTP**: Input component optimized for one-time passcodes (v1.4.2).

### Data Visualization
- **Recharts**: Charting library built on React and D3 (v2.15.4).
  - Currently unused but included for potential future enhancements.

### Development Tools & DevDependencies
- **Vite**: Next-generation frontend tooling for fast builds and HMR (v8.0.16).
- **ESLint**: Pluggable linting utility for identifying and reporting on patterns (v9.32.0).
  - Configured with plugins for React, Prettier, and accessibility.
- **Prettier**: Opinionated code formatter for consistent code style (v3.7.3).
- **TypeScript Enterprise**: TypeScript language services for IDE support (via `@typescript-eslint/parser` and `@typescript-eslint/typescript-estree`).
- **Nitro**: Lightweight, performant HTTP server framework (v3.0.260603-beta).
  - Used under the hood by TanStack Start for server-side utilities.
- **@types/***: TypeScript definition files for all libraries.
- **Vite TSConfig Paths**: Vite plugin for resolving TypeScript path aliases (v6.0.2).
- **@lovable.dev/vite-tanstack-config**: Preset configuration for TanStack Start projects integrated with Lovable platform (v2.7.1).

## Development Scripts

See [`package.json`](https://github.com/your-username/datenight/blob/main/package.json) for the full list of scripts, including:
- `npm run dev`: Start development server with HMR
- `npm run build`: Production build
- `npm run build:dev`: Development build with debug info
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint across the project
- `npm run format`: Format code with Prettier

## Environment Variables

The project uses environment variables for configuration:
- `VITE_TMDB_API_KEY`: Optional key for accessing The Movie Database API (if extending movie search beyond the curated list).
- `VITE_TMDB_READ_ACCESS_TOKEN`: Optional bearer token for TMDB v4 authentication.

These variables should be defined in a `.env` file at the project root (see `.env.example`).

## Browser Support

Datenight targets modern browsers that support:
- ES modules
- CSS custom properties
- Fetch API
- Promise
- async/await

Tested in latest versions of Chrome, Firefox, Safari, and Edge.

## Architecture Overview

The application follows a modular structure:

```
src/
├── assets/          # Static images and media
├── components/      # Reusable UI components (buttons, modals, cards, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Core logic (store, movie data, utilities, sound)
├── routes/          # File-based route definitions (pages)
├── router.tsx       # Router configuration (auto-generated route tree)
├── server.ts        # Server-side API routes and middleware
├── start.ts         # Application entry point
└── styles.css       | Global CSS and Tailwind directives
```

Data flows from the Zustand store (`src/lib/store.ts`) through React context to components, with mutations handled via actions defined in the store.

## Why This Stack?

- **TanStack Start**: Provides a modern, batteries-included full-stack solution with minimal configuration.
- **Zustand**: Offers simple, scalable state management without boilerplate.
- **Tailwind + Radix**: Enables rapid UI development while maintaining accessibility and design flexibility.
- **TypeScript**: Catches errors early and improves IDE autocompletion and refactoring safety.
- **Vite**: Delivers lightning-fast development server and optimized production builds.

For a complete list of dependencies and their versions, see the [`package.json`](package.json) file.