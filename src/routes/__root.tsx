import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HeartExplosion } from "@/components/HeartExplosion";
import { FloatingDecorations } from "@/components/FloatingDecorations";
import { BottomControlBar } from "@/components/BottomControlBar";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { TopProgressBar } from "@/components/TopProgressBar";
import { Toaster } from "@/components/ui/sonner";
import { useDateStore } from "@/lib/store";
import { useShakeEffect } from "@/hooks/useShakeEffect";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { reportLovableError } from "@/lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <p className="text-eyebrow mb-3">Error 404</p>
        <h1 className="text-display text-5xl tracking-[-0.02em]">Not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[0.95rem] font-medium text-primary-foreground shadow-[var(--shadow-sm)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <p className="text-eyebrow mb-3">Something went sideways</p>
        <h1 className="text-display text-4xl tracking-[-0.02em]">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You can try refreshing or head back home to start over.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[0.95rem] font-medium text-primary-foreground shadow-[var(--shadow-sm)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-transparent px-5 text-[0.95rem] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [burst, setBurst] = useState(false);
  const lastShakeRef = useRef(0);
  const { isDarkMode } = useDateStore();

  // Shared, debounced love-bomb trigger — used by every easter-egg path
  // (mobile shake, desktop pointer-shake, typing "love"). 3 s debounce so a
  // flurry of input doesn't re-trigger before the burst finishes.
  const triggerBurst = () => {
    const now = Date.now();
    if (now - lastShakeRef.current < 3000) return;
    // Respect reduced-motion: the bomb is celebratory motion, so we hold fire.
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    lastShakeRef.current = now;
    setBurst(true);
    window.setTimeout(() => setBurst(false), 1500);
  };

  // Mobile: shake-to-burst.
  useShakeEffect(triggerBurst, { threshold: 25 });

  // Desktop hidden triggers — both unannounced (the joy is discovering them):
  //   - pointer-shake: rapid side-to-side cursor movement (variance over a
  //     short window),
  //   - typing "love": consecutively typing the word "love" anywhere that
  //     isn't a text field (so legit input isn't hijacked).
  useEffect(() => {
    if (typeof window === "undefined") return;

    // --- Pointer-shake detection -------------------------------------------
    const samples: { t: number; x: number; y: number }[] = [];
    const window_ = 650; // ms rolling window
    const onMove = (e: PointerEvent) => {
      const t = performance.now();
      samples.push({ t, x: e.clientX, y: e.clientY });
      // drop stale samples
      while (samples.length && samples[0].t < t - window_) samples.shift();
      if (samples.length < 6) return;
      // direction reversals on x + total path length = a shake
      let reversals = 0;
      let path = 0;
      for (let i = 1; i < samples.length; i++) {
        const dx = samples[i].x - samples[i - 1].x;
        const dy = samples[i].y - samples[i - 1].y;
        path += Math.abs(dx) + Math.abs(dy);
        if (i >= 2) {
          const prev = samples[i - 1].x - samples[i - 2].x;
          if (prev !== 0 && Math.sign(dx) !== Math.sign(prev) && Math.abs(dx) > 4) reversals++;
        }
      }
      if (reversals >= 4 && path >= 360) {
        samples.length = 0; // reset so one shake fires once
        triggerBurst();
      }
    };

    // --- Type-"love" detection ---------------------------------------------
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      // Don't fire while the user is genuinely typing in a field/letters.
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();
      if (!/[a-z]/.test(ch)) return;
      typed = (typed + ch).slice(-4);
      if (typed === "love") {
        typed = "";
        triggerBurst();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Sync dark mode with the document root – keeps CSS variables in sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Background audio — the synthesized ambient pad + SFX gate, driven from
  // the store's audio flag, with an unlock-after-first-interaction fallback.
  useBackgroundAudio();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Living, route-aware gradient mesh — the app's breathing atmosphere. */}
      <AmbientBackdrop />

      {/* Floating hearts, seasonal glyphs, and the cursor sparkle trail -
          all decoration, all pointer-events-none + aria-hidden. */}
      <FloatingDecorations />

      {/* Persistent, layout-level progress indicator. Renders nothing
          on /success so the celebration page stays uncluttered. */}
      <TopProgressBar />

      {/* Easter-egg love-bomb (shake / pointer-shake / typing "love"). Idle
          while nothing is triggering it. */}
      <HeartExplosion active={burst} />

      <Outlet />

      {/* Slim, bottom-pinned control bar. */}
      <BottomControlBar />

      <Toaster />
    </QueryClientProvider>
  );
}
