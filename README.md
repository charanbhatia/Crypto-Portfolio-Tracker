#  Crypto Portfolio Tracker

A modern, full-stack cryptocurrency portfolio tracking application with mock trading functionality, built with Next.js 14, TypeScript, and real-time price data from CoinGecko API.

##  Features

### Core Features
- ** Live Crypto Prices** - Real-time cryptocurrency prices from CoinGecko API
- ** Auto-refresh** - Prices update every 30 seconds automatically
- ** Portfolio Dashboard** - Track your holdings with detailed analytics
- ** Mock Trading** - Buy/sell cryptocurrencies with $10,000 starting balance
- ** Authentication** - Secure login/register system with NextAuth.js
- ** Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ** Dark/Light Mode** - Toggle between themes with persistent preferences

### Supported Cryptocurrencies
- **Bitcoin (BTC)**
- **Ethereum (ETH)**
- **Tether (USDT)**
- **USD Coin (USDC)**
- **Monero (XMR)**
- **Solana (SOL)**

### Bonus Features
- ** Price Alerts** - Notification system for price updates
- ** Advanced Charts** - Interactive portfolio distribution and performance charts
- ** Modern UI** - Glass morphism effects, gradients, and smooth animations
- ** Real-time Updates** - Live portfolio value calculations

##  Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Recharts** - Interactive charts and graphs

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma** - Type-safe database ORM
- **SQLite** - Lightweight database (development)
- **bcryptjs** - Password hashing

### External APIs
- **CoinGecko API** - Free cryptocurrency price data

##  Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/charanbhatia/Crypto-Portfolio-Tracker.git
   cd Crypto-Portfolio-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
   COINGECKO_API_URL="https://api.coingecko.com/api/v3"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started
1. **Sign Up** - Create a new account with email and password
2. **Start Trading** - You begin with $10,000 mock USD
3. **Buy Cryptocurrencies** - Use the trading page to buy/sell crypto
4. **Track Performance** - Monitor your portfolio in the dashboard
5. **View Analytics** - Detailed charts and performance metrics

### Navigation
- ** Dashboard** - Overview of your portfolio and performance
- ** Trading** - Buy and sell cryptocurrencies
- ** Portfolio** - Detailed analytics and charts
- ** Settings** - Theme preferences and 2FA simulation

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── crypto/        # Crypto price endpoints
│   │   ├── portfolio/     # Portfolio data endpoints
│   │   └── trading/       # Trading endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── portfolio/         # Portfolio analytics page
│   ├── trading/           # Trading page
│   └── settings/          # Settings page
├── components/            # Reusable components
│   ├── DashboardLayout.tsx
│   ├── SessionProvider.tsx
│   ├── ThemeToggle.tsx
│   └── ThemeContext.tsx
├── contexts/              # React contexts
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── coingecko.ts      # API utilities
└── prisma/               # Database schema
    └── schema.prisma
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/callback/credentials` - Login

### Crypto Data
- `GET /api/crypto/prices` - Live cryptocurrency prices

### Portfolio
- `GET /api/portfolio` - User portfolio data

### Trading
- `POST /api/trading/execute` - Execute buy/sell trades
- `GET /api/trading/history` - Trading history

## 🎨 Design Features

### UI/UX Highlights
- **Glass Morphism** - Modern glass-effect cards and components
- **Gradient Backgrounds** - Beautiful gradient overlays
- **Smooth Animations** - Floating elements and pulse effects
- **Responsive Grid** - Adaptive layouts for all screen sizes
- **Dark Mode** - Complete dark theme with proper contrast
- **Interactive Charts** - Hover effects and tooltips

### Color Scheme
- **Primary**: Indigo/Purple gradients
- **Success**: Green for profits
- **Danger**: Red for losses
- **Neutral**: Gray scale for text and backgrounds

## 🚀 Deployment

### Vercel link


### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secure-secret-key"
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
```


## 📊 Performance

### Optimizations
- **Server-side Rendering** - Fast initial page loads
- **API Caching** - Efficient data fetching
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Automatic bundle splitting
- **Database Indexing** - Optimized queries with Prisma

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Acknowledgments

- **CoinGecko** - For providing free cryptocurrency price data
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Prisma** - For the excellent database ORM
- **Lucide** - For the beautiful icon set

---

**Built with ❤️ by [Charan Bhatia](https://github.com/charanbhatia)**

*This is a mock trading application for educational purposes. No real money is involved.*
