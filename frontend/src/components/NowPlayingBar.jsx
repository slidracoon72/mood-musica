import { MOODS } from '../moods';
import { seek, stopPlayback, togglePlayback, usePlayer } from '../services/playerService';
import { formatDuration } from '../utils/time';
import Spinner from './Spinner';

// Deezer previews are 30 seconds long
const PREVIEW_LENGTH = 30;

// Persistent mini player shown while a preview is loaded
const NowPlayingBar = () => {
    const { song, playing, loading, currentTime, duration } = usePlayer();
    if (!song) return null;

    const mood = MOODS[song.emotion];
    const total = duration || PREVIEW_LENGTH;

    let icon = <i className="fa-solid fa-play" aria-hidden="true"></i>;
    if (loading) icon = <Spinner label="Loading preview" />;
    else if (playing) icon = <i className="fa-solid fa-pause" aria-hidden="true"></i>;

    return (
        <div className="now-playing" style={{ '--mood': mood?.color }} role="region" aria-label="Now playing">
            <div className="container now-playing-inner">
                <div className="now-playing-song">
                    {song.thumbnail_url ? (
                        <img className="now-playing-cover" src={song.thumbnail_url} alt="" />
                    ) : (
                        <div className="now-playing-cover cover-fallback"><i className="fa-solid fa-music" aria-hidden="true"></i></div>
                    )}
                    <div className="now-playing-text">
                        <p className="now-playing-title">{song.name}</p>
                        <p className="now-playing-artist">{(song.artists ?? []).join(', ')}</p>
                    </div>
                </div>

                <div className="now-playing-controls">
                    <button
                        type="button"
                        className="preview-play"
                        onClick={togglePlayback}
                        disabled={loading}
                        aria-label={playing ? 'Pause' : 'Play'}
                    >
                        {icon}
                    </button>
                    <span className="preview-time">{formatDuration(currentTime)}</span>
                    <input
                        type="range"
                        className="preview-seek"
                        min="0"
                        max={total}
                        step="0.1"
                        value={currentTime}
                        onChange={(event) => seek(Number(event.target.value))}
                        aria-label={`Seek ${song.name}`}
                    />
                    <span className="preview-time">{formatDuration(total)}</span>
                </div>

                <button type="button" className="icon-btn" onClick={stopPlayback} aria-label="Close player">
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    );
};

export default NowPlayingBar;
