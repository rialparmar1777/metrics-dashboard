import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchStockData, fetchHistoricalData } from '../services/api';
import StockChart from './components/StockChart';
import StockCard from './components/StockCard';
import { FaChartLine, FaDollarSign } from 'react-icons/fa';
import Navbar from './components/Navbar';

function App() {
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Fetch live stock data every 5 seconds
  useEffect(() => {
    const fetchLiveData = async () => {
      const currentData = await fetchStockData('AAPL');
      setStockData(currentData);
    };

    // Fetch data immediately
    fetchLiveData();

    // Set up polling
    const interval = setInterval(fetchLiveData, 5000); // Fetch every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch watchlist for a user
  const fetchWatchlist = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5001/watchlist/${userId}`);
      setWatchlist(response.data.stocks);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  // Fetch historical data once on mount
  useEffect(() => {
    const fetchHistorical = async () => {
      const now = Math.floor(Date.now() / 1000);
      const oneMonthAgo = now - 30 * 86400; // 30 days ago
      const historical = await fetchHistoricalData('AAPL', 'D', oneMonthAgo, now);
      setHistoricalData(historical);
    };

    fetchHistorical();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <header className="text-center py-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <h1 className="text-4xl font-bold flex items-center justify-center">
          <FaChartLine className="mr-2" />
          Tech Stocks Dashboard
        </h1>
        <p className="text-gray-200 mt-2">Track your favorite tech stocks in real-time.</p>
      </header>

      <main className="container mx-auto p-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stockData && (
            <StockCard
              title="Apple Inc. (AAPL)"
              data={stockData}
            />
          )}

          {historicalData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800 dark:text-blue-200">
                <FaDollarSign className="mr-2" />
                Historical Data
              </h2>
              <StockChart data={historicalData} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-blue-600 text-white text-center py-4 mt-8">
        <p>© 2023 Stock Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;