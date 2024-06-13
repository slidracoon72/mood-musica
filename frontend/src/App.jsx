import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SuggestedSongs from './components/SuggestedSongs';
import LikedSongs from './components/LikedSongs';
import Header from './components/Header';
import Login from './components/Login';
import Callback from './components/Callback';

const App = () => {
  return (
    <div>
      <Navbar />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/suggested-songs" element={<SuggestedSongs />} />
        <Route path="/liked-songs" element={<LikedSongs />} />
        {/* <Route path='/login' element={<Home />} /> */}
      </Routes>
    </div>
  );
};

export default App;