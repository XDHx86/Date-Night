import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Movie } from "./movies";
import { env } from "./env";

// State interface
interface DateState {
 // Original state
 date: string | null; // ISO yyyy-MM-dd
 time: string | null; // HH:mm (24h)
 movie: Movie | null;

 // UI state
 isDarkMode: boolean; // Dark/night mode preference
 isAudioEnabled: boolean; // Background audio preference
 loveMessage: string; // Custom love message for the love letter page

 // Actions for original state
 setDate: (date: string) => void;
 setTime: (time: string) => void;
 setMovie: (movie: Movie) => void;
 reset: () => void;

 // Actions for UI state
 toggleDarkMode: () => void;
 setDarkMode: (isDark: boolean) => void;
 toggleAudio: () => void;
 setAudioEnabled: (enabled: boolean) => void;
 setLoveMessage: (message: string) => void;
}

export const useDateStore = create<DateState>()(
 persist(
 (set, get) => ({
 // Initial state
 date: null,
 time: null,
 movie: null,
 isDarkMode: false,
 isAudioEnabled: true,
 loveMessage: "You are my sunshine on a cloudy day. ☀️",

 // Original state actions
 setDate: (date) => set({ date }),
 setTime: (time) => set({ time }),
 setMovie: (movie) => set({ movie }),
 reset: () =>
 set({
 date: null,
 time: null,
 movie: null,
 isDarkMode: false,
 // keep audio preference across "plan another date"
 isAudioEnabled: get().isAudioEnabled,
 loveMessage: "You are my sunshine on a cloudy day. ☀️",
 }),

 // UI state actions
 toggleDarkMode: () =>
 set((state) => ({ isDarkMode: !state.isDarkMode })),
 setDarkMode: (isDark) => set({ isDarkMode: isDark }),
 toggleAudio: () =>
 set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
 setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
 setLoveMessage: (message) => set({ loveMessage: message }),
 }),
 {
 name: "date-plan",
 storage: createJSONStorage(() =>
 typeof window !== "undefined"
 ? window.localStorage
 : (undefined as unknown as Storage)
 ),
 partialize: (state) => ({
 date: state.date,
 time: state.time,
 movie: state.movie,
 isDarkMode: state.isDarkMode,
 isAudioEnabled: state.isAudioEnabled,
 loveMessage: state.loveMessage,
 }),
 }
 )
);
