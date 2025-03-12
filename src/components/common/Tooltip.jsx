import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const Tooltip = ({ term, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <FaInfoCircle className="ml-1 h-4 w-4 text-blue-500" />
      </div>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-4 mt-2 -ml-2 text-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-gray-900 dark:text-white mb-1">{term}</div>
          <div className="text-gray-600 dark:text-gray-400">{definition}</div>
          <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 