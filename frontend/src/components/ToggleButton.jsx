const ToggleButton = ({ isCameraOn, handleToggleCamera, disabled }) => (
  <div>
    <button
      onClick={handleToggleCamera}
      disabled={disabled}
      className={`toggle-camera-button ${isCameraOn ? 'camera-on' : 'camera-off'}`}
    >
      {isCameraOn ? 'Stop Mood Detection' : 'Start Mood Detection'}
    </button>
  </div>
);

export default ToggleButton;
