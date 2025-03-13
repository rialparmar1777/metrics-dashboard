import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartLine, FaGlobe, FaArrowUp, FaArrowDown, FaDollarSign, 
  FaBalanceScale, FaExchangeAlt, FaStar, FaTrash, FaBell,
  FaFire, FaChartBar, FaRegClock, FaInfoCircle, FaSpinner,
  FaExclamationTriangle, FaSearch, FaFilter
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import StockCard from './StockCard';
import api from '../services/api';

const Dashboard = () => {
  const [stockData, setStockData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [selectedView, setSelectedView] = useState('grid');

  const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA'];

  const marketOverview = {
    totalMarketCap: Object.values(stockData).reduce((sum, stock) => sum + (stock?.marketCap || 0), 0),
    gainers: Object.values(stockData).filter(stock => stock?.changePercent > 0).length,
    losers: Object.values(stockData).filter(stock => stock?.changePercent < 0).length,
    averageChange: Object.values(stockData).reduce((sum, stock) => sum + (stock?.changePercent || 0), 0) / Object.values(stockData).length || 0,
    volume: '127.5M',
    volatility: '15.2%'
  };

  // Chart data with gradient
  const chartData = {
    labels: ['9:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:00'],
    datasets: [
      {
        label: 'Market Index',
        data: [100, 102, 101, 103, 102.5, 104, 105, 106],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
            weight: '500'
          },
          callback: (value) => `$${value}`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
            weight: '500'
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const isHealthy = await api.checkHealth();
        if (!isHealthy) {
          throw new Error('Server is not responding. Please try again later.');
        }

        const results = await api.fetchMultipleStockData(techStocks);
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
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Header with Market Overview */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl p-6 mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="text-white mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-2">Market Dashboard</h1>
                <p className="opacity-90 flex items-center">
                  <FaRegClock className="mr-2" />
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </p>
              </div>
              <div className="flex space-x-2">
                {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/20
                      bg-white/10 text-white"
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[240px] mb-6">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaDollarSign className="text-white/70 mr-2" />
                  <span className="text-white/70 text-sm">Market Cap</span>
                </div>
                <p className="text-white text-xl font-bold">
                  ${(marketOverview.totalMarketCap / 1000).toFixed(2)}B
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaArrowUp className="text-green-400 mr-2" />
                  <span className="text-white/70 text-sm">Gainers</span>
                </div>
                <p className="text-white text-xl font-bold">{marketOverview.gainers}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaArrowDown className="text-red-400 mr-2" />
                  <span className="text-white/70 text-sm">Losers</span>
                </div>
                <p className="text-white text-xl font-bold">{marketOverview.losers}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaChartLine className="text-white/70 mr-2" />
                  <span className="text-white/70 text-sm">Avg Change</span>
                </div>
                <p className={`text-xl font-bold ${
                  marketOverview.averageChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {marketOverview.averageChange.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaChartBar className="text-white/70 mr-2" />
                  <span className="text-white/70 text-sm">Volume</span>
                </div>
                <p className="text-white text-xl font-bold">{marketOverview.volume}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaFire className="text-white/70 mr-2" />
                  <span className="text-white/70 text-sm">Volatility</span>
                </div>
                <p className="text-white text-xl font-bold">{marketOverview.volatility}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Stock Cards */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaChartLine className="mr-2 text-blue-500" />
                  Tech Stocks Overview
                </h2>
                <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter stocks..."
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setSelectedView(selectedView === 'grid' ? 'list' : 'grid')}
                    className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <FaFilter className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className={`grid ${
                selectedView === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              } gap-6`}>
                {techStocks
                  .filter(symbol => symbol.includes(filterValue.toUpperCase()))
                  .map((symbol) => (
                    <StockCard
                      key={symbol}
                      data={stockData[symbol]}
                      view={selectedView}
                    />
                  ))
                }
              </div>
            </div>

            {/* Analysis Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/technical-analysis" className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <FaChartLine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">Technical Analysis</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced technical indicators and chart patterns
                </p>
              </Link>

              <Link to="/fundamental-analysis" className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <FaBalanceScale className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">Fundamental Analysis</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Company financials and key metrics
                </p>
              </Link>

              <Link to="/compare" className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <FaExchangeAlt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">Compare Stocks</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Side-by-side stock comparison
                </p>
              </Link>
            </div>
          </div>

          {/* Right Column - Watchlist */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FaStar className="mr-2 text-yellow-500" />
                Watchlist
              </h2>
              
              <form onSubmit={handleAddSymbol} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    placeholder="Add symbol (e.g., AAPL)"
                    className="flex-1 min-w-0 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap transition-colors"
                  >
                    Add
                  </button>
                </div>
              </form>

              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-24rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {watchlist.length === 0 ? (
                  <div className="text-center py-8">
                    <FaStar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Your watchlist is empty
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Add stocks to track them
                    </p>
                  </div>
                ) : (
                  watchlist.map((symbol) => (
                    <div
                      key={symbol}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">{symbol}</span>
                        <span className="ml-2 text-sm text-green-500">+2.45%</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSymbol(symbol)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none ml-2 transition-colors"
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
      </div>
    </div>
  );
};

export default Dashboard; 