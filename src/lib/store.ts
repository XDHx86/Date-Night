import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Movie } from "./movies";
import { env } from "./env";

// Extended state interface
interface DateState {
  // Original state (maintained for backward compatibility during transition)
  date: string | null; // ISO yyyy-MM-dd
  time: string | null; // HH:mm (24h)
  movie: Movie | null;

  // UI state
  step: number; // Current step in the flow (1-6)
  isDarkMode: boolean; // Dark/night mode preference
  loveMessage: string; // Custom love message for the love letter page

  // Actions for original state
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setMovie: (movie: Movie) => void;
  reset: () => void;

  // Actions for UI state
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setLoveMessage: (message: string) => void;
}

export const useDateStore = create<DateState>()(
  persist(
    (set, get) => ({
      // Initial state
      date: null,
      time: null,
      movie: null,
      step: 1, // Start at first step (landing page)
      isDarkMode: false,
      loveMessage: "You are my sunshine on a cloudy day. ☀️",

      // Original state actions
      setDate: (date) => set({ date }),
      setTime: (time) => set({ time }),
      setMovie: (movie) => set({ movie }),
      reset: () => set({
        date: null,
        time: null,
        movie: null,
        step: 1,
        isDarkMode: false,
        loveMessage: "You are my sunshine on a cloudy day. ☀️",
      }),

      // UI state actions
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({
        step: Math.min(state.step + 1, 6) // Max 6 steps
      })),
      prevStep: () => set((state) => ({
        step: Math.max(state.step - 1, 1) // Min 1 step
      })),
      toggleDarkMode: () => set((state) => ({
        isDarkMode: !state.isDarkMode
      })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      setLoveMessage: (message) => set({ loveMessage: message }),
    }),
    {
      name: "date-plan", // localStorage key
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage)
      ),
      // Optional: merge persisted state with defaults on hydrate
      partialize: (state) => ({
        // Only persist these fields
        date: state.date,
        time: state.time,
        movie: state.movie,
        step: state.step,
        isDarkMode: state.isDarkMode,
        loveMessage: state.loveMessage,
      })
    }
  )
);