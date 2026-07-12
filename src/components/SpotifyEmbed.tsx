import { useEffect } from "react";

/**
 * Embedded Spotify playlist player
 * Only shows if VITE_SPOTIFY_PLAYLIST_ID is set
 */
export function SpotifyEmbed() {
  const spotifyPlaylistId = import.meta.env.VITE_SPOTIFY_PLAYLIST_ID;

  // If no playlist ID is set, don't render anything
  if (!spotifyPlaylistId) {
    return null;
  }

  useEffect(() => {
    // Optional: You could add some analytics or logging here
    console.log("Spotify embed loaded for playlist:", spotifyPlaylistId);
  }, [spotifyPlaylistId]);

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-card-foreground">🎵 Date Night Playlist</h3>
        <p className="text-sm text-muted-foreground">
          Spotify
        </p>
      </div>
      <iframe
        src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
        width="100%"
        height="380"
        frameBorder="0"
        allowTransparency={true}
        allow="encrypted-media"
        className="rounded-lg"
      ></iframe>
    </div>
  );
}