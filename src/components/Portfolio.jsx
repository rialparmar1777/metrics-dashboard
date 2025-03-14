import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaChartPie, FaInfoCircle } from 'react-icons/fa';
import portfolioService from '../services/portfolioService';
import api from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import Footer from './Footer';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const sectors = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Industrials',
  'Energy',
  'Materials',
  'Real Estate',
  'Utilities',
  'Communication Services'
];

const Portfolio = () => {
  const [positions, setPositions] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    sector: 'Technology'
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch positions and current prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userPositions = await portfolioService.getUserPositions();
        setPositions(userPositions);

        // Fetch current prices for all positions
        const symbols = userPositions.map(p => p.symbol);
        const prices = {};
        for (const symbol of symbols) {
          const quote = await api.fetchStockQuote(symbol);
          prices[symbol] = quote;
        }
        setCurrentPrices(prices);

        // Calculate portfolio metrics
        const portfolioMetrics = portfolioService.calculateMetrics(userPositions, prices);
        setMetrics(portfolioMetrics);
      } catch (err) {
        setError('Failed to load portfolio data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const positionData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: new Date(formData.purchaseDate).toISOString()
      };

      if (editingPosition) {
        await portfolioService.updatePosition(editingPosition.id, positionData);
      } else {
        await portfolioService.addPosition(positionData);
      }

      // Refresh positions
      const updatedPositions = await portfolioService.getUserPositions();
      setPositions(updatedPositions);
      
      // Reset form
      setFormData({
        symbol: '',
        quantity: '',
        purchasePrice: '',
        purchaseDate: '',
        sector: 'Technology'
      });
      setShowAddForm(false);
      setEditingPosition(null);
    } catch (err) {
      setError('Failed to save position');
      console.error(err);
    }
  };

  const handleDelete = async (positionId) => {
    try {
      await portfolioService.deletePosition(positionId);
      const updatedPositions = await portfolioService.getUserPositions();
      setPositions(updatedPositions);
    } catch (err) {
      setError('Failed to delete position');
      console.error(err);
    }
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setFormData({
      symbol: position.symbol,
      quantity: position.quantity.toString(),
      purchasePrice: position.purchasePrice.toString(),
      purchaseDate: new Date(position.purchaseDate).toISOString().split('T')[0],
      sector: position.sector
    });
    setShowAddForm(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Prepare data for the diversity chart
  const diversityChartData = {
    labels: Object.keys(metrics?.diversity || {}),
    datasets: [
      {
        data: Object.values(metrics?.diversity || {}),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Management</h1>
          
          {/* Portfolio Summary */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Value</h3>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalValue)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Cost</h3>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{formatCurrency(metrics.totalCost)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Gain/Loss</h3>
                <p className={`text-2xl font-bold ${metrics.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.totalGain)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Return</h3>
                <p className={`text-2xl font-bold ${metrics.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(metrics.totalGainPercent)}
                </p>
              </div>
            </div>
          )}

          {/* Portfolio Diversity Chart */}
          {metrics && Object.keys(metrics.diversity).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Portfolio Diversity</h2>
              <div className="w-full max-w-md mx-auto">
                <Doughnut data={diversityChartData} options={{ responsive: true }} />
              </div>
            </div>
          )}

          {/* Position Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Positions</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <FaPlus className="mr-2" />
                  {editingPosition ? 'Edit Position' : 'Add Position'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {showAddForm && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Symbol
                      </label>
                      <input
                        type="text"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchase Price
                      </label>
                      <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sector
                      </label>
                      <select
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        {sectors.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingPosition(null);
                        setFormData({
                          symbol: '',
                          quantity: '',
                          purchasePrice: '',
                          purchaseDate: '',
                          sector: 'Technology'
                        });
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {editingPosition ? 'Update Position' : 'Add Position'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Purchase Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {positions.map((position) => {
                    const currentPrice = currentPrices[position.symbol]?.c || position.purchasePrice;
                    const gainLoss = (currentPrice - position.purchasePrice) * position.quantity;
                    const gainLossPercent = ((currentPrice - position.purchasePrice) / position.purchasePrice) * 100;

                    return (
                      <tr key={position.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {position.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {position.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatCurrency(position.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatCurrency(currentPrice)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(gainLoss)} ({formatPercent(gainLossPercent)})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {position.sector}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(position)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(position.id)}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

export default Portfolio; 