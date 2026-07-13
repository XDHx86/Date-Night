import { useEffect, useState } from "react";

const EMOJIS = [
  "💕",
  "💖",
  "✨",
  "🌸",
  "⭐",
  "💫",
  "🌷",
  "💗",
  "💓",
  "💞",
  "💘",
  "💝",
  "🎀",
  "🌺",
  "🍀",
  "🌼",
  "🪄",
  "🪐",
  "🌙",
  "☀️",
  "⚡",
  "🎪",
  "🎈",
  "🎉",
];

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  scale: number;
  emoji: string;
}

/**
 * Full-screen decorative layer of gently floating hearts, sparkles and petals.
 * Increased density, variety, and visual quality with randomized sizes, speeds,
 * and positions while staying GPU-friendly (transform/opacity).
 */
export function FloatingBackground({ count = 35 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: count }, (_, i) => {
      const size = 12 + Math.random() * 20; // 12-32px
      const duration = 10 + Math.random() * 12; // 10-22s
      const delay = Math.random() * 20; // 0-20s
      const opacity = 0.15 + Math.random() * 0.55; // 0.15-0.7
      const scale = 0.6 + Math.random() * 0.6; // 0.6-1.2
      return {
        id: i,
        left: Math.random() * 100, // 0-100%
        size,
        duration,
        delay,
        opacity,
        scale,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      };
    });
    setParticles(items);
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* subtle gradient blobs */}
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
            // Custom properties used by the float-up keyframes. The public
            // CSS Properties type does not know about these dashed custom
            // properties, so we cast the whole style object through `unknown`.
            ...({
              "--o": p.opacity,
              "--s": p.scale,
              animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            } as Record<string, string | number>),
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
