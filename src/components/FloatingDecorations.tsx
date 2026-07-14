import { memo } from "react";
import { FloatingBackground } from "./FloatingBackground";
import { SparkleTrail } from "./SparkleTrail";

interface Props {
  /** Base particle count. Denser than the default for a richer, more cinematic feel. */
  count?: number;
}

/**
 * Persistent floating decoration layer mounted once at the app root.
 *
 * - Mounted once — never recreated on route navigation (no flicker).
 * - A denser particle field than the per-page default, for a richer feel.
 * - The sparkle trail renders above the particles so cursor/touch feedback
 *   always reads clearly.
 * - Both children are `pointer-events-none` + `aria-hidden`, and both respect
 *   `prefers-reduced-motion` + pause while the tab is hidden.
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
