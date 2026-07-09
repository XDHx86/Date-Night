import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Spark {
  id: number;
  x: number;
  y: number;
}

/** Sparkle trail that follows the pointer (desktop) and touch (mobile). */
export function SparkleTrail() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    let id = 0;
    let last = 0;
    const add = (x: number, y: number) => {
      const now = Date.now();
      if (now - last < 55) return;
      last = now;
      const spark = { id: id++, x, y };
      setSparks((s) => [...s.slice(-14), spark]);
      setTimeout(() => setSparks((s) => s.filter((p) => p.id !== spark.id)), 700);
    };
    const onMove = (e: MouseEvent) => add(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) add(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.span
            key={s.id}
            className="absolute select-none text-sm"
            style={{ left: s.x, top: s.y }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 1.2, opacity: 0, y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
