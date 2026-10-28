import { useRef, useState } from 'react';
import { formatDuration } from '../utils/time';
import { toast } from '../services/toastService';

// Deezer previews are 30 seconds long
const PREVIEW_LENGTH = 30;

const AudioPreview = ({ src, title }) => {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(PREVIEW_LENGTH);

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (audio.paused) {
            audio.play().catch(() => toast('Could not play the preview', 'error'));
        } else {
            audio.pause();
        }
    };

    const handleSeek = (event) => {
        const time = Number(event.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    return (
        <div className="preview">
            <button
                type="button"
                className="preview-play"
                onClick={togglePlayback}
                aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
                <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} aria-hidden="true"></i>
            </button>
            <input
                type="range"
                className="preview-seek"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label={`Seek preview of ${title}`}
            />
            <span className="preview-time">
                {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setCurrentTime(0)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || PREVIEW_LENGTH)}
            />
        </div>
    );
};

export default AudioPreview;
