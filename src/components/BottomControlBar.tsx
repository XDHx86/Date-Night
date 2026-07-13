import { Heart, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useDateStore } from "@/lib/store";

/**
 * Centered bottom control bar that consolidates every floating control:
 *
 * - Dark mode toggle
 * - Background audio toggle
 * - Love letter shortcut
 *
 * Centered horizontally, fixed at the bottom of the viewport, the bar
 * has a translucent card background so it works over both bright and
 * dark backdrops. Buttons are large enough for touch and include
 * proper accessibility attributes (aria‑pressed, aria‑label,
 * focus‑visible ring).
 */
export function BottomControlBar() {
  const navigate = useNavigate();
  const isDarkMode = useDateStore((s) => s.isDarkMode);
  const toggleDarkMode = useDateStore((s) => s.toggleDarkMode);
  const isAudioEnabled = useDateStore((s) => s.isAudioEnabled);
  const toggleAudio = useDateStore((s) => s.toggleAudio);

  return (
    <nav
      aria-label="Primary actions"
      // Position lifts the bar above the iOS home-indicator safe area
      // without changing visual placement on devices that don't have
      // one. `1rem` is the original `bottom-4` baseline.
      style={{ bottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      className="pointer-events-auto fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/40 bg-card/80 px-2 py-2 shadow-[var(--shadow-card)] backdrop-blur-md"
    >
      <ControlButton
        onClick={toggleDarkMode}
        ariaPressed={isDarkMode}
        ariaLabel={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </ControlButton>

      <ControlButton
        onClick={toggleAudio}
        ariaPressed={isAudioEnabled}
        ariaLabel={isAudioEnabled ? "Mute background audio" : "Enable background audio"}
      >
        {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </ControlButton>

      <ControlButton onClick={() => navigate({ to: "/love-letter" })} ariaLabel="Open love letter">
        <Heart className="h-5 w-5" />
      </ControlButton>
    </nav>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  ariaPressed?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}

function ControlButton({ onClick, ariaPressed, ariaLabel, children }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
    >
      {children}
    </button>
  );
}
