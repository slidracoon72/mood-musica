import random
import requests
from config import DEEZER_API_URL, REQUEST_TIMEOUT
from moods import mood_queries, suggestion_texts

# How many matching playlists to try before falling back to a track search
MAX_PLAYLIST_ATTEMPTS = 3


class MusicServiceError(Exception):
    pass


def _deezer_get(path, **params):
    try:
        response = requests.get(f'{DEEZER_API_URL}/{path}', params=params, timeout=REQUEST_TIMEOUT)
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


def _pick_track(query):
    playlists = _deezer_get('search/playlist', q=query, limit=25).get('data', [])
    random.shuffle(playlists)

    for playlist in playlists[:MAX_PLAYLIST_ATTEMPTS]:
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
        'thumbnail_url': track['album'].get('cover_medium'),
        'preview_url': track['preview'],
        'track_url': track['link'],
        'suggestion_text': suggestion_texts[emotion],
        'emotion': emotion,
    }
