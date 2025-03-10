import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import StockChart from '../components/StockChart';

const StockDetail = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/stock/${symbol}`);
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, [symbol]);

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const oneMonthAgo = now - 30 * 86400; // 30 days ago
        const response = await axios.get(`http://localhost:5001/historical/${symbol}?from=${oneMonthAgo}&to=${now}`);
        setHistoricalData(response.data);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [symbol]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Stock Details for {symbol}</h2>
      {stockData && (
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300">Current Price: ${stockData.c}</p>
          <p className="text-gray-700 dark:text-gray-300">High: ${stockData.h}</p>
          <p className="text-gray-700 dark:text-gray-300">Low: ${stockData.l}</p>
          <p className="text-gray-700 dark:text-gray-300">Open: ${stockData.o}</p>
          <p className="text-gray-700 dark:text-gray-300">Previous Close: ${stockData.pc}</p>
        </div>
      )}
      {historicalData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Historical Data</h3>
          <StockChart data={historicalData} />
        </div>
      )}
    </div>
  );
};

export default StockDetail;