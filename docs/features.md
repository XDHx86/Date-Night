# Features

This document provides a detailed walkthrough of Datenight's features and user interactions. Each step in the date planning process is implemented as a distinct route with specific functionality, animations, and state updates.

## Overview of the User Flow

The application guides users through a linear progression:
1. **Landing** (`/`): Initial yes/no question
2. **Begging** (`/begging`): Playful alternative path if user says "NO"
3. **Confirmation** (`/confirmation`): Celebration after saying "YES"
4. **Date** (`/date`): Selecting the date
5. **Time** (`/time`): Choosing the time of day
6. **Movie** (`/movie`): Selecting a film to watch (with live TMDb search)
7. **Love Letter** (`/love-letter`): Customizable love letter with templates
8. **Summary** (`/summary`): Reviewing all selections
9. **Success** (`/success`): Final celebration with details and restart option

Users can navigate between steps using:
- Next/Continue buttons
- Browser back/forward buttons
- Progress bar buttons (to jump back to previous steps)
- State is preserved across all navigation methods via URL synchronization

## 1. Landing Page (`/`)

### Purpose
The entry point that sets the playful tone of the application.

### Key Features
- **Central Question**: Prominently displays "Will you go out with me?"
- **Dual Action Buttons**:
  - **YES** (green): Proceeds to the celebration screen (`/confirmation`)
  - **NO** (red): Takes the user to the playful begging route (`/begging`)
- **Animated Entrance**: Elements fade in and slide up on load
- **Responsive Layout**: Centers content vertically and horizontally

### Implementation Details
- Located in: `src/routes/index.tsx`
- Uses `useNavigate` hook for programmatic navigation
- Buttons are `AnimatedButton` components with different variants:
  - YES: `variant="gold"` (custom gradient)
  - NO: `variant="outline"` (styled to look playful)
- No store interaction at this stage (pure presentation)

## 2. Begging Page (`/begging`)

### Purpose
A lighthearted, interactive experience for users who initially say "NO".

### Key Features
- **Playful Message**: "Please? 🥺" with appealing visuals
- **Dodging Button**: The "NO" button moves away when the user attempts to click it
- **Persistence Counter**: Tracks how many times the user has tried to click the NO button
- **Eventual Surrender**: After a set number of attempts (default: 5), the NO button stops dodging and becomes clickable
- **YES Button**: Always present and functional, leading to confirmation
- **Background Animation**: Gentle floating elements create a whimsical atmosphere

### Technical Implementation
- Located in: `src/routes/begging.tsx`
- State Management:
  - Uses React `useState` to track:
    - `clickCount`: Number of times the NO button was hovered/attempted
    - `buttonPosition`: Random position within bounds
    - `hasSurrendered`: Boolean indicating if the button has stopped dodging
- Event Handlers:
  - `onMouseEnter` / `onMouseOver`: Trigger position change for the NO button
  - `onClick` (NO button): Either moves the button or allows progression based on `hasSurrendered`
  - `onClick` (YES button): Navigates to `/confirmation`
- Animation:
  - Uses `framer-motion` for smooth position transitions
  - Button movement constrained to viewport boundaries
  - Randomized offset each time prevents predictable patterns

### User Experience
- First 4 clicks: Button dodges with increasing frequency/variety of excuses in tooltip
- 5th click: Button stops dodging, allows selection, and shows a message like "Okay, you win!"
- Regardless of path, both YES and (eventually clickable) NO lead to confirmation

## 3. Confirmation Page (`/confirmation`)

### Purpose
Celebrates the user's "YES" decision and prompts them to start planning.

### Key Features
- **Celebration Animation**: Confetti bursts and heart particles using `HeartBurst` component
- **Positive Messaging**: "Yay! 🎉 Let's plan your date."
- **Primary Action Button**: "Plan Your Date" leads to date selection (`/date`)
- **Secondary Option**: Text link to restart ("Change my mind?") that goes back to landing
- **Sound Effect**: Playful chime sound on page load (if audio enabled)

### Technical Implementation
- Located in: `src/routes/confirmation.tsx`
- Store Interaction: None (pure celebration page)
- Components:
  - `HeartBurst`: Custom particle animation triggered on mount
  - `AnimatedButton`: Primary CTA with gold gradient variant
  - Sound: Uses `playSound` from `src/lib/sound.ts` on `useEffect`
- Animation:
  - Entrance fade-in and slight scale-up
  - HeartBurst uses `framer-motion` for spring-based particle animation
  - Background may include slow-moving decorative elements

## 4. Date Picker (`/date`)

### Purpose
Allows users to select a date for their date night.

### Key Features
- **Calendar Interface**: Native HTML5 date picker (`<input type="date">`)
- **Date Validation**: Prevents selection of past dates
- **Context Display**: Shows the selected date in a friendly format
- **Clear Selection**: Option to reset the date choice
- **Progress Indicator**: Shows completion status of the planning steps
- **Navigation**:
  - Back to confirmation (top-left)
  - Continue to time picker (bottom-right)

### Technical Implementation
- Located in: `src/routes/date.tsx`
- Store Interaction:
  - Reads: `date` from `useDateStore`
  - Updates: Calls `setDate(selectedValue)` on change
- Validation:
  - Sets `min` attribute to today's date (ISO format)
  - Handles invalid input gracefully
- Formatting:
  - Uses `date-fns` to convert ISO string to readable format (e.g., "July 15, 2026")
  - Format: `format(new Date(date), 'PPP')`
- UI Components:
  - Custom styled inputs with focus states
  - Secondary button for clearing selection
  - Progress steps indicator showing completed/current/remaining steps
- Accessibility:
  - Proper label association
  - Keyboard navigable
  - Screen reader friendly announcements on change

## 5. Time Selector (`/time`)

### Purpose
Enables users to choose a time for their date night.

### Key Features
- **Quick Select Buttons**: Preset times for common scenarios:
  - Early dinner (17:30)
  - Standard dinner (19:00)
  - Late dinner (20:30)
  - Night out (21:30)
  - Midnight showing (00:00)
- **Custom Time Input**: Allows manual entry of any valid time
- **24-hour Format**: Consistent with store format (HH:mm)
- **Visual Feedback**: Selected option highlighted
- **Context Awareness**:
  - Displays the selected date (from store)
  - Shows time of day labels (Morning, Afternoon, Evening, Night)
- **Navigation**:
  - Back to date picker
  - Continue to movie selection

### Technical Implementation
- Located in: `src/routes/time.tsx`
- Store Interaction:
  - Reads: `date` (for display), `time` (for pre-selection)
  - Updates: Calls `setTime(selectedTime)` on selection
- Quick Select Implementation:
  - Array of preset time objects: `{ label: 'Early Dinner', value: '17:30' }`
  - Click handler calls `setTime` with the selected value
- Custom Input:
  - `<input type="time">` for browser-native time selection
  - Falls back to manual input handling for older browsers
  - Parses and validates input to ensure HH:mm format
- Time of Day Calculation:
  - Splits hours from time string
  - Maps to categories:
    - 5-11: Morning
    - 12-16: Afternoon
    - 17-20: Evening
    - 21-4: Night (handles midnight crossover)
- UI/UX:
  - Grid layout for quick select buttons
  - Visual distinction between selected and unselected states
  - Smooth scaling animation on selection
  - Clear visual separation between quick select and custom input sections

## 6. Movie Selector (`/movie`)

### Purpose
Allows users to choose a movie to watch during their date night.

### Key Features
- **Curated Collection**: Built-in library of popular films across genres
- **Search Functionality**: Real-time filtering as user types
- **Genre Tags**: Color-coded labels for each movie's genres
- **Visual Presentation**: Movie cards with gradient backgrounds representing poster colors
- **Information Display**: Title, year, rating, runtime, and emoji genre indicator
- **Selection Feedback**: Clear visual indication of chosen movie
- **Context Display**: Shows selected date and time above the movie list
- **Navigation**:
  - Back to time picker
  - Continue to summary

### Technical Implementation
- Located in: `src/routes/movie.tsx`
- Store Interaction:
  - Reads: `date`, `time`, `movie` (for pre-selection display)
  - Updates: Calls `setMovie(selectedMovie)` on selection
- Movie Data:
  - Sourced from `src/lib/movies.ts`
  - Contains a curated array of ~12 films with diverse genres
  - Each movie includes:
    - `id`: Unique identifier
    - `title`: Film name
    - `year`: Release year
    - `rating`: MPAA rating (PG, PG-13, R, etc.)
    - `runtime`: Duration in minutes
    - `genres`: Array of genre strings
    - `overview`: Brief plot summary
    - `posterGradient`: CSS gradient simulating a poster background
    - `emoji`: Thematic emoji (e.g., 😂 for comedy, 🚀 for sci-fi)
- Search Implementation:
  - Case-insensitive filtering on title and overview
  - Updates in real-time as user types in search input
  - Shows "No movies found" message if filter yields no results
  - Resets to full list when search cleared
- Movie Card Component (`src/components/MovieCard.tsx`):
  - Displays the movie gradient as background
  - Shows title, year, rating, runtime
  - Displays genre tags (colored by genre type)
  - Features the representative emoji prominently
  - Applies selected state styling (border, scale, shadow)
- UI Components:
  - Search input with clear button
  - Grid layout for movie cards (responsive: 1→2→3→4 columns)
  - Loading state (though data is local and instant)
  - Empty state message for filtered results
- Accessibility:
  - Proper alt-text equivalents (aria-label on cards)
  - Keyboard navigable grid
  - Focus management when opening/closing

### Data Source Note
While the primary data source is the built-in curated list, the `movies.ts` file is structured to support extension:
- The `searchMovies` function first tries to use TMDB if API keys are present
- Falls back to the curated list on error or absence of keys
- Easy to swap to full TMDB integration by adding valid credentials

## 7. Summary Page (`/summary`)

### Purpose
Presents a review of all selections before final confirmation.

### Key Features
- **Review Card**: Attractive display of chosen date, time, and movie
- **Formatted Presentation**:
  - Date: Formatted as "Month Day, Year" (e.g., "July 15, 2026")
  - Time: Shown in both 24-hour and 12-hour formats with AM/PM
  - Movie: Full movie card display with all details
- **Edit Options**:
  - Separate buttons to modify each selection (date, time, movie)
  - Each edit button navigates to the corresponding selector page
- **Primary Action**: "Confirm Date Night" leads to success screen
- **Secondary Option**: "Start Over" to reset all selections
- **Sound Effect**: Pleasant chime when page loads

### Technical Implementation
- Located in: `src/routes/summary.tsx`
- Store Interaction:
  - Reads: `date`, `time`, `movie` from `useDateStore`
  - Does NOT modify state (read-only review)
- Presentation Logic:
  - Date formatting: Uses `date-fns` to convert ISO to readable format
  - Time formatting: Converts HH:mm to 12-hour format with AM/PM
    - Function: `formatTime(timeString)` handles leading zeros and 12/24 conversion
  - Movie display: Reuses `MovieCard` component with slight size adjustment
- UI Components:
  - Custom card with elevation and hover effects
  - Edit buttons outlined (less prominent than primary action)
  - Confirmation button with prominent gradient styling
  - Text link for start-over option
- Navigation Handlers:
  - Edit date: `navigate({ to: '/date' })`
  - Edit time: `navigate({ to: '/time' })`
  - Edit movie: `navigate({ to: '/movie' })`
  - Confirm: `navigate({ to: '/success' })`
  - Start over: Calls `store.reset()` then `navigate({ to: '/' })`
- Animation:
  - Gentle fade-in on mount
  - Card may have subtle pulse to draw attention
  - Buttons use existing `AnimatedButton` variants

## 8. Success Page (`/success`)

### Purpose
Celebrates the completed plan and provides a way to start over.

### Key Features
- **Celebration Visuals**:
  - Full-screen confetti animation
  - Floating hearts or sparkles
  - Optional background music or sound effect
- **Plan Details Display**:
  - Large, formatted presentation of the final selections
  - Date: "Saturday, July 15, 2026"
  - Time: "7:00 PM"
  - Movie: Title with poster gradient backdrop and emoji
- **Primary Action**: "Plan Another Date" resets everything and returns to start
- **Shareability**: Implicitly shareable via URL (though selections aren't in URL by default)
- **Mood Enhancement**: Uplifting message and visuals

### Technical Implementation
- Located in: `src/routes/success.tsx`
- Store Interaction:
  - Reads: `date`, `time`, `movie` from `useDateStore`
  - Resets: Calls `reset()` on "Start over" button (then navigates to home)
- Celebration Components:
  - `HeartBurst`: Larger, more elaborate version than in confirmation
  - Additional particle effects (stars, circles) using `framer-motion`
  - Optional confetti canvas using `canvas-confetti` or similar (if implemented)
- Audio:
  - Plays a celebratory tune or sound effect on mount
  - Volume controlled and can be muted
- Presentation:
  - Uses same formatting logic as summary page for consistency
  - Date and time displayed in larger, more prominent typography
  - Movie card centered with optional drop shadow
- Layout:
  - Central column with max-width for readability on large screens
  - Vertically spaced sections for clarity
  - Gentle entrance animations for each element
- Navigation:
  - "Plan Another Date":
    1. Calls `useDateStore.getState().reset()`
    2. Navigates to `/` (landing page)
  - Alternative: Link to summary for review
- Accessibility:
  - ARIA-live regions for announcement of completed plan
  - Reduced motion media query respected for animation preferences
  - All interactive elements have clear focus states

## Cross-Feature Characteristics

### Animation & Motion
- **Consistent Library**: All animations use `framer-motion`
- **Preset Variants**: Reusable animation variants for common patterns (fade, scale, tap)
- **Performance Considerations**: Uses `will-change` and `useTimeout` to limit expensive animations
- **Reduced Motion Support**: Respects `@media (prefers-reduced-motion: reduce)` to minimize or disable animations

### Sound Effects
- **Centralized Audio**: All sounds managed through `src/lib/sound.ts`
- **Lazy Loading**: Sounds loaded on first use to minimize initial bundle
- **Volume Control**: Global volume setting with mute option
- **Sound Library**:
  - Button clicks: Soft tick or pop
  - Confirmations: Pleasant chime
  - Errors: Gentle error sound (rarely used, form validation is preventive)
  - Celebrations: Longer, more elaborate tunes
  - Background: Ambient loops for certain screens (optional)

### State Persistence
- **Automatic Saving**: All selections saved to `sessionStorage` via Zustand middleware
- **Recovery**: Page reload returns user to exact state
- **Tab Isolation**: Each browser tab maintains its own plan (sessionStorage is tab-specific)
- **Privacy Consideration**: No data leaves the client machine unless user explicitly shares

### Error Handling & Validation
- **Preventive Design**: UI constraints prevent invalid selections (min dates, time limits, etc.)
- **Form Validation**: Uses React Hook Form + Zod where forms are present (though most selection is via simple inputs)
- **User-Friendly Messages**: Clear guidance when actions cannot be completed
- **Graceful Degradation**: Core functionality works without JavaScript (though enhanced experience requires it)

### Accessibility Features
- **Semantic HTML**: Proper use of heading levels, landmarks, and form elements
- **Keyboard Navigable**: All interactive elements reachable via Tab key
- **Focus Management**: Modal-like behaviors trap focus appropriately
- **ARIA Attributes**: Roles, labels, and live regions where needed
- **Color Contrast**: Meets WCAG AA standards for text and UI components
- **Responsive Design**: Works from mobile screen sizes up to large desktop displays
- **Reduce Motion**: Animations respect user preferences for reduced motion
- **Text Scaling**: Layout accommodates increased text sizes (up to 200%)

### Extensibility Points
1. **Adding New Planning Steps**:
   - Add new route file in `src/routes/`
   - Update state store in `src/lib/store.ts` with new field and setter
   - Add navigation links in preceding and succeeding steps
   - Include step in progress indicators
   - Add to summary and success displays
2. **Changing the Movie Source**:
   - Obtain TMDB API key
   - Add to `.env` file as `VITE_TMDB_API_KEY`
   - The existing `movies.ts` function will automatically use TMDB when credentials are present
3. **Theme Customization**:
   - Modify `tailwind.config.js` (inherited from `@lovable.dev/vite-tanstack-config`)
   - Override colors, font sizes, border radii, etc.
   - Update `src/styles.css` for any global CSS changes
4. **Internationalization**:
   - Extract all strings to translation files
   - Use `react-i18next` or similar (would require adding dependency)
   - Store locale preference in Zustand store
5. **Analytics Integration**:
   - Add page view tracking via `useEffect` on route changes
   - Track feature usage (e.g., movie selections, time preferences)
   - Respect privacy preferences and do-not-track signals

## Feature Development Guidelines

When adding new features to the application, consider:

### 1. State Management
- Determine if new data should live in the Zustand store
- Consider persistence needs (sessionStorage vs localStorage vs no storage)
- Follow existing patterns for actions and selectors

### 2. UI Consistency
- Use existing component libraries (`AnimatedButton`, `MovieCard`, etc.)
- Follow established spacing, typography, and color patterns
- Implement entrance and exit animations for new routes
- Ensure responsive behavior matches existing breakpoints

### 3. User Experience
- Maintain the playful, delightful tone
- Provide clear feedback for user actions
- Keep the flow linear and focused
- Include appropriate sound effects (optional but encouraged)
- Consider accessibility from the start

### 4. Performance
- Lazy-load heavy components if necessary
- Use React.memo for expensive rendering components
- Optimize image assets (though currently using gradients)
- Bundle analysis for new dependencies

### 5. Testing
- Manual verification through the user flow
- Visual regression testing for UI changes
- Check linting and formatting compliance
- Verify accessibility with axe or similar tools

---

*This document describes the current feature set as of the latest version. For the most up-to-date information on implementation details, refer to the source code files referenced throughout this document.*