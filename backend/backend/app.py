from flask import Flask
from flask_cors import CORS
import os


def create_app():
    app = Flask(__name__)
    app.secret_key = os.urandom(24)
    CORS(app, supports_credentials=True)

    with app.app_context():
        from routes import init_routes
        init_routes(app)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

# from flask import Flask
# app = Flask(__name__)
# @app.route('/')
# def hello_world():
#     return 'Hello, World!'
# if __name__ == '__main__':
#     app.run(debug=True)
