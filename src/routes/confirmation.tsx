import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import celebrationImg from "@/assets/celebration.jpg";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useRandomMessage } from "@/hooks/useRandomMessage";

export const Route = createFileRoute("/confirmation")({
  component: Confirmation,
});

/**
 * Confirmation — the first quiet breath after "yes".
 *
 * Three beats:
 * 1. Tiny eyebrow label ("Oh")
 * 2. The headline: "You said yes."
 * 3. A single reassuring line, then one CTA.
 *
 * Typography carries the moment. Confetti ticks briefly, then leaves.
 */
function Confirmation() {
  const navigate = useNavigate();
  const message = useRandomMessage("celebration");
  const [burst, setBurst] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBurst(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageShell width="narrow">
      <ConfettiCelebration active={burst} />

      <Eyebrow>Oh</Eyebrow>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-display text-balance text-5xl tracking-[-0.03em] sm:text-6xl"
      >
        You said yes.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 max-w-md text-pretty text-lg text-muted-foreground sm:text-xl"
      >
        Best decision. Now let's figure out the when.
      </motion.p>

      {message ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-md text-pretty text-base italic text-muted-foreground"
        >
          {message}
        </motion.p>
      ) : null}

      <motion.figure
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex w-full flex-col items-center"
      >
        <img
          src={celebrationImg}
          alt=""
          aria-hidden
          width={320}
          height={320}
          loading="eager"
          className="h-32 w-32 rounded-full object-cover shadow-[var(--shadow-md)] sm:h-40 sm:w-40"
        />
        <figcaption className="mt-3 text-xs text-muted-foreground">Pumped for you.</figcaption>
      </motion.figure>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 w-full max-w-xs"
      >
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate({ to: "/date" })}
          className="w-full"
        >
          Let's pick a date
        </Button>
      </motion.div>
    </PageShell>
  );
}

console.log({
  baseUrl: import.meta.env.BASE_URL,
  pathname: window.location.pathname,
  raw: import.meta.env,
});
