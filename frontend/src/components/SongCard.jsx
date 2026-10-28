// A saved song in the Suggested / Liked lists
const SongCard = ({ song, onToggleLike, onDelete }) => {
    const emotion = song.emotion ?? '';

    return (
        <div className="song-card">
            <div className={`emotion-label ${emotion.toLowerCase()}`}>{emotion.toUpperCase()}</div>
            <i className={`like-icon fa-heart ${song.liked ? 'fa-solid' : 'fa-regular'}`} onClick={onToggleLike}></i>
            <h4>
                <span className="song-name">{song.name} </span><span className="artist">by {(song.artists ?? []).join(', ')}</span>
            </h4>
            {song.thumbnail_url && (
                <a href={song.track_url} target="_blank" rel="noopener noreferrer" className="thumbnail-wrapper">
                    <img src={song.thumbnail_url} alt={song.name} style={{ width: '150px', borderRadius: '10px' }} />
                    <i className="fas fa-play play-icon"></i>
                </a>
            )}
            {onDelete && <i className="fas fa-trash delete-icon" onClick={onDelete}></i>}
        </div>
    );
};

export default SongCard;
