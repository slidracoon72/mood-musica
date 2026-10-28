import pytest
import music
from app import create_app
from conftest import make_playlist, make_track

FRONTEND = 'http://localhost:5173'


@pytest.fixture
def happy_song(deezer):
    deezer.responses['search/playlist'] = {'data': [make_playlist(1)]}
    deezer.responses['playlist/1/tracks'] = {'data': [make_track(42, 'Happy', 'Pharrell Williams')]}
    return deezer


def test_health(client):
    assert client.get('/api/health').json == {'status': 'ok'}


# --- /api/song ---

def test_song_success(client, happy_song):
    response = client.get('/api/song?emotion=happy')

    assert response.status_code == 200
    assert response.json['name'] == 'Happy'
    assert response.json['emotion'] == 'happy'


@pytest.mark.parametrize('query', ['', '?emotion=', '?emotion=bored', '?emotion=HAPPY'])
def test_song_rejects_unknown_emotions(client, deezer, query):
    response = client.get(f'/api/song{query}')

    assert response.status_code == 400
    assert response.json == {'error': 'Unknown emotion'}
    assert deezer.calls == []


def test_song_not_found(client, deezer):
    deezer.responses['search/playlist'] = {'data': []}
    deezer.responses['search'] = {'data': []}

    response = client.get('/api/song?emotion=sad')

    assert response.status_code == 404


def test_song_upstream_failure_hides_details(client, deezer):
    deezer.responses['search/playlist'] = music.MusicServiceError('Deezer API error: secret internal detail')

    response = client.get('/api/song?emotion=sad')

    assert response.status_code == 502
    assert 'secret' not in response.get_data(as_text=True)


# --- /api/tracks/<id>/preview ---

def test_preview_success(client, deezer):
    deezer.responses['track/42'] = make_track(42)

    response = client.get('/api/tracks/42/preview')

    assert response.status_code == 200
    assert response.json == {'preview_url': 'https://cdnt-preview.dzcdn.net/42.mp3'}


def test_preview_missing_track(client, deezer):
    deezer.responses['track/42'] = music.NotFoundError('no data')
    assert client.get('/api/tracks/42/preview').status_code == 404


def test_preview_unreadable_track(client, deezer):
    deezer.responses['track/42'] = make_track(42, readable=False)
    assert client.get('/api/tracks/42/preview').status_code == 404


def test_preview_upstream_failure(client, deezer):
    deezer.responses['track/42'] = music.MusicServiceError('down')
    assert client.get('/api/tracks/42/preview').status_code == 502


@pytest.mark.parametrize('track_id', ['abc', '-1', '1.5', '..%2Fsearch'])
def test_preview_rejects_non_numeric_ids(client, deezer, track_id):
    assert client.get(f'/api/tracks/{track_id}/preview').status_code == 404
    assert deezer.calls == []


# --- CORS ---

def test_cors_allows_the_frontend(client, happy_song):
    response = client.get('/api/song?emotion=happy', headers={'Origin': FRONTEND})
    assert response.headers.get('Access-Control-Allow-Origin') == FRONTEND


def test_cors_rejects_other_origins(client, happy_song):
    response = client.get('/api/song?emotion=happy', headers={'Origin': 'https://evil.example'})
    assert 'Access-Control-Allow-Origin' not in response.headers


# --- Rate limiting ---

def limited_client(**limits):
    app = create_app({
        'RATE_LIMIT_SONG': '1000 per minute',
        'RATE_LIMIT_SONG_GLOBAL': '1000 per minute',
        'RATE_LIMIT_PREVIEW': '1000 per minute',
        'RATE_LIMIT_PREVIEW_GLOBAL': '1000 per minute',
        **limits,
    })
    return app.test_client()


def get_as(client, path, ip):
    return client.get(path, environ_base={'REMOTE_ADDR': ip}, headers={'Origin': FRONTEND})


def test_rate_limit_per_client(happy_song):
    client = limited_client(RATE_LIMIT_SONG='2 per minute')

    statuses = [get_as(client, '/api/song?emotion=happy', '1.1.1.1').status_code for _ in range(3)]
    other_client = get_as(client, '/api/song?emotion=happy', '2.2.2.2')

    assert statuses == [200, 200, 429]
    assert other_client.status_code == 200


def test_rate_limit_response_is_json_with_cors(happy_song):
    client = limited_client(RATE_LIMIT_SONG='1 per minute')
    get_as(client, '/api/song?emotion=happy', '1.1.1.1')

    response = get_as(client, '/api/song?emotion=happy', '1.1.1.1')

    assert response.status_code == 429
    assert 'error' in response.json
    assert response.headers.get('Access-Control-Allow-Origin') == FRONTEND
    assert 'Retry-After' in response.headers


def test_global_rate_limit_is_shared_by_all_clients(happy_song):
    client = limited_client(RATE_LIMIT_SONG_GLOBAL='2 per minute')

    statuses = [get_as(client, '/api/song?emotion=happy', f'10.0.0.{i}').status_code for i in range(3)]

    assert statuses == [200, 200, 429]


def test_preview_rate_limit(deezer):
    deezer.responses['track/42'] = make_track(42)
    client = limited_client(RATE_LIMIT_PREVIEW='1 per minute')

    statuses = [get_as(client, '/api/tracks/42/preview', '1.1.1.1').status_code for _ in range(2)]

    assert statuses == [200, 429]


def test_health_is_not_rate_limited():
    client = limited_client(RATE_LIMIT_SONG='1 per minute', RATE_LIMIT_PREVIEW='1 per minute')
    assert all(get_as(client, '/api/health', '1.1.1.1').status_code == 200 for _ in range(5))
