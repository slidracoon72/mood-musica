import { useCallback, useEffect, useState } from 'react';
import { areModelsLoaded, loadModels } from '../services/faceApiService';
import { fetchSongRecommendation, saveSuggestedSong } from '../services/songService';
import { useAuthUser } from '../services/authService';
import { toast } from '../services/toastService';
import { setAmbientMood } from '../utils/glassEffects';
import MoodScanner from './MoodScanner';
import MoodPicker from './MoodPicker';
import SongResult from './SongResult';
import Spinner from './Spinner';

const STEPS = [
    {
        icon: 'fa-camera',
        title: 'Scan Your Expression',
        text: 'Turn on your camera and hold an expression for two seconds. No camera? Just pick a mood.',
    },
    {
        icon: 'fa-brain',
        title: 'We Read Your Mood',
        text: 'An on-device model recognizes seven emotions. Your video never leaves your browser.',
    },
    {
        icon: 'fa-headphones',
        title: 'Hear a Matching Song',
        text: 'Get a song from curated Deezer playlists with a 30-second preview. Sign in to keep a history.',
    },
];

const ResultSkeleton = () => (
    <div className="result-card" aria-busy="true" aria-label="Finding a song">
        <div className="skeleton skeleton-cover"></div>
        <div>
            <div className="skeleton skeleton-line" style={{ width: '30%' }}></div>
            <div className="skeleton skeleton-title" style={{ width: '70%' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '45%' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '90%', height: '48px', marginTop: '28px' }}></div>
        </div>
    </div>
);

// Keeps the last recommendation when navigating away and back (until reload)
let lastSong = null;

// `startOver` shows the initial screen instead of restoring the last song
const Home = ({ startOver = false }) => {
    const { user } = useAuthUser();
    const [modelsState, setModelsState] = useState(() => (areModelsLoaded() ? 'ready' : 'loading')); // loading | ready | error
    const [scanning, setScanning] = useState(false);
    const [loadingSong, setLoadingSong] = useState(false);
    const [song, setSongState] = useState(() => (startOver ? null : lastSong));

    const setSong = useCallback((nextSong) => {
        lastSong = nextSong;
        setSongState(nextSong);
    }, []);

    useEffect(() => {
        if (startOver) lastSong = null;
    }, [startOver]);

    // The background takes on the colour of the recommended song's mood
    useEffect(() => {
        setAmbientMood(song?.emotion ?? null);
    }, [song]);

    useEffect(() => () => setAmbientMood(null), []);

    useEffect(() => {
        loadModels()
            .then(() => setModelsState('ready'))
            .catch((error) => {
                console.error('Failed to load face detection models:', error);
                setModelsState('error');
            });
    }, []);

    const recommendSong = useCallback(async (emotion) => {
        setScanning(false);
        setLoadingSong(true);
        try {
            const recommendedSong = await fetchSongRecommendation(emotion);
            setSong(recommendedSong);

            if (user) {
                saveSuggestedSong(user.uid, recommendedSong).catch((error) => {
                    console.error('Failed to save song:', error);
                    toast('Could not save this song to your history', 'error');
                });
            }
        } catch (error) {
            toast(error.message, 'error');
        } finally {
            setLoadingSong(false);
        }
    }, [user, setSong]);

    // Leaving the scanner without a result drops the live mood tint
    const stopScanning = useCallback(() => {
        setScanning(false);
        setAmbientMood(null);
    }, []);

    const handleCameraError = useCallback(() => {
        stopScanning();
        toast('Could not access your camera. Allow camera access, or pick a mood instead.', 'error');
    }, [stopScanning]);

    const compactHero = scanning || loadingSong || Boolean(song);

    const startScan = () => {
        setSong(null);
        setScanning(true);
    };

    const handleStartOver = () => {
        setSong(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <section className={`hero ${compactHero ? 'hero-compact' : ''}`}>
                {!compactHero && (
                    <span className="eyebrow">
                        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Emotion-aware music discovery
                    </span>
                )}
                <h1>Music that matches <span className="gradient-text">your mood</span></h1>
                {!compactHero && (
                    <p className="lead">
                        Mood Musica reads your facial expression right in your browser and finds a song to match how you feel.
                    </p>
                )}

                {!scanning && (
                    <>
                        <div className="hero-actions">
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                onClick={startScan}
                                disabled={modelsState !== 'ready' || loadingSong}
                            >
                                {modelsState === 'loading' ? (
                                    <><Spinner label="Preparing mood detection" /> Preparing…</>
                                ) : (
                                    <><i className="fa-solid fa-camera" aria-hidden="true"></i> {song ? 'Scan again' : 'Scan my mood'}</>
                                )}
                            </button>
                        </div>
                        {(!compactHero || modelsState === 'error') && <p className="hero-note">
                            {modelsState === 'error'
                                ? 'Mood detection could not load. Refresh the page, or pick a mood below.'
                                : 'Private by design: detection runs entirely on your device.'}
                        </p>}
                    </>
                )}
            </section>

            {scanning && (
                <MoodScanner
                    onDetected={recommendSong}
                    onCameraError={handleCameraError}
                    onCancel={stopScanning}
                />
            )}

            {!scanning && loadingSong && <ResultSkeleton />}

            {!scanning && !loadingSong && song && (
                <SongResult
                    key={song.id}
                    song={song}
                    user={user}
                    onAnotherSong={() => recommendSong(song.emotion)}
                    onClose={handleStartOver}
                />
            )}

            {!scanning && (
                <section className="section" aria-labelledby="mood-picker-title">
                    <div className="section-header">
                        <h2 id="mood-picker-title" className="section-title">{song ? 'Try Another Mood' : 'Or Pick a Mood'}</h2>
                        <p className="section-subtitle">No camera needed. Choose how you feel and we will find a song.</p>
                    </div>
                    <MoodPicker activeMood={song?.emotion} onPick={recommendSong} disabled={loadingSong} />
                </section>
            )}

            {!scanning && !song && !loadingSong && (
                <section className="section" aria-labelledby="how-it-works-title">
                    <div className="section-header">
                        <h2 id="how-it-works-title" className="section-title">How It Works</h2>
                    </div>
                    <div className="steps">
                        {STEPS.map(step => (
                            <div key={step.title} className="panel step">
                                <span className="step-icon"><i className={`fa-solid ${step.icon}`} aria-hidden="true"></i></span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
};

export default Home;
