/**
 * Collections of randomized copy for the date-night flow.
 *
 * Each category is a flat pool of strings consumed by `useRandomMessage`
 * (the hydration-safe hook at `@/hooks/useRandomMessage`) and the rotating
 * loader hook at `@/hooks/useRotatingMessage`. Keep these contracts:
 *
 *   1. Every pool is a non-empty array of unique, non-empty strings
 *      (the unit tests assert ≥5 per category — add to a pool, never trim
 *      below that without updating the tests).
 *   2. The seven original pools have a per-entry content contract exercised
 *      by tests, so each message keeps a token from its category's theme:
 *        romantic → love | romance | heart | ❤️ | ✨
 *        movie    → movie | film | popcorn | 🎬 | 🎥 | scene | actor
 *        time     → time | clock | hour | minute | ⏰ | ⏳ | moment
 *        date     → date | calendar | day | month | 📅
 *        celebration → congrat | celebrat | amazing | great | wonderful | 🎉 | 🎊 | party
 *      (encouragement + playful are free-form, just non-empty + unique.)
 *
 * The `loading` / `empty` / `error` / `chrome` pools are newer — `loading`
 * rotates while we wait, `empty`/`error` give the no-results / failure
 * states a little personality, and `chrome` holds short on-screen phrases.
 */
export const messages = {
  // Gentle cheer for the start of the journey.
  encouragement: [
    "Every great adventure starts with a single step. 👣",
    "You're doing wonderfully — keep going.",
    "The best part of this is still ahead. Keep moving.",
    "Your perfect night is waiting to be shaped.",
    "Trust the process — it's heading somewhere lovely.",
    "One step at a time, and it's already looking good.",
    "Love's in the details you keep choosing. Keep going.",
    "Each choice carries you closer to a night to remember.",
    "The anticipation is half the magic — lean into it.",
    "You're building a memory right now, and it's a great one.",
  ],

  // A wink for the teasing / "are you sure" screens.
  playful: [
    "Are you sure you're ready for this much charm?",
    "Warning: smiling may occur, repeatedly.",
    "Proceed with caution — happiness levels are climbing.",
    "You're about to make someone's whole week.",
    "Psst — the answer's been “yes” since the start.",
    "Is it getting warm in here, or is it just the chemistry?",
    "You're officially on the path to “our best night.”",
    "Slow down, speed racer — enjoy the planning.",
    "Your future self is already saying thank you.",
    "Plot twist: you're the romantic one here.",
  ],

  // Tender lines for the planning beats.
  romantic: [
    "Every choice you make quietly says “I love you.”",
    "This is what romance looks like when it's planned with care.",
    "You're writing a love story, one answer at a time.",
    "A heart shows in the details you keep choosing.",
    "Planning this together is its own kind of love letter.",
    "The little touches are where the real romance lives.",
    "Your heart already knows the answer — trust it.",
    "A night planned with love already feels like coming home.",
    "This is romance in slow motion, and it's lovely to watch.",
    "Every option glows a little brighter when it's chosen with love. ✨",
  ],

  // On-theme nudges for the movie picker.
  movie: [
    "There's a perfect film in here with your name on it.",
    "Two people, one couch, one movie — the best kind of night.",
    "Your taste in films is showing, and it's excellent.",
    "Popcorn's warming up — go pick the winner.",
    "The right movie makes every other plan feel secondary.",
    "Somewhere in this list is a scene you'll quote for years.",
    "Tonight's film should feel like a hug in two hours.",
    "You're casting the lead role for tonight's movie.",
    "Pick the film that makes you both stay off your phones.",
    "A great movie is two people agreeing on a mood.",
  ],

  // Working out the when.
  time: [
    "The right time slot is the one that means no rushing.",
    "Golden hour energy — even if it's after dinner.",
    "A good moment to start is whenever the two of you settle in.",
    "Pick the hour that lets the night breathe.",
    "Timing is everything, and yours is lovely.",
    "There's a quiet magic in the timing of when you begin.",
    "Evenings have a rhythm; pick the time that's yours.",
    "An early start, a late one — both are good times to begin.",
    "The clock only matters if it gives you room to enjoy this.",
    "Choose a time that feels like an invitation, not a deadline.",
  ],

  // Working out the when-on-the-calendar.
  date: [
    "The date you pick keeps its own quiet promise.",
    "A good day for this is any day that's already yours.",
    "Circle the date — everything else follows.",
    "Pick a day that ends with no regrets and no alarms.",
    "The calendar has been waiting to help you with this.",
    "Choose the day the two of you can fully show up.",
    "A thoughtful date beats a lucky one, every time.",
    "Even an ordinary day becomes the day when you plan like this.",
    "Pick a date that gives the night room to linger.",
    "Mark the calendar — tonight's the start of something good.",
  ],

  // The payoff beat — plan locked in.
  celebration: [
    "Look at you — the plan's locked and it's a wonderful one.",
    "This deserves a tiny celebration before the real one.",
    "You planned a great night and barely broke a sweat.",
    "Go ahead and feel amazing about this for a second.",
    "It's party time — you earned this one.",
    "Wonderful things happen when you show up for each other.",
    "Celebrate the small win: you both said yes to a plan.",
    "A great date isn't luck — it's this kind of care.",
    "Amazing what a few minutes of planning just unlocked.",
    "Let the celebration begin — the hard part's done. 🎉",
  ],

  // Rotating while we fetch / settle — short, in-progress, a little alive.
  loading: [
    "Fate is thinking…",
    "Loading something magical…",
    "Today's main-character energy…",
    "Warming up the projector…",
    "Picking the perfect reel…",
    "Consulting the rom-com oracle…",
    "Setting the mood lighting…",
    "Finding your film soulmate…",
  ],

  // No results yet — warm, not blank.
  empty: [
    "Nothing here yet — try another title above.",
    "No matches this time, but the right film is still out there.",
    "Hmm, that one's hiding. Got another idea?",
    "Empty for now — your next search might be the one.",
    "No films surfaced, but the night's still young.",
    "We came up dry — try a different title (snack optional).",
  ],

  // Something broke — honest, calm, retry-able.
  error: [
    "Hmm, something hiccuped. Let's try that again.",
    "The connection stumbled — give it another go.",
    "We couldn't load that just now. Try once more?",
    "Tiny glitch — nothing a retry can't fix.",
    "Couldn't reach the film shelf this second. Retry?",
    "Something went sideways — we'll try again with you.",
  ],

  // Short on-screen chrome — confirm-flavored micro labels reused for CTAs
  // and affordances (e.g. the chosen-movie "Continue" gets one of these).
  // Keep them tiny and affirm-as-you-press flavored.
  chrome: ["Let's do this", "Make it ours", "I'm in", "Lock it in", "Perfect pick", "Off we go"],
};

/**
 * Return a random message from a category. Synchronous, no hydration guard —
 * routes use the hook variant in `@/hooks/useRandomMessage`; this plain
 * helper is kept for direct (e.g. test) use. Falls back to "" on an unknown
 * category.
 */
export function useRandomMessage(category: keyof typeof messages): string {
  const messagesForCategory = messages[category];
  if (!messagesForCategory || messagesForCategory.length === 0) return "";
  const count = messagesForCategory.length;
  const randomIndex = Math.floor(Math.random() * count);
  return messagesForCategory[randomIndex];
}

/**
 * Get a random message from any category. Same direct (non-hook) helper as
 * above; the hydration-safe variant lives in `@/hooks/useRandomMessage`.
 */
export function useAnyRandomMessage(): string {
  const categories = Object.keys(messages) as (keyof typeof messages)[];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return useRandomMessage(randomCategory);
}
