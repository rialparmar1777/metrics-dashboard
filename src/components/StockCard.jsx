import React from 'react';
import { FaArrowUp, FaArrowDown, FaTrash, FaChartLine } from 'react-icons/fa';

const StockCard = ({ title, data, onRemove, onClick, isSelected }) => {
  if (!data) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}>
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const isPositive = data.c > data.pc;
  const changePercent = ((data.c - data.pc) / data.pc) * 100;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            <FaChartLine />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Current Price</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${data.c.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Change</span>
          <div className="flex items-center">
            <span className={`text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />}
              ${Math.abs(data.c - data.pc).toFixed(2)}
            </span>
            <span className={`ml-2 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
            <p className="font-semibold text-gray-900 dark:text-white">${data.h.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
            <p className="font-semibold text-gray-900 dark:text-white">${data.l.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;