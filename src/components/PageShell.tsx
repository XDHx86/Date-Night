import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Shared page layout. Decorative background, floating particles, and
 * the global control bar live at the app root (`__root.tsx`) so they
 * are never re‑created on route changes — this component only owns
 * the soft fade/slide entrance for the page content.
 */
export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-16">
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
