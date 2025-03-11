import axios from 'axios';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// Create axios instance for Finnhub API
const finnhubApi = axios.create({
  baseURL: BASE_URL,
  params: {
    token: FINNHUB_API_KEY
  }
});

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

const api = {
  async getStockQuote(symbol) {
    const cacheKey = `quote-${symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await finnhubApi.get('/quote', {
        params: { symbol: symbol.toUpperCase() }
      });

      const data = response.data;
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
  },

  async getCompanyProfile(symbol) {
    const cacheKey = `profile-${symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await finnhubApi.get('/stock/profile2', {
        params: { symbol: symbol.toUpperCase() }
      });

      const data = response.data;
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error);
      throw new Error(`Failed to fetch company profile for ${symbol}`);
    }
  },

  async getStockCandles(symbol, resolution = 'D', from = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000), to = Math.floor(Date.now() / 1000)) {
    const cacheKey = `candles-${symbol}-${resolution}-${from}-${to}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await finnhubApi.get('/stock/candle', {
        params: {
          symbol: symbol.toUpperCase(),
          resolution,
          from,
          to
        }
      });

      const data = response.data;
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }
  },

  async getMarketNews(category = 'general') {
    const cacheKey = `news-${category}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await finnhubApi.get('/news', {
        params: { category }
      });

      const data = response.data;
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw new Error('Failed to fetch market news');
    }
  },

  async getCompanyNews(symbol, from, to) {
    const cacheKey = `company-news-${symbol}-${from}-${to}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await finnhubApi.get('/company-news', {
        params: {
          symbol: symbol.toUpperCase(),
          from,
          to
        }
      });

      const data = response.data;
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      throw new Error(`Failed to fetch company news for ${symbol}`);
    }
  },

  // Helper function to fetch all required data for a stock
  async fetchStockData(symbol) {
    try {
      const [quote, profile] = await Promise.all([
        this.getStockQuote(symbol),
        this.getCompanyProfile(symbol)
      ]);

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
      throw new Error('Failed to fetch stock data');
    }
  }
};

export default api; 