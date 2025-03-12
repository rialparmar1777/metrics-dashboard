import React, { useState } from 'react';
import { FaBalanceScale, FaSearch } from 'react-icons/fa';

const FundamentalAnalysis = () => {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement fundamental analysis functionality
    console.log('Analyzing:', symbol);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <FaBalanceScale className="h-6 w-6 text-green-500 mr-2" />
          Fundamental Analysis
        </h2>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <FaSearch className="mr-2" />
              Analyze
            </button>
          </div>
        </form>

        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Fundamental analysis features coming soon!</p>
          <p className="mt-2">This will include:</p>
          <ul className="mt-4 space-y-2">
            <li>• Financial Ratios</li>
            <li>• Income Statement Analysis</li>
            <li>• Balance Sheet Analysis</li>
            <li>• Cash Flow Analysis</li>
            <li>• Key Performance Indicators</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FundamentalAnalysis; 