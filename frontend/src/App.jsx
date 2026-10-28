import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SuggestedSongs from './components/SuggestedSongs';
import LikedSongs from './components/LikedSongs';
import Header from './components/Header';

const App = () => {
  return (
    <div>
      <Navbar />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/suggested-songs" element={<SuggestedSongs />} />
        <Route path="/liked-songs" element={<LikedSongs />} />
      </Routes>
    </div>
  );
};

export default App;