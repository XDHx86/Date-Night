import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ----------------------------------------------------------------------------
 *  Page‑specific background variants. Add new ones here and map them to
 *  routes in `useRouteBackgroundVariant`.
 * ------------------------------------------------------------------------- */

export type BackgroundVariant =
  "love" | "movie" | "date" | "time" | "begging" | "confirmation" | "summary" | "success";

interface BackgroundContextValue {
  variant: BackgroundVariant;
  setVariant: (variant: BackgroundVariant) => void;
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

// Default variant when nothing else is set.
const DEFAULT_VARIANT: BackgroundVariant = "love";

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<BackgroundVariant>(DEFAULT_VARIANT);

  // `setVariant` is stable — keeps consumers from re‑rendering unnecessarily.
  const setVariant = useCallback((next: BackgroundVariant) => {
    setVariantState(next);
  }, []);

  const value = useMemo(() => ({ variant, setVariant }), [variant, setVariant]);

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>;
}

/** Hook to read & write the current background variant. */
export function useBackgroundVariant() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) {
    throw new Error("useBackgroundVariant must be used inside a <BackgroundProvider />");
  }
  return ctx;
}

/** Read‑only variant access (for components that don’t need to change it). */
export function useCurrentBackgroundVariant(): BackgroundVariant {
  return useBackgroundVariant().variant;
}
