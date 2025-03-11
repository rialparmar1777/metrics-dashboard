import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import NodeCache from 'node-cache';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Initialize cache
const cache = new NodeCache({
  stdTTL: 60, // Cache for 60 seconds
  checkperiod: 120 // Check for expired entries every 120 seconds
});

// In-memory watchlist store (replace with database in production)
let watchlist = new Set();

// Ensure required environment variables are set
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'cv7p1npr01qpecigufjgcv7p1npr01qpecigufk0';

// Create Finnhub API client with rate limiting
const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: {
    token: FINNHUB_API_KEY
  },
  timeout: 10000
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting - adjusted to be more lenient
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // allow 300 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Please try again later'
  }
});
app.use(limiter);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.response) {
    // Finnhub API error
    return res.status(err.response.status).json({
      error: err.response.data.error || 'API Error',
      message: 'Failed to fetch data from Finnhub'
    });
  }
  
  if (err.code === 'ECONNABORTED') {
    return res.status(408).json({
      error: 'Request Timeout',
      message: 'The request to Finnhub API timed out'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

// Helper function to validate timestamp
const validateTimestamp = (timestamp) => {
  const now = Math.floor(Date.now() / 1000);
  return timestamp <= now ? timestamp : now;
};

// Helper function to get cached data or fetch from API
const getCachedOrFetch = async (cacheKey, fetchFn) => {
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const data = await fetchFn();
  cache.set(cacheKey, data);
  return data;
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stock quote endpoint
app.get('/api/stock/:symbol/quote', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `quote-${symbol}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await finnhubClient.get('/quote', {
        params: { symbol: symbol.toUpperCase() }
      });
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Company profile endpoint
app.get('/api/stock/:symbol/profile', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `profile-${symbol}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await finnhubClient.get('/stock/profile2', {
        params: { symbol: symbol.toUpperCase() }
      });
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Batch endpoint for multiple stocks
app.post('/api/stock/batch', async (req, res, next) => {
  try {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Please provide an array of stock symbols'
      });
    }
    
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const [quote, profile] = await Promise.all([
            getCachedOrFetch(`quote-${symbol}`, async () => {
              const response = await finnhubClient.get('/quote', {
                params: { symbol: symbol.toUpperCase() }
              });
              return response.data;
            }),
            getCachedOrFetch(`profile-${symbol}`, async () => {
              const response = await finnhubClient.get('/stock/profile2', {
                params: { symbol: symbol.toUpperCase() }
              });
              return response.data;
            })
          ]);

          return {
            symbol,
            quote,
            profile
          };
        } catch (error) {
          return {
            symbol,
            error: error.message
          };
        }
      })
    );
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Stock candles endpoint
app.get('/api/stock/:symbol/candles', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    let { resolution, from, to } = req.query;
    
    if (!resolution || !from || !to) {
      return res.status(400).json({
        error: 'Missing Parameters',
        message: 'Resolution, from, and to parameters are required'
      });
    }

    // Validate and adjust timestamps
    from = validateTimestamp(Number(from));
    to = validateTimestamp(Number(to));
    
    const cacheKey = `candles-${symbol}-${resolution}-${from}-${to}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await finnhubClient.get('/stock/candle', {
        params: {
          symbol: symbol.toUpperCase(),
          resolution,
          from,
          to
        }
      });
      return response.data;
    });
    
    if (data.s === 'no_data') {
      return res.status(404).json({
        error: 'No Data',
        message: 'No historical data available for the specified timeframe'
      });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Watchlist endpoints
app.get('/api/watchlist', (req, res) => {
  res.json(Array.from(watchlist));
});

app.post('/api/watchlist', (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({
      error: 'Missing Symbol',
      message: 'Please provide a stock symbol'
    });
  }
  watchlist.add(symbol.toUpperCase());
  res.json(Array.from(watchlist));
});

app.delete('/api/watchlist/:symbol', (req, res) => {
  const { symbol } = req.params;
  watchlist.delete(symbol.toUpperCase());
  res.json(Array.from(watchlist));
});

// Market news endpoint
app.get('/api/news', async (req, res, next) => {
  try {
    const { category = 'general' } = req.query;
    const cacheKey = `news-${category}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await finnhubClient.get('/news', {
        params: { category }
      });
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Company news endpoint
app.get('/api/stock/:symbol/news', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        error: 'Missing Parameters',
        message: 'From and to dates are required'
      });
    }
    
    const cacheKey = `news-${symbol}-${from}-${to}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await finnhubClient.get('/company-news', {
        params: {
          symbol: symbol.toUpperCase(),
          from,
          to
        }
      });
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('API endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/stock/:symbol/quote');
  console.log('- GET /api/stock/:symbol/profile');
  console.log('- POST /api/stock/batch');
  console.log('- GET /api/stock/:symbol/candles');
  console.log('- GET /api/watchlist');
  console.log('- POST /api/watchlist');
  console.log('- DELETE /api/watchlist/:symbol');
  console.log('- GET /api/news');
  console.log('- GET /api/stock/:symbol/news');
}); 