import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useBackgroundVariant, type BackgroundVariant } from "./BackgroundContext";

/* ----------------------------------------------------------------------------
 *  Path → background variant.
 *  Single source of truth — never set the variant from inside a route.
 * ------------------------------------------------------------------------- */

const ROUTE_VARIANT: Record<string, BackgroundVariant> = {
  "/": "love",
  "/begging": "begging",
  "/confirmation": "confirmation",
  "/date": "date",
  "/time": "time",
  "/movie": "movie",
  "/summary": "summary",
  "/success": "success",
  "/love-letter": "love",
};

const FALLBACK: BackgroundVariant = "love";

/**
 * Mirrors the current route into the global background variant.
 * Place once at the app root next to the BackgroundLayer.
 */
export function BackgroundVariantSync() {
  const { setVariant } = useBackgroundVariant();
  const location = useLocation();

  useEffect(() => {
    const next = ROUTE_VARIANT[location.pathname] ?? FALLBACK;
    setVariant(next);
  }, [location.pathname, setVariant]);

  return null;
}
