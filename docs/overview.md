# Project Overview

## What is Datenight?

Datenight is a full-stack web application designed to make planning a date night fun and interactive. It guides users through a step-by-step process to plan the perfect evening, featuring smooth transitions, engaging animations, a persistent state store to track selections, and **real-time URL synchronization** for seamless navigation.

## User Flow

1. **Start Screen**: The app begins with a playful prompt asking a yes/no question to set the tone.
2. **Begging Screen** (`/begging`): A lighthearted alternative path if user initially says "NO" (the NO button dodges the cursor).
3. **Confirmation Screen** (`/confirmation`): Celebration screen after user says "YES".
4. **Date Selection** (`/date`): Users pick a date for their night out.
5. **Time Selection** (`/time`): Users choose a time for the date.
6. **Movie Selection** (`/movie`): Users search and select a movie from the TMDb database.
7. **Review Summary** (`/summary`): A summary of the chosen date, time, and movie is displayed.
8. **Success/Celebration** (`/success`): Final celebration screen with details and restart option.

> **Note**: Users can navigate back and forth between steps using the browser's back/forward buttons or the progress bar at the top of the screen.

## Key Features

- **Step-by-Step Wizard**: Clear progression through each planning step with a persistent progress bar.
- **Animated Transitions**: Smooth, delightful animations between steps using Framer Motion.
- **Persistent State**: Zustand store maintains selections across steps, page reloads (via sessionStorage), and **URL synchronization**.
- **Real Movie Data**: Built-in integration with The Movie Database (TMDb) API for searching real movies with posters, ratings, genres, and durations.
- **Responsive Design**: Works on desktop and mobile devices.
- **Sound Effects**: Optional audio feedback for user interactions.
- **Modern Tech Stack**: Built with TanStack Start (React Router + Vite), Tailwind CSS v4, and Radix UI primitives.
- **TypeScript**: Full type safety for enhanced developer experience.

## Navigation System

The application uses **TanStack Router** for file-based routing with the following key characteristics:

- **URL as Source of Truth**: The current route determines the active step, ensuring consistency across navigation, refreshes, and deep links.
- **Progress Bar**: A persistent progress indicator at the top shows the current step and allows jumping back to previous steps.
- **URL Synchronization**: State (date, time, movie, theme) is synchronized with URL search parameters, allowing:
  - Bookmarking any step in the flow
  - Sharing date plans via URL
  - Restoring state on page refresh
  - Browser back/forward navigation

> **Important**: The navigation system was refactored in July 2026 to fix issues where clicking "Next" would update the URL but not the displayed page. All navigation now uses TanStack Router's `navigate()` API instead of direct `window.history` manipulation.

## Design Philosophy

- **Delightful Interactions**: Every click and transition includes thoughtful animations or sounds.
- **Simplicity**: The flow is linear and focused, avoiding unnecessary complexity.
- **Customizability**: The movie database uses live TMDb API data, and themes can be toggled between light and dark modes.
- **Performance**: Built with Vite for fast hot module replacement and optimized production builds.
- **Accessibility**: All interactive elements are keyboard navigable with proper ARIA attributes.

## Technology Highlights

| Area | Technology |
|------|------------|
| Framework | TanStack Start (React + Vite) |
| Routing | TanStack Router (file-based) |
| State Management | Zustand + sessionStorage |
| URL Sync | Custom `useUrlSync` hook |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Movie Data | TMDb API |
| Date Handling | date-fns |
| Audio | Web Audio API |
| Notifications | Sonner |

## Getting Started

To run the project locally, see the [Getting Started Guide](getting-started.md) for installation and development instructions.

---

*Last updated: July 11, 2026*
