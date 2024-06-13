import React, { useRef, useEffect, useState } from 'react';
import { loadModels } from '../services/faceApiService';
import { fetchSongRecommendation } from '../services/songService';
import ToggleButton from './ToggleButton';
import EmotionDetection from './EmotionDetection';
import Camera from './Camera';
import SongSuggestionCard from './SongSuggestionCard';
import Loader from '../assets/Loader';
import Description from './Description';
import '../App.css';


const Home = () => {
  const webcamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [song, setSong] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [emotionStartTime, setEmotionStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadModels();
    // Check if user info is stored in session storage
    const userInfo = sessionStorage.getItem('user_info');
    if (userInfo) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleToggleCamera = () => {
    if (!isCameraOn) {
      setSong(null);
    }
    setIsCameraOn(!isCameraOn);
    setEmotion(null);
    setEmotionStartTime(null);
  };

  const handleSongRecommendation = async (emotion) => {
    setLoading(true);
    try {
      await fetchSongRecommendation(emotion, setSong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <ToggleButton isCameraOn={isCameraOn} handleToggleCamera={handleToggleCamera} />
        {isCameraOn && (
          <div style={{ position: 'relative', display: 'inline-block', margin: '20px' }}>
            <Camera webcamRef={webcamRef} />
            <EmotionDetection
              isCameraOn={isCameraOn}
              webcamRef={webcamRef}
              setEmotion={setEmotion}
              emotion={emotion}
              emotionStartTime={emotionStartTime}
              setEmotionStartTime={setEmotionStartTime}
              handleSongRecommendation={handleSongRecommendation}
              setIsCameraOn={setIsCameraOn}
            />
          </div>
        )}
        {loading ? (
          <Loader /> // Display loader while fetching song
        ) : (
          song && <SongSuggestionCard song={song} /> // Display song suggestion card when song is fetched
        )}
      </div>
      {(!isCameraOn && !loading && !emotion) && <Description />}
    </div>

  );
};

export default Home;
