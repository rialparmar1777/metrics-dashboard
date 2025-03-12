import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaChartLine, FaBalanceScale, FaExchangeAlt, FaSun, FaMoon, FaStar, FaGraduationCap, FaBars, FaTimes, FaUser, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../services/auth.jsx';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', !darkMode);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: FaChartBar
    },
    {
      path: '/technical',
      name: 'Technical',
      icon: FaChartLine
    },
    {
      path: '/fundamental',
      name: 'Fundamental',
      icon: FaBalanceScale
    },
    {
      path: '/compare',
      name: 'Compare',
      icon: FaExchangeAlt
    },
    {
      path: '/watchlist',
      name: 'Watchlist',
      icon: FaStar
    },
    {
      path: '/education',
      name: 'Learn',
      icon: FaGraduationCap
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/dashboard" 
                className="flex items-center hover:opacity-90 transition-opacity duration-200"
              >
                <img
                  src="/logo.png"
                  alt="Metrics Dashboard Logo"
                  className="h-12 w-auto object-contain"
                  style={{ 
                    maxHeight: '48px',
                    minWidth: '280px',
                    objectFit: 'contain',
                    objectPosition: 'left center'
                  }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-1 justify-center ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-in-out
                    flex items-center space-x-2
                    hover:bg-opacity-90
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4 ml-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                  <FaUser className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`
            md:hidden 
            transition-all duration-300 ease-in-out 
            ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
          `}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  block px-3 py-2 rounded-lg text-base font-medium
                  transition-colors duration-200
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full mt-2 px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;