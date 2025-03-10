import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockCard from './StockCard';
import { FaPlus, FaTrash } from 'react-icons/fa';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [newStock, setNewStock] = useState('');

  const userId = '123'; // Replace with dynamic user ID from authentication

  // Fetch watchlist on component mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/watchlist/${userId}`);
        setWatchlist(response.data.stocks || []);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, [userId]);

  // Add a stock to the watchlist
  const addStock = async () => {
    if (newStock && !watchlist.includes(newStock.toUpperCase())) {
      try {
        const updatedWatchlist = [...watchlist, newStock.toUpperCase()];
        await axios.post(`http://localhost:5001/watchlist`, { userId, stocks: updatedWatchlist });
        setWatchlist(updatedWatchlist);
        setNewStock('');
      } catch (error) {
        console.error('Error adding stock:', error);
      }
    }
  };

  // Remove a stock from the watchlist
  const removeStock = async (symbol) => {
    try {
      const updatedWatchlist = watchlist.filter((stock) => stock !== symbol);
      await axios.post(`http://localhost:5001/watchlist`, { userId, stocks: updatedWatchlist });
      setWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-200">My Watchlist</h2>
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="p-2 border rounded-lg flex-grow"
        />
        <button
          onClick={addStock}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Stock
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlist.map((symbol) => (
          <div key={symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center">
            <span className="text-blue-800 dark:text-blue-200">{symbol}</span>
            <button
              onClick={() => removeStock(symbol)}
              className="text-red-600 hover:text-red-800"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;