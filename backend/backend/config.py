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

# Rate limits (Flask-Limiter syntax). Per-client limits stop one visitor from
# hammering the API; the global caps keep total traffic under Deezer's limit of
# roughly 50 requests per 5 seconds per server IP.
RATE_LIMIT_SONG = os.getenv('RATE_LIMIT_SONG', '20 per minute')
RATE_LIMIT_SONG_GLOBAL = os.getenv('RATE_LIMIT_SONG_GLOBAL', '100 per minute')
RATE_LIMIT_PREVIEW = os.getenv('RATE_LIMIT_PREVIEW', '60 per minute')
RATE_LIMIT_PREVIEW_GLOBAL = os.getenv('RATE_LIMIT_PREVIEW_GLOBAL', '200 per minute')

# memory:// keeps counters in the process; use e.g. redis://localhost:6379 to
# share them between several server processes
RATELIMIT_STORAGE_URI = os.getenv('RATELIMIT_STORAGE_URI', 'memory://')

# Number of reverse proxies (e.g. nginx) in front of the app. When set, the
# client IP used for rate limiting is read from X-Forwarded-For.
TRUSTED_PROXIES = int(os.getenv('TRUSTED_PROXIES', '0'))
