import React, { useState } from 'react';
import { FaChartBar, FaFileAlt, FaCalculator, FaChartLine, FaBalanceScale } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Footer from './Footer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FundamentalAnalysis = () => {
  const [selectedSection, setSelectedSection] = useState('ratios');
  const [selectedTimeframe, setSelectedTimeframe] = useState('2023');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sample data for financial ratios
  const ratiosData = {
    labels: ['P/E Ratio', 'P/B Ratio', 'Debt/Equity', 'Current Ratio', 'ROE'],
    datasets: [
      {
        label: 'Company',
        data: [25.4, 3.2, 0.45, 1.8, 15.2],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'Industry Average',
        data: [22.1, 2.8, 0.52, 1.6, 13.8],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  // Sample income statement data
  const incomeStatementData = {
    labels: ['Revenue', 'Cost of Goods', 'Operating Expenses', 'EBIT', 'Net Income'],
    datasets: [
      {
        label: '2023',
        data: [1000000, 600000, 200000, 200000, 150000],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  // Sample balance sheet data
  const balanceSheetData = {
    labels: ['Assets', 'Liabilities', 'Equity', 'Current Assets', 'Current Liabilities'],
    datasets: [
      {
        label: '2023',
        data: [2000000, 800000, 1200000, 500000, 300000],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
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
        text: 'Financial Analysis'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const sections = [
    {
      id: 'ratios',
      name: 'Financial Ratios',
      icon: FaCalculator,
      description: 'Key financial ratios and metrics for company analysis',
      content: (
        <div className="space-y-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={ratiosData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">P/E Ratio</h4>
              <p className="text-2xl text-blue-500">25.4</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price to Earnings ratio</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">P/B Ratio</h4>
              <p className="text-2xl text-blue-500">3.2</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price to Book ratio</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Debt/Equity</h4>
              <p className="text-2xl text-blue-500">0.45</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Debt to Equity ratio</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'income',
      name: 'Income Statement',
      icon: FaFileAlt,
      description: 'Analysis of revenue, expenses, and profitability',
      content: (
        <div className="space-y-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={incomeStatementData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Revenue Growth</h4>
              <p className="text-2xl text-green-500">+12.5%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Year over Year</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Profit Margin</h4>
              <p className="text-2xl text-green-500">15%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Income / Revenue</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'balance',
      name: 'Balance Sheet',
      icon: FaBalanceScale,
      description: 'Analysis of assets, liabilities, and equity',
      content: (
        <div className="space-y-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={balanceSheetData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Total Assets</h4>
              <p className="text-2xl text-blue-500">$2M</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current + Non-current</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Working Capital</h4>
              <p className="text-2xl text-blue-500">$200K</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Assets - Current Liabilities</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'kpis',
      name: 'Key Performance Indicators',
      icon: FaChartLine,
      description: 'Important metrics for business performance',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Revenue Growth</h4>
            <p className="text-2xl text-green-500">+12.5%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">YoY Growth</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Gross Margin</h4>
            <p className="text-2xl text-blue-500">40%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gross Profit / Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Operating Margin</h4>
            <p className="text-2xl text-purple-500">20%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Operating Income / Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">ROE</h4>
            <p className="text-2xl text-orange-500">15.2%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Return on Equity</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Fundamental Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive analysis of company financials and performance metrics
          </p>
        </div>

        {/* Timeframe Selection */}
        <div className="flex justify-center mb-8 space-x-4">
          {['2021', '2022', '2023'].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedTimeframe(year)}
              className={`px-4 py-2 rounded-md font-medium ${
                selectedTimeframe === year
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Section Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                selectedSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <section.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{section.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {sections.find(s => s.id === selectedSection)?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {sections.find(s => s.id === selectedSection)?.description}
            </p>
          </div>

          {/* Section Content */}
          {sections.find(s => s.id === selectedSection)?.content}
        </div>

        {/* Additional Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Financial Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Ratio</span>
                <span className="text-gray-900 dark:text-white font-medium">1.8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Debt Ratio</span>
                <span className="text-gray-900 dark:text-white font-medium">0.45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Interest Coverage</span>
                <span className="text-gray-900 dark:text-white font-medium">4.2x</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profitability
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Gross Margin</span>
                <span className="text-gray-900 dark:text-white font-medium">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Operating Margin</span>
                <span className="text-gray-900 dark:text-white font-medium">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Net Margin</span>
                <span className="text-gray-900 dark:text-white font-medium">15%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Efficiency
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Asset Turnover</span>
                <span className="text-gray-900 dark:text-white font-medium">0.8x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Inventory Turnover</span>
                <span className="text-gray-900 dark:text-white font-medium">6.2x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Receivables Turnover</span>
                <span className="text-gray-900 dark:text-white font-medium">8.5x</span>
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

export default FundamentalAnalysis; 