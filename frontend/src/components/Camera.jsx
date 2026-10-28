import Webcam from 'react-webcam';

const Camera = ({ webcamRef, onError }) => (
  <div>
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      width="360"
      height="270"
      onUserMediaError={onError}
      style={{ position: 'relative', border: '1px solid white', borderRadius: '10px' }}
    />
  </div>
);

export default Camera;
