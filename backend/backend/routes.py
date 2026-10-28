from flask import request, jsonify
from music import get_song_for_emotion, get_preview_url, MusicServiceError, NotFoundError
from moods import mood_queries


# Key for limits shared by all clients
def _all_clients():
    return 'all-clients'


def init_routes(app, limiter):
    @app.get('/api/song')
    @limiter.limit(lambda: app.config['RATE_LIMIT_SONG'])
    @limiter.limit(lambda: app.config['RATE_LIMIT_SONG_GLOBAL'], key_func=_all_clients)
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

    @app.get('/api/tracks/<int:track_id>/preview')
    @limiter.limit(lambda: app.config['RATE_LIMIT_PREVIEW'])
    @limiter.limit(lambda: app.config['RATE_LIMIT_PREVIEW_GLOBAL'], key_func=_all_clients)
    def get_track_preview(track_id):
        try:
            preview_url = get_preview_url(track_id)
        except NotFoundError:
            preview_url = None
        except MusicServiceError:
            app.logger.exception('Failed to fetch preview for track %s', track_id)
            return jsonify({'error': 'Music service is unavailable, please try again'}), 502

        if not preview_url:
            return jsonify({'error': 'No preview is available for this song'}), 404
        return jsonify({'preview_url': preview_url})

    @app.get('/api/health')
    def health():
        return jsonify({'status': 'ok'})
