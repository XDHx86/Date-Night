import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FloatingBackground } from "./FloatingBackground";
import { SparkleTrail } from "./SparkleTrail";
import { SoundToggle } from "./SoundToggle";

/**
 * Shared page layout: decorative background, sparkle trail, sound toggle,
 * and a soft fade/slide entrance for the page content.
 */
export function PageShell({
  children,
  particles,
  className = "",
}: {
  children: ReactNode;
  particles?: number;
  className?: string;
}) {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-5 py-16">
      <FloatingBackground count={particles} />
      <SparkleTrail />
      <SoundToggle />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 flex w-full max-w-xl flex-col items-center text-center ${className}`}
      >
        {children}
      </motion.div>
    </main>
  );
}
