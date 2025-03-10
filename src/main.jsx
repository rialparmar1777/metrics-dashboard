import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Watchlist from '../src/components/Watchlist';
import StockDetail from '../src/pages/StockDetail';
import Login from '../src/components/Login';
import Signup from '../src/components/SignUp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
