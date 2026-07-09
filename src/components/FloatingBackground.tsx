import { useEffect, useState } from "react";

const EMOJIS = ["💕", "💖", "✨", "🌸", "⭐", "💫", "🌷", "💗"];

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  emoji: string;
}

/**
 * Full-screen decorative layer of gently floating hearts, sparkles and petals.
 * Purely presentational, pointer-events disabled, GPU-friendly (transform/opacity).
 * Particles are generated after mount to avoid SSR hydration mismatches.
 */
export function FloatingBackground({ count = 18 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 26,
      duration: 12 + Math.random() * 12,
      delay: Math.random() * 14,
      opacity: 0.4 + Math.random() * 0.5,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setParticles(items);
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft gradient blobs */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-secondary/50 blur-3xl" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 select-none will-change-transform"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            // custom props consumed by the float-up keyframes
            ["--o" as string]: p.opacity,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
