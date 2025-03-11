import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000
});

// Error handling
const handleError = (error, customMessage) => {
  console.error(customMessage, error);
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    if (status === 401) {
      throw new Error('API key is missing or invalid. Please check your configuration.');
    }
    if (status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    }
    throw new Error(message || customMessage);
  }
  
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timed out. Please try again.');
  }
  
  throw new Error(customMessage);
};

// Helper function to format dates
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const stockApi = {
  // Symbol search
  async searchSymbol(query) {
    try {
      const response = await api.get('/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      handleError(error, `Failed to search for symbol: ${query}`);
    }
  },

  // Basic stock data
  async getBasicStockData(symbol) {
    try {
      const response = await api.get(`/quote/${symbol}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch data for ${symbol}`);
    }
  },

  // Helper function to fetch data for multiple stocks
  async fetchMultipleStockData(symbols) {
    try {
      const response = await api.post('/quotes', { symbols });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch multiple stock data');
    }
  },

  // Watchlist
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

  // Check server health
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data.status === 'ok' && response.data.apiKey === 'configured';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

export default stockApi; 