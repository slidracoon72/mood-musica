# Gunicorn settings, used with: gunicorn -c gunicorn.conf.py wsgi:app
import os
from dotenv import load_dotenv

load_dotenv()

bind = f"{os.getenv('HOST', '127.0.0.1')}:{os.getenv('PORT', '5001')}"

# A single process keeps the in-memory rate limits and playlist cache shared.
# Threads handle concurrent requests, which mostly wait on Deezer. To run more
# processes, point RATELIMIT_STORAGE_URI at Redis first.
workers = int(os.getenv('WEB_WORKERS', '1'))
threads = int(os.getenv('WEB_THREADS', '8'))
timeout = 30
accesslog = '-'
