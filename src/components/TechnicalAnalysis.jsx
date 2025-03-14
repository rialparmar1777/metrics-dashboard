import React, { useState, useEffect } from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuth } from '../services/auth.jsx';
import Footer from './Footer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TechnicalAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndicator, setSelectedIndicator] = useState('price');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sample data - Replace with real API data
  const priceData = {
    labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'],
    datasets: [
      {
        label: 'Price',
        data: [100, 102, 101, 103, 105, 104, 106, 107, 108, 109],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const rsiData = {
    labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'],
    datasets: [
      {
        label: 'RSI',
        data: [45, 52, 48, 55, 58, 62, 65, 68, 70, 72],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const macdData = {
    labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'],
    datasets: [
      {
        label: 'MACD',
        data: [0.5, 0.8, 0.6, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5],
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Signal Line',
        data: [0.3, 0.5, 0.4, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9],
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const volumeData = {
    labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'],
    datasets: [
      {
        label: 'Volume',
        data: [1000, 1500, 1200, 1800, 2000, 1600, 2200, 1900, 2400, 2100],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Technical Analysis Chart'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const indicators = [
    {
      id: 'price',
      name: 'Price Chart',
      description: 'Basic price chart showing the stock\'s price movement over time.',
      icon: FaChartLine
    },
    {
      id: 'ma',
      name: 'Moving Averages',
      description: 'Technical indicators that smooth out price data to identify trends.',
      icon: FaChartLine
    },
    {
      id: 'rsi',
      name: 'RSI',
      description: 'Relative Strength Index measures momentum and identifies overbought/oversold conditions.',
      icon: FaChartLine
    },
    {
      id: 'macd',
      name: 'MACD',
      description: 'Moving Average Convergence Divergence shows trend direction and momentum.',
      icon: FaChartLine
    },
    {
      id: 'volume',
      name: 'Volume Analysis',
      description: 'Analyzes trading volume to confirm price trends and identify potential reversals.',
      icon: FaChartLine
    }
  ];

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  const getChartData = () => {
    switch (selectedIndicator) {
      case 'price':
        return priceData;
      case 'rsi':
        return rsiData;
      case 'macd':
        return macdData;
      case 'volume':
        return volumeData;
      default:
        return priceData;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Advanced charting and technical indicators for informed trading decisions
          </p>
        </div>

        {/* Main Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          {/* Chart Controls */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            {/* Timeframe Selection */}
            <div className="flex space-x-2 mb-4 sm:mb-0">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedTimeframe === timeframe
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>

            {/* Indicator Selection */}
            <div className="relative">
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <FaInfoCircle className="h-5 w-5" />
              </button>
              {showTooltip && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 z-10">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {indicators.find(i => i.id === selectedIndicator)?.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[500px]">
            <Line options={chartOptions} data={getChartData()} />
          </div>
        </div>

        {/* Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((indicator) => (
            <div
              key={indicator.id}
              onClick={() => setSelectedIndicator(indicator.id)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
                selectedIndicator === indicator.id
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="flex items-center space-x-4">
                <indicator.icon className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {indicator.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {indicator.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Analysis Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaArrowUp className="text-green-500" />
                <span className="text-gray-900 dark:text-white font-medium">Trend</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Bullish
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-blue-500" />
                <span className="text-gray-900 dark:text-white font-medium">RSI</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                65.4
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-purple-500" />
                <span className="text-gray-900 dark:text-white font-medium">MACD</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Positive
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-orange-500" />
                <span className="text-gray-900 dark:text-white font-medium">Volume</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Above Average
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer 
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
    </div>
  );
};

export default TechnicalAnalysis; 