import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const Route = createFileRoute("/love-letter")({
  component: LoveLetter,
});

function LoveLetter() {
  const navigate = useNavigate();
  const { loveMessage, setLoveMessage } = useDateStore();
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(loveMessage);

  // Load the love message from store on mount
  useEffect(() => {
    setInputValue(loveMessage);
  }, [loveMessage]);

  const handleSave = () => {
    setLoveMessage(inputValue);
    setEditMode(false);
    sounds.celebrate();
  };

  const handleCancel = () => {
    setInputValue(loveMessage);
    setEditMode(false);
  };

  return (
    <PageShell>
      {/* Animated background */}
      <AnimatedBackground className="pointer-events-none" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            💌 Your Love Letter 💌
          </h1>
          <p className="text-lg text-muted-foreground">
            A special message just for them
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
          {editMode ? (
            <div className="space-y-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Write your love message here..."
                className="w-full min-h-[120px] rounded-border p-3 border-border focus:outline-none focus:ring-2 focus:ring-ring text-lg"
              />
              <div className="flex justify-end space-x-3">
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="yes"
                  size="sm"
                  onClick={handleSave}
                >
                  Save
                </AnimatedButton>
              </div>
            </div>
          ) : (
            <div className="text-center text-lg font-medium text-card-foreground leading-relaxed">
              {loveMessage}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <AnimatedButton
            variant={editMode ? "ghost" : "yes"}
            size="md"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Exit Edit" : "Edit Message"}
          </AnimatedButton>

          <AnimatedButton
            variant="gold"
            size="md"
            onClick={() => navigate({ to: "/success" })}
          >
            Back to Date Plan <ArrowRight className="h-4 w-4" />
          </AnimatedButton>
        </div>

        <div className="mt-8 text-center">
          <HeartBurst active={false} pieces={10} className="inline" />
          <Heart className="h-6 w-6 text-primary/50" />
          <span className="text-xs text-muted-foreground">
            Edit anytime to keep your words fresh
          </span>
          <Heart className="h-6 w-6 text-primary/50" />
        </div>
      </div>
    </PageShell>
  );
}