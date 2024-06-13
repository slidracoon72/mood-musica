import { database } from '../firebase';
import { ref, remove } from 'firebase/database';

export const fetchSongRecommendation = async (emotion, setSong) => {
  const response = await fetch('http://localhost:5000/get_song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emotion })
  });

  const data = await response.json();
  setSong(data);
};

export const deleteSuggestedSong = async (songId) => {
  const songRef = ref(database, `suggested_songs/${songId}`);
  await remove(songRef);
};
