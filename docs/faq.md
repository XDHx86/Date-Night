# Frequently Asked Questions

This document answers common questions about the Datenight project. If you don't see your question here, please check the [documentation](/docs/) or [open an issue](https://github.com/your-username/datenight/issues/new).

## General Questions

### Q: What is Datenight?
A: Datenight is a playful, interactive web application that guides users through planning a date night step-by-step. It helps couples (or friends) select a date, time, and movie for their outing through a series of engaging screens with animations and sound effects.

### Q: Is Datenight free to use?
A: Yes! Datenight is completely free and open-source. There are no hidden costs, subscriptions, or in-app purchases.

### Q: Do I need to create an account to create an account?
A: No account creation. The application a backend is entirely client'session state storage to remember your progress, so you can refresh the page without losing your selections.

### Q: Is my data private?
A: Yes. All data (your selected date, time, and movie) is stored only in your browser's sessionStorage. No data is sent to any external server unless you explicitly choose to extend the movie search with a TMDB API key (and even then, only search queries are sent to TMDB, not your selections).

### Q: Can I use Datenight on mobile devices?
A: Absolutely! The application is fully responsive and works on smartphones, tablets, and desktop computers. The interface adapts to different screen sizes for optimal usability.

### Q: Does Datenight work offline?
A: The core functionality works offline once the application has loaded. The movie search uses a built-in curated list that doesn't require an internet connection. If you have configured TMDB API keys, those features will require an internet connection.

### Q: How does the "NO" button dodging work on the begging page?
A: The "NO" button on the begging page uses JavaScript to detect when your mouse gets close to it and then moves to a random position within the viewport. After a set number of attempts (usually 5), it stops dodging and becomes clickable, ensuring that users who persist can still proceed.

### Q: What happens if I refresh the page during the planning process?
A: Your selections are automatically saved to your browser's sessionStorage, so refreshing the page will restore you to exactly where you left off. This allows you to accidentally close the tab or lose internet connection without losing your progress.

### Q: Can I share my date plan with someone else?
A: The current version doesn't include a built-in sharing feature because selections aren't stored in the URL. However, you can:
1. Take a screenshot of the summary or success page
2. Manually tell your partner the selections
3. If you're both using the same browser on the same device, the sessionStorage will persist for both of you

### Q: Why does the movie search sometimes show limited results?
A: By default, Datenight uses a built-in curated list of approximately 12 popular films across various genres. This ensures the app works immediately without any setup. If you want access to the full TMDB database, you can add your TMDB API key to the `.env` file.

### Q: Is Datenight available in languages other than English?
A: Currently, the application is available only in English. Contributions for translations are welcome! Please see the [contributing guide](/docs/contributing.md) for more information.

## Technical Questions

### Q: What technology stack does Datenight use?
A: Datenight is built with a modern web development stack:
- **Framework**: TanStack Start (React-based full-stack framework on Vite)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Radix UI primitives
- **State Management**: Zustand (with sessionStorage persistence)
- **Routing**: TanStack Router (file-based)
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Dates**: date-fns for date/time manipulation
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Language**: TypeScript

See the [Technology Stack documentation](/docs/tech-stack.md) for complete details.

### Q: How does the persistent state work?
A: The application uses Zustand with the persist middleware to store state in sessionStorage. The store automatically saves changes and retrieves them on page load. The storage key is `"date-plan"`, and the data is stored as JSON.

### Q: Can I modify the movie list?
A: Yes! The movie data is located in `src/lib/movies.ts`. You can:
1. Edit the existing `MOVIES` array to add, remove, or modify films
2. Change the `posterGradient` values to alter the background appearance of movie cards
3. Adjust the `genres` arrays and `emoji` values to change how movies are categorized
4. For a much larger dataset, add a TMDB API key to enable live search (see below)

### Q: How do I enable TMDB integration for movie search?
A: To enable searching the full TMDB database instead of the curated list:
1. Obtain an API key from [The Movie Database](https://www.themoviedb.org/) (free account required)
2. Add the key to your `.env` file:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   VITE_TMDB_READ_ACCESS_TOKEN=your_read_access_token_here  # Optional for v3 auth
   ```
3. Restart the development server
4. The movie search will now first attempt to use TMDB, falling back to the curated list if there's an error or no connection

### Q: Why does the application use sessionStorage instead of localStorage?
A: sessionStorage was chosen because:
- Date plans are typically short-term (relevant for the same day or browsing session)
- It provides better privacy isolation (data doesn't persist indefinitely or across browser sessions)
- It automatically clears when the tab/window is closed, reducing clutter
- It prevents accidental reuse of old data days later

### Q: How are animations implemented?
A: All animations use the Framer Motion library. Common patterns include:
- Entrance animations (fade-in, slide-up)
- Button press effects (scale, press)
- Transition animations between steps
- Celebration effects (confetti, heart bursts, floating particles)
- The library is chosen for its performance, ease of use, and excellent React integration.

### Q: Is server-side rendering (SSR) used?
A: Yes, Datenight uses TanStack Start which provides server-side rendering capabilities. However, the current implementation primarily uses client-side rendering for the interactive features. The SSR capabilities are mainly used for:
- Faster initial paint
- SEO benefits (though the app is primarily client-interactive)
- Server utilities if API routes are added in the future

### Q: How does the application handle different time zones?
A: All times are stored and displayed in 24-hour format (HH:mm) without time zone conversion. The application assumes the user is selecting a time in their local time zone. Date values are stored in ISO format (yyyy-MM-dd) which is timezone-agnostic for date-only values.

### Q: Can I change the appearance or theme of the application?
A: Yes! The application uses Tailwind CSS, so you can:
1. Modify the tailwind.config.js file (though it's inherited from @lovable.dev/vite-tanstack-config)
2. Override Tailwind classes directly in components
3. Add custom CSS to src/styles.css for global changes
4. Create custom variants using class-variance-authority
5. For significant theme changes, consider creating a tailwind.config.js override in your project

### Q: What happens if I select a date in the past?
A: The date picker input (`<input type="date">`) has a `min` attribute set to today's date, preventing selection of past dates in modern browsers. For older browsers or edge cases, the application includes validation that rejects past dates and shows an error message.

### Q: Why do some movie cards have different gradient backgrounds?
A: Each movie in the curated list has a custom `posterGradient` value that attempts to capture the dominant colors from the movie's poster art. These gradients provide visual variety and help users identify movies by their visual style as well as their textual information.

### Q: How does the application prevent users from getting stuck in an infinite loop?
A: The begging page has a built-in surrender mechanism. After a configurable number of attempts to click the dodging "NO" button (default: 5), the button stops moving and becomes clickable. This ensures that all users can eventually proceed regardless of how many times they try to avoid saying "YES".

### Q: Is the application accessible to users with disabilities?
A: Accessibility is a consideration in the development of Datenight. Features include:
- Proper semantic HTML structure
- Keyboard navigable interfaces
- ARIA labels and roles where needed
- Sufficient color contrast ratios
- Focus management for interactive elements
- Respect for reduced motion preferences
- Screen reader friendly labels and announcements
Ongoing improvements are made to enhance accessibility further.

### Q: How can I run the application in production mode locally?
A: To test the production build locally:
1. Build the application: `npm run build` or `bun run build`
2. Preview the build: `npm run preview` or `bun run preview`
3. This will start a server serving the optimized assets from the `dist/` directory

### Q: What browsers are supported?
A: Datenight supports modern browsers that support:
- ES modules
- CSS custom properties
- Fetch API
- Promise
- async/await
Specifically tested on the latest versions of:
- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge
The application may work in older browsers but with reduced functionality or appearance.

### Q: How do I contribute to the project?
A: Please see the [contributing guide](/docs/contributing.md) for detailed instructions on reporting bugs, suggesting features, setting up your development environment, making changes, and submitting pull requests.

### Q: Is the project open source? What license does it use?
A: Yes, Datenight is open source and licensed under the MIT license. See the LICENSE file in the repository root for details.

### Q: Who maintains this project?
A: The project is community-maintained. If you're interested in becoming a maintainer, please reach out through the issue tracker or discussions.

### Q: Where can I find the source code?
A: The source code is available on GitHub at https://github.com/your-username/datenight

### Q: I found a security@your-username.com
A: For security concerns, please email security@your-username.com (if applicable) or create a private issue through GitHub's security advisories feature.

## Troubleshooting

### Q: The application won't start or shows a blank screen.
A: Try these steps:
1. Ensure you have Node.js 18+ installed
2. Delete node_modules and lockfile, then reinstall: `rm -rf node_modules bun.lockb && bun install`
3. Check the browser console for errors (F12 -> Console tab)
4. Verify that your .env file doesn't have syntax errors
5. Try a different browser to rule out browser-specific issues
6. Ensure no other process is using port 5173 (try `npm run dev --port 5175`)

### Q: The movie search isn't working or shows no results.
A: If you've added TMDB keys:
1. Verify the keys are correct and have not expired
2. Check that the keys have the correct permissions (API key for v3, read access token for v4)
3. Check network requests in the browser dev tools to see if TMDB is being called
4. The application will automatically fall back to the curated list if TMDB fails
If you haven't added TMDB keys, ensure you're typing in the search box - the curated list should appear immediately.

### Q: The animations are too distracting or cause motion sickness.
A: Enable your operating system's "reduce motion" setting. The application respects the `prefers-reduced-motion` media query and will minimize or disable animations when this setting is enabled.

### Q: My selections aren't persisting after a refresh.
A: Check:
1. That you're not using incognito/private browsing mode with settings that clear sessionStorage on close
2. That browser settings aren't blocking local storage
3. That you haven't exceeded the storage quota for sessionStorage (very unlikely for this amount of data)
4. Try clearing site data for the localhost and trying again

### Q: The buttons or inputs aren't responding to clicks.
A: Check:
1. That you're not zoomed in to an extreme level that misaligns click handlers
2. That browser extensions aren't interfering with pointer events
3. Try disabling extensions temporarily
4. Test in an incognito/private window to rule out extension conflicts
5. Ensure JavaScript is enabled in your browser settings

### Q: I see a "Module not found" error.
A: Try:
1. Deleting node_modules and reinstalling dependencies
2. Ensuring you're running commands from the project root directory
3. Checking that your package manager (npm/bun) is functioning correctly
4. Verifying that the import paths in the code match the actual file structure

### Q: The application runs slowly on my device.
A: Try:
1. Closing other browser tabs and applications to free up resources
2. Ensuring your device meets the minimum specifications (modern smartphone or better)
3. Checking that power-saving mode isn't throttling CPU/GPU performance
4. Trying a different browser to see if performance varies
5. Reporting the issue if it persists on capable hardware

### Q: How do I completely reset the application?
A: You have several options:
1. Use the "Start over" button on the success screen
2. Clear site data for localhost in your browser settings
3. Open the application in an incognito/private window
4. Manually clear sessionStorage for the localhost domain in developer tools
5. Remove any .env file and restart (though this only affects TMDB configuration)

### Q: I want to run unit tests or contribute tests.
A: The project currently doesn't have a test suite configured. If you're interested in adding tests:
1. Choose a testing framework (Vitest/Jest + React Testing Library is recommended)
2. Add the necessary dependencies as devDependencies
3. Create a test configuration file
4. Write tests for new features as you implement them
5. Consider adding a test script to package.json
Please open a discussion if you'd like to collaborate on adding tests to the project.

---

*If your question isn't answered here, please check the [full documentation](/docs/) or feel free to [ask the community](https://github.com/your-username/datenight/discussions).*

*Last updated: July 2026*