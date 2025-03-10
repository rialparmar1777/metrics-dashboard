import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const StockChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const labels = data.t.map((timestamp) => new Date(timestamp * 1000).toLocaleDateString());
      const prices = data.c;

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Stock Price',
              data: prices,
              borderColor: 'rgba(37, 99, 235, 1)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#ffffff', // White text for dark mode
              },
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)', // Light grid for dark mode
              },
              ticks: {
                color: '#ffffff', // White text for dark mode
              },
            },
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
          },
        },
      });
    }
  }, [data]);

  return <canvas ref={chartRef} className="w-full h-96" />;
};

export default StockChart;