const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Cache setup
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Finnhub API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Stock data endpoints
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock_${symbol}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol,
        token: FINNHUB_API_KEY
      }
    });

    if (response.data && response.data.c) {
      cache.set(cacheKey, response.data);
      res.json(response.data);
    } else {
      res.status(404).json({ error: 'Stock not found' });
    }
  } catch (error) {
    console.error('Stock data error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/api/stock/:symbol/historical', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { resolution = 'D', from, to } = req.query;
    const cacheKey = `historical_${symbol}_${resolution}_${from}_${to}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to,
        token: FINNHUB_API_KEY
      }
    });

    if (response.data && response.data.s === 'ok') {
      cache.set(cacheKey, response.data);
      res.json(response.data);
    } else {
      res.status(404).json({ error: 'Historical data not found' });
    }
  } catch (error) {
    console.error('Historical data error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Market news endpoint
app.get('/api/news', async (req, res) => {
  try {
    const cacheKey = 'market_news';
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(`${FINNHUB_BASE_URL}/news`, {
      params: {
        category: 'general',
        token: FINNHUB_API_KEY
      }
    });

    if (response.data) {
      cache.set(cacheKey, response.data);
      res.json(response.data);
    } else {
      res.status(404).json({ error: 'News not found' });
    }
  } catch (error) {
    console.error('News error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Watchlist endpoints
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const watchlistRef = admin.firestore().collection('watchlists').doc(userId);
    const doc = await watchlistRef.get();

    if (doc.exists) {
      res.json(doc.data());
    } else {
      // Create new watchlist if it doesn't exist
      await watchlistRef.set({ stocks: [] });
      res.json({ stocks: [] });
    }
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { stocks } = req.body;

    if (!Array.isArray(stocks)) {
      return res.status(400).json({ error: 'Invalid watchlist data' });
    }

    await admin.firestore().collection('watchlists').doc(userId).set({ stocks });
    res.json({ message: 'Watchlist updated successfully' });
  } catch (error) {
    console.error('Save watchlist error:', error);
    res.status(500).json({ error: 'Failed to save watchlist' });
  }
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    // Create initial watchlist for the user
    await admin.firestore().collection('watchlists').doc(userRecord.uid).set({
      stocks: []
    });

    res.status(201).json({
      message: 'User created successfully',
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // First, get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Create a custom token for the user
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.json({
      message: 'Login successful',
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});