import requests
import random
from config import CLIENT_ID, CLIENT_SECRET, BASE_URL, REDIRECT_URI
from playlists import mood_playlists, suggestion_texts
from datetime import datetime
import base64


def get_spotify_token():
    auth_response = requests.post('https://accounts.spotify.com/api/token', {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    })
    auth_response_data = auth_response.json()
    return auth_response_data['access_token']


def get_song_from_spotify(emotion):
    token = get_spotify_token()
    headers = {
        'Authorization': f'Bearer {token}'
    }

    playlist_ids = mood_playlists.get(emotion)
    if not playlist_ids:
        return None

    # Choose a random playlist for the given emotion
    playlist_id = random.choice(playlist_ids)

    response = requests.get(f'{BASE_URL}playlists/{playlist_id}/tracks', headers=headers)
    tracks_data = response.json()

    if 'items' not in tracks_data:
        return None

    track = random.choice(tracks_data['items'])['track']
    return {
        'name': track['name'],
        'artists': [artist['name'] for artist in track['artists']],
        'thumbnail_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
        'preview_url': track['preview_url'],
        'spotify_url': track['external_urls']['spotify'],
        'suggestion_text': suggestion_texts.get(emotion, "Here's a song for you."),
        'emotion': emotion,
        'liked': False,
        'timestamp': datetime.now().timestamp()
    }


############
def get_spotify_authorize_url():
    scope = 'user-library-read user-read-email user-read-private'
    auth_url = f'https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope={scope}&redirect_uri={REDIRECT_URI}'
    return auth_url


def get_user_spotify_token(code):
    token_url = 'https://accounts.spotify.com/api/token'
    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    })
    return response.json()


def get_user_profile(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.get(f'{BASE_URL}me', headers=headers)
    return response.json()


# def get_user_top_tracks(user_id, access_token):
#     headers = {
#         'Authorization': f'Bearer {access_token}'
#     }
#     response = requests.get(f'{BASE_URL}users/{user_id}/top/tracks', headers=headers)
#     return response.json()


def get_spotify_token_code(code):
    auth_str = f'{CLIENT_ID}:{CLIENT_SECRET}'
    b64_auth_str = base64.urlsafe_b64encode(auth_str.encode()).decode()

    headers = {
        'Authorization': f'Basic {b64_auth_str}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }

    response = requests.post('https://accounts.spotify.com/api/token', headers=headers, data=data)

    if response.status_code != 200:
        print(f"Error getting Spotify token: {response.json()}")
        return None

    return response.json()
