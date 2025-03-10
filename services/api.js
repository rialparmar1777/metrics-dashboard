import axios from 'axios';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_URL = import.meta.env.VITE_API_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

export const fetchHistoricalData = async (symbol, resolution = 'D', from, to) => {
  try {
    // Ensure timestamps are valid
    const currentTime = Math.floor(Date.now() / 1000);
    const oneMonthAgo = currentTime - (30 * 24 * 60 * 60);

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
      params: {
        symbol: symbol.toUpperCase(),
        resolution: resolution,
        from: from || oneMonthAgo,
        to: to || currentTime,
        token: FINNHUB_API_KEY,
      },
    });

    if (response.data.s === 'no_data') {
      throw new Error('No data available for this time range');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// Authentication functions
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.uid);
    localStorage.setItem('userEmail', user.email);
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.uid);
    localStorage.setItem('userEmail', user.email);
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  delete axios.defaults.headers.common['Authorization'];
};

// Watchlist functions
export const saveWatchlist = async (stocks) => {
  try {
    const response = await axios.post(`${API_URL}/watchlist`, { stocks });
    return response.data;
  } catch (error) {
    console.error('Error saving watchlist:', error);
    throw error;
  }
};

export const getWatchlist = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/watchlist/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};