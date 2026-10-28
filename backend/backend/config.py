import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DEEZER_API_URL = 'https://api.deezer.com'
REQUEST_TIMEOUT = 10  # seconds

# Comma-separated list of origins allowed to call this API
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv('FRONTEND_ORIGINS', 'http://localhost:5173').split(',')
    if origin.strip()
]

# Port 5000 is taken by AirPlay Receiver on macOS, so default to 5001
PORT = int(os.getenv('PORT', '5001'))

# Never enable debug mode on a machine reachable from the network
DEBUG = os.getenv('FLASK_DEBUG') == '1'
