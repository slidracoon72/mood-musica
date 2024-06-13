import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyA8kGPRE8XhguDUs97QzoVhjVpfnXGMT2U",
    authDomain: "chat-gpt-4c586.firebaseapp.com",
    databaseURL: "https://chat-gpt-4c586-default-rtdb.firebaseio.com",
    projectId: "chat-gpt-4c586",
    storageBucket: "chat-gpt-4c586.appspot.com",
    messagingSenderId: "77673082845",
    appId: "1:77673082845:web:50aa8848899d55600c9034",
    measurementId: "G-DBB29LJCMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };
