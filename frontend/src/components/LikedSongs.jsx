import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue, off, update } from 'firebase/database';
import Loader from '../assets/Loader';

const LikedSongs = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    let songsRef;

    useEffect(() => {
        songsRef = ref(database, 'suggested_songs');

        const handleValueChange = (snapshot) => {
            const songsData = snapshot.val();
            if (songsData) {
                const likedSongs = Object.keys(songsData)
                    .filter(key => songsData[key].liked === true)
                    .map(key => ({
                        id: key,
                        ...songsData[key]
                    }));
                // Sort the liked songs by timestamp in descending order
                const sortedLikedSongs = likedSongs.sort((a, b) => b.timestamp - a.timestamp);
                setSongs(sortedLikedSongs);
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


    const handleUnlikeSong = async (songId) => {
        // Remove the unliked song from the list
        const updatedSongs = songs.filter(song => song.id !== songId);
        setSongs(updatedSongs);

        // Update liked status in the database
        update(ref(database, `suggested_songs/${songId}`), { liked: false });
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h2 className='ss'>Liked Songs ❤️</h2>
            {loading ? (
                <Loader /> // Display loader while fetching songs
            ) : songs.length === 0 ? (
                <p style={{ color: '#fff' }}>No liked songs yet!</p>// Message if no liked songs are found
            ) : (
                <div className="songs-list">
                    {songs.map(song => (
                        <div key={song.id} className="song-card">
                            <div className={`emotion-label ${song.emotion.toLowerCase()}`}>{song.emotion.toUpperCase()}</div>
                            <i className={`far fa-heart like-icon fa-${song.liked ? 'solid' : 'regular'}`} onClick={() => handleUnlikeSong(song.id)}></i> {/* Toggle between filled and regular heart icon */}
                            <h4>
                                <span className="song-name">{song.name} </span><span className="artist">by {song.artists.join(', ')}</span>
                            </h4>
                            {song.thumbnail_url && (
                                <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className="thumbnail-wrapper">
                                    <img src={song.thumbnail_url} alt={song.name} style={{ width: '150px', borderRadius: '10px' }} />
                                    <i className="fas fa-play play-icon"></i>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedSongs;
