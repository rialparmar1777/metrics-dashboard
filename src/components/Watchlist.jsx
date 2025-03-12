import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaSearch, FaFilter, FaSortAmountUp, FaSortAmountDown, FaSpinner, FaStar } from 'react-icons/fa';
import StockCard from './StockCard';
import api from '../services/api';
import { useAuth } from '../services/auth.jsx';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Tooltip from './common/Tooltip';

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

  // Portfolio statistics
  const portfolioStats = {
    totalValue: Object.values(stockData).reduce((sum, stock) => sum + (stock?.currentPrice || 0), 0),
    totalGain: Object.values(stockData).reduce((sum, stock) => {
      const change = ((stock?.currentPrice || 0) - (stock?.previousClose || 0)) / (stock?.previousClose || 1) * 100;
      return sum + change;
    }, 0) / (Object.keys(stockData).length || 1),
    topPerformer: Object.entries(stockData).reduce((best, [symbol, data]) => {
      const change = ((data?.currentPrice || 0) - (data?.previousClose || 0)) / (data?.previousClose || 1) * 100;
      return change > (best?.change || -Infinity) ? { symbol, change } : best;
    }, null)?.symbol,
    worstPerformer: Object.entries(stockData).reduce((worst, [symbol, data]) => {
      const change = ((data?.currentPrice || 0) - (data?.previousClose || 0)) / (data?.previousClose || 1) * 100;
      return change < (worst?.change || Infinity) ? { symbol, change } : worst;
    }, null)?.symbol
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">My Watchlist</h1>
          {lastUpdated && (
            <p className="text-sm opacity-70 mb-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
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
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <FaStar className="mr-2" />
            Add Stock to Watchlist
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newStock}
                onChange={(e) => {
                  setNewStock(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Enter stock symbol..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={(e) => {
                        e.preventDefault();
                        setNewStock(result.symbol);
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="font-semibold">{result.symbol}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{result.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={addStock}
              disabled={isUpdating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? <FaSpinner className="animate-spin" /> : 'Add'}
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

        {/* Stock List */}
        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Your watchlist is empty. Add some stocks to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedAndFilteredStocks().map((stock) => (
              <StockCard
                key={stock.id}
                data={stockData[stock.symbol]}
                onRemove={() => removeStock(stock.id)}
                onSelect={(symbol) => setSelectedStock(selectedStock === symbol ? null : symbol)}
                isSelected={selectedStock === stock.symbol}
              />
            ))}
          </div>
        )}

        {/* Selected Stock Details */}
        {selectedStock && stockData[selectedStock] && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {stockData[selectedStock].companyName} ({selectedStock})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Market Cap</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${(stockData[selectedStock].marketCap / 1e9).toFixed(2)}B
                </p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Volume</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(stockData[selectedStock].volume / 1e6).toFixed(1)}M
                </p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">52 Week High</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${stockData[selectedStock].high?.toFixed(2)}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">52 Week Low</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${stockData[selectedStock].low?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;