import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StockCard = ({ title, data }) => {
  const isPositive = data.c > data.pc;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price</span>
          <span className="font-bold">${data.c}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">High</span>
          <span className="font-bold">${data.h}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Low</span>
          <span className="font-bold">${data.l}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Previous Close</span>
          <span className="font-bold">${data.pc}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Change</span>
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