import { motion } from "framer-motion";
import { backdropUrl } from "@/lib/tmdbImages";
import type { Movie } from "@/lib/movies";

interface Props {
  movie: Movie | null;
}

/**
 * Full‑page, blurred, expanded background image for the selected movie.
 *
 * Implementation notes:
 * - Uses CSS background‑image instead of a child <img> so nothing relies on
 *   `position: absolute` inside the wrapper (avoids overflow / stacking issues
 *   with the page's `overflow-hidden` containers).
 * - One `fixed inset-0` div fills the viewport; a second `fixed inset-0` div
 *   sits on top of it for dim + tint.
 * - If TMDb returns no artwork, a dark gradient still paints so the page
 *   never looks blank.
 */
export function MovieBackdropBackground({ movie }: Props) {
  const fullBackdrop = backdropUrl(movie);

  if (!fullBackdrop) {
    return (
      <div
        className="fixed inset-0 z-[-5]"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)",
        }}
      />
    );
  }

  return (
    <>
      <motion.div
        key={fullBackdrop}
        className="fixed inset-0 z-[-5] overflow-hidden"
        style={{
          backgroundImage: `url(${fullBackdrop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(1px) brightness(0.85)",
          transform: "scale(1.1)", // avoid blurred edges showing
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Dim & tint overlay for foreground legibility */}
      <div className="fixed inset-0 z-[-4] pointer-events-none bg-black/40 backdrop-blur-sm" />
    </>
  );
}
