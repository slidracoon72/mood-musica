import { useRef, useEffect, useState, useCallback } from 'react';
import { loadModels } from '../services/faceApiService';
import { fetchSongRecommendation, saveSuggestedSong } from '../services/songService';
import { useAuthUser } from '../services/authService';
import ToggleButton from './ToggleButton';
import EmotionDetection from './EmotionDetection';
import Camera from './Camera';
import SongSuggestionCard from './SongSuggestionCard';
import Loader from '../assets/Loader';
import Description from './Description';
import '../App.css';


const Home = () => {
  const webcamRef = useRef(null);
  const { user } = useAuthUser();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels()
      .then(() => setModelsReady(true))
      .catch((loadError) => {
        console.error('Failed to load face detection models:', loadError);
        setError('Could not load the face detection models. Please refresh the page.');
      });
  }, []);

  const handleToggleCamera = () => {
    if (!isCameraOn) {
      setSong(null);
      setError(null);
    }
    setIsCameraOn(!isCameraOn);
  };

  const handleEmotionDetected = useCallback(async (emotion) => {
    setIsCameraOn(false);
    setLoading(true);
    try {
      const recommendedSong = await fetchSongRecommendation(emotion);
      setSong(recommendedSong);

      if (user) {
        saveSuggestedSong(user.uid, recommendedSong)
          .catch((saveError) => console.error('Failed to save song:', saveError));
      }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCameraError = () => {
    setIsCameraOn(false);
    setError('Could not access your camera. Please allow camera access and try again.');
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <ToggleButton isCameraOn={isCameraOn} handleToggleCamera={handleToggleCamera} disabled={!modelsReady || loading} />
        {!modelsReady && !error && <p style={{ color: '#fff' }}>Loading face detection models...</p>}
        {isCameraOn && (
          <div style={{ position: 'relative', display: 'inline-block', margin: '20px' }}>
            <Camera webcamRef={webcamRef} onError={handleCameraError} />
            <EmotionDetection webcamRef={webcamRef} onEmotionDetected={handleEmotionDetected} />
          </div>
        )}
        {error && <p style={{ color: '#ff865c' }}>{error}</p>}
        {loading ? (
          <Loader /> // Display loader while fetching song
        ) : (
          song && <SongSuggestionCard song={song} /> // Display song suggestion card when song is fetched
        )}
        {song && !user && <p style={{ color: '#fff' }}>Login to save your suggested songs.</p>}
      </div>
      {(!isCameraOn && !loading && !song) && <Description />}
    </div>

  );
};

export default Home;
