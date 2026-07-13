/**
 * Collections of randomized messages for different contexts
 */

export const messages = {
  // Encouraging messages for the journey
  encouragement: [
    "Every great adventure starts with a single step 👣",
    "You're doing amazing - keep going! 💫",
    "The best is yet to come... just wait and see! 🌟",
    "Your perfect day is waiting to be planned 📅",
    "Trust the process - it's leading you somewhere wonderful ✨",
    "You've got this! One step at a time 🚶‍♀️🚶‍♂️",
    "Love is in the details you're choosing 💖",
    "Each choice brings you closer to your perfect day 💫",
    "The anticipation is half the fun! 😊",
    "You're creating memories before they even happen 📸",
  ],

  // Playful messages for teasing interactions
  playful: [
    "Are you sure you're ready for this level of fun? 😉",
    "Warning: May cause excessive smiling 😄",
    "Proceed with caution - happiness levels may rise 📈",
    "You're about to make someone's day awesome! 🌟",
    "Psst... the answer is always yes when it comes to you 💌",
    "Is it getting warm in here, or is it just this chemistry? 🔥",
    "You're officially on the path to awesomeness 🛤️",
    "Slow down, speed racer! Enjoy the journey 🏁",
    "Your future self is already thanking you 🙏",
    "Plot twist: You're amazing. The rest is just details 📖",
  ],

  // Romantic moments
  romantic: [
    "Every choice you make is a love letter to your future together ✉️",
    "The way you plan shows how much you care 💕",
    "You're not just planning a date - you're crafting a memory 📸",
    "Love is in the air... and in your dropdown menus 💨",
    "You've got the magic touch for making moments special ✨",
    "This isn't just scheduling - it's romance in action 💘",
    "The way you look at options says everything about your heart ❤️",
    "You're building a masterpiece one choice at a time 🎨",
    "Your attention to detail is seriously adorable 😍",
    "Fun fact: You're basically a love wizard 🧙‍♂️💫",
  ],

  // Movie-specific
  movie: [
    "Popcorn's getting jealous of your taste 🍿",
    "This movie choice says 'I know you better than you know yourself'",
    "Ready to press play on perfection? ▶️",
    "The perfect film is waiting to be discovered... like your love 💫",
    "Lights, camera, romance! 🎥💖",
    "Your movie taste is impeccable - no notes 📝",
    "This choice is getting a standing ovation from your future self 👏",
    "Warning: May cause sudden urges to reenact scenes 🎭",
    "You're not picking a movie - you're selecting a vibe 🌈",
    "The critics agree: This selection is flawless 🏆",
  ],

  // Time-specific
  time: [
    "Timing is everything... and you've got perfect timing ⏰",
    "You're not just picking a time - you're choosing a moment ⏳",
    "This time slot has serious potential ✨",
    "Clock's ticking... in the best way possible 🕐",
    "You've got the golden hour instincts of a photographer 📸",
    "Is it just me, or does this time feel extra special? ✨",
    "You're syncing up with the universe's perfect rhythm 🎵",
    "Time flies when you're having fun planning 🚀",
    "This isn't just a time - it's a promise 💫",
    "You're essentially a time wizard right now 🧙‍♂️⏱️",
  ],

  // Date-specific
  date: [
    "You're not just picking a date - you're choosing destiny 📅✨",
    "This date has your name written all over it 💫",
    "The calendar just got a lot more exciting 📆",
    "You're essentially dating the date before the date 😉",
    "This day is already blessed by your choice 🙏",
    "You've got impeccable taste in dates - no surprise there 😌",
    "The stars are aligning for this very special day ⭐",
    "You're not just selecting a date - you're invoking romance 💞",
    "This date is going to be memorable - you can feel it 💫",
    "You're basically a date-matchmaking maestro 🎻",
  ],

  // Completion/milestone
  celebration: [
    "You did it! The perfect plan is officially locked in 🎉",
    "Look at you, being all thoughtful and romantic 😍",
    "Future you is currently doing a happy dance 💃🕺",
    "You've officially leveled up in the art of romance 📈",
    "This plan is so good, it should be illegal (in a good way) ⚖️",
    "You're basically a relationship expert now - congrats! 🏆",
    "The anticipation is real... and it's delicious 😋",
    "You've transformed planning into an art form 🎨",
    "Well done! You've earned your romantic planner badge 🎖️",
    "This isn't just a plan - it's a love story in the making 📖",
  ],
};

/**
 * Hook to get a random message from a category
 */
export function useRandomMessage(category: keyof typeof messages): string {
  const messagesForCategory = messages[category];
  const count = messagesForCategory.length;
  const randomIndex = Math.floor(Math.random() * count);
  return messagesForCategory[randomIndex];
}

/**
 * Get a random message from any category
 */
export function useAnyRandomMessage(): string {
  const categories = Object.keys(messages) as (keyof typeof messages)[];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return useRandomMessage(randomCategory);
}
