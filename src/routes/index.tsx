import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import landingImg from "@/assets/landing.jpg";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { useDateStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Landing,
});

/**
 * Landing — the first impression.
 *
 * Composition: a small chip-label above the headline, the headline
 * itself, an italic opening line, a single figure anchoring the
 * composition from below, then two CTAs of equal size. The
 * "Yes" path is the primary action; the "Not tonight" path
 * stays visible (instead of shrinking) because that path is
 * itself part of the playful flow.
 */
function Landing() {
  const navigate = useNavigate();
  const reset = useDateStore((s) => s.reset);
  const openingMessage = useRandomMessage("encouragement");
  const [burst, setBurst] = useState(false);
  const [yesLabel, setYesLabel] = useState<string | null>(null);

  // Returning users — clear an in-progress plan so the landing reads
  // fresh. We won't reset the audio preference.
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

  const handleYes = () => {
    setBurst(true);
    setYesLabel("You will?");
    setTimeout(() => setYesLabel("Yesss"), 600);
    setTimeout(() => navigate({ to: "/confirmation" }), 1400);
  };

  return (
    <PageShell width="narrow">
      <ConfettiCelebration active={burst} />

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

      {openingMessage ? (
        <p className="mt-6 max-w-md text-pretty text-base italic text-muted-foreground sm:text-lg">
          {openingMessage}
        </p>
      ) : null}

      <motion.figure
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex w-full flex-col items-center"
      >
        <img
          src={landingImg}
          alt=""
          aria-hidden
          width={320}
          height={320}
          loading="eager"
          className="h-44 w-44 rounded-full object-cover shadow-[var(--shadow-md)] sm:h-56 sm:w-56"
        />
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
        Tap the icons at the bottom to toggle audio, switch theme, or jump to the love letter.
      </p>
    </PageShell>
  );
}
