import { useEffect, useState } from 'react';
import { database } from '../firebase';
import { onValue, ref, remove, serverTimestamp, update } from 'firebase/database';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const SERVER_UNREACHABLE = 'Could not reach the Mood Musica server. Please try again shortly.';

// GETs a JSON endpoint of our API; errors carry a message fit to show the user
const apiGet = async (path) => {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`);
  } catch {
    throw new Error(SERVER_UNREACHABLE);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Our API always answers with JSON; anything else means the request did
    // not reach it (wrong URL, an outdated server, a proxy error page)
    if (!data) {
      console.error(`Unexpected ${response.status} response from ${path}; check VITE_API_URL and that the backend is up to date`);
    }
    throw new Error(data?.error || SERVER_UNREACHABLE);
  }
  return data;
};

export const fetchSongRecommendation = (emotion) =>
  apiGet(`/api/song?emotion=${encodeURIComponent(emotion)}`);

// Deezer preview URLs expire after ~15 minutes; this returns a fresh one
export const fetchPreviewUrl = async (trackId) =>
  (await apiGet(`/api/tracks/${encodeURIComponent(trackId)}/preview`)).preview_url;

// A YouTube search link for listening to the full song (no API key needed)
export const youtubeSearchUrl = (song) => {
  const query = [song.name, ...(song.artists ?? [])].join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

const songRef = (uid, songId) => ref(database, `users/${uid}/songs/${songId}`);

// Songs are keyed by Deezer track id, so a repeated suggestion updates the
// existing entry (keeping its liked status) instead of adding a duplicate.
// The preview URL is not stored because Deezer preview links expire.
export const saveSuggestedSong = (uid, song) => update(songRef(uid, song.id), {
  name: song.name,
  artists: song.artists,
  thumbnail_url: song.thumbnail_url || null,
  track_url: song.track_url,
  emotion: song.emotion,
  timestamp: serverTimestamp(),
});

export const setSongLiked = (uid, songId, liked) => update(songRef(uid, songId), { liked });

export const deleteSuggestedSong = (uid, songId) => remove(songRef(uid, songId));

// Subscribes to whether one saved song is a favorite (false if not saved)
export const useSongLiked = (uid, songId) => {
  // Remember which song the value belongs to, so switching songs never shows a stale heart
  const [result, setResult] = useState({ path: null, liked: false });
  const path = uid && songId ? `users/${uid}/songs/${songId}/liked` : null;

  useEffect(() => {
    if (!path) return undefined;

    return onValue(
      ref(database, path),
      (snapshot) => setResult({ path, liked: snapshot.val() === true }),
      (dbError) => console.error('Failed to load favorite status:', dbError)
    );
  }, [path]);

  return result.path === path && result.liked;
};

// Subscribes to the user's saved songs, newest first
export const useUserSongs = (uid) => {
  // Remember which user the loaded songs belong to, so switching users shows a loader
  const [result, setResult] = useState({ uid: null, songs: [], error: null });

  useEffect(() => {
    if (!uid) return undefined;

    return onValue(
      ref(database, `users/${uid}/songs`),
      (snapshot) => {
        const songsData = snapshot.val() || {};
        const songsList = Object.entries(songsData).map(([id, song]) => ({
          id,
          ...song,
          liked: song.liked === true,
        }));
        songsList.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
        setResult({ uid, songs: songsList, error: null });
      },
      (dbError) => {
        console.error('Failed to load songs:', dbError);
        setResult({ uid, songs: [], error: 'Could not load your songs.' });
      }
    );
  }, [uid]);

  if (!uid) return { songs: [], loading: false, error: null };
  if (result.uid !== uid) return { songs: [], loading: true, error: null };
  return { songs: result.songs, loading: false, error: result.error };
};
