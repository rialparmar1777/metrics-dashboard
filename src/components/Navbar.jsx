import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaChartLine, FaBalanceScale, FaExchangeAlt, FaSun, FaMoon, 
  FaStar, FaGraduationCap, FaBars, FaTimes, FaUser, FaChartBar,
  FaBell, FaSearch, FaCog, FaRocket, FaNewspaper, FaExternalLinkAlt
} from 'react-icons/fa';
import { useAuth } from '../services/auth.jsx';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [scrolled, setScrolled] = useState(false);
  const [marketNews, setMarketNews] = useState([]);
  const [showNews, setShowNews] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Add new state for mobile menu animation
  const [menuClosing, setMenuClosing] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch market news
  const fetchMarketNews = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/market-news');
      const data = await response.json();
      setMarketNews(data.slice(0, 5)); // Keep only latest 5 news items
    } catch (error) {
      console.error('Failed to fetch market news:', error);
    }
  };

  useEffect(() => {
    fetchMarketNews();
    const newsInterval = setInterval(fetchMarketNews, 300000); // Refresh every 5 minutes

    return () => {
      clearInterval(newsInterval);
    };
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
      icon: FaChartBar,
      description: 'Overview of market data',
      color: 'from-blue-500 to-blue-600'
    },
    {
      path: '/technical',
      name: 'Technical',
      icon: FaChartLine,
      description: 'Technical analysis tools',
      color: 'from-green-500 to-green-600'
    },
    {
      path: '/fundamental',
      name: 'Fundamental',
      icon: FaBalanceScale,
      description: 'Fundamental analysis',
      color: 'from-purple-500 to-purple-600'
    },
    {
      path: '/compare',
      name: 'Compare',
      icon: FaExchangeAlt,
      description: 'Compare stocks',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      path: '/watchlist',
      name: 'Watchlist',
      icon: FaStar,
      description: 'Your watched stocks',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      path: '/education',
      name: 'Learn',
      icon: FaGraduationCap,
      description: 'Educational resources',
      color: 'from-red-500 to-red-600'
    }
  ];

  // Add this before the return statement
  const formatNewsTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Enhanced mobile menu handling with touch events
  const handleMobileMenuToggle = () => {
    if (isOpen) {
      setMenuClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setMenuClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
    }
  };

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      handleMobileMenuToggle();
    }
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className={`
        fixed w-full top-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg'
          : 'bg-white dark:bg-gray-800'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Brand Name */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 group"
              >
                <FaRocket className="h-6 w-6 text-blue-600 dark:text-blue-500 transform group-hover:rotate-45 transition-all duration-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-transparent bg-clip-text transition-all duration-500">
                  Metrics
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300 ease-in-out
                    flex items-center space-x-2
                    group relative
                    hover:shadow-md
                    ${isActive(item.path)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <item.icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive(item.path) ? 'text-white' : 'group-hover:text-blue-500'
                  }`} />
                  <span>{item.name}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
                    opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                    <div className="px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl
                      whitespace-nowrap mt-2 border border-gray-700">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Market News Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowNews(!showNews)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300 ease-in-out
                    flex items-center space-x-2
                    group relative
                    hover:shadow-md
                    ${showNews
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <FaNewspaper className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    showNews ? 'text-white' : 'group-hover:text-orange-500'
                  }`} />
                  <span>Market News</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
                    opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                    <div className="px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl
                      whitespace-nowrap mt-2 border border-gray-700">
                      Latest market updates and news
                    </div>
                  </div>
                </button>

                {/* News Dropdown */}
                {showNews && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                        Latest Market News
                        <span className="text-xs text-gray-500 dark:text-gray-400">Auto-updates every 5m</span>
                      </h3>
                      <div className="space-y-4">
                        {marketNews.length > 0 ? (
                          marketNews.map((news, index) => (
                            <a
                              key={index}
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block group"
                            >
                              <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                                    {news.headline}
                                  </h4>
                                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-blue-500 ml-2 flex-shrink-0" />
                                </div>
                                <div className="mt-1 flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatNewsTime(news.datetime)}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    {news.source}
                                  </span>
                                </div>
                              </div>
                            </a>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            Loading latest news...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md hover:scale-105">
                <FaSearch className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md hover:scale-105">
                  <FaBell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md hover:scale-105"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-700" />
                )}
              </button>

              {/* Settings & Profile */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md hover:scale-105">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </button>
                <div className="absolute right-0 w-56 mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300
                  border border-gray-200 dark:border-gray-700 transform group-hover:translate-y-0 translate-y-2">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                    <div className="flex items-center mt-1">
                      <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30 rounded-full">
                        Pro Member
                      </span>
                    </div>
                  </div>
                  <a href="#settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FaCog className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FaTimes className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Notifications for Mobile */}
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 relative">
                <FaBell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Dark Mode Toggle for Mobile */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-500 animate-spin-slow" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-700" />
                )}
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={handleMobileMenuToggle}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300
                  relative overflow-hidden group"
              >
                <div className="relative z-10">
                  {isOpen ? (
                    <FaTimes className="h-6 w-6 transform rotate-90 transition-transform duration-300" />
                  ) : (
                    <FaBars className="h-6 w-6 transform transition-transform duration-300" />
                  )}
                </div>
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0
                  group-hover:opacity-10 transition-opacity duration-300
                  ${isOpen ? 'scale-x-100' : 'scale-x-0'}
                `} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile menu */}
        <div 
          className={`
            md:hidden fixed inset-0 z-40
            ${isOpen ? 'visible' : 'invisible'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <div 
            className={`
              absolute inset-0 bg-black/50 backdrop-blur-sm
              transition-opacity duration-300 ease-in-out
              ${isOpen ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={handleMobileMenuToggle}
          />

          {/* Menu Content */}
          <div 
            className={`
              absolute right-0 top-0 h-[100dvh] w-[85%] max-w-sm
              bg-white dark:bg-gray-800 shadow-2xl
              transform transition-transform duration-300 ease-in-out
              ${isOpen ? 'translate-x-0' : 'translate-x-full'}
              overflow-y-auto overscroll-contain
              flex flex-col
            `}
          >
            {/* User Profile Section */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-lg 
                  flex items-center justify-center text-white text-xl font-semibold
                  shadow-inner">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.email}</p>
                  <p className="text-blue-100 text-sm">Pro Member</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Market News Section */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FaNewspaper className="h-4 w-4 mr-2 text-blue-500" />
                  Latest Market News
                </h3>
                <div className="space-y-3">
                  {marketNews.slice(0, 3).map((news, index) => (
                    <a
                      key={index}
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 
                        transition-colors active:bg-gray-100 dark:active:bg-gray-600/50"
                    >
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {news.headline}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatNewsTime(news.datetime)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 
                          text-blue-600 dark:text-blue-400">
                          {news.source}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleMobileMenuToggle}
                    className={`
                      block px-4 py-3.5 rounded-xl text-base font-medium
                      transition-all duration-300 relative overflow-hidden group
                      active:scale-95 touch-manipulation
                      ${isActive(item.path)
                        ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 relative z-10">
                      <item.icon className={`h-5 w-5 ${
                        isActive(item.path) 
                          ? 'text-white' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
                      }`} />
                      <span>{item.name}</span>
                    </div>
                    <div className={`
                      absolute inset-0 bg-gradient-to-r ${item.color} opacity-0
                      group-hover:opacity-10 transition-opacity duration-300
                      ${!isActive(item.path) ? 'block' : 'hidden'}
                    `} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => {
                  handleMobileMenuToggle();
                  handleLogout();
                }}
                className="w-full flex items-center justify-center px-4 py-3.5 text-base font-medium 
                  text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors
                  active:scale-95 touch-manipulation"
              >
                <FaTimes className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;