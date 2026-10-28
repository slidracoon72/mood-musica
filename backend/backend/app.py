from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from config import (
    FRONTEND_ORIGINS, PORT, DEBUG, TRUSTED_PROXIES, RATELIMIT_STORAGE_URI,
    RATE_LIMIT_SONG, RATE_LIMIT_SONG_GLOBAL, RATE_LIMIT_PREVIEW, RATE_LIMIT_PREVIEW_GLOBAL,
)
from routes import init_routes


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.update(
        RATE_LIMIT_SONG=RATE_LIMIT_SONG,
        RATE_LIMIT_SONG_GLOBAL=RATE_LIMIT_SONG_GLOBAL,
        RATE_LIMIT_PREVIEW=RATE_LIMIT_PREVIEW,
        RATE_LIMIT_PREVIEW_GLOBAL=RATE_LIMIT_PREVIEW_GLOBAL,
        RATELIMIT_STORAGE_URI=RATELIMIT_STORAGE_URI,
        RATELIMIT_HEADERS_ENABLED=True,
    )
    app.config.update(config_overrides or {})

    if TRUSTED_PROXIES:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=TRUSTED_PROXIES)

    CORS(app, origins=FRONTEND_ORIGINS)
    limiter = Limiter(get_remote_address, app=app)
    init_routes(app, limiter)

    @app.errorhandler(429)
    def too_many_requests(_error):
        return jsonify({'error': 'Too many requests, please wait a moment and try again'}), 429

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(port=PORT, debug=DEBUG)
