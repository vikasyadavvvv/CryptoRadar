import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import TopTen from './pages/TopTen';
import BottomTen from './pages/BottomTen';
import CoinDetail from './pages/CoinDetails';
import News from './pages/News';  {/* Import News page */}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coin/:coinId" element={<CoinDetail />} />
        <Route path="/news" element={<News />} />  {/* Route for News page */}
        <Route path="/top-10" element={<TopTen />} />
        <Route path="/bottom-10" element={<BottomTen />} />
      </Routes>
    </Router>
  );
}

export default App;
