import React, { useState } from 'react';
import { FaChartLine, FaBalanceScale, FaCalculator, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Footer from './Footer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockComparison = () => {
  const [selectedMetric, setSelectedMetric] = useState('price');
  const [timeframe, setTimeframe] = useState('1Y');
  const [stock1, setStock1] = useState('AAPL');
  const [stock2, setStock2] = useState('MSFT');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sample price performance data
  const priceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: stock1,
        data: [150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      },
      {
        label: stock2,
        data: [280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  // Sample financial metrics data
  const financialData = {
    labels: ['Revenue', 'Net Income', 'Operating Margin', 'Free Cash Flow'],
    datasets: [
      {
        label: stock1,
        data: [100, 25, 30, 20],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      },
      {
        label: stock2,
        data: [90, 22, 28, 18],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  // Sample valuation ratios data
  const valuationData = {
    labels: ['P/E', 'P/B', 'P/S', 'EV/EBITDA'],
    datasets: [
      {
        label: stock1,
        data: [25, 3.2, 5.5, 18],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1
      },
      {
        label: stock2,
        data: [28, 3.5, 6.0, 20],
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgb(255, 159, 64)',
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
        text: 'Stock Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const metrics = [
    {
      id: 'price',
      name: 'Price Performance',
      icon: FaChartLine,
      description: 'Compare stock price movements over time',
      content: (
        <div className="space-y-6">
          <div className="h-[400px]">
            <Line options={chartOptions} data={priceData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">{stock1} Performance</h4>
              <p className="text-2xl text-green-500">+36.7%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Year to Date</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">{stock2} Performance</h4>
              <p className="text-2xl text-green-500">+19.6%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Year to Date</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financial',
      name: 'Financial Metrics',
      icon: FaBalanceScale,
      description: 'Compare key financial performance indicators',
      content: (
        <div className="space-y-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={financialData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Revenue Growth</h4>
              <p className="text-2xl text-green-500">{stock1}: +8.2%</p>
              <p className="text-2xl text-blue-500">{stock2}: +7.5%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Profit Margin</h4>
              <p className="text-2xl text-green-500">{stock1}: 25%</p>
              <p className="text-2xl text-blue-500">{stock2}: 24%</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'valuation',
      name: 'Valuation Ratios',
      icon: FaCalculator,
      description: 'Compare key valuation metrics',
      content: (
        <div className="space-y-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={valuationData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">P/E Ratio</h4>
              <p className="text-2xl text-blue-500">{stock1}: 25</p>
              <p className="text-2xl text-purple-500">{stock2}: 28</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">P/B Ratio</h4>
              <p className="text-2xl text-blue-500">{stock1}: 3.2</p>
              <p className="text-2xl text-purple-500">{stock2}: 3.5</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'growth',
      name: 'Growth Metrics',
      icon: FaChartBar,
      description: 'Compare growth and expansion indicators',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Revenue Growth</h4>
            <p className="text-2xl text-green-500">{stock1}: +8.2%</p>
            <p className="text-2xl text-blue-500">{stock2}: +7.5%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">EPS Growth</h4>
            <p className="text-2xl text-green-500">{stock1}: +12.3%</p>
            <p className="text-2xl text-blue-500">{stock2}: +10.8%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Free Cash Flow Growth</h4>
            <p className="text-2xl text-green-500">{stock1}: +15.4%</p>
            <p className="text-2xl text-blue-500">{stock2}: +13.2%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Dividend Growth</h4>
            <p className="text-2xl text-green-500">{stock1}: +7.8%</p>
            <p className="text-2xl text-blue-500">{stock2}: +10.2%</p>
          </div>
        </div>
      )
    },
    {
      id: 'risk',
      name: 'Risk Metrics',
      icon: FaExclamationTriangle,
      description: 'Compare risk and volatility indicators',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Beta</h4>
            <p className="text-2xl text-blue-500">{stock1}: 1.2</p>
            <p className="text-2xl text-purple-500">{stock2}: 1.1</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Volatility</h4>
            <p className="text-2xl text-blue-500">{stock1}: 18.5%</p>
            <p className="text-2xl text-purple-500">{stock2}: 16.8%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Debt/Equity</h4>
            <p className="text-2xl text-blue-500">{stock1}: 0.45</p>
            <p className="text-2xl text-purple-500">{stock2}: 0.38</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Interest Coverage</h4>
            <p className="text-2xl text-blue-500">{stock1}: 4.2x</p>
            <p className="text-2xl text-purple-500">{stock2}: 4.8x</p>
          </div>
        </div>
      )
    }
  ];

  const timeframes = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'];

  const handleCompare = () => {
    // Here you would typically fetch real data for the selected stocks
    console.log(`Comparing ${stock1} and ${stock2}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stock Comparison
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Compare stocks across multiple metrics and timeframes
          </p>
        </div>

        {/* Stock Selection */}
        <div className="flex flex-col sm:flex-row justify-center items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={stock1}
            onChange={(e) => setStock1(e.target.value.toUpperCase())}
            placeholder="Enter first stock symbol"
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={stock2}
            onChange={(e) => setStock2(e.target.value.toUpperCase())}
            placeholder="Enter second stock symbol"
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleCompare}
            className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Compare
          </button>
        </div>

        {/* Timeframe Selection */}
        <div className="flex flex-wrap justify-center mb-8 space-x-2 sm:space-x-4">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 sm:px-4 py-2 rounded-md font-medium mb-2 ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Metric Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                selectedMetric === metric.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <metric.icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{metric.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {metrics.find(m => m.id === selectedMetric)?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {metrics.find(m => m.id === selectedMetric)?.description}
            </p>
          </div>

          {/* Metric Content */}
          {metrics.find(m => m.id === selectedMetric)?.content}
        </div>

        {/* Summary Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {stock1} Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                <span className="text-gray-900 dark:text-white font-medium">$2.8T</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">52W High</span>
                <span className="text-gray-900 dark:text-white font-medium">$205.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">52W Low</span>
                <span className="text-gray-900 dark:text-white font-medium">$150.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Dividend Yield</span>
                <span className="text-gray-900 dark:text-white font-medium">0.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {stock2} Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                <span className="text-gray-900 dark:text-white font-medium">$2.5T</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">52W High</span>
                <span className="text-gray-900 dark:text-white font-medium">$335.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">52W Low</span>
                <span className="text-gray-900 dark:text-white font-medium">$280.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Dividend Yield</span>
                <span className="text-gray-900 dark:text-white font-medium">0.8%</span>
              </div>
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

export default StockComparison; 