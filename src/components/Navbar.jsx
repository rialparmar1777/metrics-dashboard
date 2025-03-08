import React from 'react';
import { FaHome, FaChartLine } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <FaChartLine className="text-2xl mr-2" />
          <span className="text-xl font-semibold">Stock Dashboard</span>
        </div>
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="hover:text-blue-200 flex items-center">
              <FaHome className="mr-1" />
              Home
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;