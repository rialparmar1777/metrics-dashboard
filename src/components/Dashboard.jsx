import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaGlobe, FaArrowUp, FaArrowDown, FaDollarSign, FaNewspaper } from 'react-icons/fa';
import StockCard from './StockCard';
import StockChart from './StockChart';
import api from '../services/api';

const Dashboard = () => {
  const [stockData, setStockData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        const stockPromises = techStocks.map(symbol => api.fetchStockData(symbol));
        const stockResults = await Promise.all(stockPromises);
        
        const stockDataObj = {};
        stockResults.forEach((result, index) => {
          stockDataObj[techStocks[index]] = result;
        });
        
        setStockData(stockDataObj);

        // Fetch historical data for selected stock
        const now = Math.floor(Date.now() / 1000);
        let from = now;
        switch (selectedTimeframe) {
          case '1D':
            from = now - 24 * 60 * 60;
            break;
          case '1W':
            from = now - 7 * 24 * 60 * 60;
            break;
          case '1M':
            from = now - 30 * 24 * 60 * 60;
            break;
          case '3M':
            from = now - 90 * 24 * 60 * 60;
            break;
          case '1Y':
            from = now - 365 * 24 * 60 * 60;
            break;
          default:
            from = now - 30 * 24 * 60 * 60;
        }

        const historicalResult = await api.getStockCandles(selectedStock, 'D', from, now);
        setHistoricalData({ [selectedStock]: historicalResult });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch market data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedStock, selectedTimeframe]);

  const handleStockSelect = (symbol) => {
    setSelectedStock(symbol);
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
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track your favorite tech stocks in real-time</p>
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
            onClick={() => handleStockSelect(symbol)}
            isSelected={selectedStock === symbol}
          />
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
            <FaDollarSign className="mr-2" />
            {selectedStock} Performance
          </h2>
          <div className="flex space-x-2">
            {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
        {historicalData[selectedStock] && (
          <StockChart data={historicalData[selectedStock]} symbol={selectedStock} />
        )}
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