import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, FaTrash, FaSearch, FaFilter, FaSortAmountUp, FaSortAmountDown, 
  FaSpinner, FaStar, FaChartLine, FaDollarSign, FaPercent, FaVolumeMute,
  FaArrowUp, FaArrowDown, FaExternalLinkAlt, FaInfoCircle, FaBell, FaTimes, FaEdit, FaChartPie
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import StockCard from './StockCard';
import api from '../services/api';
import { useAuth } from '../services/auth.jsx';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Tooltip from './common/Tooltip';
import Footer from './Footer';

const Watchlist = () => {
  // State management
  const [watchlist, setWatchlist] = useState([]);
  const [newStock, setNewStock] = useState('');
  const [stockData, setStockData] = useState({});
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Add new state for chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // Add new state for alerts
  const [priceAlerts, setPriceAlerts] = useState({});
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedStockForAlert, setSelectedStockForAlert] = useState(null);

  // Portfolio statistics with safe checks
  const portfolioStats = {
    totalValue: Object.values(stockData).reduce((sum, stock) => sum + (stock?.currentPrice || 0), 0),
    previousValue: Object.values(stockData).reduce((sum, stock) => sum + (stock?.previousClose || 0), 0),
    totalGain: Object.values(stockData).reduce((sum, stock) => {
      const change = ((stock?.currentPrice || 0) - (stock?.previousClose || 0)) / (stock?.previousClose || 1) * 100;
      return sum + change;
    }, 0) / (Object.keys(stockData).length || 1),
    gainers: Object.values(stockData).filter(stock => (stock?.changePercent || 0) > 0).length,
    losers: Object.values(stockData).filter(stock => (stock?.changePercent || 0) < 0).length,
    topPerformer: Object.entries(stockData).reduce((best, [symbol, data]) => {
      const change = ((data?.currentPrice || 0) - (data?.previousClose || 0)) / (data?.previousClose || 1) * 100;
      return change > (best?.change || -Infinity) ? { symbol, change } : best;
    }, { symbol: '-', change: -Infinity }),
    worstPerformer: Object.entries(stockData).reduce((worst, [symbol, data]) => {
      const change = ((data?.currentPrice || 0) - (data?.previousClose || 0)) / (data?.previousClose || 1) * 100;
      return change < (worst?.change || Infinity) ? { symbol, change } : worst;
    }, { symbol: '-', change: Infinity })
  };

  // Format large numbers with safety checks
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0.00';
    if (isNaN(num)) return '0.00';
    
    try {
      if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toFixed(2);
    } catch (error) {
      console.error('Error formatting number:', error);
      return '0.00';
    }
  };

  // Calculate performance metrics with safety checks
  const calculateMetrics = (stock) => {
    const data = stockData[stock.symbol] || {};
    return {
      dayChange: ((data?.currentPrice || 0) - (data?.previousClose || 0)) / (data?.previousClose || 1) * 100,
      weekChange: ((data?.currentPrice || 0) - (data?.weekOpen || data?.previousClose || 0)) / (data?.weekOpen || data?.previousClose || 1) * 100,
      monthChange: ((data?.currentPrice || 0) - (data?.monthOpen || data?.previousClose || 0)) / (data?.monthOpen || data?.previousClose || 1) * 100,
      volatility: data?.volatility || 0
    };
  };

  // Fetch watchlist data
  const fetchWatchlistData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const q = query(
        collection(db, 'watchlist'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const watchlistData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWatchlist(watchlistData);
    } catch (error) {
      setError('Failed to fetch watchlist. Please try again.');
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch stock data for all watchlist items
  const fetchAllStockData = useCallback(async () => {
    if (watchlist.length === 0) return;

    setIsUpdating(true);
    try {
      const results = await api.fetchMultipleStockData(watchlist.map(stock => stock.symbol));
      const stockDataObj = {};
      results.forEach(result => {
        if (!result.error) {
          stockDataObj[result.symbol] = result;
        }
      });
      setStockData(stockDataObj);
      setLastUpdated(new Date());
    } catch (error) {
      setError('Failed to fetch stock data. Please try again.');
      console.error('Error fetching stock data:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [watchlist]);

  // Search for stocks
  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await api.searchSymbol(query);
      setSearchResults(results.result || []);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  // Add a stock to watchlist
  const addStock = async (e) => {
    e.preventDefault();
    if (!newStock.trim()) return;

    if (watchlist.some(stock => stock.symbol === newStock.toUpperCase())) {
      setError('Stock already in watchlist');
      return;
    }

    try {
      setIsUpdating(true);
      setError('');
      const stockRef = await addDoc(collection(db, 'watchlist'), {
        symbol: newStock.toUpperCase(),
        userId: user.uid,
        addedAt: new Date().toISOString()
      });
      setWatchlist([...watchlist, {
        id: stockRef.id,
        symbol: newStock.toUpperCase(),
        addedAt: new Date().toISOString()
      }]);
      setNewStock('');
      setSearchResults([]);
    } catch (error) {
      setError('Failed to add stock to watchlist');
      console.error('Error adding stock:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove a stock from watchlist
  const removeStock = async (stockId) => {
    try {
      setIsUpdating(true);
      await deleteDoc(doc(db, 'watchlist', stockId));
      setWatchlist(watchlist.filter(stock => stock.id !== stockId));
    } catch (error) {
      setError('Failed to remove stock from watchlist');
      console.error('Error removing stock:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Sort and filter stocks
  const getSortedAndFilteredStocks = () => {
    return watchlist
      .filter(stock => stock.symbol.includes(filterValue.toUpperCase()))
      .sort((a, b) => {
        const aData = stockData[a.symbol];
        const bData = stockData[b.symbol];
        
        if (!aData || !bData) return 0;
        
        let comparison = 0;
        switch (sortBy) {
          case 'price':
            comparison = (aData.currentPrice || 0) - (bData.currentPrice || 0);
            break;
          case 'change':
            comparison = (aData.changePercent || 0) - (bData.changePercent || 0);
            break;
          default:
            comparison = a.symbol.localeCompare(b.symbol);
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  };

  // Initial data fetch
  useEffect(() => {
    fetchWatchlistData();
  }, [fetchWatchlistData]);

  // Fetch stock data when watchlist changes
  useEffect(() => {
    fetchAllStockData();
    const interval = setInterval(fetchAllStockData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchAllStockData]);

  // Add price alert
  const addPriceAlert = (symbol, price, condition) => {
    setPriceAlerts({
      ...priceAlerts,
      [symbol]: [...(priceAlerts[symbol] || []), { price, condition }]
    });
    setShowAlertModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header with Glassmorphism */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-12">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Watchlist</h1>
              {lastUpdated && (
                <p className="text-sm text-blue-100 flex items-center">
                  <FaSpinner className={`mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => fetchAllStockData()}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Enhanced Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Portfolio Value</h3>
                <FaDollarSign className="text-blue-300" />
              </div>
              <p className="text-3xl font-bold">${formatNumber(portfolioStats.totalValue)}</p>
              <div className="mt-2 text-sm text-blue-100">
                {formatNumber(portfolioStats.totalValue - portfolioStats.previousValue)} today
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Average Return</h3>
                <FaPercent className="text-green-300" />
              </div>
              <p className={`text-3xl font-bold ${portfolioStats.totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatNumber(portfolioStats.totalGain)}%
              </p>
              <div className="mt-2 text-sm text-blue-100">
                Across {watchlist.length} stocks
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top Performer</h3>
                <FaArrowUp className="text-green-300" />
              </div>
              <p className="text-3xl font-bold text-green-300">{portfolioStats.topPerformer.symbol}</p>
              <div className="mt-2 text-sm text-blue-100">
                {formatNumber(portfolioStats.topPerformer.change)}% gain
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Market Activity</h3>
                <FaChartLine className="text-blue-300" />
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-2xl font-bold text-green-300">{portfolioStats.gainers}</p>
                  <p className="text-sm text-blue-100">Gainers</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-2xl font-bold text-red-300">{portfolioStats.losers}</p>
                  <p className="text-sm text-blue-100">Losers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Display with Animation */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 animate-fade-in">
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Add Stock Form with Enhanced UI */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transform hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <FaStar className="mr-3 text-yellow-500" />
            Add to Watchlist
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={newStock}
                  onChange={(e) => {
                    setNewStock(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search by symbol or company name..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                    dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 
                    transition-all duration-300"
                />
              </div>
              
              {/* Enhanced Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
                  border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => {
                        setNewStock(result.symbol);
                        setSearchResults([]);
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 
                        border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{result.symbol}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{result.description}</div>
                        </div>
                        <FaExternalLinkAlt className="text-gray-400 h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={addStock}
              disabled={isUpdating || !newStock}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 
                transition-all duration-300 flex items-center justify-center min-w-[120px]"
            >
              {isUpdating ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Add Stock
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Filters and Sorting */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Filter your watchlist..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                  dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 
                  transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                  dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 
                  transition-all duration-300"
              >
                <option value="symbol">Symbol</option>
                <option value="price">Price</option>
                <option value="change">% Change</option>
                <option value="volume">Volume</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                  hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>
        </div>

        {/* Stock Grid with Enhanced Cards */}
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <FaStar className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start by adding some stocks to your watchlist. You can search by company name or symbol.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedAndFilteredStocks().map((stock) => (
              <div key={stock.id} className="transform hover:scale-105 transition-all duration-300">
                <StockCard
                  data={stockData[stock.symbol]}
                  onRemove={() => removeStock(stock.id)}
                  onSelect={() => setSelectedStock(selectedStock === stock.symbol ? null : stock.symbol)}
                  isSelected={selectedStock === stock.symbol}
                  onSetAlert={() => {
                    setSelectedStockForAlert(stock.symbol);
                    setShowAlertModal(true);
                  }}
                  hasAlerts={priceAlerts[stock.symbol]?.length > 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* Selected Stock Details with Chart */}
        {selectedStock && stockData[selectedStock] && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stockData[selectedStock].companyName} ({selectedStock})
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedStockForAlert(selectedStock);
                    setShowAlertModal(true);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <FaBell className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-[300px]">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Market Cap</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${formatNumber(stockData[selectedStock].marketCap)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Volume</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(stockData[selectedStock].volume)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">52W High</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${stockData[selectedStock].high?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">52W Low</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${stockData[selectedStock].low?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Today</span>
                      <span className={stockData[selectedStock].changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {stockData[selectedStock].changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">This Week</span>
                      <span className={stockData[selectedStock].weekChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {stockData[selectedStock].weekChange.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">This Month</span>
                      <span className={stockData[selectedStock].monthChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {stockData[selectedStock].monthChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Set Price Alert for {selectedStockForAlert}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert me when price is
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 
                      dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 
                      dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                    dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add alert logic here
                    setShowAlertModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transition-colors"
                >
                  Set Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer 
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
    </div>
  );
};

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    }
  }
};

export default Watchlist;