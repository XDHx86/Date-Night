/**
 * Environment variable utility functions
 * Provides type-safe access to environment variables
 */

// Vite exposes environment variables on import.meta.env
// Variables must be prefixed with VITE_ to be exposed to the client

export const env = {
  // TMDB API Configuration
  tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY || "",
  tmdbReadAccessToken: import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN || "",

  // Spotify Configuration
  spotifyPlaylistId: import.meta.env.VITE_SPOTIFY_PLAYLIST_ID || "",

  // Helper to check if TMDB is configured
  get isTmdbConfigured(): boolean {
    return !!this.tmdbApiKey && !!this.tmdbReadAccessToken;
  },

  // Helper to check if Spotify is configured
  get isSpotifyConfigured(): boolean {
    return !!this.spotifyPlaylistId;
  },
};

export default env;
