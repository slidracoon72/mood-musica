from flask import request, jsonify
from music import get_song_for_emotion, MusicServiceError
from moods import mood_queries


def init_routes(app):
    @app.get('/api/song')
    def get_song():
        emotion = request.args.get('emotion', '')
        if emotion not in mood_queries:
            return jsonify({'error': 'Unknown emotion'}), 400

        try:
            song = get_song_for_emotion(emotion)
        except MusicServiceError:
            app.logger.exception('Failed to fetch song for %s', emotion)
            return jsonify({'error': 'Music service is unavailable, please try again'}), 502

        if not song:
            return jsonify({'error': 'No song found for this mood, please try again'}), 404
        return jsonify(song)

    @app.get('/api/health')
    def health():
        return jsonify({'status': 'ok'})
