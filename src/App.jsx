import React, { useEffect, useState } from 'react';
import { fetchStockData, fetchHistoricalData } from '../services/api';
import StockChart from './components/StockChart';
import StockCard from './components/StockCard';
import { FaChartLine, FaDollarSign, FaArrowUp, FaArrowDown, FaGlobe, FaNewspaper } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Link } from 'react-router-dom';

function App() {
  const [stockData, setStockData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [marketOverview, setMarketOverview] = useState(null);
  const [news, setNews] = useState([]);

  // Popular tech stocks to track
  const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA'];

  // Fetch live stock data every 5 seconds
  useEffect(() => {
    const fetchLiveData = async () => {
      const data = {};
      for (const symbol of techStocks) {
        try {
          const currentData = await fetchStockData(symbol);
          data[symbol] = currentData;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
      }
      setStockData(data);
    };

    // Fetch data immediately
    fetchLiveData();

    // Set up polling
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch historical data for all stocks
  useEffect(() => {
    const fetchHistorical = async () => {
      const now = Math.floor(Date.now() / 1000);
      const oneMonthAgo = now - 30 * 86400;
      const data = {};
      
      for (const symbol of techStocks) {
        try {
          const historical = await fetchHistoricalData(symbol, 'D', oneMonthAgo, now);
          data[symbol] = historical;
        } catch (error) {
          console.error(`Error fetching historical data for ${symbol}:`, error);
        }
      }
      setHistoricalData(data);
    };

    fetchHistorical();
  }, []);

  // Calculate market overview
  useEffect(() => {
    if (Object.keys(stockData).length > 0) {
      const overview = {
        totalMarketCap: 0,
        gainers: 0,
        losers: 0,
        averageChange: 0,
      };

      Object.values(stockData).forEach(stock => {
        if (stock && stock.c && stock.pc) {
          overview.totalMarketCap += stock.c;
          if (stock.c > stock.pc) overview.gainers++;
          if (stock.c < stock.pc) overview.losers++;
          overview.averageChange += ((stock.c - stock.pc) / stock.pc) * 100;
        }
      });

      overview.averageChange = overview.averageChange / Object.keys(stockData).length;
      setMarketOverview(overview);
    }
  }, [stockData]);

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
        {/* Market Overview Section */}
        {marketOverview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <FaGlobe className="text-blue-500 text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Market Overview</h3>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">Total Market Cap</p>
                <p className="text-2xl font-bold">${marketOverview.totalMarketCap.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <FaArrowUp className="text-green-500 text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Gainers</h3>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-green-500">{marketOverview.gainers}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <FaArrowDown className="text-red-500 text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Losers</h3>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-red-500">{marketOverview.losers}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <FaChartLine className="text-blue-500 text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Avg Change</h3>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">Today</p>
                <p className={`text-2xl font-bold ${marketOverview.averageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketOverview.averageChange.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stock Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {techStocks.map((symbol) => (
            <StockCard
              key={symbol}
              title={`${symbol} Stock`}
              data={stockData[symbol]}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center text-blue-800 dark:text-blue-200">
                <FaDollarSign className="mr-2" />
                Historical Data
              </h2>
              <div className="flex space-x-2">
                {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 rounded ${
                      selectedTimeframe === timeframe
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <StockChart data={historicalData['AAPL']} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800 dark:text-blue-200">
              <FaNewspaper className="mr-2" />
              Market News
            </h2>
            <div className="space-y-4">
              {news.map((item, index) => (
                <div key={index} className="border-b dark:border-gray-700 pb-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.summary}</p>
                </div>
              ))}
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
            Go to Watchlist
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;