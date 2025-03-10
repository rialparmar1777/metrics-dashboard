const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

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
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Metrics Dashboard Backend');
});

// Signup route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await admin.auth().createUser({
        email,
        password,
      });
      res.status(201).json({ message: 'User created', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Login route
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await admin.auth().getUserByEmail(email);
      res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

//Save Watchlist route
  app.post('/watchlist', async (req, res) => {
    const { userId, stocks } = req.body;
  
    try {
      await db.collection('watchlists').doc(userId).set({ stocks });
      res.status(200).json({ message: 'Watchlist saved' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  //Get Watchlist route
  app.get('/watchlist/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const doc = await db.collection('watchlists').doc(userId).get();
      if (doc.exists) {
        res.status(200).json(doc.data());
      } else {
        res.status(404).json({ message: 'Watchlist not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});