import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import celebrationImg from "@/assets/celebration.jpg";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
import { sounds } from "@/lib/sound";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const Route = createFileRoute("/confirmation")({
  component: Confirmation,
});

function Confirmation() {
  const navigate = useNavigate();
  const { setStep } = useDateStore();
  const [burst, setBurst] = useState(false);

  // Set current step (confirmation is step 3)
  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // Play celebration sound on mount
  useEffect(() => {
    sounds.celebrate();
  }, []);

  // Get a celebratory or romantic message
  const celebrationMessage = useRandomMessage("celebration");

  const handleContinue = () => {
    navigate({ to: "/date" });
  };

  return (
    <PageShell>
      {/* Animated background */}
      <AnimatedBackground className="pointer-events-none" />

      {/* Progress Indicator */}
      <div className="mb-4">
        <ProgressIndicator currentStep={3} totalSteps={6} />
      </div>

      {celebrationMessage && (
        <p className="mb-4 text-center text-muted-foreground italic max-w-xl">
          "{celebrationMessage}"
        </p>
      )}

      <HeartBurst active={burst} pieces={36} />

      <motion.img
        src={celebrationImg}
        alt="A joyful character jumping with confetti and hearts"
        width={1024}
        height={1024}
        loading="eager"
        className="mb-6 h-44 w-44 rounded-full object-cover shadow-[var(--shadow-glow)] sm:h-56 sm:w-56"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      />

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-muted-foreground"
      >
        WAIT...
      </motion.h1>
      <motion.h2
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 12 }}
        className="mt-2 text-5xl font-bold text-gradient sm:text-6xl"
      >
        YOU SAID YES?! 🥹❤️
      </motion.h2>
      <p className="mt-4 text-xl text-muted-foreground">Best decision ever. Now let's plan it 💕</p>

      <AnimatedButton
        variant="gold"
        size="lg"
        className="mt-10"
        onClick={handleContinue}
      >
        Continue →
      </AnimatedButton>
    </PageShell>
  );
}