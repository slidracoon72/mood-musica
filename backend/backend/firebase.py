import firebase_admin
from firebase_admin import credentials, db
from flask import session

# Path to your Firebase private key JSON file
cred = credentials.Certificate('serviceAccountKey.json')

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://chat-gpt-4c586-default-rtdb.firebaseio.com/'
})


def store_song_in_firebase(song_data):
    ref = db.reference('suggested_songs')
    songs = ref.get()

    # Check if the song already exists in the database
    song_exists = any(
        song.get('name') == song_data['name'] and
        song.get('artists') == song_data['artists']
        for song in songs.values()
    ) if songs else False

    if not song_exists:
        ref.push(song_data)


def store_user_in_firebase(user_info):
    ref = db.reference('users')
    user_ref = ref.child(user_info['id'])
    user_ref.set(user_info)
    # Store the user ID in the session
    session['user_id'] = user_info['id']
