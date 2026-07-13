import { memo } from "react";
import { FloatingBackground } from "./FloatingBackground";
import { SparkleTrail } from "./SparkleTrail";

interface Props {
  /** Base particle count. Decoration is denser than the PageShell default. */
  count?: number;
}

/**
 * Persistent floating decoration layer that lives at the app root.
 *
 * - Mounted once — never re‑created on route navigation (no flicker).
 * - Higher particle density for a richer, more cinematic feel.
 * - Sparkle trail is rendered above particles so the cursor/touch feedback
 *   always reads clearly.
 */
function FloatingDecorationsBase({ count = 40 }: Props) {
  return (
    <>
      <FloatingBackground count={count} />
      <SparkleTrail />
    </>
  );
}

export const FloatingDecorations = memo(FloatingDecorationsBase);
