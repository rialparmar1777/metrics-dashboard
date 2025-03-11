import React, { useState, useEffect } from 'react';
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
import { FaSpinner } from 'react-icons/fa';

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

const StockChart = ({ data, symbol }) => {
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('1M'); // 1D, 1W, 1M, 3M, 1Y
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!data || data.s === 'no_data') {
      setIsLoading(false);
      return;
    }

    try {
      const timestamps = data.t.map(timestamp => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString();
      });

      const prices = data.c;
      const openPrices = data.o;
      const highPrices = data.h;
      const lowPrices = data.l;

      const startPrice = prices[0];
      const endPrice = prices[prices.length - 1];
      const priceChange = ((endPrice - startPrice) / startPrice) * 100;
      const isPositive = priceChange >= 0;

      const chartConfig = {
        labels: timestamps,
        datasets: [
          {
            label: `${symbol} Price`,
            data: prices,
            fill: true,
            borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
            backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          }
        ]
      };

      setChartData(chartConfig);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing chart data:', error);
      setIsLoading(false);
    }
  }, [data, symbol]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 5,
          maxRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => `$${value.toFixed(2)}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  if (!data || data.s === 'no_data') {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No historical data available
      </div>
    );
  }

  const startPrice = data.c[0];
  const endPrice = data.c[data.c.length - 1];
  const priceChange = ((endPrice - startPrice) / startPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Current</p>
          <p className="text-xl font-bold">${endPrice.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Change</p>
          <p className={`text-xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeframe === tf
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="h-64">
        {chartData && <Line data={chartData} options={options} />}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">Open</p>
          <p className="font-semibold">${data.o[data.o.length - 1].toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Close</p>
          <p className="font-semibold">${data.c[data.c.length - 1].toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">High</p>
          <p className="font-semibold">${data.h[data.h.length - 1].toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Low</p>
          <p className="font-semibold">${data.l[data.l.length - 1].toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockChart;