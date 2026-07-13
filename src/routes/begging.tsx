import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import beggingImg from "@/assets/begging.jpg";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { sounds } from "@/lib/sound";
// import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";

export const Route = createFileRoute("/begging")({
  component: Begging,
});

const PLEAS = [
  "Pleaseee 🥺",
  "I even made an entire website...",
  "You can't say no to all this effort...",
  "Pretty pretty please? 🥹",
  "My heart can't take another no 💔",
  "Look how cute I'm being 🐶",
];

function Begging() {
  const navigate = useNavigate();
  // const {movie, date } = useDateStore();
  const [burst, setBurst] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flip, setFlip] = useState(1);

  const pleaIndex = Math.min(dodges, PLEAS.length - 1);
  const yesScale = 1 + Math.min(dodges, 6) * 0.12;

  const handleYes = () => {
    sounds.celebrate();
    setBurst(true);
    setTimeout(() => navigate({ to: "/confirmation" }), 1400);
  };

  const dodge = () => {
    sounds.pop();
    // Keep the button safely within the viewport (no overflow, no off-screen).
    const range = Math.min(140, typeof window !== "undefined" ? window.innerWidth / 3 : 140);
    const x = (Math.random() * 2 - 1) * range;
    const y = (Math.random() * 2 - 1) * Math.min(range, 120);
    setPos({ x, y });
    setFlip(Math.random() > 0.5 ? -1 : 1);
    setDodges((d) => d + 1);
  };

  // Get a playful message for this screen
  const playfulMessage = useRandomMessage("playful");

  return (
    <PageShell>
      {playfulMessage && (
        <p className="mb-4 text-center text-muted-foreground italic max-w-xl">"{playfulMessage}"</p>
      )}

      <ConfettiCelebration active={burst} />

      <motion.img
        src={beggingImg}
        alt="An adorable puppy with big teary eyes, begging"
        width={1024}
        height={1024}
        loading="eager"
        className="mb-6 h-44 w-44 rounded-full object-cover shadow-[var(--shadow-glow)] sm:h-52 sm:w-52"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <h1 className="text-4xl font-bold text-gradient sm:text-5xl">Wait, noo! 😭</h1>
      <motion.p
        key={pleaIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 min-h-[2rem] text-xl text-muted-foreground"
      >
        {PLEAS[pleaIndex]}
      </motion.p>

      <div className="relative mt-10 flex min-h-[9rem] w-full items-center justify-center gap-4">
        <motion.div animate={{ scale: yesScale }} transition={{ type: "spring", stiffness: 260 }}>
          <AnimatedButton variant="yes" size="lg" onClick={handleYes}>
            YES ❤️
          </AnimatedButton>
        </motion.div>

        <motion.div
          animate={{ x: pos.x, y: pos.y, scaleX: flip, rotate: dodges ? flip * 8 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="relative"
        >
          <AnimatedButton
            variant="no"
            size="lg"
            // Dodge on hover AND tap so it's uncatchable on every device.
            onMouseEnter={dodges > 0 ? dodge : undefined}
            onClick={dodges === 0 ? dodge : dodge}
          >
            NO 😭
          </AnimatedButton>
          {dodges > 0 && (
            <motion.span
              key={dodges}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-lg"
            >
              😢
            </motion.span>
          )}
        </motion.div>
      </div>

      {dodges >= 3 && (
        <p className="mt-6 text-sm font-semibold text-muted-foreground">
          (The "No" button seems a little... slippery 👀)
        </p>
      )}
    </PageShell>
  );
}
