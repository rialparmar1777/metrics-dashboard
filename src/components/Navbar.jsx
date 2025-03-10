import React, { useState } from 'react';
import { FaHome, FaChartLine, FaMoon, FaSun, FaList, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <FaChartLine className="text-2xl mr-2" />
          <span className="text-xl font-semibold">Stock Dashboard</span>
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-blue-200 flex items-center">
              <FaHome className="mr-1" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/watchlist" className="hover:text-blue-200 flex items-center">
              <FaList className="mr-1" />
              Watchlist
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-blue-200 flex items-center">
              <FaSignInAlt className="mr-1" />
              Login
            </Link>
          </li>
          <li>
            <Link to="/signup" className="hover:text-blue-200 flex items-center">
              <FaUserPlus className="mr-1" />
              Sign Up
            </Link>
          </li>
          <li>
            <button onClick={toggleDarkMode} className="hover:text-blue-200 flex items-center">
              {darkMode ? <FaSun className="mr-1" /> : <FaMoon className="mr-1" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;