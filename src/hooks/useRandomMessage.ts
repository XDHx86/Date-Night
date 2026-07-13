import { useEffect, useMemo, useState } from "react";
import { messages } from "@/lib/messages";

type Category = keyof typeof messages;

const EMPTY = "";

/**
 * Hook – returns a deterministic placeholder (the first message of the
 * category, or empty) during SSR / initial client render, and a *random*
 * message after hydration.  This eliminates the server/client hydration
 * mismatch caused by `Math.random()` running during render.
 */
export function useRandomMessage(category: Category): string {
  const pool = useMemo(() => messages[category] ?? [], [category]);
  const [msg, setMsg] = useState<string>(() => pool[0] ?? EMPTY);

  useEffect(() => {
    if (pool.length === 0) {
      setMsg(EMPTY);
      return;
    }
    setMsg(pool[Math.floor(Math.random() * pool.length)]);
    // We intentionally only re‑pick when the category changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return msg;
}

/**
 * Hook – random message from any category.  Same hydration‑safe design.
 */
export function useAnyRandomMessage(): string {
  const allCategories = useMemo(() => Object.keys(messages) as Category[], []);
  const [msg, setMsg] = useState<string>(EMPTY);

  useEffect(() => {
    if (allCategories.length === 0) {
      setMsg(EMPTY);
      return;
    }
    const cat = allCategories[Math.floor(Math.random() * allCategories.length)];
    const pool = messages[cat] ?? [];
    setMsg(pool.length === 0 ? EMPTY : pool[Math.floor(Math.random() * pool.length)]);
    // Only needs to run once after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCategories]);

  return msg;
}
