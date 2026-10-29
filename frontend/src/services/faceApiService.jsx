// face-api (with TensorFlow.js) is large, so it is loaded on demand instead of
// in the main bundle; the page renders while it downloads.
let faceapi = null;
let detectorOptions = null;
let loadPromise = null;
let loaded = false;

const load = async () => {
  faceapi = await import('@vladmandic/face-api');
  detectorOptions = new faceapi.TinyFaceDetectorOptions();

  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
  loaded = true;
};

// Loads the library and the models used for emotion detection. Only loads
// once; a failed load can be retried.
export const loadModels = () => {
  if (!loadPromise) {
    loadPromise = load().catch((error) => {
      loadPromise = null;
      throw error;
    });
  }
  return loadPromise;
};

export const areModelsLoaded = () => loaded;

// Detects the most prominent face and its expressions (undefined if no face);
// requires loadModels() first. face-api's task objects are thenables whose
// then() drops errors, so awaiting them directly never settles on failure;
// run() returns a real promise that rejects properly.
export const detectFace = (video) =>
  faceapi.detectSingleFace(video, detectorOptions).withFaceExpressions().run();

// Draws a rounded box around the detected face in the video's pixel space
export const drawFaceBox = (canvas, video, box, color) => {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!box) return;

  context.strokeStyle = color;
  context.lineWidth = Math.max(3, canvas.width / 160);
  context.beginPath();
  context.roundRect(box.x, box.y, box.width, box.height, Math.min(box.width, box.height) * 0.12);
  context.stroke();
};
