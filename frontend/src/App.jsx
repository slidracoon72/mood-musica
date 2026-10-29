import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { usePlayer } from './services/playerService';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toaster from './components/Toaster';
import NowPlayingBar from './components/NowPlayingBar';
import Home from './components/Home';
import Library from './components/Library';

// Remount Home on every navigation to it, so links can ask it to start over
const HomeRoute = () => {
  const location = useLocation();
  return <Home key={location.key} startOver={location.state?.startOver === true} />;
};

const App = () => {
  const { song } = usePlayer();

  return (
    <div className={`app ${song ? 'has-player' : ''}`}>
      <Navbar />
      <main className="main container">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          {/* Keys keep each page's filter state separate */}
          <Route path="/history" element={<Library key="history" />} />
          <Route path="/favorites" element={<Library key="favorites" favoritesOnly />} />
          {/* Old URLs */}
          <Route path="/suggested-songs" element={<Navigate to="/history" replace />} />
          <Route path="/liked-songs" element={<Navigate to="/favorites" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <NowPlayingBar />
      <Toaster />
    </div>
  );
};

export default App;
