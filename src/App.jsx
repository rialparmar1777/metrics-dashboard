import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import FundamentalAnalysis from './components/FundamentalAnalysis';
import StockComparison from './components/StockComparison';
import Portfolio from './components/Portfolio';
import Watchlist from './components/Watchlist';
import Education from './components/Education';
import { useAuth } from './services/auth.jsx';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" /> : <SignUp />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/technical"
            element={user ? <TechnicalAnalysis /> : <Navigate to="/login" />}
          />
          <Route
            path="/fundamental"
            element={user ? <FundamentalAnalysis /> : <Navigate to="/login" />}
          />
          <Route
            path="/compare"
            element={user ? <StockComparison /> : <Navigate to="/login" />}
          />
          <Route
            path="/portfolio"
            element={user ? <Portfolio /> : <Navigate to="/login" />}
          />
          <Route
            path="/watchlist"
            element={user ? <Watchlist /> : <Navigate to="/login" />}
          />
          <Route
            path="/education"
            element={user ? <Education /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;