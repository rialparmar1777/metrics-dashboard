import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaChartLine, FaHeart, FaBolt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Watchlist
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Analysis Tools */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Analysis Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/technical" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Technical Analysis
                </Link>
              </li>
              <li>
                <Link to="/fundamental" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Fundamental Analysis
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Stock Comparison
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Market News
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  Learning Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <FaGithub className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <FaLinkedin className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <FaTwitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 sm:gap-0">
            {/* Powered by Rial - Left */}
            <div className="flex items-center order-2 sm:order-1">
              <FaBolt className="text-yellow-400 animate-pulse mr-2" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold text-base sm:text-lg">
                Powered by Rial
              </span>
            </div>

            {/* Logo - Center */}
            <div className="order-1 sm:order-2 transform-none sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <img
                src="/logo.png"
                alt="Metrics Dashboard Logo"
                className="h-16 sm:h-20 w-auto object-contain"
                style={{ 
                  maxHeight: '80px',
                  minWidth: '200px',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  filter: 'contrast(1.3) brightness(1.2)',
                }}
              />
            </div>
            
            {/* Copyright - Right */}
            <div className="flex items-center space-x-1 text-sm sm:text-base order-3">
              <span className="text-gray-600 dark:text-gray-300">Made with</span>
              <FaHeart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-gray-600 dark:text-gray-300">© {currentYear}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;