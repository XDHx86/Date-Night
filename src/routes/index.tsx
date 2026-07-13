import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import landingImg from "@/assets/landing.jpg";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { sounds } from "@/lib/sound";
import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const {} = useDateStore();
  const [burst, setBurst] = useState(false);
  const [yesText, setYesText] = useState<string | null>(null);

  const handleYes = () => {
    sounds.celebrate();
    setBurst(true);
    setYesText("YOU WILL?! 🥹");
    setTimeout(() => setYesText("YAAAAAY ❤️"), 1100);
    setTimeout(() => navigate({ to: "/confirmation" }), 2200);
  };

  // Get a playful or encouraging message for the landing page
  const openingMessage = useRandomMessage("encouragement");

  return (
    <PageShell>
      {/* Confetti celebration */}
      <ConfettiCelebration active={burst} />

      {openingMessage && (
        <p className="mb-4 text-center text-muted-foreground italic max-w-xl">"{openingMessage}"</p>
      )}

      <motion.img
        src={landingImg}
        alt="A cute winged heart floating among clouds"
        width={1024}
        height={1024}
        fetchPriority="high"
        className="mb-6 h-44 w-44 rounded-full object-cover shadow-[var(--shadow-glow)] sm:h-56 sm:w-56"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {yesText ? (
        <motion.h1
          key={yesText}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 12 }}
          className="text-5xl font-bold text-gradient sm:text-6xl"
        >
          {yesText}
        </motion.h1>
      ) : (
        <>
          <h1 className="text-balance text-4xl font-bold leading-tight text-gradient sm:text-5xl">
            Will you spend the night with me?
          </h1>
          <p className="mt-4 text-balance text-lg text-muted-foreground sm:text-xl">
            Would you honor me with the privilege of stealing you away for a date? 🥺
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <AnimatedButton variant="yes" size="lg" onClick={handleYes}>
              YES ❤️
            </AnimatedButton>
            <AnimatedButton variant="no" size="lg" onClick={() => navigate({ to: "/begging" })}>
              NO 😤
            </AnimatedButton>
          </div>
        </>
      )}
    </PageShell>
  );
}
