/**
 * Love Letter data source.
 *
 * Provides a **type‑safe**, **modular** structure for letters.
 * Each category contains exactly six letters; adding new
 * categories or expanding existing ones is just a matter of
 * editing the relevant array — the runtime never needs to change.
 */

export type Category = 'default' | 'birthday' | 'anniversary' | 'valentine';

export interface LoveLetter {
  id: string;
  title: string;
  font: string;
  content: string;
}

/* ----------------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------------- */

const letter = (
  id: string,
  title: string,
  font: string,
  content: string,
): LoveLetter => ({ id, title, font, content });

/* ----------------------------------------------------------------------------
 *  DEFAULT category — everyday love notes (six variations)
 * ------------------------------------------------------------------------- */

const defaultLetters: LoveLetter[] = [
  letter('default-1', 'Our Love Story', 'cursive',
    `Every moment with you feels like a beautiful adventure. From our first hello to our forever after, you make my heart skip a beat. I love you more than words can express, and I can't wait to spend the rest of my life making memories with you.

You are my sunshine on cloudy days, my calm in the storm, and the love of my life. Thank you for being you and for loving me just as I am.

Forever and always,
Your partner in crime`),
  letter('default-2', 'My Heart', 'serif',
    `Every sunrise reminds me of your light in my life. The way you laugh makes my heart dance, and your smile is the brightest part of my day. I love you more than words can say, and I will keep showing you each and every day.

You are my calm in the storm, my warmth in the cold, and the love I never knew I needed.

Yours always,
Your devoted heart`),
  letter('default-3', 'You and Me', 'fantasy',
    `In a world full of ordinary days, you make each moment magical. Your kindness, your laugh, your eyes—everything about you pulls me closer to the butterflies in my chest.

I promise to keep discovering new wonders with you, hand in hand, heart to heart.

With all my love,
Your adventurer`),
  letter('default-4', 'Forever and Always', 'cursive',
    `I love the quiet mornings with you, the way your hand finds mine without a word, and the way we can laugh at our own silly jokes. You are the most beautiful chapter of my story.

May our days together grow longer, our laughter louder, and our love deeper with each passing year.

Forever yours,
Your biggest fan`),
  letter('default-5', 'Sweet Moments', 'sans-serif',
    `Every moment we share is a treasure I keep close to my heart. From coffee in the morning to dancing in the kitchen, each memory is a piece of our puzzle.

Thank you for being my partner, my confidant, my best friend.

Love always,
Your sweet companion`),
  letter('default-6', 'Dreaming of You', 'monospace',
    `Your love is the rhythm that keeps my heart beating in sync. When the world feels heavy, a single thought of you lifts my spirits.

I cherish every laugh, every late‑night talk, and every quiet glance we share.

All my love,
Your dreamer`),
];

/* ----------------------------------------------------------------------------
 *  BIRTHDAY category — six birthday wishes
 * ------------------------------------------------------------------------- */

const birthdayLetters: LoveLetter[] = [
  letter('birthday-1', 'Happy Birthday', 'cursive',
    `Happy Birthday, my love! 🎉
May your day be as bright as your smile and as sweet as all the memories we've created together.

I feel lucky to celebrate another year of you, and I cannot wait to make this year the best one yet.

With all my love,
Your favorite person`),
  letter('birthday-2', 'Birthday Wishes', 'serif',
    `Wishing you a day filled with love, laughter, and everything your heart desires. You deserve all the happiness in the world, and I'm honored to be part of your special day.

May this new year bring you closer to your dreams, and may I be there to cheer you on every step of the way.

Happy Birthday!
Your forever cheerleader`),
  letter('birthday-3', 'Cheers to You', 'fantasy',
    `Another trip around the sun, and you shine brighter than ever. Your kindness, your joy, and your spirit make every day brighter for those around you.

May this birthday be the start of a beautiful chapter, full of adventures and unforgettable moments.

Celebrate big, my love!
Your biggest fan`),
  letter('birthday-4', 'A Special Day', 'cursive',
    `Today is the day my favorite person came into this world, and I'm forever grateful the universe chose you to be with me.

I hope your birthday is as wonderful as you are, and I promise to fill this year with endless love, surprises, and sweet moments.

Happy Birthday!
Your secret admirer`),
  letter('birthday-5', 'Birthday Blessings', 'sans-serif',
    `Happy Birthday to the one who makes my heart skip a beat! Your presence in my life is the greatest gift I could ever ask for.

May your day be filled with laughter, love, and all the little things that make you happiest.

Love you endlessly,
Your forever date`),
  letter('birthday-6', 'My Birthday Star', 'monospace',
    `Cheers to you on your special day! I'm proud of everything you've achieved and excited for everything that's still to come.

May this birthday bring you new opportunities, boundless joy, and the warmest of memories.

Happy Birthday, my love!
Your devoted partner`),
];

/* ----------------------------------------------------------------------------
 *  ANNIVERSARY category — six anniversary notes
 * ------------------------------------------------------------------------- */

const anniversaryLetters: LoveLetter[] = [
  letter('anniversary-1', 'Happy Anniversary', 'cursive',
    `Happy Anniversary, my love! 🎊
Looking back on our journey together fills my heart with gratitude and excitement for the future. Every memory we've built is a treasure that grows more precious each day.

May our love keep flourishing, and may we continue to write the most beautiful story together.

With all my heart,
Your forever Valentine`),
  letter('anniversary-2', 'Our Journey', 'serif',
    `Today marks another year of love, laughter, and countless unforgettable moments. I'm grateful for every challenge we've overcome and every joy we've shared.

Here's to many more years of being each other's rock, partner, and best friend.

Cheers to us!
Your devoted partner`),
  letter('anniversary-3', 'Together Again', 'fantasy',
    `What a wonderful trip around the sun it's been together! From quiet evenings to exciting adventures, you have made my life richer than I ever imagined.

May our next chapters be even brighter, deeper, and more exciting than the first.

Happy Anniversary!
Your biggest fan`),
  letter('anniversary-4', 'Two Hearts', 'cursive',
    `Each day with you feels like a precious gift. As we celebrate today, I'm reminded of how lucky I am to have you by my side.

Let's keep dreaming, laughing, and loving—forever and always.

All my love,
Your secret admirer`),
  letter('anniversary-5', 'Endless Love', 'sans-serif',
    `Another year, another reason to fall in love with you all over again. Your support, your smile, and your endless encouragement make every day brighter.

Here's to us, to our past, and to an incredible future ahead.

Happy Anniversary!
Your forever date`),
  letter('anniversary-6', 'Always & Forever', 'monospace',
    `Today, we celebrate the beautiful tapestry we've woven together. Every thread of love, trust, and companionship makes it stronger with each passing day.

May our love continue to grow, and may we always find joy in each other's presence.

Forever grateful,
Your devoted heart`),
];

/* ----------------------------------------------------------------------------
 *  VALENTINE category — six Valentine's Day notes
 * ------------------------------------------------------------------------- */

const valentineLetters: LoveLetter[] = [
  letter('valentine-1', 'My Valentine', 'cursive',
    `Happy Valentine's Day, my love! 🌹
You are the reason my heart beats faster, the smile that lights up my day, and the warmth that fills my soul.

I cherish every moment we've shared and look forward to many more.

All my love,
Your forever Valentine`),
  letter('valentine-2', 'Love Letter', 'serif',
    `On this special day, I want to remind you just how much you mean to me. Your kindness, your laugh, and your love make my world complete.

Thank you for being my rock, my confidante, and my forever Valentine.

With love,
Your secret admirer`),
  letter('valentine-3', 'Sweetheart', 'fantasy',
    `You are the most beautiful chapter of my love story. Every time I think of you, my heart flutters like a butterfly in spring.

May this Valentine's Day be filled with sweet moments, gentle whispers, and endless love.

Forever yours,
Your biggest fan`),
  letter('valentine-4', 'Be Mine', 'cursive',
    `Roses are red, violets are blue, my love for you is endless, and my heart belongs only to you. You are my everything, and I'm grateful for each laugh, each hug, each quiet moment.

Happy Valentine's Day!
Your forever date`),
  letter('valentine-5', 'Heartbeat', 'sans-serif',
    `You stole my heart, and I never want it back! Being with you is the greatest adventure of my life.

May our love continue to blossom, today and always.

Love you more than words,
Your devoted heart`),
  letter('valentine-6', 'Always', 'monospace',
    `To the one who makes every day brighter, every night cozier, and every dream sweeter—happy Valentine's Day!

Let's keep creating beautiful memories together.

All my love,
Your adventurer`),
];

/* ----------------------------------------------------------------------------
 *  Aggregate lookup map
 * ------------------------------------------------------------------------- */

export const loveLetters: Record<Category, LoveLetter[]> = {
  default: defaultLetters,
  birthday: birthdayLetters,
  anniversary: anniversaryLetters,
  valentine: valentineLetters,
};

export const categories: readonly Category[] = [
  'default',
  'birthday',
  'anniversary',
  'valentine',
] as const;
