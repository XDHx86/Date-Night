import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Movie } from "./movies";

interface DateState {
  date: string | null; // ISO yyyy-MM-dd
  time: string | null; // HH:mm (24h)
  movie: Movie | null;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setMovie: (movie: Movie) => void;
  reset: () => void;
}

export const useDateStore = create<DateState>()(
  persist(
    (set) => ({
      date: null,
      time: null,
      movie: null,
      setDate: (date) => set({ date }),
      setTime: (time) => set({ time }),
      setMovie: (movie) => set({ movie }),
      reset: () => set({ date: null, time: null, movie: null }),
    }),
    {
      name: "date-plan",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as unknown as Storage),
      ),
    },
  ),
);
