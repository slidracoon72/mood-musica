import { deleteSuggestedSong, setSongLiked, useUserSongs } from '../services/songService';
import { signIn, useAuthUser } from '../services/authService';
import Loader from '../assets/Loader';
import SongCard from './SongCard';

const SuggestedSongs = () => {
    const { user, loading: authLoading } = useAuthUser();
    const { songs, loading, error } = useUserSongs(user?.uid);

    const handleDeleteSong = (songId) => {
        deleteSuggestedSong(user.uid, songId).catch((dbError) => console.error('Failed to delete song:', dbError));
    };

    const handleLikeSong = (song) => {
        setSongLiked(user.uid, song.id, !song.liked).catch((dbError) => console.error('Failed to update song:', dbError));
    };

    let content;
    if (authLoading || loading) {
        content = <Loader />;
    } else if (!user) {
        content = <p style={{ color: '#fff' }}>Please <button type="button" className="login-link nav-button" onClick={signIn}>login</button> to see your suggested songs.</p>;
    } else if (error) {
        content = <p style={{ color: '#ff865c' }}>{error}</p>;
    } else if (songs.length === 0) {
        content = <p style={{ color: '#fff' }}>Click &quot;Start Mood Detection&quot; for personalized song suggestions on Home Page!</p>;
    } else {
        content = (
            <div className="songs-list">
                {songs.map(song => (
                    <SongCard
                        key={song.id}
                        song={song}
                        onToggleLike={() => handleLikeSong(song)}
                        onDelete={() => handleDeleteSong(song.id)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <h2 className='ss'>Suggested Songs 💿</h2>
            {content}
        </div>
    );
};

export default SuggestedSongs;
