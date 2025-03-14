import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTwitter, FaGithub, FaLinkedin, FaDiscord, FaHeart,
  FaMoon, FaSun, FaNewspaper, FaBook, FaChartPie, FaCode
} from 'react-icons/fa';

const Footer = ({ isDarkMode, onThemeToggle }) => {
  const footerLinks = {
    resources: [
      { label: 'Market News', icon: FaNewspaper, path: '/news' },
      { label: 'Learning Center', icon: FaBook, path: '/learn' },
      { label: 'API Documentation', icon: FaCode, path: '/docs' },
      { label: 'Market Analysis', icon: FaChartPie, path: '/analysis' }
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact', path: '/contact' },
      { label: 'Blog', path: '/blog' }
    ],
    legal: [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Security', path: '/security' }
    ]
  };

  const marketStatus = {
    isOpen: true,
    nextEvent: 'Market closes in 2h 15m',
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Market Status Bar */}
        <div className="py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className={`h-2 w-2 rounded-full ${marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {marketStatus.isOpen ? 'Market Open' : 'Market Closed'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {marketStatus.nextEvent}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last Updated: {marketStatus.timestamp}
              </span>
              <button
                onClick={onThemeToggle}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                  hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Market Metrics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Your comprehensive solution for real-time market analysis and stock tracking.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">
                <FaDiscord className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path}
                    className="flex items-center text-gray-600 dark:text-gray-400 
                      hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 
                      dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 
                      dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© {new Date().getFullYear()} Market Metrics.</span>
              <span>All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Made with</span>
              <FaHeart className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">by Market Metrics Team</span>
              <span className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-md text-sm font-medium">
                Powered by Rial
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;