import { motion } from "framer-motion";
import { backdropUrl } from "@/lib/tmdbImages";
import type { Movie } from "@/lib/movies";

interface Props {
  movie: Movie | null;
  /** Strength of the dim layer — used to ensure the foreground scans
   * clearly regardless of whether the chosen film is dark or bright. */
  dim?: "soft" | "medium" | "strong";
}

/**
 * Selected-movie backdrop, painted as a full-viewport wash behind the
 * content on `/summary` and `/success`. Reads as supporting decoration
 * rather than a featured image — the goal is atmosphere, not attention.
 *
 * - Heavy blur and a dim layer keep text foreground-readable.
 * - Sits behind the global AmbientBackdrop's tone and only adds
 *   a soft desaturation tint of the chosen film's palette.
 * - When no backdrop is available, the page still reads correctly
 *   thanks to the document background bleeding through.
 */
export function MovieBackdropBackground({ movie, dim = "medium" }: Props) {
  const src = backdropUrl(movie);

  const dimOpacity = dim === "soft" ? 0.4 : dim === "strong" ? 0.78 : 0.6;

  return (
    <>
      {src ? (
        <motion.div
          key={src}
          className="fixed inset-0 z-[-1] overflow-hidden"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(1px) saturate(0.9) brightness(0.7)",
            transform: "scale(1.2)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : null}

      {/* Vignette + dim — guarantees text contrast over any artwork. */}
      <div
        aria-hidden
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{ background: `oklch(0.18 0.012 50 / ${dimOpacity})` }}
      />
    </>
  );
}
