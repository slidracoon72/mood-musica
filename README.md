# Mood-Musica
Welcome to Mood-Musica! This project is a facial emotion detection-based music recommendation system that suggests songs based on your detected mood. It's a full-stack application with a frontend built in React.js, a backend in Python Flask, and Firebase for sign-in and storing your song history.

## Live Demo Link:
https://drive.google.com/file/d/12LzXyRqfZdRUQ6kCnNsn8qXCqpbc8X36/view?usp=sharing

> The demo shows the original Spotify version. Song recommendations now come from the free [Deezer API](https://developers.deezer.com/api), since Spotify's Web API is no longer usable for this kind of app without a Premium subscription.

## How it works
1. Emotion detection runs entirely in your browser with [face-api](https://github.com/vladmandic/face-api). Webcam images are never uploaded.
2. Once the same emotion is detected for 2 seconds, the frontend asks the Flask backend for a song. No webcam? Pick a mood by hand instead.
3. The backend searches Deezer for playlists matching that mood and returns a random track with a 30-second preview.
4. Listen to the preview, open the full song on Deezer or YouTube, or ask for another song in the same mood.
5. If you are signed in with Google, songs are saved to your **History**, and hearted songs to **Favorites**.

## Setup

### 1. Firebase (one time)
1. In the [Firebase console](https://console.firebase.google.com/), open your project (or create one) and add a **Web app**.
2. **Authentication > Sign-in method**: enable **Google**.
3. **Realtime Database**: create a database, then deploy the security rules from this repo:
   ```
   npm install -g firebase-tools
   firebase login
   firebase deploy --only database --project <your-project-id>
   ```
   (Or paste the contents of `database.rules.json` into the **Rules** tab.)

### 2. Backend
```
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
cd backend
../venv/bin/python app.py
```
The API runs on http://localhost:5001. Settings are optional; see `backend/.env.example`.

### 3. Frontend
Requires Node 20.19 or newer.
```
cd frontend
cp .env.example .env.local   # then fill in your Firebase web app config
npm install
npm run dev
```
Open http://localhost:5173.

## Security notes
- Never commit `.env`, `.env.local` or Firebase service-account keys; they are ignored by `.gitignore`.
- The backend holds no secrets. Users can only read and write their own data, enforced by `database.rules.json`.
- Run the backend with `FLASK_DEBUG=0` (the default) on any machine reachable from a network.
