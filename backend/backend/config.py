import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
BASE_URL = 'https://api.spotify.com/v1/'

APP_BASE_URL = os.getenv('APP_BASE_URL')
REDIRECT_URI = f'{APP_BASE_URL}/callback'
