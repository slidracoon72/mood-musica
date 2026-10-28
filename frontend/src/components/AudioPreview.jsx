import { playSong, seek, usePlayer } from '../services/playerService';
import { formatDuration } from '../utils/time';
import Spinner from './Spinner';

// Deezer previews are 30 seconds long
const PREVIEW_LENGTH = 30;

// Inline preview controls for one song, driven by the app-wide player
const AudioPreview = ({ song }) => {
    const player = usePlayer();
    const isCurrent = player.song?.id === song.id;
    const playing = isCurrent && player.playing;
    const loading = isCurrent && player.loading;
    const currentTime = isCurrent ? player.currentTime : 0;
    const duration = (isCurrent && player.duration) || PREVIEW_LENGTH;

    let icon = <i className="fa-solid fa-play" aria-hidden="true"></i>;
    if (loading) icon = <Spinner label="Loading preview" />;
    else if (playing) icon = <i className="fa-solid fa-pause" aria-hidden="true"></i>;

    return (
        <div className="preview">
            <button
                type="button"
                className="preview-play"
                onClick={() => playSong(song)}
                aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
                {icon}
            </button>
            <input
                type="range"
                className="preview-seek"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                disabled={!isCurrent}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label={`Seek preview of ${song.name}`}
            />
            <span className="preview-time">
                {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
        </div>
    );
};

export default AudioPreview;
