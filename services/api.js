import axios from 'axios';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol: symbol,
        token: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
};

export const fetchHistoricalData = async (symbol, resolution, from, to) => {
  try {
    const response = await axios.get(`${BASE_URL}/stock/candle`, {
      params: {
        symbol: symbol,
        resolution: resolution, // 'D' for daily, 'W' for weekly, 'M' for monthly
        from: from, // Unix timestamp (e.g., Math.floor(Date.now() / 1000) - 86400)
        to: to, // Unix timestamp (e.g., Math.floor(Date.now() / 1000))
        token: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
};