# Getting Started

This guide will help you set up and run the Datenight project on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 18.0.0 or higher (we recommend using [nvm](https://github.com/nvm-sh/nvm) for version management)
- **Package Manager**: Either `npm` (comes with Node.js) or [Bun](https://bun.sh/) (used in this project for faster installs)
- **Git**: For cloning the repository
- **A modern web browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/datenight.git
   cd datenight
   ```

2. **Install dependencies**:
   Using npm:
   ```bash
   npm install
   ```
   Or using Bun (recommended for this project):
   ```bash
   bun install
   ```

3. **Set up environment variables** (optional but recommended for full functionality):
   Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to add your TMDB API key if you want to enable live movie search:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here
   ```
   > **Note**: The application includes a curated list of movies and will work without an API key. Adding a TMDB key enables searching the full TMDB database.

## Development Server

To start the development server with hot module replacement (HMR):

Using npm:
```bash
npm run dev
```

Using Bun:
```bash
bun run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173) by default.

## Building for Production

To create a production-ready build:

Using npm:
```bash
npm run build
```

Using Bun:
```bash
bun run build
```

The optimized assets will be generated in the `dist/` directory.

## Previewing the Production Build

To locally preview the production build before deploying:

Using npm:
```bash
npm run preview
```

Using Bun:
```bash
bun run preview
```

This will start a server serving the contents of the `dist/` directory.

## Linting and Formatting

To check for code style issues:

Using npm:
```bash
npm run lint
```

Using Bun:
```bash
bun run lint
```

To automatically fix formatting issues:

Using npm:
```bash
npm run format
```

Using Bun:
```bash
bun run format
```

## Project Structure Overview

After cloning, you'll see the following key directories and files:

```
datenight/
├── src/                 # Source code
│   ├── assets/          # Static images (icons, illustrations)
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core logic (store, movie data, utilities)
│   ├── routes/          # Application pages (file-based routing)
│   ├── router.tsx       # Router configuration
│   ├── server.ts        # Server-side API endpoints
│   ├── start.ts         # Application entry point
│   └── styles.css       # Global styles and Tailwind base
├── public/              # Static assets served at root (/favicon.ico, etc.)
├── .env.example         # Example environment variables
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite and TanStack Start configuration
```

## Troubleshooting

### Port Already in Use
If you see an error about the port being in use, either:
- Stop the process using port 5173, or
- Specify a different port:
  ```bash
  vite dev --port 5174
  ```

### Module Not Found Errors
If you encounter module resolution issues:
1. Delete `node_modules` and the lockfile (`package-lock.json` or `bun.lockb`)
2. Run `install` again
3. Try starting the dev server

### Environment Variables Not Loading
Ensure:
- You have a `.env` file in the root directory
- Variable names are prefixed with `VITE_` (as required by Vite)
- You've restarted the development server after adding/modifying `.env`

## Need Help?

If you encounter issues not covered here, please:
1. Check the [existing issues](https://github.com/your-username/datenight/issues)
2. Open a new issue with details about your problem
3. Reach out to the maintainers

Happy coding! 🎬💖