import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import FundamentalAnalysis from './components/FundamentalAnalysis';
import StockComparison from './components/StockComparison';
import authService from './services/auth';

const PrivateRoute = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/technical"
          element={
            <PrivateRoute>
              <TechnicalAnalysis />
            </PrivateRoute>
          }
        />
        <Route
          path="/fundamental"
          element={
            <PrivateRoute>
              <FundamentalAnalysis />
            </PrivateRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <PrivateRoute>
              <StockComparison />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;