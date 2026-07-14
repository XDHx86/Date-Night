import { useEffect } from "react";

/**
 * Embedded Spotify playlist player — rendered as a glassy soundtrack card.
 *
 * Renders nothing unless `VITE_SPOTIFY_PLAYLIST_ID` is configured — the layout
 * below assumes a 380-px iframe, so we only show what would be helpful rather
 * than a half-finished player.
 */
export function SpotifyEmbed() {
  const spotifyPlaylistId = import.meta.env.VITE_SPOTIFY_PLAYLIST_ID;

  useEffect(() => {
    if (!spotifyPlaylistId) return;

    // Available hook for later analytics — kept intentionally quiet.
  }, [spotifyPlaylistId]);

  if (!spotifyPlaylistId) return null;

  return (
    <section className="mt-8 rounded-2xl p-4 shadow-[var(--shadow-sm)] glass">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-display text-base font-medium text-card-foreground">
          <span className="mr-1.5" aria-hidden>
            🎵
          </span>
          The soundtrack
        </h3>
        <p className="text-eyebrow text-muted-foreground">Spotify</p>
      </div>
      <iframe
        title="Spotify playlist — date night"
        src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
        width="100%"
        height="380"
        allow="encrypted-media"
        loading="lazy"
        className="rounded-xl"
      />
    </section>
  );
}
