import React from 'react';
import { FaArrowUp, FaArrowDown, FaTrash, FaChartLine } from 'react-icons/fa';

const StockCard = ({ data, onRemove, onSelect, isSelected }) => {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    );
  }

  const {
    symbol,
    companyName,
    currentPrice,
    change,
    changePercent,
    high,
    low,
    volume,
    marketCap,
    currency = 'USD'
  } = data;

  const isPositive = changePercent > 0;
  const formatMarketCap = (value) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return `${value.toFixed(2)}`;
  };

  const formatVolume = (value) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{symbol}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{companyName}</p>
        </div>
        <div className="flex gap-2">
          {onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(symbol);
              }}
              className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <FaChartLine className="h-5 w-5" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(symbol);
              }}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <FaTrash className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currency} {currentPrice?.toFixed(2)}
          </p>
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            <span className="font-semibold">{Math.abs(changePercent).toFixed(2)}%</span>
            <span className="ml-2">{change?.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            H: {currency} {high?.toFixed(2)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            L: {currency} {low?.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Volume</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatVolume(volume || 0)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatMarketCap(marketCap || 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockCard;