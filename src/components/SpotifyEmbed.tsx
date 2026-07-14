import { useEffect } from "react";

/**
 * Embedded Spotify playlist player.
 *
 * Renders nothing unless `VITE_SPOTIFY_PLAYLIST_ID` is configured —
 * the layout below assumes a 380-px iframe, so we only show what
 * would be helpful rather than a half-finished player.
 */
export function SpotifyEmbed() {
  const spotifyPlaylistId = import.meta.env.VITE_SPOTIFY_PLAYLIST_ID;

  if (!spotifyPlaylistId) return null;

  useEffect(() => {
    // Available hook for later analytics — kept intentionally quiet.
  }, [spotifyPlaylistId]);

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-display text-base font-medium text-card-foreground">The soundtrack</h3>
        <p className="text-eyebrow text-muted-foreground">Spotify</p>
      </div>
      <iframe
        title="Spotify playlist — date night"
        src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
        width="100%"
        height="380"
        allow="encrypted-media"
        className="rounded-md"
      />
    </section>
  );
}
