import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { detectFace, drawFaceBox, strongestExpression } from '../services/faceApiService';
import { MOODS } from '../moods';
import Spinner from './Spinner';

const DETECTION_INTERVAL_MS = 100;
// How long an emotion must stay the strongest before it is accepted
const STABLE_EMOTION_MS = 2000;
const NO_FACE_COLOR = '#ffffff';

const VIDEO_CONSTRAINTS = { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } };

// Shows the webcam, reads the user's expression and reports it once it has
// been stable for STABLE_EMOTION_MS
const MoodScanner = ({ onDetected, onCameraError, onCancel }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const onDetectedRef = useRef(onDetected);
    const [cameraReady, setCameraReady] = useState(false);
    // Expression currently being read, or null when no face is visible
    const [liveEmotion, setLiveEmotion] = useState(null);

    useEffect(() => {
        onDetectedRef.current = onDetected;
    }, [onDetected]);

    useEffect(() => {
        let cancelled = false;
        let timeoutId;
        let currentEmotion = null;
        let emotionStartTime = null;

        // Schedule the next detection only after the current one finishes, so
        // slow detections never overlap and the result is reported exactly once
        const detect = async () => {
            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;

            if (video?.readyState === 4 && canvas) {
                try {
                    const result = await detectFace(video);
                    if (cancelled) return;

                    const detectedEmotion = result ? strongestExpression(result.expressions) : null;
                    drawFaceBox(canvas, video, result?.detection.box, MOODS[detectedEmotion]?.color ?? NO_FACE_COLOR);

                    if (detectedEmotion !== currentEmotion) {
                        currentEmotion = detectedEmotion;
                        emotionStartTime = Date.now();
                        setLiveEmotion(detectedEmotion);
                    } else if (detectedEmotion && Date.now() - emotionStartTime >= STABLE_EMOTION_MS) {
                        onDetectedRef.current(detectedEmotion);
                        return;
                    }
                } catch (error) {
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

    const mood = MOODS[liveEmotion];

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
                    <div className="scanner-status" aria-live="polite">
                        {mood ? (
                            <>
                                <i className={`fa-solid ${mood.icon}`} aria-hidden="true"></i>
                                Reading: {mood.label}
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-expand" aria-hidden="true"></i>
                                Looking for your face…
                            </>
                        )}
                    </div>
                )}

                {/* Restarts whenever the expression changes */}
                {mood && (
                    <div
                        key={liveEmotion}
                        className="scanner-progress"
                        style={{ animationDuration: `${STABLE_EMOTION_MS}ms` }}
                    />
                )}
            </div>

            <div className="scanner-footer">
                <span>Hold an expression for 2 seconds. Video never leaves your device.</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default MoodScanner;
