import { MOODS } from '../moods';
import { youtubeSearchUrl } from '../services/songService';
import { playSong, usePlayer } from '../services/playerService';
import { relativeTime } from '../utils/time';
import Spinner from './Spinner';

// A saved song in the History / Favorites grids; the cover plays its preview
const SongTile = ({ song, onToggleLike, onDelete }) => {
    const player = usePlayer();
    const isCurrent = player.song?.id === song.id;
    const playing = isCurrent && player.playing;
    const mood = MOODS[song.emotion];
    const artists = (song.artists ?? []).join(', ');

    let playIcon = <i className="fa-solid fa-play" aria-hidden="true"></i>;
    if (isCurrent && player.loading) playIcon = <Spinner label="Loading preview" />;
    else if (playing) playIcon = <i className="fa-solid fa-pause" aria-hidden="true"></i>;

    return (
        <article className={`tile ${isCurrent ? 'is-current' : ''}`} style={{ '--mood': mood?.color }}>
            <button
                type="button"
                className={`tile-cover ${playing ? 'is-playing' : ''}`}
                onClick={() => playSong(song)}
                aria-label={playing ? `Pause ${song.name}` : `Play preview of ${song.name}`}
            >
                {song.thumbnail_url ? (
                    <img src={song.thumbnail_url} alt="" loading="lazy" />
                ) : (
                    <div className="cover-fallback"><i className="fa-solid fa-music" aria-hidden="true"></i></div>
                )}
                <span className="tile-play">{playIcon}</span>
            </button>

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
                    className="icon-btn"
                    href={song.track_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${song.name} on Deezer`}
                >
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </a>
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
