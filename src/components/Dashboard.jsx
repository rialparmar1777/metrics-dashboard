import React, { useState, useEffect, useRef } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const PULL_THRESHOLD = 80;

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

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (containerRef.current.scrollTop === 0) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartY > 0) {
        const pull = e.touches[0].clientY - touchStartY;
        if (pull > 0 && pull < PULL_THRESHOLD) {
          setPullDistance(pull);
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > PULL_THRESHOLD / 2) {
        setIsRefreshing(true);
        await fetchData();
      }
      setTouchStartY(0);
      setPullDistance(0);
      setIsRefreshing(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [touchStartY, pullDistance]);

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
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden touch-pan-y"
    >
      {/* Pull to refresh indicator */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center 
          transition-transform duration-300 bg-blue-500/10 backdrop-blur-sm
          ${pullDistance > 0 ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ height: `${pullDistance}px` }}
      >
        <div className="flex items-center space-x-2">
          <FaSpinner className={`text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm text-blue-500 font-medium">
            {pullDistance > PULL_THRESHOLD / 2 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error message with improved mobile styling */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 backdrop-blur-sm border border-red-400 
            dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2.5 rounded-lg mb-4 
            flex items-center text-sm shadow-lg animate-slide-in-top">
            <FaExclamationTriangle className="mr-2 flex-shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Enhanced Mobile Header with improved touch feedback */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 
          rounded-xl shadow-lg mb-4 p-4 overflow-hidden relative transform 
          transition-all duration-300 active:scale-[0.99] touch-manipulation">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
              <div className="text-white mb-3 sm:mb-0 w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Market Dashboard</h1>
                <p className="opacity-90 flex items-center text-sm">
                  <FaRegClock className="mr-2" />
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </p>
              </div>
              <div className="flex flex-row overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto 
                scrollbar-none -mx-1 px-1">
                {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium 
                      transition-all hover:bg-white/20 bg-white/10 text-white mr-2 flex-shrink-0
                      active:scale-95 touch-manipulation"
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[180px] sm:h-[240px] mb-4 sm:mb-6">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              {[
                { icon: FaDollarSign, label: 'Market Cap', value: `$${(marketOverview.totalMarketCap / 1000).toFixed(2)}B` },
                { icon: FaArrowUp, label: 'Gainers', value: marketOverview.gainers, color: 'text-green-400' },
                { icon: FaArrowDown, label: 'Losers', value: marketOverview.losers, color: 'text-red-400' },
                { icon: FaChartLine, label: 'Avg Change', value: `${marketOverview.averageChange.toFixed(2)}%`, 
                  color: marketOverview.averageChange >= 0 ? 'text-green-400' : 'text-red-400' },
                { icon: FaChartBar, label: 'Volume', value: marketOverview.volume },
                { icon: FaFire, label: 'Volatility', value: marketOverview.volatility }
              ].map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4
                  active:scale-95 touch-manipulation transition-transform">
                  <div className="flex items-center mb-1">
                    <item.icon className={`${item.color || 'text-white/70'} mr-1 sm:mr-2 text-sm sm:text-base`} />
                    <span className="text-white/70 text-xs">{item.label}</span>
                  </div>
                  <p className={`text-base sm:text-xl font-bold ${item.color || 'text-white'} truncate`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content with improved mobile grid and animations */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="lg:col-span-3 space-y-4">
            {/* Stock Cards Section with enhanced mobile interactions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 
              transform transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    <FaChartLine className="inline mr-2 text-blue-500" />
                    Tech Stocks
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedView(selectedView === 'grid' ? 'list' : 'grid')}
                      className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 
                        bg-gray-100 dark:bg-gray-700 rounded-lg active:scale-95 
                        transition-transform touch-manipulation"
                    >
                      <FaFilter className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter stocks..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 
                      rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                      dark:text-white text-sm transition-shadow"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 
                    text-gray-400" />
                </div>
              </div>
              
              <div className={`grid ${
                selectedView === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              } gap-3 animate-fade-in`}>
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

            {/* Analysis Tools with improved mobile touch targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  title: 'Technical Analysis',
                  icon: FaChartLine,
                  color: 'blue',
                  description: 'Advanced technical indicators and chart patterns',
                  path: '/technical-analysis'
                },
                {
                  title: 'Fundamental Analysis',
                  icon: FaBalanceScale,
                  color: 'green',
                  description: 'Company financials and key metrics',
                  path: '/fundamental-analysis'
                },
                {
                  title: 'Compare Stocks',
                  icon: FaExchangeAlt,
                  color: 'purple',
                  description: 'Side-by-side stock comparison',
                  path: '/compare'
                }
              ].map((tool) => (
                <Link
                  key={tool.title}
                  to={tool.path}
                  className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg 
                    p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
                    active:scale-95 touch-manipulation"
                >
                  <div className="flex items-center mb-2 sm:mb-4">
                    <div className={`p-2 sm:p-3 bg-${tool.color}-100 dark:bg-${tool.color}-900 
                      rounded-lg sm:rounded-xl group-hover:bg-${tool.color}-200 
                      dark:group-hover:bg-${tool.color}-800 transition-colors`}>
                      <tool.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${tool.color}-600 
                        dark:text-${tool.color}-400`} />
                    </div>
                    <h3 className="ml-3 sm:ml-4 text-base sm:text-lg font-semibold text-gray-900 
                      dark:text-white">{tool.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-none">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Watchlist with improved mobile scrolling */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 
              lg:sticky lg:top-4 transform transition-all duration-300 
              hover:shadow-xl">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 
                flex items-center">
                <FaStar className="mr-2 text-yellow-500" />
                Watchlist
              </h2>
              
              <form onSubmit={handleAddSymbol} className="mb-4 sm:mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    placeholder="Add symbol (e.g., AAPL)"
                    className="flex-1 min-w-0 px-4 py-2 border border-gray-200 dark:border-gray-600 
                      rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                      dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap 
                      transition-colors active:scale-95 touch-manipulation"
                  >
                    Add
                  </button>
                </div>
              </form>

              <div className="space-y-2 overflow-y-auto overscroll-contain 
                max-h-[calc(100vh-24rem)] momentum-scroll">
                {watchlist.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <FaStar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 
                      dark:text-gray-600 mb-3 sm:mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                      Your watchlist is empty
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 sm:mt-2">
                      Add stocks to track them
                    </p>
                  </div>
                ) : (
                  watchlist.map((symbol) => (
                    <div
                      key={symbol}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 
                        dark:bg-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 
                        dark:hover:bg-gray-600 transition-colors active:bg-gray-200 
                        dark:active:bg-gray-500 active:scale-95 touch-manipulation"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">{symbol}</span>
                        <span className="ml-2 text-sm text-green-500">+2.45%</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSymbol(symbol)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none ml-2 
                          transition-colors p-2 rounded-lg hover:bg-gray-200 
                          dark:hover:bg-gray-500 active:scale-95 touch-manipulation"
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