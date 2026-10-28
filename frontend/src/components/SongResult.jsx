import { useState } from 'react';
import { MOODS } from '../moods';
import { setSongLiked, youtubeSearchUrl } from '../services/songService';
import { signIn } from '../services/authService';
import { toast } from '../services/toastService';
import AudioPreview from './AudioPreview';

// The recommended song; render with key={song.id} so state resets per song
const SongResult = ({ song, user, onAnotherSong }) => {
    const mood = MOODS[song.emotion];
    const [liked, setLiked] = useState(false);

    const toggleLike = async () => {
        const nextLiked = !liked;
        setLiked(nextLiked);
        try {
            await setSongLiked(user.uid, song.id, nextLiked);
            toast(nextLiked ? 'Added to favorites' : 'Removed from favorites', 'success');
        } catch (error) {
            console.error('Failed to update favorite:', error);
            setLiked(!nextLiked);
            toast('Could not update favorites', 'error');
        }
    };

    return (
        <>
            <article className="result-card" style={{ '--mood': mood.color }}>
                {song.thumbnail_url ? (
                    <img className="result-cover" src={song.thumbnail_url} alt={`${song.name} cover art`} />
                ) : (
                    <div className="cover-fallback"><i className="fa-solid fa-music" aria-hidden="true"></i></div>
                )}

                <div className="result-body">
                    <div>
                        <span className="mood-chip">
                            <i className={`fa-solid ${mood.icon}`} aria-hidden="true"></i> {mood.label}
                        </span>
                    </div>
                    <p className="result-headline">{mood.headline}. {mood.blurb}</p>
                    <h2 className="result-title">{song.name}</h2>
                    <p className="result-artist">{song.artists.join(', ')}</p>

                    <AudioPreview song={song} />

                    <div className="result-actions">
                        <a className="btn btn-secondary" href={song.track_url} target="_blank" rel="noopener noreferrer">
                            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Deezer
                        </a>
                        <a className="btn btn-youtube" href={youtubeSearchUrl(song)} target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-youtube" aria-hidden="true"></i> YouTube
                        </a>
                        {user && (
                            <button
                                type="button"
                                className={`icon-btn ${liked ? 'is-liked' : ''}`}
                                onClick={toggleLike}
                                aria-pressed={liked}
                                aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <i className={`fa-heart ${liked ? 'fa-solid' : 'fa-regular'}`} aria-hidden="true"></i>
                            </button>
                        )}
                        <button type="button" className="btn btn-ghost" onClick={onAnotherSong}>
                            <i className="fa-solid fa-rotate-right" aria-hidden="true"></i> Another song
                        </button>
                    </div>
                </div>
            </article>

            {!user && (
                <p className="result-note">
                    <button type="button" className="link-button" onClick={signIn}>Sign in</button> to save songs to your history and favorites.
                </p>
            )}
        </>
    );
};

export default SongResult;
