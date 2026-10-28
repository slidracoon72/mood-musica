import { setSongLiked, useUserSongs } from '../services/songService';
import { signIn, useAuthUser } from '../services/authService';
import Loader from '../assets/Loader';
import SongCard from './SongCard';

const LikedSongs = () => {
    const { user, loading: authLoading } = useAuthUser();
    const { songs, loading, error } = useUserSongs(user?.uid);
    const likedSongs = songs.filter(song => song.liked);

    const handleUnlikeSong = (songId) => {
        setSongLiked(user.uid, songId, false).catch((dbError) => console.error('Failed to update song:', dbError));
    };

    let content;
    if (authLoading || loading) {
        content = <Loader />;
    } else if (!user) {
        content = <p style={{ color: '#fff' }}>Please <button type="button" className="login-link nav-button" onClick={signIn}>login</button> to see your liked songs.</p>;
    } else if (error) {
        content = <p style={{ color: '#ff865c' }}>{error}</p>;
    } else if (likedSongs.length === 0) {
        content = <p style={{ color: '#fff' }}>No liked songs yet!</p>;
    } else {
        content = (
            <div className="songs-list">
                {likedSongs.map(song => (
                    <SongCard key={song.id} song={song} onToggleLike={() => handleUnlikeSong(song.id)} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <h2 className='ss'>Liked Songs ❤️</h2>
            {content}
        </div>
    );
};

export default LikedSongs;
