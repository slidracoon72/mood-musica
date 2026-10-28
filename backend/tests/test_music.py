import pytest
import requests
import music
from conftest import make_playlist, make_track


class FakeResponse:
    def __init__(self, data=None, status=200, json_error=False):
        self.data = data
        self.status = status
        self.json_error = json_error

    def raise_for_status(self):
        if self.status >= 400:
            raise requests.HTTPError(f'{self.status} error')

    def json(self):
        if self.json_error:
            raise ValueError('not JSON')
        return self.data


@pytest.fixture
def session(monkeypatch):
    """Replaces the HTTP session used by music._deezer_get."""
    class FakeSession:
        response = None

        def get(self, url, params=None, timeout=None):
            if isinstance(self.response, Exception):
                raise self.response
            return self.response

    fake = FakeSession()
    monkeypatch.setattr(music, '_get_session', lambda: fake)
    return fake


# --- _deezer_get ---

def test_deezer_get_returns_data(session):
    session.response = FakeResponse({'data': [1, 2]})
    assert music._deezer_get('search') == {'data': [1, 2]}


def test_deezer_error_code_800_is_not_found(session):
    session.response = FakeResponse({'error': {'type': 'DataException', 'message': 'no data', 'code': 800}})
    with pytest.raises(music.NotFoundError):
        music._deezer_get('track/1')


def test_other_deezer_errors_are_service_errors(session):
    session.response = FakeResponse({'error': {'message': 'Quota limit exceeded', 'code': 4}})
    with pytest.raises(music.MusicServiceError) as raised:
        music._deezer_get('search')
    assert not isinstance(raised.value, music.NotFoundError)


@pytest.mark.parametrize('response', [
    FakeResponse(status=503),
    FakeResponse(json_error=True),
    requests.ConnectionError('offline'),
])
def test_http_and_network_failures_are_service_errors(session, response):
    session.response = response
    with pytest.raises(music.MusicServiceError):
        music._deezer_get('search')


# --- get_song_for_emotion ---

def test_returns_song_from_editorial_playlist(deezer):
    deezer.responses['search/playlist'] = {'data': [
        make_playlist(1, owner='some_user'),
        make_playlist(2, owner='Laeti - Deezer Pop Editor'),
    ]}
    deezer.responses['playlist/2/tracks'] = {'data': [make_track(42, 'Happy', 'Pharrell Williams')]}

    song = music.get_song_for_emotion('happy')

    assert song == {
        'id': 42,
        'name': 'Happy',
        'artists': ['Pharrell Williams'],
        'thumbnail_url': 'https://cdn.example/42.jpg',
        'preview_url': 'https://cdnt-preview.dzcdn.net/42.mp3',
        'track_url': 'https://www.deezer.com/track/42',
        'emotion': 'happy',
    }
    assert 'playlist/1/tracks' not in deezer.calls


def test_uses_user_playlists_when_no_editorial_ones(deezer):
    deezer.responses['search/playlist'] = {'data': [make_playlist(1, owner='some_user')]}
    deezer.responses['playlist/1/tracks'] = {'data': [make_track(7)]}

    assert music.get_song_for_emotion('sad')['id'] == 7


def test_skips_seasonal_playlists(deezer):
    deezer.responses['search/playlist'] = {'data': [
        make_playlist(1, title='Christmas Calm Piano'),
        make_playlist(2, title='Calm Piano'),
    ]}
    deezer.responses['playlist/2/tracks'] = {'data': [make_track(9)]}

    assert music.get_song_for_emotion('angry')['id'] == 9
    assert 'playlist/1/tracks' not in deezer.calls


def test_only_returns_playable_tracks_with_previews(deezer):
    deezer.responses['search/playlist'] = {'data': [make_playlist(1)]}
    deezer.responses['playlist/1/tracks'] = {'data': [
        make_track(1, readable=False),
        make_track(2, preview=False),
        make_track(3),
    ]}

    assert music.get_song_for_emotion('neutral')['id'] == 3


def test_falls_back_to_track_search(deezer):
    deezer.responses['search/playlist'] = {'data': [make_playlist(1)]}
    deezer.responses['playlist/1/tracks'] = {'data': [make_track(1, readable=False)]}
    deezer.responses['search'] = {'data': [make_track(5)]}

    assert music.get_song_for_emotion('fearful')['id'] == 5


def test_returns_none_when_nothing_is_playable(deezer):
    deezer.responses['search/playlist'] = {'data': []}
    deezer.responses['search'] = {'data': []}

    assert music.get_song_for_emotion('disgusted') is None


def test_unknown_emotion_returns_none(deezer):
    assert music.get_song_for_emotion('bored') is None
    assert deezer.calls == []


def test_playlist_search_is_cached(deezer, monkeypatch):
    monkeypatch.setitem(music.mood_queries, 'happy', ['happy hits'])
    deezer.responses['search/playlist'] = {'data': [make_playlist(1)]}
    deezer.responses['playlist/1/tracks'] = {'data': [make_track(1)]}

    music.get_song_for_emotion('happy')
    music.get_song_for_emotion('happy')

    assert deezer.calls.count('search/playlist') == 1
    assert deezer.calls.count('playlist/1/tracks') == 2


def test_playlist_cache_expires(deezer, monkeypatch):
    monkeypatch.setitem(music.mood_queries, 'happy', ['happy hits'])
    deezer.responses['search/playlist'] = {'data': [make_playlist(1)]}
    deezer.responses['playlist/1/tracks'] = {'data': [make_track(1)]}
    clock = iter([0, music.PLAYLIST_CACHE_TTL + 1, music.PLAYLIST_CACHE_TTL + 1])
    monkeypatch.setattr(music.time, 'monotonic', lambda: next(clock))

    music.get_song_for_emotion('happy')
    music.get_song_for_emotion('happy')

    assert deezer.calls.count('search/playlist') == 2


# --- get_preview_url ---

def test_preview_url_for_readable_track(deezer):
    deezer.responses['track/42'] = make_track(42)
    assert music.get_preview_url(42) == 'https://cdnt-preview.dzcdn.net/42.mp3'


def test_no_preview_for_unreadable_track(deezer):
    deezer.responses['track/42'] = make_track(42, readable=False)
    assert music.get_preview_url(42) is None
