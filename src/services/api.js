import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

// Add auth token to requests
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
  async (error) => {
    const originalRequest = error.config;

    // Don't retry on 429 (Too Many Requests) or 403 (Forbidden)
    if (error.response && (error.response.status === 429 || error.response.status === 403)) {
      return Promise.reject(error);
    }

    if (!originalRequest._retry && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1)));

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

const handleError = (error, customMessage) => {
  console.error(customMessage, error);
  if (error.response) {
    if (error.response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    }
    if (error.response.status === 403) {
      throw new Error('Access forbidden. Please check your API key.');
    }
    // Server responded with error
    throw new Error(error.response.data.message || error.response.data.error || customMessage);
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Other errors
    throw new Error(error.message || customMessage);
  }
};

// Helper function to get Unix timestamp
const getUnixTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

const stockApi = {
  async getStockQuote(symbol) {
    try {
      const response = await api.get(`/stock/${symbol}/quote`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch stock data for ${symbol}`);
    }
  },

  async getCompanyProfile(symbol) {
    try {
      const response = await api.get(`/stock/${symbol}/profile`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch company profile for ${symbol}`);
    }
  },

  async getBatchStockData(symbols) {
    try {
      const response = await api.post('/stock/batch', { symbols });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch batch stock data');
    }
  },

  async getStockCandles(symbol, resolution = 'D', from, to) {
    try {
      // Convert dates to Unix timestamps if they're Date objects
      const fromTimestamp = from instanceof Date ? getUnixTimestamp(from) : from;
      const toTimestamp = to instanceof Date ? getUnixTimestamp(to) : to;

      const response = await api.get(`/stock/${symbol}/candles`, {
        params: { 
          resolution,
          from: fromTimestamp,
          to: toTimestamp
        }
      });
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch historical data for ${symbol}`);
    }
  },

  async getMarketNews(category = 'general') {
    try {
      const response = await api.get('/news', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch market news');
    }
  },

  async getCompanyNews(symbol, from, to) {
    try {
      const response = await api.get(`/stock/${symbol}/news`, {
        params: { from, to }
      });
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch company news for ${symbol}`);
    }
  },

  async getWatchlist() {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch watchlist');
    }
  },

  async addToWatchlist(symbol) {
    try {
      const response = await api.post('/watchlist', { symbol });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to add to watchlist');
    }
  },

  async removeFromWatchlist(symbol) {
    try {
      const response = await api.delete(`/watchlist/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to remove from watchlist');
    }
  },

  // Helper function to fetch all required data for a stock
  async fetchStockData(symbol) {
    try {
      const response = await this.getBatchStockData([symbol]);
      const stockData = response[0];

      if (stockData.error) {
        throw new Error(stockData.error);
      }

      const { quote, profile } = stockData;

      if (!quote || !profile) {
        throw new Error(`No data available for ${symbol}`);
      }

      return {
        symbol,
        currentPrice: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        high: quote.h,
        low: quote.l,
        open: quote.o,
        previousClose: quote.pc,
        companyName: profile.name,
        currency: profile.currency,
        exchange: profile.exchange,
        industry: profile.finnhubIndustry,
        marketCap: profile.marketCapitalization,
        logo: profile.logo
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  },

  // Helper function to fetch data for multiple stocks
  async fetchMultipleStockData(symbols) {
    try {
      const response = await this.getBatchStockData(symbols);
      return response.map(stockData => {
        if (stockData.error) {
          return {
            symbol: stockData.symbol,
            error: stockData.error
          };
        }

        const { symbol, quote, profile } = stockData;

        if (!quote || !profile) {
          return {
            symbol,
            error: `No data available for ${symbol}`
          };
        }

        return {
          symbol,
          currentPrice: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          open: quote.o,
          previousClose: quote.pc,
          companyName: profile.name,
          currency: profile.currency,
          exchange: profile.exchange,
          industry: profile.finnhubIndustry,
          marketCap: profile.marketCapitalization,
          logo: profile.logo
        };
      });
    } catch (error) {
      console.error('Error fetching multiple stock data:', error);
      throw error;
    }
  },

  // Check server health
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

export default stockApi; 