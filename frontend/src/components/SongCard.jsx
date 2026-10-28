import { youtubeSearchUrl } from '../services/songService';

// A saved song in the Suggested / Liked lists
const SongCard = ({ song, onToggleLike, onDelete }) => {
    const emotion = song.emotion ?? '';

    return (
        <div className="song-card">
            <div className={`emotion-label ${emotion.toLowerCase()}`}>{emotion.toUpperCase()}</div>
            <button type="button" className="icon-button like-icon" onClick={onToggleLike} aria-label={song.liked ? 'Unlike song' : 'Like song'}>
                <i className={`fa-heart ${song.liked ? 'fa-solid' : 'fa-regular'}`}></i>
            </button>
            <h4>
                <span className="song-name">{song.name} </span><span className="artist">by {(song.artists ?? []).join(', ')}</span>
            </h4>
            {song.thumbnail_url && (
                <a href={song.track_url} target="_blank" rel="noopener noreferrer" className="thumbnail-wrapper">
                    <img src={song.thumbnail_url} alt={song.name} style={{ width: '150px', borderRadius: '10px' }} />
                    <i className="fas fa-play play-icon"></i>
                </a>
            )}
            <a href={youtubeSearchUrl(song)} target="_blank" rel="noopener noreferrer" className="youtube-icon" aria-label="Listen on YouTube">
                <i className="fa-brands fa-youtube"></i>
            </a>
            {onDelete && (
                <button type="button" className="icon-button delete-icon" onClick={onDelete} aria-label="Delete song">
                    <i className="fas fa-trash"></i>
                </button>
            )}
        </div>
    );
};

export default SongCard;
