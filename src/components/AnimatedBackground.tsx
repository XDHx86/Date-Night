import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Animated background with a slowly shifting gradient
 * Now includes fade-in/fade-out transitions to prevent flashing on route changes.
 */
export function AnimatedBackground({
  className = "",
  style = {},
  variant = "default",
}: {
  className?: string;
  style?: React.CSSProperties;
  variant?: "default" | "love" | "movie" | "date" | "success" | "summary" | "begging" | "confirmation" | "time";
} = {}) {
  // Add the keyframes for the gradient animation if not already added
  useEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById("animated-background-styles");
    if (existing) return;
    const style = document.createElement("style");
    style.id = "animated-background-styles";
    // Define multiple gradients for different variants
    style.textContent = `
      @keyframes gradientShiftDefault {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftLove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftMovie {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftDate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftSuccess {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftBegging {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftConfirmation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftTime {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes gradientShiftSummary {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Define gradient styles for each variant
  const getGradientStyle = (v: string) => {
    switch (v) {
      case "love":
        return {
          background:
            "linear-gradient(120deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%, #fbc2eb 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftLove 15s ease infinite",
        };
      case "movie":
        return {
          background:
            "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #a1c4fd 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftMovie 18s ease infinite",
        };
      case "date":
        return {
          background:
            "linear-gradient(120deg, #f6d365 0%, #fda085 50%, #f6d365 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftDate 12s ease infinite",
        };
      case "success":
        return {
          background:
            "linear-gradient(120deg, #84fab0 0%, #8fd3f4 50%, #84fab0 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftSuccess 20s ease infinite",
        };
      case "begging":
        return {
          background:
            "linear-gradient(120deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%, #fbc2eb 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftBegging 16s ease infinite",
        };
      case "confirmation":
        return {
          background:
            "linear-gradient(120deg, #a8edea 0%, #fed6e3 50%, #a8edea 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftConfirmation 14s ease infinite",
        };
      case "time":
        return {
          background:
            "linear-gradient(120deg, #ff9a9e 0%, #fecfef 50%, #ff9a9e 100%, #fecfef 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftTime 17s ease infinite",
        };
      case "summary":
        return {
          background:
            "linear-gradient(120deg, #d4fc79 0%, #96e6a1 50%, #d4fc79 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftSummary 19s ease infinite",
        };
      default:
        return {
          background:
            "linear-gradient(120deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%, #fbc2eb 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShiftDefault 15s ease infinite",
        };
    }
  };

  const gradientStyle = getGradientStyle(variant);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("fixed inset-0 z-[-1] pointer-events-none", className)}
      style={{
        ...gradientStyle,
        ...style,
      }}
    >
      {/* Content will be layered on top by the parent */}
    </motion.div>
  );
}