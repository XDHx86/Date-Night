import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useMemo, useState, type ReactNode, type ReactElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { format, isValid, parseISO } from "date-fns";
import {
  Check,
  Star,
  Clock,
  Calendar,
  Sparkles,
  Crown,
  ChevronRight,
  Globe,
  Flame,
  Loader2,
  X,
} from "lucide-react";
import { getMovieById, type Movie } from "@/lib/movies";
import { tmdbImage } from "@/lib/tmdbImages";
import { AnimatedButton } from "./AnimatedButton";
import { cn } from "@/lib/utils";

const FALLBACK_GRADIENT = "linear-gradient(160deg, oklch(0.55 0.05 40), oklch(0.35 0.05 250))";

const POSTER_URL = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;

/**
 * Best-effort, locale-safe formatting of a movie's release date for the modal.
 * Prefers the full TMDB date (parsed as local via `parseISO` so a UTC/island
 * timezone never slides it onto the wrong day), falls back to the year, and
 * returns `null` when neither is known — so the caller can just omit the row
 * instead of rendering an empty chip.
 */
function formatReleaseDate(releaseDate: string | null | undefined, year: number): string | null {
  if (releaseDate) {
    const parsed = parseISO(releaseDate);
    if (isValid(parsed)) return format(parsed, "MMM d, yyyy");
  }
  return year > 0 ? String(year) : null;
}

/**
 * Human-readable language label from a TMDB `original_language` code (e.g.
 * "en" -> "English"). Uses the platform `Intl.DisplayNames` when present,
 * degrading to the uppercased code. Returns `null` for a missing code so the
 * modal renders nothing for it. Resolves the constructor through a typed shim
 * rather than naming `Intl.DisplayNames` directly, so this compiles even if
 * the configured TS `lib` doesn't declare the API.
 */
function languageName(code: string | null | undefined): string | null {
  if (!code) return null;
  const DisplayNames = (
    Intl as unknown as {
      DisplayNames?: new (
        locales: string | string[],
        options: { type: "language"; fallback: "code" | "none" },
      ) => { of: (code: string) => string | undefined };
    }
  ).DisplayNames;
  if (DisplayNames) {
    try {
      const name = new DisplayNames(["en"], { type: "language", fallback: "code" }).of(code);
      if (name) return name;
    } catch {
      // fall through to the raw code
    }
  }
  return code.toUpperCase();
}

/**
 * Whether the current pointer is hover-capable and fine (a real mouse).
 * Frozen false in SSR/jsdom (`matchMedia` absent) and on touch devices,
 * which is exactly the calm fallback we want for the tilt.
 */
function useHoverFinePointer(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    try {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    } catch {
      return false;
    }
  }, []);
}

function Poster({ movie, zoom }: { movie: Movie; zoom: boolean }) {
  const [imageError, setImageError] = useState(false);

  if (movie.poster_path && !imageError) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted">
        <img
          src={POSTER_URL(movie.poster_path)}
          alt={`${movie.title} poster`}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            zoom && "transition-transform duration-500 ease-out group-hover:scale-[1.06]",
          )}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/5"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[2/3] w-full overflow-hidden rounded-xl"
      style={{ backgroundImage: FALLBACK_GRADIENT }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/5"
        aria-hidden
      />
    </div>
  );
}

/**
 * Editorial "Recommended" / "Classic" badge — shared by the card and the modal
 * so the two surfaces stay in sync. Positioning is passed in so each surface
 * owns its own corner.
 */
function CategoryBadge({
  category,
  className,
}: {
  category: "recommended" | "classic";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-semibold text-play shadow-[var(--shadow-md)] ring-1 ring-white/30",
        category === "recommended"
          ? "bg-[image:var(--gradient-romance)] text-primary-foreground ring-white/40"
          : "bg-[image:linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-accent-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full",
          category === "recommended"
            ? "bg-white/25 text-primary-foreground"
            : "bg-accent-foreground/15 text-accent-foreground",
        )}
        aria-hidden
      >
        {category === "recommended" ? (
          <Sparkles className="h-3 w-3" />
        ) : (
          <Crown className="h-3 w-3" />
        )}
      </span>
      {category === "recommended" ? "Recommended" : "Classic"}
    </span>
  );
}

/**
 * "Read more" affordance — the keyboard-accessible trigger that opens the
 * details modal. The accessible name is kept to "Read more" (it does not echo
 * the title) so it never collides with journey-style selectors that locate a
 * film by clicking a button named after the title.
 */
function ReadMoreLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group/rm inline-flex w-fit items-center gap-1 self-start rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      Read more
      <ChevronRight
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover/rm:translate-x-0.5"
        aria-hidden
      />
    </button>
  );
}

interface MovieCardProps {
  movie: Movie;
  selected?: boolean;
  onChoose: (movie: Movie) => void;
  /** Hide the description (kept for the dense-picker use-case). */
  compact?: boolean;
  /** Optional editorial badge — first picks lead, the tail earns "Classic". */
  category?: "recommended" | "classic";
}

/**
 * Movie card — the rich, poster-led picker tile.
 *
 * Glass surface, a "Recommended" (Sparkles) / "Classic" (Crown) editorial
 * badge top-left, a bold rating seal bottom-right, poster hover-zoom, and a
 * per-card pointer-follow tilt (sprang, ±6°) that stays frozen on touch and
 * under reduced-motion. The selected card swaps the thin ring for a pulsing
 * rose-glow halo.
 *
 * The badge and rating live in opposite poster corners so they never crowd
 * each other on narrow cards; the Choose button is anchored to the card foot
 * with `mt-auto` so a row of cards shares a clean baseline.
 *
 * Clicking anywhere on the card surface — or the explicit "Read more" link —
 * opens an animated details modal that expands to show the full description
 * and every metadata field. The Choose button opts out: it stops propagation
 * so selecting a film never pops the modal. The card surface itself is a
 * mouse/touch affordance; keyboard users reach the same modal through the
 * focusable "Read more" link (the article is deliberately not given a
 * `role="button"` to avoid nesting one interactive control inside another).
 */
export function MovieCard({
  movie,
  selected = false,
  onChoose,
  compact = false,
  category,
}: MovieCardProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const canTilt = useHoverFinePointer() && !prefersReduced;
  const [open, setOpen] = useState(false);

  // Pointer-follow tilt: pointer position within the card (-0.5..0.5) is
  // mapped to a ±6° rotation on each axis and eased through a spring so it
  // glides instead of snapping. Reset to neutral on leave.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 18 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 18 });

  const handleMove = canTilt
    ? (e: React.PointerEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const w = r.width || 1;
        const h = r.height || 1;
        mx.set((e.clientX - r.left) / w - 0.5);
        my.set((e.clientY - r.top) / h - 0.5);
      }
    : undefined;
  const handleLeave = canTilt
    ? () => {
        mx.set(0);
        my.set(0);
      }
    : undefined;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onClick={() => setOpen(true)}
        style={canTilt ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1000 } : undefined}
        className={cn(
          "group relative flex cursor-pointer flex-col gap-3 rounded-2xl glass p-4 text-left shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]",
          selected && "animate-glow",
        )}
      >
        <div className="relative">
          <Poster movie={movie} zoom />

          {category ? (
            <CategoryBadge category={category} className="absolute left-3 top-3 z-20" />
          ) : null}

          <span
            className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full glass-strong px-2.5 py-1 shadow-[var(--shadow-md)] ring-1 ring-white/30"
            aria-label={`Rated ${movie.rating.toFixed(1)} out of 10`}
          >
            <Star
              className="h-4 w-4 shrink-0 fill-accent-2 text-accent-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
              aria-hidden
            />
            <span className="text-base font-bold leading-none tabular-nums text-card-foreground">
              {movie.rating.toFixed(1)}
            </span>
            <span
              className="text-[10px] font-semibold leading-none text-muted-foreground"
              aria-hidden
            >
              /10
            </span>
            <span className="sr-only">out of 10</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-display text-balance break-words text-lg leading-tight text-card-foreground sm:text-xl">
            {movie.title}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {movie.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full glass px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {!compact && movie.description ? (
            <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              {movie.description}
            </p>
          ) : null}

          <ReadMoreLink onClick={() => setOpen(true)} />

          <div className="mt-1 flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden /> {movie.year}
            </span>
            {movie.duration > 0 ? (
              <>
                <span className="text-muted-foreground/40" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> {movie.duration}m
                </span>
              </>
            ) : null}
          </div>

          <AnimatedButton
            type="button"
            size="sm"
            variant={selected ? "soft" : "yes"}
            className="mt-auto w-full"
            onClick={(e) => {
              // Keep the modal closed when picking the film — the card surface
              // opens the modal, but the Choose button should select, not peek.
              e.stopPropagation();
              onChoose(movie);
            }}
          >
            {selected ? (
              <>
                <Check className="h-4 w-4" aria-hidden /> Chosen
              </>
            ) : (
              "Choose"
            )}
          </AnimatedButton>
        </div>
      </motion.article>

      <MovieDetailsDialog
        movie={movie}
        category={category}
        selected={selected}
        open={open}
        onOpenChange={setOpen}
        onChoose={onChoose}
      />
    </>
  );
}

/**
 * Optional cinematic backdrop banner across the modal's top — rendered only when
 * the movie actually carries a backdrop path, so it never leaves an empty band.
 * On image error it collapses away; the poster column still supplies artwork, so
 * the modal stays fully populated regardless.
 */
function BackdropHero({ movie }: { movie: Movie }) {
  const [imageError, setImageError] = useState(false);
  if (!movie.backdrop_path || imageError) return null;
  const src = tmdbImage(movie.backdrop_path, "w1280");
  if (!src) return null;
  return (
    <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-48">
      <img
        src={src}
        alt={`${movie.title} backdrop`}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={() => setImageError(true)}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
        aria-hidden
      />
    </div>
  );
}

/**
 * Renders only the metadata chips a movie actually has, joined by dot
 * separators — so a missing field just disappears (no dangling "·", no empty
 * row). Keeps the modal honest about what the dataset carries.
 */
function MetaLine({ children }: { children: ReactNode }) {
  const items = (Array.isArray(children) ? children : [children]).filter(
    (item): item is ReactElement => item !== null && item !== undefined && item !== false,
  );
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
          ) : null}
          {item}
        </Fragment>
      ))}
    </div>
  );
}

/** Release-year-or-date chip; renders nothing when the movie carries neither. */
function CalendarMeta({
  releaseDate,
  year,
}: {
  releaseDate: string | null | undefined;
  year: number;
}) {
  const label = formatReleaseDate(releaseDate, year);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Calendar className="h-3.5 w-3.5" aria-hidden /> {label}
    </span>
  );
}

/** Original-language chip; renders nothing when the movie carries no language. */
function LanguageMeta({ code }: { code: string | null | undefined }) {
  const label = languageName(code);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Globe className="h-3.5 w-3.5" aria-hidden /> {label}
    </span>
  );
}

/**
 * The details modal — opens from the MovieCard via the surface click or the
 * "Read more" link. Built on Radix Dialog for portal, focus-trap, scroll-lock,
 * Escape, and aria, with hand-authored keyframe animations (see styles.css) so
 * the panel expands and the backdrop fades with the romance spring instead of
 * the stock zoom. Renders the full, untruncated description, every genre tag,
 * and all metadata, plus a "Choose this film" action that selects and closes.
 */
function MovieDetailsDialog({
  movie,
  category,
  selected,
  open,
  onOpenChange,
  onChoose,
}: {
  movie: Movie;
  category?: "recommended" | "classic";
  selected: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (movie: Movie) => void;
}) {
  // Search-result movies arrive without runtime — `/search/movie` omits it, so
  // `duration` is 0. Only then do we fetch the heavier `/movie/{id}` details
  // (one request, cached in movies.ts) so the modal can show the runtime without
  // making every card pay that cost. `view` is what we render: the enriched
  // detail when we have one, otherwise the movie the card was passed. `detail`
  // is a complete `Movie` (runtime + full genres from the details endpoint), so
  // we use it directly rather than merging.
  const [enriched, setEnriched] = useState<Movie | null>(null);
  const [enriching, setEnriching] = useState(false);
  const view: Movie = enriched ?? movie;
  const { id: movieId, duration: movieDuration } = movie;

  useEffect(() => {
    // No need to look anything up until the modal is open, and never when the
    // card already carries a runtime (curated recommendations are full).
    if (!open || movieDuration > 0) return;
    let cancelled = false;
    setEnriching(true);
    getMovieById(movieId)
      .then((detail) => {
        if (cancelled) return;
        // null / failure → leave `view` as the search movie; the runtime row
        // just stays omitted rather than showing a placeholder.
        if (detail) setEnriched(detail);
      })
      .finally(() => {
        if (!cancelled) setEnriching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, movieId, movieDuration]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm data-[state=open]:animate-modal-backdrop-in data-[state=closed]:animate-modal-backdrop-out" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 flex max-h-[88dvh] w-[calc(100vw-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl glass-strong shadow-[var(--shadow-lg)] data-[state=open]:animate-modal-pop-in data-[state=closed]:animate-modal-pop-out">
          <DialogPrimitive.Close className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full glass text-card-foreground/70 transition-colors hover:text-card-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <BackdropHero movie={view} />

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto sm:grid-cols-[220px_1fr]">
            <div className="relative h-44 w-full overflow-hidden sm:h-auto sm:min-h-[24rem]">
              {view.poster_path ? (
                <img
                  src={POSTER_URL(view.poster_path)}
                  alt={`${view.title} poster`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: FALLBACK_GRADIENT }}
                  aria-hidden
                />
              )}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/5 sm:bg-gradient-to-r sm:from-black/25 sm:via-transparent sm:to-transparent"
                aria-hidden
              />
              {category ? (
                <CategoryBadge category={category} className="absolute left-3 top-3 z-10" />
              ) : null}
            </div>

            <div className="flex flex-col gap-3 p-5 sm:p-6">
              <MetaLine>
                <span
                  className="inline-flex items-center gap-1"
                  aria-label={`Rated ${view.rating.toFixed(1)} out of 10`}
                >
                  <Star className="h-3.5 w-3.5 shrink-0 fill-accent-2 text-accent-2" aria-hidden />
                  <span className="font-bold tabular-nums text-card-foreground">
                    {view.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground/70" aria-hidden>
                    /10
                  </span>
                </span>

                {/* Vote count — appended only when known, so a missing value
                    simply disappears instead of dangling a "0 votes" chip. */}
                {view.voteCount != null && view.voteCount > 0 ? (
                  <span
                    className="inline-flex items-center gap-1"
                    aria-label={`${view.voteCount.toLocaleString()} ${view.voteCount === 1 ? "vote" : "votes"}`}
                  >
                    <span className="tabular-nums">{view.voteCount.toLocaleString()}</span>
                    <span className="text-muted-foreground/70">
                      {view.voteCount === 1 ? "vote" : "votes"}
                    </span>
                  </span>
                ) : null}

                <CalendarMeta releaseDate={view.releaseDate} year={view.year} />

                {view.duration > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden /> {view.duration}m
                  </span>
                ) : enriching ? (
                  // Runtime loads on demand for search results; until it
                  // resolves, a tiny spinner holds the slot so nothing shifts.
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin text-muted-foreground"
                    aria-label="Loading runtime"
                  />
                ) : null}

                <LanguageMeta code={view.originalLanguage} />
              </MetaLine>

              {/* Popularity — a subtle, separate line, shown only when known so
                  0 / unknown omits cleanly. */}
              {view.popularity != null && view.popularity > 0 ? (
                <MetaLine>
                  <span
                    className="inline-flex items-center gap-1"
                    aria-label={`Popularity ${view.popularity.toLocaleString(undefined, { maximumFractionDigits: 1 })}`}
                  >
                    <Flame className="h-3.5 w-3.5 text-accent-2" aria-hidden />
                    <span className="tabular-nums text-muted-foreground">
                      {view.popularity < 100
                        ? view.popularity.toFixed(1)
                        : Math.round(view.popularity).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground/70">popularity</span>
                  </span>
                </MetaLine>
              ) : null}

              <DialogPrimitive.Title className="text-display text-balance text-2xl leading-tight text-card-foreground sm:text-3xl">
                {view.title}
              </DialogPrimitive.Title>

              {/* Original title — only when it differs from the localized one
                  (foreign titles shown under the English release). */}
              {view.originalTitle &&
              view.originalTitle.trim().toLowerCase() !== view.title.trim().toLowerCase() ? (
                <p className="text-xs italic text-muted-foreground/80">
                  Originally: <span className="not-italic">{view.originalTitle}</span>
                </p>
              ) : null}

              {view.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {view.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full glass px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <DialogPrimitive.Description className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {view.description?.trim() ? (
                  view.description
                ) : (
                  <span className="sr-only">No overview available for this title.</span>
                )}
              </DialogPrimitive.Description>

              <div className="mt-auto pt-2">
                <AnimatedButton
                  type="button"
                  variant={selected ? "soft" : "yes"}
                  className="w-full"
                  onClick={() => {
                    onChoose(movie);
                    onOpenChange(false);
                  }}
                >
                  {selected ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden /> Chosen
                    </>
                  ) : (
                    "Choose this film"
                  )}
                </AnimatedButton>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
