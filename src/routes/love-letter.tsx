import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ArrowRight, Shuffle } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Surface } from "@/components/ui/card";
import { HeartBurst } from "@/components/HeartBurst";
import { TextArea } from "@/components/ui/field";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { useUrlSync } from "@/hooks/useUrlSync";
import { toast } from "sonner";
import { loveLetters, type Category, type LoveLetter as LoveLetterData } from "@/data/loveLetters";
import { getActiveLoveLetterCategory } from "@/lib/loveLetterConfig";

export const Route = createFileRoute("/love-letter")({
  component: LoveLetter,
});

/* ----------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------------
 */

const pickRandomLetter = (category: Category, excludeId?: string): LoveLetterData => {
  const pool = loveLetters[category];
  if (excludeId && pool.length > 1) {
    const filtered = pool.filter((l) => l.id !== excludeId);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
};

const CATEGORY_LABELS: Record<Category, string> = {
  default: "Everyday Love",
  birthday: "Birthday Wishes",
  anniversary: "Anniversary Notes",
  valentine: "Valentine's Day",
};

/**
 * Love letter — choose, shuffle, or write your own.
 *
 * Editorial vocabulary throughout: a Chip row for the curated
 * letters, a single Surface holds the reading panel (and the inline
 * editor when writing your own), and a restrained action row below.
 * The canvas-based love-card export is untouched — only the chrome
 * around it moved to the new design system.
 */
function LoveLetter() {
  const navigate = useNavigate();
  const { loveMessage, setLoveMessage } = useDateStore();
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(loveMessage);
  const [isSharing, setIsSharing] = useState(false);

  // Hidden peek-sparkle over the letter — a tiny twinkle for hover/long-press.
  const [peek, setPeek] = useState(false);
  const [peekKey, setPeekKey] = useState(0);
  const peekTimer = useRef<number | undefined>(undefined);
  const firePeek = useCallback(() => {
    sounds.twinkle();
    setPeekKey((k) => k + 1);
    setPeek(true);
    window.setTimeout(() => setPeek(false), 900);
  }, []);
  const onLetterEnter = firePeek;
  const onLetterDown = () => {
    peekTimer.current = window.setTimeout(firePeek, 450);
  };
  const onLetterUp = () => {
    if (peekTimer.current !== undefined) {
      window.clearTimeout(peekTimer.current);
      peekTimer.current = undefined;
    }
  };

  // Resolve the active category once on mount (env-driven).
  const [category] = useState<Category>(() => getActiveLoveLetterCategory());

  // The letter starts as `null` on the server / first client render - we
  // pick a random one **after** hydration to avoid server/client mismatch.
  const [currentLetter, setCurrentLetter] = useState<LoveLetterData | null>(
    () => loveLetters[category]?.[0] ?? null,
  );

  // Use centralized URL sync
  const { syncUrl, syncState } = useUrlSync();

  // The set of available letters for the active category - memoized.
  const availableLetters = useMemo<LoveLetterData[]>(() => loveLetters[category], [category]);

  // Sync state from URL on mount
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Whenever the category changes (e.g. env var changes between mounts),
  // pick a fresh letter from that category.
  useEffect(() => {
    setCurrentLetter(pickRandomLetter(category));
  }, [category]);

  // Keep the textarea in sync with external loveMessage updates.
  useEffect(() => {
    setInputValue(loveMessage);
  }, [loveMessage]);

  // Sync URL when loveMessage changes
  useEffect(() => {
    syncUrl();
  }, [loveMessage, syncUrl]);

  /* --------------------------------------------------------------------------
   * Letter interactions
   * -----------------------------------------------------------------------
   */

  const chooseLetter = useCallback(
    (letter: LoveLetterData) => {
      setCurrentLetter(letter);
      setLoveMessage(letter.content);
      setInputValue(letter.content);
    },
    [setLoveMessage],
  );

  const handleShuffle = useCallback(() => {
    const next = pickRandomLetter(category, currentLetter?.id);
    setCurrentLetter(next);
    setLoveMessage(next.content);
    setInputValue(next.content);
  }, [category, currentLetter?.id, setLoveMessage]);

  const handleSave = useCallback(() => {
    setLoveMessage(inputValue);
    setEditMode(false);
    sounds.celebrate();
  }, [inputValue, setLoveMessage]);

  const handleCancel = useCallback(() => {
    setInputValue(loveMessage);
    setEditMode(false);
  }, [loveMessage]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInputValue(val);
      setLoveMessage(val);
    },
    [setLoveMessage],
  );

  /* --------------------------------------------------------------------------
   * Share-as-image logic (unchanged from previous version)
   * -----------------------------------------------------------------------
   */

  const createLoveCardImage = async (message: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const width = 800;
      const height = 600;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#fdf6e3");
      gradient.addColorStop(1, "#f5deb3");
      ctx.fillStyle = gradient;

      const radius = 20;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(width - radius, 0);
      ctx.quadraticCurveTo(width, 0, width, radius);
      ctx.lineTo(width, height - radius);
      ctx.quadraticCurveTo(width, height, width - radius, height);
      ctx.lineTo(radius, height);
      ctx.quadraticCurveTo(0, height, 0, height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e8d8b3";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#5d4037";
      ctx.font = '24px "Comic Sans MS", cursive, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = message.split("\n");
      const lineHeight = 32;
      const startY = height / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;

      lines.forEach((line, lineIndex) => {
        const words = line.split(" ");
        let currentLine = "";
        let lineY = startY + lineIndex * lineHeight;

        for (const word of words) {
          const testLine = currentLine + word + " ";
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > width - 40 && currentLine) {
            ctx.fillText(currentLine, width / 2, lineY);
            currentLine = word + " ";
            lineY += lineHeight;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          ctx.fillText(currentLine.trim(), width / 2, lineY);
        }
      });

      ctx.fillStyle = "#e91e63";
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.bezierCurveTo(30, 30, 30, 10, 40, 0);
      ctx.bezierCurveTo(50, 10, 50, 30, 40, 40);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width - 40, height - 40);
      ctx.bezierCurveTo(width - 30, height - 30, width - 30, height - 10, width - 40, height);
      ctx.bezierCurveTo(width - 50, height - 10, width - 50, height - 30, width - 40, height - 40);
      ctx.closePath();
      ctx.fill();

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create blob"));
        }
      }, "image/png");
    });
  };

  const handleShareLoveCard = async () => {
    if (!loveMessage.trim()) {
      toast.error("Please add a love message first!");
      return;
    }

    setIsSharing(true);
    try {
      const blob = await createLoveCardImage(loveMessage);

      const file = new File([blob], "love-card.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Our Love Card",
          text: "Check out our special love card!",
          files: [file],
        });
        toast.success("Love card shared!");
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "love-card.png";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Love card downloaded!");
      }
    } catch (err) {
      console.error("Error sharing love card:", err);
      toast.error("Failed to create or share love card");
    } finally {
      setIsSharing(false);
    }
  };

  /* --------------------------------------------------------------------------
   * UI
   * -----------------------------------------------------------------------
   */

  return (
    <PageShell width="default">
      <Eyebrow>A love letter</Eyebrow>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-display text-balance text-4xl leading-[1.1] tracking-[-0.02em] sm:text-5xl"
      >
        Your love letter
      </motion.h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
        {CATEGORY_LABELS[category]} &mdash; choose, shuffle, or write your own.
      </p>

      {/* Letter selector — the curated letters for the active category. */}
      <div className="mt-8 flex w-full max-w-xl flex-col gap-2.5">
        <span className="text-eyebrow">Choose one</span>
        <div className="flex flex-wrap gap-2">
          {availableLetters.map((letter) => (
            <Chip
              key={letter.id}
              selected={currentLetter?.id === letter.id}
              onSelect={() => chooseLetter(letter)}
            >
              {letter.title}
            </Chip>
          ))}
        </div>
      </div>

      {/* Reading panel — holds the letter, or the inline editor. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 w-full max-w-xl"
      >
        <Surface pad="loose" glass className="relative text-left">
          {editMode ? (
            <div className="flex flex-col gap-4">
              <TextArea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Write your love message here..."
                aria-label="Love message"
                className="min-h-[10rem] text-left"
              />
              <div className="flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            currentLetter && (
              <motion.div
                key={currentLetter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative cursor-default whitespace-pre-line text-center text-lg font-medium leading-relaxed text-card-foreground"
                style={{ fontFamily: currentLetter.font }}
                onPointerEnter={onLetterEnter}
                onPointerDown={onLetterDown}
                onPointerUp={onLetterUp}
                onPointerLeave={onLetterUp}
              >
                {currentLetter.content}
                {/* Hidden peek-sparkle — a single twinkle on hover/long-press. */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <HeartBurst key={peekKey} active={peek} variant="peek" pieces={1} />
                </div>
              </motion.div>
            )
          )}
        </Surface>

        {/* Slim toolbar: the letters font + a shuffle shortcut. */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Set in <span className="italic">{currentLetter?.font}</span>
          </p>
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4" aria-hidden /> Another letter
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex w-full max-w-md flex-col gap-3"
      >
        <Button variant="primary" onClick={handleShareLoveCard} disabled={isSharing}>
          {isSharing ? "Sharing…" : "Share love card"}
        </Button>
        <div className="flex flex-wrap gap-3">
          {!editMode ? (
            <Button variant="outline" onClick={() => setEditMode(true)} className="flex-1">
              Edit message
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => navigate({ to: "/summary" })} className="flex-1">
            Back to date plan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </motion.div>
    </PageShell>
  );
}
