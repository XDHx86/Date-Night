import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { initMutedFromStorage, isMuted, setMuted, sounds } from "@/lib/sound";

/** Floating speaker toggle. Audio is off by default; clicking enables cute blips. */
export function SoundToggle() {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    initMutedFromStorage();
    setMutedState(isMuted());
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sounds.pop();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sounds on" : "Turn sounds off"}
      className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-card/80 text-primary shadow-[var(--shadow-soft)] backdrop-blur transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
