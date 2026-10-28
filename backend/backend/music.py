import random
import time
import requests
from config import DEEZER_API_URL, REQUEST_TIMEOUT
from moods import mood_queries, suggestion_texts, excluded_playlist_words

# How many matching playlists to try before falling back to a track search
MAX_PLAYLIST_ATTEMPTS = 3

# Playlist search results rarely change, so cache them per query. Track lists
# are not cached because their preview URLs expire.
PLAYLIST_CACHE_TTL = 60 * 60  # seconds
_playlist_cache = {}

# Reuse connections to Deezer across requests
_session = requests.Session()


class MusicServiceError(Exception):
    pass


def _deezer_get(path, **params):
    try:
        response = _session.get(f'{DEEZER_API_URL}/{path}', params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError) as e:
        raise MusicServiceError(f'Deezer request failed: {e}') from e

    # Deezer reports errors with HTTP 200 and an "error" object
    if 'error' in data:
        raise MusicServiceError(f"Deezer API error: {data['error'].get('message', 'unknown')}")
    return data


def _playable(tracks):
    return [t for t in tracks if t.get('readable') and t.get('preview')]


def _is_editorial(playlist):
    # Playlists curated by Deezer's staff editors, e.g. "Laeti - Deezer Pop Editor"
    owner = playlist.get('user', {}).get('name', '').lower()
    return 'editor' in owner or 'deezer' in owner


def _is_seasonal(playlist):
    title = playlist.get('title', '').lower()
    return any(word in title for word in excluded_playlist_words)


def _search_playlists(query):
    cached = _playlist_cache.get(query)
    if cached and time.monotonic() - cached[0] < PLAYLIST_CACHE_TTL:
        return cached[1]

    playlists = [p for p in _deezer_get('search/playlist', q=query, limit=25).get('data', []) if not _is_seasonal(p)]
    # Prefer editorial playlists; user playlists often don't match the mood
    playlists = [p for p in playlists if _is_editorial(p)] or playlists
    _playlist_cache[query] = (time.monotonic(), playlists)
    return playlists


def _pick_track(query):
    playlists = _search_playlists(query)

    for playlist in random.sample(playlists, min(MAX_PLAYLIST_ATTEMPTS, len(playlists))):
        tracks = _deezer_get(f"playlist/{playlist['id']}/tracks", limit=100).get('data', [])
        candidates = _playable(tracks)
        if candidates:
            return random.choice(candidates)

    # No usable playlist: search tracks directly
    candidates = _playable(_deezer_get('search', q=query, limit=50).get('data', []))
    return random.choice(candidates) if candidates else None


def get_song_for_emotion(emotion):
    queries = mood_queries.get(emotion)
    if not queries:
        return None

    track = _pick_track(random.choice(queries))
    if track is None:
        return None

    return {
        'id': track['id'],
        'name': track['title'],
        'artists': [track['artist']['name']],
        'thumbnail_url': track.get('album', {}).get('cover_medium') or None,
        'preview_url': track['preview'],
        'track_url': track['link'],
        'suggestion_text': suggestion_texts[emotion],
        'emotion': emotion,
    }
