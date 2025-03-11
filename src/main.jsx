import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Initialize dark mode from localStorage or system preference
const initializeDarkMode = () => {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'true') {
    document.documentElement.classList.add('dark');
  } else if (darkMode === 'false') {
    document.documentElement.classList.remove('dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  }
};

initializeDarkMode();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);