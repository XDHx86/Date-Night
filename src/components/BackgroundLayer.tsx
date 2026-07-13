import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentBackgroundVariant, type BackgroundVariant } from "./BackgroundContext";

/* ----------------------------------------------------------------------------
 *  Per‑variant gradient strings. Edit these to tweak the look of any page.
 * ------------------------------------------------------------------------- */

const GRADIENTS: Record<BackgroundVariant, string> = {
  love: "linear-gradient(120deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%, #fbc2eb 100%)",
  movie: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #a1c4fd 100%)",
  date: "linear-gradient(120deg, #f6d365 0%, #fda085 50%, #f6d365 100%)",
  time: "linear-gradient(120deg, #ff9a9e 0%, #fecfef 50%, #ff9a9e 100%, #fecfef 100%)",
  begging: "linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 50%, #fbc2eb 100%)",
  confirmation: "linear-gradient(120deg, #a8edea 0%, #fed6e3 50%, #a8edea 100%)",
  summary: "linear-gradient(120deg, #d4fc79 0%, #96e6a1 50%, #d4fc79 100%)",
  success: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 50%, #84fab0 100%)",
};

// Each variant gets its own keyframe name so the animation survives a
// cross‑fade without any visible reset (the new layer just starts animating
// from the same `background-position` baseline).
const KEYFRAMES: Record<BackgroundVariant, string> = {
  love: "bgLove",
  movie: "bgMovie",
  date: "bgDate",
  time: "bgTime",
  begging: "bgBegging",
  confirmation: "bgConfirmation",
  summary: "bgSummary",
  success: "bgSuccess",
};

const DURATIONS: Record<BackgroundVariant, number> = {
  love: 15,
  movie: 18,
  date: 12,
  time: 17,
  begging: 16,
  confirmation: 14,
  summary: 19,
  success: 20,
};

/* ----------------------------------------------------------------------------
 *  Persistent, cross‑fading animated background layer.
 *  Renders once at the app root — never unmounts on route change.
 * ------------------------------------------------------------------------- */

export function BackgroundLayer() {
  const variant = useCurrentBackgroundVariant();

  // Inject the per‑variant keyframes once.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("bg-keyframes")) return;
    const style = document.createElement("style");
    style.id = "bg-keyframes";
    style.textContent = Object.values(KEYFRAMES)
      .map(
        (k) =>
          `@keyframes ${k} { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`,
      )
      .join("\n");
    document.head.appendChild(style);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={variant}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            background: GRADIENTS[variant],
            backgroundSize: "300% 300%",
            animation: `${KEYFRAMES[variant]} ${DURATIONS[variant]}s ease infinite`,
          }}
        />
      </AnimatePresence>

      {/* Persistent dim layer for legibility */}
      <div className="absolute inset-0 bg-black/5" />
    </div>
  );
}
