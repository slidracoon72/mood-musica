import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue, off, update } from 'firebase/database';
import { deleteSuggestedSong } from '../services/songService';
import Loader from '../assets/Loader';

const SuggestedSongs = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    let songsRef;

    useEffect(() => {
        songsRef = ref(database, 'suggested_songs');

        const handleValueChange = (snapshot) => {
            const songsData = snapshot.val();
            if (songsData) {
                const songsList = Object.keys(songsData).map(key => ({
                    id: key,
                    ...songsData[key],
                    liked: songsData[key].liked || false // Initialize liked status
                }));
                // Sort the songs by timestamp in descending order
                const sortedSongsList = songsList.sort((a, b) => b.timestamp - a.timestamp);
                setSongs(sortedSongsList);
            } else {
                setSongs([]);
            }
            setLoading(false); // Turn off the loader once data is fetched
        };

        onValue(songsRef, handleValueChange);

        // Cleanup listener on unmount
        return () => {
            if (songsRef) {
                off(songsRef, 'value', handleValueChange);
            }
        };
    }, []);

    const handleDeleteSong = async (songId) => {
        await deleteSuggestedSong(songId); // Call the delete function
        setSongs(songs.filter(song => song.id !== songId)); // Update local state
    };

    const handleLikeSong = async (songId) => {
        const updatedSongs = songs.map(song => {
            if (song.id === songId) {
                // Toggle liked status
                const liked = !song.liked;
                // Update liked status in the database
                update(ref(database, `suggested_songs/${songId}`), { liked });
                return { ...song, liked };
            }
            return song;
        });
        setSongs(updatedSongs); // Update local state
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h2 className='ss'>Suggested Songs 💿</h2>
            {loading ? (
                <Loader /> // Display loader while fetching songs
            ) : songs.length === 0 ? (
                <p style={{ color: '#fff' }}>Click "Start Mood Detection" for personalized song suggestions on Home Page!</p>// Message if no songs are in the database
            ) : (
                <div className="songs-list">
                    {songs.map(song => (
                        <div key={song.id} className="song-card">
                            <div className={`emotion-label ${song.emotion.toLowerCase()}`}>{song.emotion.toUpperCase()}</div>
                            <i className={`far fa-heart like-icon ${song.liked ? 'fa-solid' : 'fa-regular'}`} onClick={() => handleLikeSong(song.id)}></i> {/* Heart icon */}
                            <h4>
                                <span className="song-name">{song.name} </span><span className="artist">by {song.artists.join(', ')}</span>
                            </h4>
                            {song.thumbnail_url && (
                                <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className="thumbnail-wrapper">
                                    <img src={song.thumbnail_url} alt={song.name} style={{ width: '150px', borderRadius: '10px' }} />
                                    <i className="fas fa-play play-icon"></i>
                                </a>

                            )}
                            <i className="fas fa-trash delete-icon" onClick={() => handleDeleteSong(song.id)}></i>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuggestedSongs;
