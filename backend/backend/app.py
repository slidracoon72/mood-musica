from flask import Flask
from flask_cors import CORS
from config import FRONTEND_ORIGINS, PORT, DEBUG
from routes import init_routes


def create_app():
    app = Flask(__name__)
    CORS(app, origins=FRONTEND_ORIGINS)
    init_routes(app)
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(port=PORT, debug=DEBUG)
