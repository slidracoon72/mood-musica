import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import './App.css';

const WebcamCapture = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [song, setSong] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [emotionStartTime, setEmotionStartTime] = useState(null);

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
        if (!isCameraOn) {
            setSong(null);
        }
        setIsCameraOn(!isCameraOn);
        setEmotion(null);
        setEmotionStartTime(null);
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
                            const detectedEmotion = detectEmotion(expressions);

                            if (detectedEmotion === emotion) {
                                if (emotionStartTime && (Date.now() - emotionStartTime >= 2000)) {
                                    setIsCameraOn(false);
                                    fetchSongRecommendation(detectedEmotion);
                                }
                            } else {
                                setEmotion(detectedEmotion);
                                setEmotionStartTime(Date.now());
                            }
                        }
                    }
                }
            }, 100);

            return () => clearInterval(intervalId);
        }
    }, [isCameraOn, emotion, emotionStartTime]);

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

    const fetchSongRecommendation = async (emotion) => {
        const response = await fetch('http://localhost:5000/get_song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emotion })
        });

        const data = await response.json();
        setSong(data);
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
                    {isCameraOn ? 'Stop Mood Detection' : 'Start Mood Detection'}
                </button>
            </div>

            {isCameraOn && (
                <>
                    <div style={{ display: 'inline-block', position: 'relative', margin: '20px' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="360"
                            height="270"
                            style={{ position: 'relative', border: '1px solid white', borderRadius: '10px' }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{ position: 'absolute', top: 0, left: 0, width: '360px', height: '270px' }}
                        />
                    </div>
                </>
            )}
            {song && (
                <div className="suggestion-card">
                    <div className='card-heading'>
                        <h2>{song.suggestion_text}</h2>
                        <hr style={{ border: '0', borderTop: '1px solid #ccc' }} />
                    </div>
                    <h3>MUSIC TO SUIT YOUR MOOD</h3>
                    <h3 style={{ color: "#ccd6f6" }}>{song.name} by {song.artists.join(', ')}</h3>
                    {song.thumbnail_url && (
                        <a href={song.spotify_url} target="_blank" rel="noopener noreferrer">
                            <img src={song.thumbnail_url} alt={song.name} style={{ width: '150px', borderRadius: '10px' }} />
                        </a>
                    )}

                    {song.preview_url ? (
                        <>
                            <p>SONG PREVIEW</p>
                            <audio controls>
                                <source src={song.preview_url} type="audio/mpeg" />
                            </audio></>

                    ) : (
                        <p>No Preview Available</p>
                    )}
                    <p>Click the thumbnail to play the full song on Spotify!</p>
                </div>
            )}
        </div>
    );
};

export default WebcamCapture;

