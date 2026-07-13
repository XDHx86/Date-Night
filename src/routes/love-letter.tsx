import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Heart, Sparkles, ArrowRight, Shuffle } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
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

function LoveLetter() {
  const navigate = useNavigate();
  const { loveMessage, setLoveMessage } = useDateStore();
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(loveMessage);
  const [isSharing, setIsSharing] = useState(false);

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
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gradient mb-2">💌 Your Love Letter 💌</h1>
          <p className="text-lg text-muted-foreground">
            {CATEGORY_LABELS[category]} — choose, shuffle, or write your own.
          </p>
        </div>

        {/* Letter selector - only the six letters for the active category */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {availableLetters.map((letter) => {
              const isCurrent = currentLetter?.id === letter.id;
              return (
                <button
                  key={letter.id}
                  onClick={() => chooseLetter(letter)}
                  className={`px-3 py-1.5 rounded-full border border-border/50 text-sm font-medium transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/60 hover:bg-primary/10"
                  }`}
                >
                  {letter.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: shuffle / info */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">Category</span>{" "}
            <span className="uppercase tracking-wide">{category}</span>{" "}
            <span className="opacity-70">|</span> <span className="font-semibold">Font</span>{" "}
            <span className="italic">{currentLetter?.font}</span>
          </div>
          <AnimatedButton variant="no" size="sm" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4" />
            Another letter
          </AnimatedButton>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
          {editMode ? (
            <div className="space-y-4">
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Write your love message here..."
                className="w-full min-h-[120px] rounded-xl p-3 border-border focus:outline-none focus:ring-2 focus:ring-ring text-lg"
              />
              <div className="flex justify-end space-x-3">
                <AnimatedButton variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton variant="yes" size="sm" onClick={handleSave}>
                  Save
                </AnimatedButton>
              </div>
            </div>
          ) : (
            currentLetter && (
              <motion.div
                key={currentLetter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="whitespace-pre-line text-center text-lg font-medium leading-relaxed text-card-foreground"
                style={{ fontFamily: currentLetter.font }}
              >
                {currentLetter.content}
              </motion.div>
            )
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <AnimatedButton variant="no" size="md" onClick={handleShareLoveCard} disabled={isSharing}>
            {isSharing ? "Sharing..." : "Share Love Card 💖"}
          </AnimatedButton>
          <AnimatedButton
            variant={editMode ? "ghost" : "yes"}
            size="md"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Exit Edit" : "Edit Message"}
          </AnimatedButton>
          <AnimatedButton variant="gold" size="md" onClick={() => navigate({ to: "/summary" })}>
            Back to Date Plan <ArrowRight className="h-4 w-4" />
          </AnimatedButton>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <HeartBurst active={false} pieces={10} />
          <Heart className="h-5 w-5 text-primary/50" />
          <span className="text-xs">Edit any time to keep your words fresh</span>
          <Heart className="h-5 w-5 text-primary/50" />
        </div>
      </div>
    </PageShell>
  );
}
