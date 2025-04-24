import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCoins, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg border-b border-gray-800">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-gradient bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent"
          onClick={closeMenu}
        >
          <FaCoins className="text-yellow-400 text-3xl" />
          CryptoRadar
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-lg font-medium">
          <Link to="/top-10" className="hover:text-yellow-400 transition" onClick={closeMenu}>
            Top 10 Coins
          </Link>
          <Link to="/bottom-10" className="hover:text-red-400 transition" onClick={closeMenu}>
            Bottom 10 Coins
          </Link>
          <Link to="/news" className="hover:text-blue-400 transition" onClick={closeMenu}>
            News
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-2xl focus:outline-none">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col mt-4 space-y-4 text-lg font-medium px-4">
          <Link to="/top-10" className="hover:text-yellow-400" onClick={closeMenu}>
            Top 10 Coins
          </Link>
          <Link to="/bottom-10" className="hover:text-red-400" onClick={closeMenu}>
            Bottom 10 Coins
          </Link>
          <Link to="/news" className="hover:text-blue-400" onClick={closeMenu}>
            News
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
