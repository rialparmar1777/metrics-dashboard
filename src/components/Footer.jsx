import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-sm text-gray-200">
              The Metrics Dashboard is a powerful tool for tracking and analyzing tech stocks in real-time. Stay informed and make better investment decisions.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-200 hover:text-blue-200">Home</a>
              </li>
              <li>
                <a href="/watchlist" className="text-sm text-gray-200 hover:text-blue-200">Watchlist</a>
              </li>
              <li>
                <a href="/login" className="text-sm text-gray-200 hover:text-blue-200">Login</a>
              </li>
              <li>
                <a href="/signup" className="text-sm text-gray-200 hover:text-blue-200">Sign Up</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@metricsdashboard.com" className="text-sm text-gray-200 hover:text-blue-200 flex items-center">
                  <FaEnvelope className="mr-2" />
                  support@metricsdashboard.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="text-sm text-gray-200 hover:text-blue-200">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-blue-200">
                <FaGithub className="text-2xl" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-blue-200">
                <FaLinkedin className="text-2xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-blue-200">
                <FaTwitter className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-200">
            © 2024 Metrics Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;