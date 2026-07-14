import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import beggingImg from "@/assets/begging.jpg";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { HeartBurst } from "@/components/HeartBurst";
import { sounds } from "@/lib/sound";
import { useRandomMessage } from "@/hooks/useRandomMessage";

export const Route = createFileRoute("/begging")({
  component: Begging,
});

const PLEAS = [
  "Please?",
  "I made the whole site for this, you know…",
  "You can't say no to all this effort.",
  "Pretty pretty please?",
  "My heart can't take another no.",
  "Look how well-mannered I'm being.",
];

/**
 * Begging — the playful "no" path.
 *
 * The mechanic is preserved: the *No* button dodges on hover+tap and
 * the *Yes* button grows each time it's avoided. But the surrounding
 * chrome stays editorial — single eyebrow chip, headline, italic plea,
 * small captioned figure. The chaos is concentrated on the dodge, not
 * smeared across the page.
 */
function Begging() {
  const navigate = useNavigate();
  const playfulMessage = useRandomMessage("playful");
  const [burst, setBurst] = useState(false);
  const [heartRain, setHeartRain] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flip, setFlip] = useState(1);

  const pleaIndex = Math.min(dodges, PLEAS.length - 1);

  // Cap the Yes growth at +20% so the layout never feels like it
  // tips over.
  const yesScale = 1 + Math.min(dodges, 4) * 0.05;

  const handleYes = () => {
    sounds.celebrate();
    // Varied accept — flip a coin between a confetti burst and a heart-rain so
    // the payoff never reads the same twice.
    if (Math.random() > 0.5) setHeartRain(true);
    else setBurst(true);
    setTimeout(() => navigate({ to: "/confirmation" }), 1400);
  };

  const dodge = () => {
    sounds.pop();
    // Keep the button safely within the viewport (no overflow, no
    // off-screen). Math.random in render is fine here — the bound
    // is read after the user actually acts. Confirmed SSR-safe:
    // both are inside the onClick handler.
    const range = Math.min(160, typeof window !== "undefined" ? window.innerWidth / 3 : 160);
    const x = (Math.random() * 2 - 1) * range;
    const y = (Math.random() * 2 - 1) * Math.min(range, 100);
    setPos({ x, y });
    setFlip(Math.random() > 0.5 ? -1 : 1);
    setDodges((d) => d + 1);
  };

  return (
    <PageShell width="narrow">
      <ConfettiCelebration active={burst} />
      <HeartBurst active={heartRain} variant="heartRain" pieces={36} />

      <Eyebrow>A change of heart</Eyebrow>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-display text-balance text-5xl tracking-[-0.03em] sm:text-6xl"
      >
        Wait, no?
      </motion.h1>

      <AnimatePresence mode="wait">
        <motion.p
          key={pleaIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 min-h-[3rem] max-w-md text-pretty text-lg italic text-muted-foreground sm:text-xl"
        >
          {PLEAS[pleaIndex]}
        </motion.p>
      </AnimatePresence>

      <motion.figure
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex w-full flex-col items-center"
      >
        <img
          src={beggingImg}
          alt=""
          aria-hidden
          width={320}
          height={320}
          loading="eager"
          className="h-32 w-32 rounded-full object-cover shadow-[var(--shadow-md)] sm:h-40 sm:w-40"
        />
        <figcaption className="mt-3 text-xs text-muted-foreground">Promise I'll behave.</figcaption>
      </motion.figure>

      {playfulMessage ? (
        <p className="mt-8 max-w-md text-center text-sm text-muted-foreground">{playfulMessage}</p>
      ) : null}

      <div className="relative mt-8 flex min-h-[7rem] w-full items-center justify-center gap-4">
        <motion.div
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <Button size="lg" variant="primary" onClick={handleYes}>
            Yes, in fact
          </Button>
        </motion.div>

        <motion.div
          animate={{ x: pos.x, y: pos.y, scaleX: flip, rotate: dodges ? flip * 4 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="relative"
        >
          <Button
            size="lg"
            variant="outline"
            // Dodge on hover AND tap so it's uncatchable on every device.
            onMouseEnter={dodges > 0 ? dodge : undefined}
            onClick={dodges === 0 ? dodge : dodge}
          >
            Still no
          </Button>
          {dodges > 0 ? (
            <motion.span
              key={dodges}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs italic text-muted-foreground"
            >
              oof
            </motion.span>
          ) : null}
        </motion.div>
      </div>

      {dodges >= 3 ? (
        <p className="mt-6 max-w-xs text-center text-xs italic text-muted-foreground">
          (The "No" button seems a little slippery.)
        </p>
      ) : null}
    </PageShell>
  );
}
