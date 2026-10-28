import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Values come from .env.local (see .env.example)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fail early with a clear message instead of Firebase's cryptic one
const missingKeys = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => key);
if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase config (${missingKeys.join(', ')}). Copy frontend/.env.example to frontend/.env.local and fill it in.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
