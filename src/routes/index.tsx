import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import landingImg from "@/assets/landing.jpg";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { HeartBurst } from "@/components/HeartBurst";
import { useRotatingMessage } from "@/hooks/useRotatingMessage";
import { messages } from "@/lib/messages";
import { sounds } from "@/lib/sound";
import { useDateStore } from "@/lib/store";
import { isLoveLetterFeatureEnabled } from "@/lib/loveLetterConfig";

export const Route = createFileRoute("/")({
  component: Landing,
});

/**
 * Landing — the first impression.
 *
 * Composition: a small chip-label above the headline, the headline itself, a
 * rotating line of gentle encouragement, a single breathing figure anchoring
 * the composition from below (with a hidden heart-puff for the curious), then
 * two CTAs of equal size. The "Yes" path fires an avalanche of confetti and a
 * heart-rain payoff before it leaves; the "Not tonight" path stays visible
 * (instead of shrinking) because that path is itself part of the playful flow.
 */
function Landing() {
  const navigate = useNavigate();
  const reset = useDateStore((s) => s.reset);
  const loveLetterEnabled = isLoveLetterFeatureEnabled();
  const encouragement = useRotatingMessage(messages.encouragement);
  const [burst, setBurst] = useState(false);
  const [yesLabel, setYesLabel] = useState<string | null>(null);

  // Heart-puff easter-egg state: a remount-key so repeated puffs re-arm + the
  // piece count for this particular puff.
  const [puffKey, setPuffKey] = useState(0);
  const [puffPieces, setPuffPieces] = useState(8);

  const PRESS_MS = 450;
  const pressTimer = useRef<number | undefined>(undefined);
  const longFired = useRef(false);

  // Returning users — clear an in-progress plan so the landing reads fresh. We
  // won't reset the audio preference.
  useEffect(() => {
    const { date, time, movie, loveMessage } = useDateStore.getState();
    if (
      date ||
      time ||
      movie ||
      (loveMessage && loveMessage !== "You are my sunshine on a cloudy day. ☀️")
    ) {
      reset();
    }
  }, [reset]);

  const firePuff = (pieces: number, sfx: "twinkle" | "pop") => {
    sounds[sfx]();
    setPuffPieces(pieces);
    setPuffKey((k) => k + 1);
  };

  const onPressStart = () => {
    longFired.current = false;
    pressTimer.current = window.setTimeout(() => {
      // Long-press earns a bigger puff + a soft pop.
      longFired.current = true;
      firePuff(14, "pop");
    }, PRESS_MS);
  };

  const onPressEnd = () => {
    if (pressTimer.current !== undefined) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = undefined;
    }
  };

  const onPuffClick = () => {
    // A quick tap (no long-press) → a small twinkle puff. Long-press fires its
    // own bigger puff and flips this flag so we don't double-puff on release.
    if (longFired.current) {
      longFired.current = false;
      return;
    }
    firePuff(8, "twinkle");
  };

  const handleYes = () => {
    sounds.celebrate();
    setBurst(true);
    setYesLabel("You will?");
    setTimeout(() => setYesLabel("Yesss"), 600);
    setTimeout(() => navigate({ to: "/confirmation" }), 1400);
  };

  return (
    <PageShell width="narrow">
      {/* Yes payoff — a confetti avalanche and a heart-rain. */}
      <ConfettiCelebration active={burst} variant="avalanche" />
      <HeartBurst active={burst} variant="heartRain" pieces={36} />

      <Eyebrow>An invitation</Eyebrow>

      <AnimatePresence mode="popLayout">
        {yesLabel ? (
          <motion.h1
            key={yesLabel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-display text-balance text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl"
          >
            {yesLabel}
          </motion.h1>
        ) : (
          <motion.h1
            key="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-display text-balance text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl"
          >
            Will you spend the evening with me?
          </motion.h1>
        )}
      </AnimatePresence>

      {encouragement ? (
        <p
          key={encouragement}
          className="mt-6 max-w-md animate-fade-in text-pretty text-base italic text-muted-foreground sm:text-lg"
        >
          {encouragement}
        </p>
      ) : null}

      <motion.figure
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex w-full flex-col items-center"
      >
        <div className="relative">
          <img
            src={landingImg}
            alt=""
            aria-hidden
            width={320}
            height={320}
            loading="eager"
            onPointerDown={onPressStart}
            onPointerUp={onPressEnd}
            onPointerLeave={onPressEnd}
            onClick={onPuffClick}
            className="h-44 w-44 cursor-pointer rounded-full object-cover shadow-[var(--shadow-md)] transition-shadow duration-300 hover:shadow-[var(--shadow-glow)] animate-breathe sm:h-56 sm:w-56"
          />
          {/* Hidden heart-puff over the hero — a tiny reward for the curious. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <HeartBurst key={puffKey} active variant="soft" pieces={puffPieces} />
          </div>
        </div>
        <figcaption className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
          Picked with intention, planned with care.
        </figcaption>
      </motion.figure>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4"
      >
        <Button size="lg" variant="primary" onClick={handleYes} className="w-full sm:w-auto">
          Yes, I'd love that
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate({ to: "/begging" })}
          className="w-full sm:w-auto"
        >
          Not tonight
        </Button>
      </motion.div>

      <p className="mt-10 text-xs text-muted-foreground/80">
        Tap the icons at the bottom to toggle audio, switch theme
        {loveLetterEnabled ? ", or jump to the love letter" : ""}.
      </p>
    </PageShell>
  );
}
