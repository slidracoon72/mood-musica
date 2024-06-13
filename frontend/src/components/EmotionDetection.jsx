import React, { useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const EmotionDetection = ({
  isCameraOn,
  webcamRef,
  setEmotion,
  emotion,
  emotionStartTime,
  setEmotionStartTime,
  handleSongRecommendation,
  setIsCameraOn
}) => {
  const canvasRef = useRef(null);

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
                  handleSongRecommendation(detectedEmotion);
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
  }, [isCameraOn, emotion, emotionStartTime, webcamRef, setEmotion, setEmotionStartTime, handleSongRecommendation, setIsCameraOn]);

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

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '360px', height: '270px' }} />;
};

export default EmotionDetection;
