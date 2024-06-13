import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { emotionSuggestions } from './emotionSuggestions';
import './App.css';

const WebcamWebsiteURL = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [suggestion, setSuggestion] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        };

        loadModels();
    }, []);

    const handleToggleCamera = () => {
        setIsCameraOn(!isCameraOn);
    };

    useEffect(() => {
        if (isCameraOn) {
            const intervalId = setInterval(async () => {
                if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                    const video = webcamRef.current.video;
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceExpressions();

                    const canvas = canvasRef.current;
                    if (canvas) {
                        const displaySize = { width: video.videoWidth, height: video.videoHeight };
                        faceapi.matchDimensions(canvas, displaySize);

                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

                        if (detections.length > 0) {
                            const expressions = detections[0].expressions;
                            const emotion = detectEmotion(expressions);
                            setSuggestion(emotionSuggestions[emotion]);
                        }
                    }
                }
            }, 100);

            return () => clearInterval(intervalId);
        }
    }, [isCameraOn]);

    const detectEmotion = (expressions) => {
        const emotionKeys = Object.keys(expressions);
        let maxEmotion = emotionKeys[0];
        let maxProbability = expressions[maxEmotion];
        for (let i = 1; i < emotionKeys.length; i++) {
            const emotion = emotionKeys[i];
            const probability = expressions[emotion];
            if (probability > maxProbability) {
                maxEmotion = emotion;
                maxProbability = probability;
            }
        }
        return maxEmotion;
    };

    const handleMusicLinkClick = () => {
        setIsCameraOn(false); // Turn off the camera when the link is clicked
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1 className='honk-header'>Mood-Musica</h1>
            <h2 className='roboto-mono'>Tune Into Your Emotions!</h2>
            <div>
                <button
                    onClick={handleToggleCamera}
                    className={`toggle-camera-button ${isCameraOn ? 'camera-on' : 'camera-off'}`}
                >
                    {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>
            </div>

            {isCameraOn && (
                <>
                    <div style={{ display: 'inline-block', position: 'relative', margin: '20px' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="360" // Reduced width
                            height="270" // Reduced height
                            style={{ position: 'relative', border: '1px solid white', borderRadius: '10px' }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{ position: 'absolute', top: 0, left: 0, width: '360px', height: '270px' }} // Match the webcam size
                        />
                    </div>
                    {suggestion && (
                        <div className="suggestion-card">
                            <h3>SUGGESTION BASED ON YOUR EMOTION</h3>
                            <h2>{suggestion.text}</h2>
                            <a href={suggestion.music} className="music-link" onClick={handleMusicLinkClick} target="_blank" rel="noopener noreferrer">LISTEN TO THIS PLAYLIST!</a>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WebcamWebsiteURL;