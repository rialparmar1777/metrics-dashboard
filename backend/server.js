import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import NodeCache from 'node-cache';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { WebSocketServer } from 'ws';
import http from 'http';
import finnhub from 'finnhub';
import { format, subMonths, subDays, parseISO } from 'date-fns';
import { RSI, MACD, SMA, EMA } from 'technicalindicators';

// ES modules replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = process.env.PORT || 5001;

// Trust proxy for rate limiter
app.set('trust proxy', 1);

// Initialize cache
const cache = new NodeCache({
  stdTTL: 300, // Cache for 5 minutes
  checkperiod: 600 // Check for expired entries every 10 minutes
});

// Initialize Finnhub client
const api_key = process.env.FINNHUB_API_KEY;
if (!api_key) {
  console.error('FINNHUB_API_KEY is not set in environment variables');
}
const finnhubClient = new finnhub.DefaultApi();

// Set up API key configuration
finnhubClient.apiKey = api_key;

// Configure axios instance for direct Finnhub API calls
const finnhubAxios = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  headers: {
    'X-Finnhub-Token': api_key
  }
});

// Promisify Finnhub API calls with proper error handling
const finnhubApi = {
  async quote(symbol) {
    try {
      const response = await finnhubAxios.get(`/quote?symbol=${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      throw error;
    }
  },

  async companyProfile2(symbol) {
    try {
      const response = await finnhubAxios.get(`/stock/profile2?symbol=${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error.message);
      throw error;
    }
  },

  async symbolSearch(query) {
    try {
      const response = await finnhubAxios.get(`/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching for symbol ${query}:`, error.message);
      throw error;
    }
  },

  async marketNews(category) {
    try {
      const response = await finnhubAxios.get(`/news?category=${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching market news:`, error.message);
      throw error;
    }
  },

  async getHistoricalData(symbol, resolution = 'D', from, to) {
    try {
      const response = await finnhubAxios.get(`/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      throw error;
    }
  },

  async getCompanyMetrics(symbol) {
    try {
      const response = await finnhubAxios.get(`/stock/metric?symbol=${symbol}&metric=all`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company metrics for ${symbol}:`, error.message);
      throw error;
    }
  }
};

// Middleware
app.use(cors({
  origin: [
    'https://metrics-dashboard01-hqvjf7pfc-rialparmar1777s-projects.vercel.app',
    'https://metrics-dashboard01-o8a9my6h1-rialparmar1777s-projects.vercel.app',
    'https://metrics-dashboard01-p2dzpvo8k-rialparmar1777s-projects.vercel.app',
    'https://stocks-dashboard01.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

// Add pre-flight OPTIONS handler
app.options('*', cors());

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

// WebSocket connection handling
const clients = new Map();

wss.on('connection', (ws) => {
  const id = Date.now();
  clients.set(id, { ws, subscriptions: new Set() });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        const client = clients.get(id);
        data.symbols.forEach(symbol => client.subscriptions.add(symbol));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(id);
  });
});

// Real-time price updates
setInterval(async () => {
  for (const [id, { ws, subscriptions }] of clients.entries()) {
    if (subscriptions.size > 0) {
      try {
        const symbols = Array.from(subscriptions);
        const quotes = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await finnhubApi.quote(symbol);
              return { symbol, ...quote };
            } catch (error) {
              console.error(`WebSocket error fetching ${symbol}:`, error);
              return { symbol, error: true };
            }
          })
        );

        const validQuotes = quotes.filter(quote => !quote.error);
        if (validQuotes.length > 0) {
          ws.send(JSON.stringify({
            type: 'quotes',
            data: validQuotes
          }));
        }
      } catch (error) {
        console.error('WebSocket update error:', error);
      }
    }
  }
}, 5000);

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
    apiKey: !!process.env.FINNHUB_API_KEY
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

    const data = await finnhubApi.symbolSearch(q);
    if (data && data.result && data.result.length > 0) {
      cache.set(cacheKey, data);
      res.json(data);
    } else {
      res.json({ result: [] });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search symbols' });
  }
});

// Stock quote endpoint
app.get('/api/quote/:symbol', async (req, res, next) => {
  try {
    let { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    // Convert to uppercase and remove any whitespace
    symbol = symbol.toUpperCase().trim();
    console.log(`Received quote request for symbol: ${symbol}`);

    // Check if the symbol contains any non-US stock indicators
    if (symbol.includes('.') || symbol.includes(':')) {
      return res.status(400).json({
        error: 'Invalid Stock Symbol',
        message: 'Only US stocks (NYSE/NASDAQ) are supported.',
        suggestions: {
          technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
          finance: ['JPM', 'BAC', 'GS'],
          retail: ['AMZN', 'WMT', 'TGT'],
          ev: ['TSLA', 'F', 'GM']
        },
        tip: 'Please use a valid US stock symbol from NYSE or NASDAQ.'
      });
    }

    const cacheKey = `quote_${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached data for ${symbol}`);
      return res.json(cachedData);
    }

    // Log the request for debugging
    console.log(`Fetching quote for ${symbol} with API key: ${api_key ? api_key.substring(0, 5) + '...' : 'not set'}`);

    const [quote, profile] = await Promise.all([
      finnhubApi.quote(symbol),
      finnhubApi.companyProfile2(symbol)
    ]);

    console.log(`Received quote data for ${symbol}:`, quote);
    console.log(`Received profile data for ${symbol}:`, profile);

    if (!quote || !quote.c) {
      console.log(`No valid quote data for ${symbol}`);
      return res.status(404).json({
        error: 'Stock Not Found',
        message: `No data available for symbol: ${symbol}`,
        suggestions: {
          technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
          finance: ['JPM', 'BAC', 'GS'],
          retail: ['AMZN', 'WMT', 'TGT'],
          ev: ['TSLA', 'F', 'GM']
        },
        tip: 'Make sure you are using a valid US stock symbol. Try one of the suggestions above.'
      });
    }

    const stockData = {
      symbol,
      currentPrice: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      previousClose: quote.pc,
      companyName: profile?.name || symbol,
      currency: profile?.currency || 'USD',
      marketCap: profile?.marketCapitalization,
      volume: quote.v
    };

    console.log(`Sending stock data for ${symbol}:`, stockData);
    cache.set(cacheKey, stockData);
    res.json(stockData);
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, error.message);
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'API Access Error',
        message: 'Unable to access stock data. Please try again later.',
        suggestions: {
          technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
          finance: ['JPM', 'BAC', 'GS'],
          retail: ['AMZN', 'WMT', 'TGT'],
          ev: ['TSLA', 'F', 'GM']
        }
      });
    }
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
          const [quote, profile] = await Promise.all([
            finnhubApi.quote(symbol),
            finnhubApi.companyProfile2(symbol)
          ]);

          if (!quote || !quote.c) {
            return { symbol, error: 'No data available' };
          }

          const stockData = {
            symbol,
            currentPrice: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            previousClose: quote.pc,
            companyName: profile?.name || symbol,
            currency: profile?.currency || 'USD',
            marketCap: profile?.marketCapitalization,
            volume: quote.v
          };

          cache.set(cacheKey, stockData);
          return stockData;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return { symbol, error: 'Failed to fetch data' };
        }
      })
    );

    res.json(quotes.filter(quote => !quote.error));
  } catch (error) {
    next(error);
  }
});

// Market news endpoint
app.get('/api/market-news', async (req, res, next) => {
  try {
    const data = await finnhubApi.marketNews('general');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Market sentiment endpoint
app.get('/api/market-sentiment', async (req, res) => {
  try {
    const sentiment = await finnhubApi.marketNews('general');
    const analyzedSentiment = sentiment.slice(0, 10).map(news => ({
      ...news,
      sentiment: Math.random() > 0.5 ? 'positive' : 'negative' // Simplified sentiment analysis
    }));
    res.json(analyzedSentiment);
  } catch (error) {
    console.error('Market sentiment error:', error);
    res.status(500).json({ error: 'Failed to fetch market sentiment' });
  }
});

// Technical indicators endpoint
app.get('/api/technical-indicators/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const indicators = await finnhubApi.technicalIndicator(symbol, 'D', 1590988249, 1591852249, 'rsi', {});
    res.json(indicators);
  } catch (error) {
    console.error('Technical indicators error:', error);
    res.status(500).json({ error: 'Failed to fetch technical indicators' });
  }
});

// Market movers endpoint
app.get('/api/market-movers', async (req, res) => {
  try {
    const gainers = await finnhubApi.marketNews('general');
    res.json(gainers.slice(0, 5));
  } catch (error) {
    console.error('Market movers error:', error);
    res.status(500).json({ error: 'Failed to fetch market movers' });
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

// Price alerts
let alerts = new Map();

app.post('/api/alerts', (req, res) => {
  const { symbol, price, condition } = req.body;
  const alertId = Date.now().toString();
  alerts.set(alertId, { symbol, price, condition });
  res.json({ id: alertId, symbol, price, condition });
});

app.get('/api/alerts', (req, res) => {
  res.json(Array.from(alerts.entries()).map(([id, alert]) => ({ id, ...alert })));
});

app.delete('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  alerts.delete(id);
  res.json({ success: true });
});

// Historical data endpoint
app.get('/api/historical/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;

    const to = Math.floor(Date.now() / 1000);
    let from;

    switch (period) {
      case '1W':
        from = Math.floor(subDays(new Date(), 7).getTime() / 1000);
        break;
      case '1M':
        from = Math.floor(subMonths(new Date(), 1).getTime() / 1000);
        break;
      case '3M':
        from = Math.floor(subMonths(new Date(), 3).getTime() / 1000);
        break;
      case '6M':
        from = Math.floor(subMonths(new Date(), 6).getTime() / 1000);
        break;
      case '1Y':
        from = Math.floor(subMonths(new Date(), 12).getTime() / 1000);
        break;
      default:
        from = Math.floor(subMonths(new Date(), 1).getTime() / 1000);
    }

    const cacheKey = `historical_${symbol}_${period}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await finnhubApi.getHistoricalData(symbol, 'D', from, to);
    
    if (!data || data.s !== 'ok') {
      return res.status(404).json({
        error: 'Historical Data Not Found',
        message: `No historical data available for symbol: ${symbol}`
      });
    }

    // Calculate technical indicators
    const closes = data.c;
    const highs = data.h;
    const lows = data.l;

    const technicalData = {
      prices: data,
      indicators: {
        rsi: RSI.calculate({
          values: closes,
          period: 14
        }),
        macd: MACD.calculate({
          values: closes,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9
        }),
        sma20: SMA.calculate({
          values: closes,
          period: 20
        }),
        sma50: SMA.calculate({
          values: closes,
          period: 50
        }),
        ema12: EMA.calculate({
          values: closes,
          period: 12
        }),
        ema26: EMA.calculate({
          values: closes,
          period: 26
        })
      }
    };

    cache.set(cacheKey, technicalData, 300); // Cache for 5 minutes
    res.json(technicalData);
  } catch (error) {
    next(error);
  }
});

// Company fundamentals endpoint
app.get('/api/fundamentals/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    const cacheKey = `fundamentals_${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const [metrics, profile] = await Promise.all([
      finnhubApi.getCompanyMetrics(symbol),
      finnhubApi.companyProfile2(symbol)
    ]);

    const fundamentalData = {
      profile,
      metrics: {
        peRatio: metrics.metric?.peBasicExcl || null,
        pbRatio: metrics.metric?.pbQuarterly || null,
        debtToEquity: metrics.metric?.totalDebtToEquity || null,
        currentRatio: metrics.metric?.currentRatioQuarterly || null,
        quickRatio: metrics.metric?.quickRatioQuarterly || null,
        grossMargin: metrics.metric?.grossMarginTTM || null,
        operatingMargin: metrics.metric?.operatingMarginTTM || null,
        netMargin: metrics.metric?.netMarginTTM || null,
        roa: metrics.metric?.roaRfy || null,
        roe: metrics.metric?.roeRfy || null,
        marketCap: profile?.marketCapitalization || null,
        eps: metrics.metric?.epsBasicExclExtraItemsTTM || null
      }
    };

    cache.set(cacheKey, fundamentalData, 3600); // Cache for 1 hour
    res.json(fundamentalData);
  } catch (error) {
    next(error);
  }
});

// Stock comparison endpoint
app.post('/api/compare', async (req, res, next) => {
  try {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length < 2) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Please provide at least two stock symbols to compare'
      });
    }

    const cacheKey = `compare_${symbols.sort().join('_')}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const comparisonData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const [quote, fundamentals] = await Promise.all([
            finnhubApi.quote(symbol),
            finnhubApi.getCompanyMetrics(symbol)
          ]);

          return {
            symbol,
            currentPrice: quote.c,
            priceChange: quote.d,
            percentChange: quote.dp,
            metrics: {
              peRatio: fundamentals.metric?.peBasicExcl || null,
              pbRatio: fundamentals.metric?.pbQuarterly || null,
              marketCap: fundamentals.metric?.marketCapitalization || null,
              eps: fundamentals.metric?.epsBasicExclExtraItemsTTM || null
            }
          };
        } catch (error) {
          console.error(`Error fetching comparison data for ${symbol}:`, error);
          return {
            symbol,
            error: 'Failed to fetch comparison data'
          };
        }
      })
    );

    const validData = comparisonData.filter(data => !data.error);
    if (validData.length < 2) {
      return res.status(404).json({
        error: 'Comparison Data Not Found',
        message: 'Unable to fetch data for enough symbols to compare'
      });
    }

    cache.set(cacheKey, validData, 300); // Cache for 5 minutes
    res.json(validData);
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('API endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/search');
  console.log('- GET /api/quote/:symbol');
  console.log('- POST /api/quotes');
  console.log('- GET /api/market-news');
  console.log('- GET /api/watchlist');
  console.log('- POST /api/watchlist');
  console.log('- DELETE /api/watchlist/:symbol');
  console.log('- GET /api/historical/:symbol');
  console.log('- GET /api/fundamentals/:symbol');
  console.log('- POST /api/compare');
}); 