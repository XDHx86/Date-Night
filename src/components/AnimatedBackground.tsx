import { useEffect } from "react";

/**
 * Animated background with a slowly shifting gradient
 */
export function AnimatedBackground({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
} = {}) {
  // Add the keyframes for the gradient animation if not already added
  useEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById("animated-background-styles");
    if (existing) return;
    const style = document.createElement("style");
    style.id = "animated-background-styles";
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[-1] pointer-events-none",
        className
      )}
      style={{
        background:
          "linear-gradient(120deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%, #fbc2eb 100%)",
        backgroundSize: "300% 300%",
        animation: "gradientShift 15s ease infinite",
        ...style,
      }}
    >
      {/* Content will be layered on top by the parent */}
    </div>
  );
}