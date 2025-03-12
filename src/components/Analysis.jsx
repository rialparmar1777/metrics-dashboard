import React, { useState } from 'react';
import TechnicalAnalysis from './TechnicalAnalysis';
import FundamentalAnalysis from './FundamentalAnalysis';
import StockComparison from './StockComparison';

const Analysis = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('technical');

  const handleStockChange = (e) => {
    setSelectedStock(e.target.value.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Stock Analysis</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            value={selectedStock}
            onChange={handleStockChange}
            placeholder="Enter stock symbol"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'technical'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Technical
            </button>
            <button
              onClick={() => setActiveTab('fundamental')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'fundamental'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Fundamental
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Compare
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'technical' && (
          <TechnicalAnalysis symbol={selectedStock} />
        )}
        {activeTab === 'fundamental' && (
          <FundamentalAnalysis symbol={selectedStock} />
        )}
        {activeTab === 'comparison' && (
          <StockComparison />
        )}
      </div>
    </div>
  );
};

export default Analysis; 