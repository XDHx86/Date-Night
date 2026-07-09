# Project Overview

## What is Datenight?

Datenight is a full-stack web application designed to make planning a date night fun and interactive. It guides users through a step-by-step process to plan the perfect evening, featuring smooth transitions, engaging animations, and a persistent state store to track selections.

## User Flow

1. **Start Screen**: The app begins with a playful prompt asking a yes/no question to set the tone.
2. **Date Selection**: Users pick a date for their night out.
3. **Time Selection**: Users choose a time for the date.
4. **Movie Selection**: Users search and select a movie from a curated list (or via TMDB integration).
5. **Confirmation**: A summary of the chosen date, time, and movie is displayed.
6. **Celebration**: Upon confirmation, the screen displays celebratory animations and effects.

## Key Features

- **Step-by-Step Wizard**: Clear progression through each planning step.
- **Animated Transitions**: Smooth, delightful animations between steps using Framer Motion.
- **Persistent State**: Zustand store maintains selections across steps and page reloads (via sessionStorage).
- **Movie Search**: Built-in movie database with search and filter capabilities.
- **Responsive Design**: Works on desktop and mobile devices.
- **Sound Effects**: Optional audio feedback for user interactions.
- **Modern Tech Stack**: Built with TanStack Start (React Router + Vite), Tailwind CSS, and Radix UI primitives.
- **TypeScript**: Full type safety for enhanced developer experience.

## Target Audience

- Couples looking for a fun way to plan date nights
- Developers interested in seeing a full-stack TanStack Start application
- Anyone who enjoys interactive web experiences with thoughtful UX

## Design Philosophy

- **Delightful Interactions**: Every click and transition includes thoughtful animations or sounds.
- **Simplicity**: The flow is linear and focused, avoiding unnecessary complexity.
- **Customizability**: The movie database can be easily extended or swapped for a live API.
- **Performance**: Built with Vite for fast hot module replacement and optimized production builds.

## Getting Started

To run the project locally, see the [Getting Started Guide](getting-started.md).