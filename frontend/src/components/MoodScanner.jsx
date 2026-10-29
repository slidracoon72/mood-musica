import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { detectFace, drawFaceBox } from '../services/faceApiService';
import { createEmotionTracker } from '../utils/emotionTracker';
import { MOODS } from '../moods';
import Spinner from './Spinner';

const DETECTION_INTERVAL_MS = 100;
// How long an emotion must stay the leader before it is accepted
const HOLD_MS = 2000;
// Suggest alternatives if nothing has locked in by then
const HINT_AFTER_MS = 8000;
const UNCERTAIN_COLOR = '#ffffff';

const VIDEO_CONSTRAINTS = { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } };

const INITIAL_STATUS = { faceVisible: false, emotion: null, leaderSince: 0 };

// Shows the webcam, reads the user's expression and reports it once it is stable
const MoodScanner = ({ onDetected, onCameraError, onCancel }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const onDetectedRef = useRef(onDetected);
    const [cameraReady, setCameraReady] = useState(false);
    const [status, setStatus] = useState(INITIAL_STATUS);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        onDetectedRef.current = onDetected;
    }, [onDetected]);

    useEffect(() => {
        if (!cameraReady) return undefined;
        const hintTimer = setTimeout(() => setShowHint(true), HINT_AFTER_MS);
        return () => clearTimeout(hintTimer);
    }, [cameraReady]);

    useEffect(() => {
        let cancelled = false;
        let timeoutId;
        const tracker = createEmotionTracker({ holdMs: HOLD_MS });
        let lastStatus = INITIAL_STATUS;

        // Schedule the next detection only after the current one finishes, so
        // slow detections never overlap and the result is reported exactly once
        const detect = async () => {
            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;

            if (video?.readyState === 4 && video.videoWidth > 0 && canvas) {
                try {
                    const result = await detectFace(video);
                    if (cancelled) return;

                    const reading = tracker.update(result?.expressions ?? null, Date.now());
                    drawFaceBox(canvas, video, result?.detection.box, MOODS[reading.emotion]?.color ?? UNCERTAIN_COLOR);

                    if (reading.locked) {
                        onDetectedRef.current(reading.emotion);
                        return;
                    }

                    // Re-render only when what the user sees changes
                    if (reading.faceVisible !== lastStatus.faceVisible
                        || reading.emotion !== lastStatus.emotion
                        || reading.leaderSince !== lastStatus.leaderSince) {
                        lastStatus = { faceVisible: reading.faceVisible, emotion: reading.emotion, leaderSince: reading.leaderSince };
                        setStatus(lastStatus);
                    }
                } catch (error) {
                    // A detection still running when the scanner closes fails
                    // on the stopped video; that is expected, not an error
                    if (cancelled) return;
                    console.error('Emotion detection failed:', error);
                }
            }

            if (!cancelled) {
                timeoutId = setTimeout(detect, DETECTION_INTERVAL_MS);
            }
        };

        detect();

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, []);

    const mood = MOODS[status.emotion];

    let statusContent;
    if (mood) {
        statusContent = <><i className={`fa-solid ${mood.icon}`} aria-hidden="true"></i> Reading: {mood.label}</>;
    } else if (status.faceVisible) {
        statusContent = <><Spinner label="Reading your expression" /> Reading your expression…</>;
    } else {
        statusContent = <><i className="fa-solid fa-expand" aria-hidden="true"></i> Looking for your face…</>;
    }

    return (
        <div className="scanner">
            <div className="scanner-frame" style={{ '--mood': mood?.color }}>
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored
                    className="scanner-video"
                    videoConstraints={VIDEO_CONSTRAINTS}
                    onUserMedia={() => setCameraReady(true)}
                    onUserMediaError={onCameraError}
                />
                <canvas ref={canvasRef} className="scanner-overlay" />

                {!cameraReady ? (
                    <div className="scanner-starting">
                        <Spinner large label="Starting camera" />
                        Starting camera…
                    </div>
                ) : (
                    <div className="scanner-status" aria-live="polite">{statusContent}</div>
                )}

                {/* Restarts whenever a new emotion takes the lead */}
                {mood && (
                    <div
                        key={`${status.emotion}-${status.leaderSince}`}
                        className="scanner-progress"
                        style={{ animationDuration: `${HOLD_MS}ms` }}
                    />
                )}
            </div>

            <div className="scanner-footer">
                <span>
                    {showHint
                        ? 'Having trouble? Face the camera in good light with a clear expression, or cancel and pick a mood.'
                        : 'Hold an expression for 2 seconds. Video never leaves your device.'}
                </span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default MoodScanner;
