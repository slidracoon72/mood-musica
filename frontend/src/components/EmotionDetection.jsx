import { useRef, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';

const DETECTION_INTERVAL_MS = 100;
// How long an emotion must stay the strongest before it is accepted
const STABLE_EMOTION_MS = 2000;

const strongestEmotion = (expressions) =>
  Object.entries(expressions).reduce((best, current) => (current[1] > best[1] ? current : best))[0];

const EmotionDetection = ({ webcamRef, onEmotionDetected }) => {
  const canvasRef = useRef(null);
  const onEmotionDetectedRef = useRef(onEmotionDetected);

  useEffect(() => {
    onEmotionDetectedRef.current = onEmotionDetected;
  }, [onEmotionDetected]);

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
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          if (cancelled) return;

          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(canvas, displaySize);

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

          if (detections.length > 0) {
            const detectedEmotion = strongestEmotion(detections[0].expressions);

            if (detectedEmotion !== currentEmotion) {
              currentEmotion = detectedEmotion;
              emotionStartTime = Date.now();
            } else if (Date.now() - emotionStartTime >= STABLE_EMOTION_MS) {
              onEmotionDetectedRef.current(detectedEmotion);
              return;
            }
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
  }, [webcamRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '360px', height: '270px' }} />;
};

export default EmotionDetection;
