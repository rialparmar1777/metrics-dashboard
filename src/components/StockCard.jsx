import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StockCard = ({ title, data }) => {
  const isPositive = data.c > data.pc;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">{title}</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Current Price</span>
          <span className="font-bold text-blue-800 dark:text-blue-200">${data.c}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">High</span>
          <span className="font-bold text-blue-800 dark:text-blue-200">${data.h}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Low</span>
          <span className="font-bold text-blue-800 dark:text-blue-200">${data.l}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Previous Close</span>
          <span className="font-bold text-blue-800 dark:text-blue-200">${data.pc}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Change</span>
          <span
            className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? <FaArrowUp className="inline" /> : <FaArrowDown className="inline" />}
            ${(data.c - data.pc).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;