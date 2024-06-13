from flask import request, jsonify, redirect, session, url_for
from spotify import get_song_from_spotify, get_spotify_authorize_url, get_spotify_token_code, get_user_profile
from firebase import store_song_in_firebase, store_user_in_firebase


def init_routes(app):
    @app.route('/get_song', methods=['POST'])
    def get_song():
        data = request.json
        emotion = data['emotion']
        song = get_song_from_spotify(emotion)
        if song:
            # Send the song to the frontend
            response = jsonify(song)
            response.status_code = 200

            # Store the song in Firebase
            store_song_in_firebase(song)

            return response
        else:
            return jsonify({'error': 'Could not fetch song from Spotify'}), 500

    #################
    @app.route('/login')
    def login():
        auth_url = get_spotify_authorize_url()
        return redirect(auth_url)

    @app.route('/callback', methods=['POST'])
    def callback():
        data = request.get_json()
        code = data.get('code')

        if not code:
            return jsonify({'error': 'Authorization code not provided'}), 400

        try:
            token_info = get_spotify_token_code(code)
            session['token_info'] = token_info

            access_token = token_info['access_token']
            user_info = get_user_profile(access_token)
            store_user_in_firebase(user_info)
            # print(user_info)

            return jsonify({'success': True, 'user_info': user_info})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/logout')
    def logout():
        session.clear()
        return redirect(url_for('home'))

    @app.route('/home')
    def home():
        return jsonify({"message": "Welcome to Mood Musica!"})

    # #############
    # @app.route('/get_user_top_tracks', methods=['GET'])
    # def get_user_tracks():
    #     token_info = session.get('token_info')
    #     if not token_info:
    #         return jsonify({'error': 'Authorization token is missing'}), 401
    #
    #     access_token = token_info['access_token']
    #     user_id = session.get('user_id')
    #     if not user_id:
    #         return jsonify({'error': 'User ID is missing'}), 400
    #
    #     tracks = get_user_top_tracks(user_id, access_token)
    #     return jsonify(tracks)
    #
    # @app.route('/get_recent_user', methods=['GET'])
    # def get_recent_user():
    #     user_id = session.get('user_id')
    #     if not user_id:
    #         return jsonify({'error': 'No recent user logged in'}), 400
    #     ref = db.reference(f'users/{user_id}')
    #     user_info = ref.get()
    #     return jsonify(user_info)
