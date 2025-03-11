import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cache for stock data
const stockDataCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

// Cache for historical data
const historicalDataCache = new Map();
const HISTORICAL_CACHE_DURATION = 300000; // 5 minutes

// Cache for news data
const newsCache = new Map();
const NEWS_CACHE_DURATION = 300000; // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp, duration) => {
  return Date.now() - timestamp < duration;
};

// Helper function to handle rate limits
const handleRateLimit = async (error) => {
  if (error.response?.status === 429) {
    const retryAfter = parseInt(error.response.headers['x-ratelimit-reset']) - Math.floor(Date.now() / 1000);
    if (retryAfter > 0) {
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return true;
    }
  }
  return false;
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, userId } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (email, password) => {
  try {
    const response = await api.post('/auth/register', { email, password });
    const { token, userId } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  window.location.href = '/login';
};

export const fetchStockData = async (symbol) => {
  try {
    // Check cache first
    const cachedData = stockDataCache.get(symbol);
    if (cachedData && isCacheValid(cachedData.timestamp, CACHE_DURATION)) {
      return cachedData.data;
    }

    const response = await api.get(`/api/stock/${symbol}`);
    const data = response.data;

    // Update cache
    stockDataCache.set(symbol, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    if (await handleRateLimit(error)) {
      return fetchStockData(symbol); // Retry after rate limit
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch stock data');
  }
};

export const fetchHistoricalData = async (symbol, resolution, from, to) => {
  try {
    const cacheKey = `${symbol}-${resolution}-${from}-${to}`;
    
    // Check cache first
    const cachedData = historicalDataCache.get(cacheKey);
    if (cachedData && isCacheValid(cachedData.timestamp, HISTORICAL_CACHE_DURATION)) {
      return cachedData.data;
    }

    const response = await api.get(`/api/stock/${symbol}/historical`, {
      params: { resolution, from, to }
    });
    const data = response.data;

    // Update cache
    historicalDataCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    if (await handleRateLimit(error)) {
      return fetchHistoricalData(symbol, resolution, from, to); // Retry after rate limit
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch historical data');
  }
};

export const fetchMarketNews = async () => {
  try {
    // Check cache first
    const cachedData = newsCache.get('market');
    if (cachedData && isCacheValid(cachedData.timestamp, NEWS_CACHE_DURATION)) {
      return cachedData.data;
    }

    const response = await api.get('/api/news');
    const data = response.data;

    // Update cache
    newsCache.set('market', {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    if (await handleRateLimit(error)) {
      return fetchMarketNews(); // Retry after rate limit
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch market news');
  }
};

export const getWatchlist = async () => {
  try {
    const response = await api.get('/api/watchlist');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch watchlist');
  }
};

export const saveWatchlist = async (stocks) => {
  try {
    const response = await api.post('/api/watchlist', { stocks });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save watchlist');
  }
};