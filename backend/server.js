import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import NodeCache from 'node-cache';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// ES modules replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Initialize cache
const cache = new NodeCache({
  stdTTL: 300, // Cache for 5 minutes
  checkperiod: 600 // Check for expired entries every 10 minutes
});

// Ensure required environment variables are set
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
if (!FINNHUB_API_KEY) {
  console.error('ERROR: FINNHUB_API_KEY is not set in environment variables');
  process.exit(1);
}

// Create Finnhub API client
const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY
  },
  timeout: 10000
});

// Add request interceptor to log API calls in development
finnhubClient.interceptors.request.use(request => {
  console.log('Making request to:', request.url);
  return request;
});

// Add response interceptor to handle errors
finnhubClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Finnhub API error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    }
    return Promise.reject(error);
  }
);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // allow 300 requests per windowMs
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Too many requests. Please try again later.'
  }
});
app.use(limiter);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.response) {
    // Finnhub API error
    const status = err.response.status;
    const message = err.response.data?.error || 'API Error';
    
    if (status === 429) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: err.response.headers['retry-after'] || 60
      });
    }

    if (status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key or unauthorized access'
      });
    }
    
    return res.status(status).json({
      error: message,
      message: 'Failed to fetch data from Finnhub'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKey: FINNHUB_API_KEY ? 'configured' : 'missing'
  });
});

// Symbol lookup endpoint
app.get('/api/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const cacheKey = `search_${q}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await finnhubClient.get('/search', {
      params: { q }
    });

    if (response.data && response.data.result) {
      cache.set(cacheKey, response.data);
      res.json(response.data);
    } else {
      res.json({ result: [] });
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Invalid API key:', FINNHUB_API_KEY);
    }
    next(error);
  }
});

// Stock quote endpoint
app.get('/api/quote/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const cacheKey = `quote_${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const [quoteResponse, profileResponse] = await Promise.all([
        finnhubClient.get('/quote', { params: { symbol } }),
        finnhubClient.get('/stock/profile2', { params: { symbol } })
      ]);

      const quote = quoteResponse.data;
      const profile = profileResponse.data;

      if (!quote.c) {
        return res.status(404).json({
          error: 'Stock Not Found',
          message: `No data available for symbol: ${symbol}`
        });
      }

      const stockData = {
        symbol,
        currentPrice: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        previousClose: quote.pc,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        companyName: profile?.name || symbol,
        currency: profile?.currency || 'USD',
        marketCap: profile?.marketCapitalization || 0
      };

      cache.set(cacheKey, stockData);
      res.json(stockData);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Invalid API key:', FINNHUB_API_KEY);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// Batch quote endpoint
app.post('/api/quotes', async (req, res, next) => {
  try {
    const { symbols } = req.body;
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }

    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        const cacheKey = `quote_${symbol}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }

        try {
          const [quoteResponse, profileResponse] = await Promise.all([
            finnhubClient.get('/quote', { params: { symbol } }),
            finnhubClient.get('/stock/profile2', { params: { symbol } })
          ]);

          const quote = quoteResponse.data;
          const profile = profileResponse.data;

          if (!quote.c) {
            return {
              symbol,
              error: 'No data available'
            };
          }

          const stockData = {
            symbol,
            currentPrice: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            previousClose: quote.pc,
            open: quote.o,
            high: quote.h,
            low: quote.l,
            companyName: profile?.name || symbol,
            currency: profile?.currency || 'USD',
            marketCap: profile?.marketCapitalization || 0
          };

          cache.set(cacheKey, stockData);
          return stockData;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error.message);
          return {
            symbol,
            error: error.response?.data?.error || 'Failed to fetch data'
          };
        }
      })
    );

    res.json(quotes);
  } catch (error) {
    next(error);
  }
});

// Market news endpoint
app.get('/api/market-news', async (req, res, next) => {
  try {
    const response = await finnhubClient.get('/news', {
      params: {
        category: 'general'
      }
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Watchlist file path
const WATCHLIST_FILE = join(__dirname, 'watchlist.json');

// Helper function to read watchlist
async function readWatchlist() {
  try {
    const data = await fs.readFile(WATCHLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, create it with empty watchlist
      await fs.writeFile(WATCHLIST_FILE, JSON.stringify({ stocks: [] }));
      return { stocks: [] };
    }
    throw error;
  }
}

// Helper function to write watchlist
async function writeWatchlist(watchlist) {
  await fs.writeFile(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));
}

// Watchlist endpoints
app.get('/api/watchlist', async (req, res, next) => {
  try {
    const watchlist = await readWatchlist();
    res.json(watchlist.stocks);
  } catch (error) {
    next(error);
  }
});

app.post('/api/watchlist', async (req, res, next) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const watchlist = await readWatchlist();
    if (watchlist.stocks.includes(symbol)) {
      return res.status(400).json({ error: 'Symbol already in watchlist' });
    }

    watchlist.stocks.push(symbol);
    await writeWatchlist(watchlist);
    res.json(watchlist.stocks);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/watchlist/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const watchlist = await readWatchlist();
    watchlist.stocks = watchlist.stocks.filter(s => s !== symbol);
    await writeWatchlist(watchlist);
    res.json(watchlist.stocks);
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Key status: ${FINNHUB_API_KEY ? 'configured' : 'missing'}`);
  console.log('API endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/search');
  console.log('- GET /api/quote/:symbol');
  console.log('- POST /api/quotes');
  console.log('- GET /api/market-news');
  console.log('- GET /api/watchlist');
  console.log('- POST /api/watchlist');
  console.log('- DELETE /api/watchlist/:symbol');
}); 