import { Heart, Moon, Sun, Volume2, VolumeX, type LucideIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useDateStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { sounds, setMuted, unlockAudio } from "@/lib/sound";
import { isLoveLetterFeatureEnabled } from "@/lib/loveLetterConfig";

interface ControlProps {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  Icon: LucideIcon;
}

/**
 * Single icon control inside the bottom bar. Same chrome as the
 * common Theme/Audio/Love shortcuts so the bar reads as one
 * composed unit.
 */
function Control({ label, pressed, onClick, Icon }: ControlProps) {
  return (
    <button
      type="button"
      onClick={() => {
        sounds.click();
        onClick();
      }}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors duration-150",
        "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-95",
      )}
    >
      <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden />
    </button>
  );
}

/**
 * The audio control is the single global sound switch: toggling flips the
 * store flag (which `useBackgroundAudio` follows), resumes the AudioContext
 * for the gesture, and plays a satisfying `pop` when enabling so the first
 * sound you hear is a welcome-back blip rather than a generic click.
 */
function AudioControl() {
  const isAudioEnabled = useDateStore((s) => s.isAudioEnabled);
  const toggleAudio = useDateStore((s) => s.toggleAudio);

  const handleToggle = () => {
    // Unlock + flip the sound engine synchronously so the welcome blip is
    // actually audible this tick (the store→effect sync lands a render later).
    unlockAudio();
    const enabling = !isAudioEnabled;
    setMuted(!enabling);
    toggleAudio();
    if (enabling) sounds.pop();
    else sounds.click();
  };

  return (
    <Control
      label={isAudioEnabled ? "Mute background audio" : "Enable background audio"}
      pressed={isAudioEnabled}
      onClick={handleToggle}
      Icon={isAudioEnabled ? Volume2 : VolumeX}
    />
  );
}

/**
 * Slim, center-fixed bottom control bar. Houses the three app-wide
 * shortcuts: theme, audio, and the love-letter jump. Shared chrome
 * means the bar reads as one composed unit rather than three
 * floating buttons.
 */
export function BottomControlBar() {
  const navigate = useNavigate();
  const isDarkMode = useDateStore((s) => s.isDarkMode);
  const toggleDarkMode = useDateStore((s) => s.toggleDarkMode);
  const loveLetterEnabled = isLoveLetterFeatureEnabled();

  return (
    <nav
      aria-label="Quick actions"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      className="pointer-events-auto fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-[var(--shadow-md)] backdrop-blur-md"
    >
      <Control
        label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        pressed={isDarkMode}
        onClick={toggleDarkMode}
        Icon={isDarkMode ? Sun : Moon}
      />
      <AudioControl />
      {loveLetterEnabled ? (
        <Control
          label="Open love letter"
          onClick={() => navigate({ to: "/love-letter" })}
          Icon={Heart}
        />
      ) : null}
    </nav>
  );
}
