import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import celebrationImg from "@/assets/celebration.jpg";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
import { sounds } from "@/lib/sound";

export const Route = createFileRoute("/confirmation")({
  component: Confirmation,
});

function Confirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    sounds.celebrate();
  }, []);

  return (
    <PageShell particles={26}>
      <HeartBurst active pieces={36} />

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
        onClick={() => navigate({ to: "/date" })}
      >
        Continue →
      </AnimatedButton>
    </PageShell>
  );
}
