import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toaster from './components/Toaster';
import Home from './components/Home';
import Library from './components/Library';

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main container">
        <Routes>
          <Route path="/" element={<Home />} />
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
      <Toaster />
    </div>
  );
};

export default App;
