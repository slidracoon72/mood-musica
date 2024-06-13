import React from 'react';

const ToggleButton = ({ isCameraOn, handleToggleCamera }) => (
  <div>
    <button
      onClick={handleToggleCamera}
      className={`toggle-camera-button ${isCameraOn ? 'camera-on' : 'camera-off'}`}
    >
      {isCameraOn ? 'Stop Mood Detection' : 'Start Mood Detection'}
    </button>
  </div>
);

export default ToggleButton;
