import React, { useEffect, useState } from 'react';
import { fetchStockData, getWatchlist, saveWatchlist, fetchHistoricalData } from '../../services/api';
import StockCard from './StockCard';
import StockChart from './StockChart';
import Navbar from './Navbar';
import { FaPlus, FaTrash, FaChartLine, FaSearch, FaFilter, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [newStock, setNewStock] = useState('');
  const [stockData, setStockData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('symbol'); // 'symbol', 'price', 'change'
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterValue, setFilterValue] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalGain: 0,
    topPerformer: null,
    worstPerformer: null
  });

  const userId = localStorage.getItem('userId');

  // Fetch watchlist on component mount
  useEffect(() => {
    const fetchWatchlistData = async () => {
      try {
        const data = await getWatchlist(userId);
        setWatchlist(data.stocks || []);
      } catch (error) {
        setError('Failed to fetch watchlist');
        console.error('Error fetching watchlist:', error);
      }
    };

    if (userId) {
      fetchWatchlistData();
    }
  }, [userId]);

  // Fetch live stock data and historical data for each stock in the watchlist
  useEffect(() => {
    const fetchAllData = async () => {
      const stockDataTemp = {};
      const historicalDataTemp = {};
      const now = Math.floor(Date.now() / 1000);
      const oneMonthAgo = now - 30 * 86400;

      for (const symbol of watchlist) {
        try {
          const [stockInfo, historical] = await Promise.all([
            fetchStockData(symbol),
            fetchHistoricalData(symbol, 'D', oneMonthAgo, now)
          ]);
          stockDataTemp[symbol] = stockInfo;
          historicalDataTemp[symbol] = historical;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
      }
      setStockData(stockDataTemp);
      setHistoricalData(historicalDataTemp);
      calculatePortfolioStats(stockDataTemp);
    };

    if (watchlist.length > 0) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 5000);
      return () => clearInterval(interval);
    }
  }, [watchlist]);

  const calculatePortfolioStats = (data) => {
    if (Object.keys(data).length === 0) return;

    let total = 0;
    let totalChange = 0;
    let best = { symbol: '', change: -Infinity };
    let worst = { symbol: '', change: Infinity };

    Object.entries(data).forEach(([symbol, stock]) => {
      if (!stock) return;
      
      const price = stock.c || 0;
      const prevPrice = stock.pc || 0;
      const change = ((price - prevPrice) / prevPrice) * 100;
      
      total += price;
      totalChange += change;

      if (change > best.change) {
        best = { symbol, change };
      }
      if (change < worst.change) {
        worst = { symbol, change };
      }
    });

    setPortfolioStats({
      totalValue: total,
      totalGain: totalChange / Object.keys(data).length,
      topPerformer: best.symbol,
      worstPerformer: worst.symbol
    });
  };

  // Add a stock to the watchlist
  const addStock = async () => {
    if (!newStock) {
      setError('Please enter a stock symbol');
      return;
    }

    const symbol = newStock.toUpperCase();
    if (watchlist.includes(symbol)) {
      setError('Stock already in watchlist');
      return;
    }

    try {
      const updatedWatchlist = [...watchlist, symbol];
      await saveWatchlist(updatedWatchlist);
      setWatchlist(updatedWatchlist);
      setNewStock('');
      setError('');
    } catch (error) {
      setError('Failed to add stock to watchlist');
      console.error('Error adding stock:', error);
    }
  };

  // Remove a stock from the watchlist
  const removeStock = async (symbol) => {
    try {
      const updatedWatchlist = watchlist.filter((stock) => stock !== symbol);
      await saveWatchlist(updatedWatchlist);
      setWatchlist(updatedWatchlist);
      if (selectedStock === symbol) {
        setSelectedStock(null);
      }
    } catch (error) {
      setError('Failed to remove stock from watchlist');
      console.error('Error removing stock:', error);
    }
  };

  // Sort and filter stocks
  const getSortedAndFilteredStocks = () => {
    return watchlist
      .filter(symbol => symbol.includes(filterValue.toUpperCase()))
      .sort((a, b) => {
        const aData = stockData[a];
        const bData = stockData[b];
        
        if (!aData || !bData) return 0;
        
        let comparison = 0;
        switch (sortBy) {
          case 'price':
            comparison = (aData.c || 0) - (bData.c || 0);
            break;
          case 'change':
            const aChange = ((aData.c - aData.pc) / aData.pc) * 100;
            const bChange = ((bData.c - bData.pc) / bData.pc) * 100;
            comparison = aChange - bChange;
            break;
          default:
            comparison = a.localeCompare(b);
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">My Watchlist</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="text-sm opacity-70">Portfolio Value</h3>
              <p className="text-2xl font-bold">${portfolioStats.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="text-sm opacity-70">Average Gain/Loss</h3>
              <p className={`text-2xl font-bold ${portfolioStats.totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {portfolioStats.totalGain.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="text-sm opacity-70">Top Performer</h3>
              <p className="text-2xl font-bold text-green-300">{portfolioStats.topPerformer || '-'}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="text-sm opacity-70">Worst Performer</h3>
              <p className="text-2xl font-bold text-red-300">{portfolioStats.worstPerformer || '-'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Add Stock Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              onClick={addStock}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Add Stock
            </button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-grow relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Filter stocks..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="symbol">Symbol</option>
                <option value="price">Price</option>
                <option value="change">Change</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border rounded-lg dark:border-gray-600"
              >
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>
        </div>

        {/* Stock List and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getSortedAndFilteredStocks().map((symbol) => (
                <StockCard
                  key={symbol}
                  title={symbol}
                  data={stockData[symbol]}
                  onRemove={() => removeStock(symbol)}
                  onClick={() => setSelectedStock(symbol)}
                  isSelected={selectedStock === symbol}
                />
              ))}
            </div>
          </div>

          {/* Chart Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaChartLine className="mr-2" />
                Performance Chart
              </h2>
              {selectedStock && historicalData[selectedStock] ? (
                <StockChart data={historicalData[selectedStock]} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Select a stock to view its performance chart
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-sm opacity-80">
                Track your favorite stocks in real-time with our advanced watchlist features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="hover:text-blue-200">Dashboard</a></li>
                <li><a href="/watchlist" className="hover:text-blue-200">Watchlist</a></li>
                <li><a href="/settings" className="hover:text-blue-200">Settings</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-sm opacity-80">
                Questions? Reach out to our support team.
              </p>
            </div>
          </div>
          <div className="border-t border-blue-500 mt-8 pt-8 text-center">
            <p>© 2024 Stock Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Watchlist;