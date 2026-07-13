import { useEffect } from "react";

/**
 * Embedded Spotify playlist player
 * Only shows if VITE_SPOTIFY_PLAYLIST_ID is set
 */
export function SpotifyEmbed() {
  const spotifyPlaylistId = import.meta.env.VITE_SPOTIFY_PLAYLIST_ID;

  useEffect(() => {
    if (!spotifyPlaylistId) return;
  }, [spotifyPlaylistId]);

  if (!spotifyPlaylistId) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">🎵 Date Night Playlist</h3>
        <p className="text-sm text-muted-foreground">Spotify</p>
      </div>

      <iframe
        src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
        width="100%"
        height="380"
        frameBorder="0"
        allow="encrypted-media"
        className="rounded-lg"
      />
    </div>
  );
}
