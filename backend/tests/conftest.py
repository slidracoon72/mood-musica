import pytest
import music
from app import create_app


def make_track(track_id, title='Song', artist='Artist', readable=True, preview=True):
    return {
        'id': track_id,
        'title': title,
        'artist': {'name': artist},
        'album': {'cover_big': f'https://cdn.example/{track_id}.jpg'},
        'link': f'https://www.deezer.com/track/{track_id}',
        'readable': readable,
        'preview': f'https://cdnt-preview.dzcdn.net/{track_id}.mp3' if preview else '',
    }


def make_playlist(playlist_id, owner='Laeti - Deezer Pop Editor', title='Happy Hits'):
    return {'id': playlist_id, 'title': title, 'user': {'name': owner}}


class FakeDeezer:
    """Stands in for music._deezer_get: maps API paths to canned responses."""

    def __init__(self):
        self.responses = {}
        self.calls = []

    def __call__(self, path, **params):
        self.calls.append(path)
        response = self.responses.get(path)
        if isinstance(response, Exception):
            raise response
        if response is None:
            raise AssertionError(f'Unexpected Deezer call: {path}')
        return response


@pytest.fixture(autouse=True)
def deterministic_random(monkeypatch):
    # Keep the given order and pick the first item, so a filter bug can't be
    # hidden by a lucky random pick
    monkeypatch.setattr(music.random, 'sample', lambda population, k: list(population)[:k])
    monkeypatch.setattr(music.random, 'choice', lambda sequence: sequence[0])


@pytest.fixture(autouse=True)
def clear_playlist_cache():
    music._playlist_cache.clear()
    yield
    music._playlist_cache.clear()


@pytest.fixture
def deezer(monkeypatch):
    fake = FakeDeezer()
    monkeypatch.setattr(music, '_deezer_get', fake)
    return fake


@pytest.fixture
def app():
    # Generous limits so only the rate limit tests hit them
    return create_app({
        'RATE_LIMIT_SONG': '1000 per minute',
        'RATE_LIMIT_SONG_GLOBAL': '1000 per minute',
        'RATE_LIMIT_PREVIEW': '1000 per minute',
        'RATE_LIMIT_PREVIEW_GLOBAL': '1000 per minute',
    })


@pytest.fixture
def client(app):
    return app.test_client()
