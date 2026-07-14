import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Eyebrow — the small label pill that opens every route.
 *
 * One declaration reused across all pages, so the opening beat of the editorial
 * rhythm stays consistent instead of drifting through copy-paste. Renders a
 * single entrance fade/slide for the pill plus a ✨ sparkle accent that pops in
 * once on mount and then rests — present, never competing with the headline.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 backdrop-blur",
        className,
      )}
    >
      <motion.span
        aria-hidden
        initial={{ scale: 0, opacity: 0, rotate: -60 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.18, type: "spring", stiffness: 420, damping: 12 }}
        className="text-[0.8rem] leading-none"
      >
        ✨
      </motion.span>
      <span className="text-eyebrow">{children}</span>
    </motion.div>
  );
}
