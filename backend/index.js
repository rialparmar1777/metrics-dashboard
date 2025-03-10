const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-admin.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await admin.auth().getUser(decoded.uid);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Stock data endpoints
app.get('/stock/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: symbol.toUpperCase(),
        token: process.env.FINNHUB_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/stock/:symbol/historical', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to, resolution = 'D' } = req.query;

    const response = await axios.get('https://finnhub.io/api/v1/stock/candle', {
      params: {
        symbol: symbol.toUpperCase(),
        resolution,
        from,
        to,
        token: process.env.FINNHUB_API_KEY,
      },
    });

    if (response.data.s === 'no_data') {
      return res.status(404).json({ error: 'No data available for this time range' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Metrics Dashboard Backend');
});

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: user.uid,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET);

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid email or password' });
  }
});

// Save Watchlist route (protected)
app.post('/watchlist', authenticateToken, async (req, res) => {
  const { stocks } = req.body;
  const userId = req.user.uid;

  try {
    await db.collection('watchlists').doc(userId).set({ stocks });
    res.status(200).json({ message: 'Watchlist saved successfully' });
  } catch (error) {
    console.error('Save watchlist error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get Watchlist route (protected)
app.get('/watchlist/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (userId !== req.user.uid) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const doc = await db.collection('watchlists').doc(userId).get();
    if (doc.exists) {
      res.status(200).json(doc.data());
    } else {
      res.status(200).json({ stocks: [] });
    }
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});