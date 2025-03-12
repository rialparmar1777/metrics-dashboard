import React, { useState } from 'react';
import { FaExchangeAlt, FaPlus, FaTrash } from 'react-icons/fa';

const StockComparison = () => {
  const [symbols, setSymbols] = useState(['', '']);
  const [error, setError] = useState('');

  const handleAddSymbol = () => {
    if (symbols.length < 4) {
      setSymbols([...symbols, '']);
    }
  };

  const handleRemoveSymbol = (index) => {
    if (symbols.length > 2) {
      const newSymbols = symbols.filter((_, i) => i !== index);
      setSymbols(newSymbols);
    }
  };

  const handleSymbolChange = (index, value) => {
    const newSymbols = [...symbols];
    newSymbols[index] = value.toUpperCase();
    setSymbols(newSymbols);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement stock comparison functionality
    console.log('Comparing stocks:', symbols.filter(Boolean));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <FaExchangeAlt className="h-6 w-6 text-purple-500 mr-2" />
          Compare Stocks
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {symbols.map((symbol, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => handleSymbolChange(index, e.target.value)}
                  placeholder={`Enter stock symbol ${index + 1} (e.g., AAPL)`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {symbols.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSymbol(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 focus:outline-none"
                >
                  <FaTrash className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-between">
            {symbols.length < 4 && (
              <button
                type="button"
                onClick={handleAddSymbol}
                className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 focus:outline-none"
              >
                <FaPlus className="mr-2" />
                Add Another Stock
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Compare
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>Stock comparison features coming soon!</p>
          <p className="mt-2">This will include:</p>
          <ul className="mt-4 space-y-2">
            <li>• Price Performance Comparison</li>
            <li>• Financial Metrics Comparison</li>
            <li>• Valuation Ratios</li>
            <li>• Growth Metrics</li>
            <li>• Risk Metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StockComparison; 