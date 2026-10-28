import { MOODS } from '../moods';
import { youtubeSearchUrl } from '../services/songService';
import { relativeTime } from '../utils/time';

// A saved song in the History / Favorites grids
const SongTile = ({ song, onToggleLike, onDelete }) => {
    const mood = MOODS[song.emotion];
    const artists = (song.artists ?? []).join(', ');

    return (
        <article className="tile" style={{ '--mood': mood?.color }}>
            <a className="tile-cover" href={song.track_url} target="_blank" rel="noopener noreferrer" aria-label={`Play ${song.name} on Deezer`}>
                {song.thumbnail_url ? (
                    <img src={song.thumbnail_url} alt="" loading="lazy" />
                ) : (
                    <div className="cover-fallback"><i className="fa-solid fa-music" aria-hidden="true"></i></div>
                )}
                <span className="tile-play"><i className="fa-solid fa-play" aria-hidden="true"></i></span>
            </a>

            <div className="tile-body">
                <h3 className="tile-title" title={song.name}>{song.name}</h3>
                <p className="tile-artist" title={artists}>{artists}</p>
                <div className="tile-meta">
                    {mood && (
                        <span className="mood-chip mood-chip-sm">
                            <i className={`fa-solid ${mood.icon}`} aria-hidden="true"></i> {mood.label}
                        </span>
                    )}
                    <span className="tile-time">{relativeTime(song.timestamp)}</span>
                </div>
            </div>

            <div className="tile-actions">
                <button
                    type="button"
                    className={`icon-btn ${song.liked ? 'is-liked' : ''}`}
                    onClick={onToggleLike}
                    aria-pressed={song.liked}
                    aria-label={song.liked ? `Remove ${song.name} from favorites` : `Add ${song.name} to favorites`}
                >
                    <i className={`fa-heart ${song.liked ? 'fa-solid' : 'fa-regular'}`} aria-hidden="true"></i>
                </button>
                <a
                    className="icon-btn icon-btn-youtube"
                    href={youtubeSearchUrl(song)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Listen to ${song.name} on YouTube`}
                >
                    <i className="fa-brands fa-youtube" aria-hidden="true"></i>
                </a>
                {onDelete && (
                    <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={onDelete}
                        aria-label={`Remove ${song.name} from history`}
                    >
                        <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                    </button>
                )}
            </div>
        </article>
    );
};

export default SongTile;
