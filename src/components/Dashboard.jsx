import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaGlobe, FaArrowUp, FaArrowDown, FaDollarSign, FaBalanceScale, FaExchangeAlt, FaStar, FaTrash } from 'react-icons/fa';
import StockCard from './StockCard';
import api from '../services/api';

const Dashboard = () => {
  const [stockData, setStockData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [newSymbol, setNewSymbol] = useState('');

  const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA'];

  const marketOverview = {
    totalMarketCap: Object.values(stockData).reduce((sum, stock) => sum + (stock?.marketCap || 0), 0),
    gainers: Object.values(stockData).filter(stock => stock?.changePercent > 0).length,
    losers: Object.values(stockData).filter(stock => stock?.changePercent < 0).length,
    averageChange: Object.values(stockData).reduce((sum, stock) => sum + (stock?.changePercent || 0), 0) / Object.values(stockData).length || 0
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Check server health first
        const isHealthy = await api.checkHealth();
        if (!isHealthy) {
          throw new Error('Server is not responding. Please try again later.');
        }

        // Fetch stock data for all tech stocks
        const results = await api.fetchMultipleStockData(techStocks);
        
        // Convert array to object
        const stockDataObj = {};
        results.forEach(result => {
          if (!result.error) {
            stockDataObj[result.symbol] = result;
          }
        });
        
        setStockData(stockDataObj);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch market data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  const handleAddSymbol = (e) => {
    e.preventDefault();
    if (!newSymbol) return;

    const symbol = newSymbol.toUpperCase();
    if (watchlist.includes(symbol)) {
      setError('Symbol already in watchlist');
      return;
    }

    const updatedWatchlist = [...watchlist, symbol];
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    setNewSymbol('');
    setError('');
  };

  const handleRemoveSymbol = (symbol) => {
    const updatedWatchlist = watchlist.filter(s => s !== symbol);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold flex items-center justify-center text-gray-900 dark:text-white">
          <FaChartLine className="mr-2" />
          Tech Stocks Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your favorite tech stocks in real-time
          {lastUpdated && (
            <span className="ml-2 text-sm">
              (Last updated: {lastUpdated.toLocaleTimeString()})
            </span>
          )}
        </p>
      </header>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <FaGlobe className="text-blue-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Overview</h3>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">Total Market Cap</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(marketOverview.totalMarketCap / 1000).toFixed(2)}B
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <FaArrowUp className="text-green-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gainers</h3>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-2xl font-bold text-green-500">{marketOverview.gainers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <FaArrowDown className="text-red-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Losers</h3>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-2xl font-bold text-red-500">{marketOverview.losers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <FaChartLine className="text-blue-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avg Change</h3>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">Today</p>
            <p className={`text-2xl font-bold ${
              marketOverview.averageChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {marketOverview.averageChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {techStocks.map((symbol) => (
          <StockCard
            key={symbol}
            data={stockData[symbol]}
          />
        ))}
      </div>

      {/* Analysis Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Analysis Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/technical"
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <FaChartLine className="h-6 w-6 text-blue-500" />
                <h3 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Technical Analysis</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Analyze stock performance with technical indicators and charts
              </p>
            </Link>

            <Link
              to="/fundamental"
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <FaBalanceScale className="h-6 w-6 text-green-500" />
                <h3 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Fundamental Analysis</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Review company financials and key metrics
              </p>
            </Link>

            <Link
              to="/compare"
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <FaExchangeAlt className="h-6 w-6 text-purple-500" />
                <h3 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Compare Stocks</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Compare multiple stocks side by side
              </p>
            </Link>
          </div>
        </div>

        {/* Watchlist */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <FaStar className="h-5 w-5 text-yellow-500 mr-2" />
              Watchlist
            </h2>
            
            <form onSubmit={handleAddSymbol} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="Add symbol (e.g., AAPL)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>

            <div className="space-y-2">
              {watchlist.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No stocks in watchlist</p>
              ) : (
                watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{symbol}</span>
                    <button
                      onClick={() => handleRemoveSymbol(symbol)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Want to track your own stocks?</h2>
        <p className="mb-6">Create your personalized watchlist and get real-time updates.</p>
        <Link
          to="/watchlist"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Create Watchlist
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 