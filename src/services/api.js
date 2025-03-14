import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

// Create API instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${timestamp}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Don't retry on specific status codes
    if (response && [401, 403, 404].includes(response.status)) {
      return Promise.reject(error);
    }

    // Retry logic
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }

    config.retryCount += 1;
    
    // Delay before retrying
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config.retryCount));
    return api(config);
  }
);

// Error handling
const handleError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        throw new Error('API key is invalid or missing. Please check your configuration.');
      case 403:
        throw new Error('Access denied. Please check your subscription plan.');
      case 429:
        throw new Error('Rate limit exceeded. Please try again later.');
      case 404:
        throw new Error('Resource not found.');
      default:
        throw new Error(data?.message || 'An error occurred while fetching data.');
    }
  }
  
  if (error.request) {
    throw new Error('No response received from server. Please check your connection.');
  }
  
  throw new Error('Error setting up the request.');
};

// Helper function to format dates
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const stockApi = {
  // Health check
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  // Symbol search
  async searchSymbol(query) {
    try {
      const response = await api.get('/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get stock data
  async getBasicStockData(symbol) {
    try {
      const response = await api.get(`/quote/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Batch stock data
  async fetchMultipleStockData(symbols) {
    try {
      const response = await api.post('/quotes', { symbols });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Market sentiment analysis
  async getMarketSentiment() {
    try {
      const response = await api.get('/market-sentiment');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Technical indicators
  async getTechnicalIndicators(symbol) {
    try {
      const response = await api.get(`/technical-indicators/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Company financials
  async getCompanyFinancials(symbol) {
    try {
      const response = await api.get(`/financials/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // News aggregation with sentiment analysis
  async getAggregatedNews(symbol) {
    try {
      const response = await api.get(`/news-aggregated/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Price alerts
  async setPriceAlert(symbol, price, condition) {
    try {
      const response = await api.post('/alerts', { symbol, price, condition });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getAlerts() {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async deleteAlert(alertId) {
    try {
      const response = await api.delete(`/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Portfolio analytics
  async getPortfolioAnalytics(symbols) {
    try {
      const response = await api.post('/portfolio-analytics', { symbols });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Market movers
  async getMarketMovers() {
    try {
      const response = await api.get('/market-movers');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Watchlist management
  async getWatchlist() {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async addToWatchlist(symbol) {
    try {
      const response = await api.post('/watchlist', { symbol });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async removeFromWatchlist(symbol) {
    try {
      const response = await api.delete(`/watchlist/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // WebSocket connection
  async subscribeToRealtimeUpdates(symbols, callback) {
    try {
      if (!window.WebSocket) {
        throw new Error('WebSocket is not supported in this browser');
      }

      const wsUrl = import.meta.env.VITE_API_URL?.replace('http://', 'ws://').replace('https://', 'wss://') || 'ws://localhost:5001';
      const ws = new WebSocket(`${wsUrl}/ws`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(JSON.stringify({ type: 'subscribe', symbols }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  },

  async fetchStockQuote(symbol) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch stock quote');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  },

  async fetchStockProfile(symbol) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch stock profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stock profile:', error);
      throw error;
    }
  },

  async fetchStockMetrics(symbol) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch stock metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stock metrics:', error);
      throw error;
    }
  },

  async fetchHistoricalData(symbol, resolution = 'D', from, to) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }
};

export default stockApi; 