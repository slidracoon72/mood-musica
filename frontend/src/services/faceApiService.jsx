// face-api (with TensorFlow.js) is large, so it is loaded on demand instead of
// in the main bundle; the page renders while it downloads.
let faceapi = null;
let detectorOptions = null;

// Loads the library and the models used for emotion detection
export const loadModels = async () => {
  faceapi = await import('@vladmandic/face-api');
  detectorOptions = new faceapi.TinyFaceDetectorOptions();

  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
};

// Detects faces with landmarks and expressions; requires loadModels() first
export const detectFaces = (video) =>
  faceapi.detectAllFaces(video, detectorOptions).withFaceLandmarks().withFaceExpressions();

export const drawDetections = (canvas, video, detections) => {
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resizedDetections);
  faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
};
