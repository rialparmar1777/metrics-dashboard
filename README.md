# Stock Market Dashboard

A real-time stock market dashboard built with React, Node.js, and the Finnhub API. This application provides comprehensive stock market data, technical analysis, and portfolio management features.

![Dashboard Preview]
(Add a screenshot of your dashboard here)

## Features

- 📈 Real-time stock price updates via WebSocket
- 📊 Interactive stock price charts with multiple timeframes
- 📱 Responsive design for desktop and mobile devices
- 📰 Latest market news and sentiment analysis
- 📋 Personal watchlist management
- 📉 Technical indicators (RSI, MACD, SMA, EMA)
- 💹 Stock comparison tools
- 📊 Company fundamentals and metrics
- 🔍 Stock symbol search functionality
- ⚡ Real-time market data updates
- 🔔 Price alerts system
- 📈 Historical price data analysis

## Tech Stack

### Frontend
- React with Vite
- TailwindCSS for styling
- Chart.js for data visualization
- Firebase Authentication
- Axios for API requests
- WebSocket for real-time updates

### Backend
- Node.js & Express
- WebSocket Server
- Finnhub API integration
- Node-Cache for data caching
- Rate limiting
- CORS configuration

## Prerequisites

Before you begin, ensure you have the following:
- Node.js (v14 or higher)
- npm or yarn
- A Finnhub API key (get one at [Finnhub.io](https://finnhub.io))
- A Firebase project (for authentication)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stock-market-dashboard.git
   cd stock-market-dashboard
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd metrics/backend
   npm install

   # Install frontend dependencies
   cd ../
   npm install
   ```

3. Set up environment variables:

   Backend (.env in metrics/backend):
   ```env
   FINNHUB_API_KEY=your_finnhub_api_key
   PORT=5001
   ```

   Frontend (.env in metrics/):
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_FINNHUB_API_KEY=your_finnhub_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd metrics/backend
   npm run start
   ```

2. Start the frontend development server:
   ```bash
   cd metrics
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## Deployment

### Backend (Railway)
1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set up the environment variables in Railway dashboard
4. Deploy the backend service

### Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure the build settings:
   - Framework Preset: Vite
   - Root Directory: metrics
   - Build Command: npm run build
   - Output Directory: dist
4. Add environment variables in Vercel dashboard
5. Deploy the frontend

## API Endpoints

### Authentication
- Firebase Authentication is used for user management

### Stock Data
- `GET /api/quote/:symbol` - Get real-time stock quote
- `GET /api/historical/:symbol` - Get historical price data
- `GET /api/fundamentals/:symbol` - Get company fundamentals
- `GET /api/market-news` - Get latest market news
- `GET /api/technical-indicators/:symbol` - Get technical indicators

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/:symbol` - Remove stock from watchlist

### Market Data
- `GET /api/market-sentiment` - Get market sentiment analysis
- `GET /api/market-movers` - Get top market movers
- `POST /api/compare` - Compare multiple stocks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Finnhub.io](https://finnhub.io) for providing the stock market data API
- [Firebase](https://firebase.google.com) for authentication services
- [Chart.js](https://www.chartjs.org) for charting capabilities
- [TailwindCSS](https://tailwindcss.com) for styling

## Support

For support, email your-email@example.com or open an issue in the repository.

## Screenshots

(Add screenshots of different features of your application here)

## Future Enhancements

- Portfolio tracking and management
- Advanced technical analysis tools
- Mobile app development
- Social features for sharing insights
- Integration with more data providers
- Cryptocurrency market data
- Options trading data
- AI-powered stock predictions 