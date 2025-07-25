# Portfolio Tracker with Financial Ratios

A comprehensive portfolio tracking application with advanced financial analytics, built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Option 1: Demo Mode (Instant)
```bash
npm install
npm run dev
```
Click "Continue with Demo Data" to explore with sample portfolio data.

### Option 2: Real Database
1. **Set up Supabase** (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```
3. **Start the app:**
   ```bash
   npm run dev
   ```

## 📱 Features

### Core Portfolio Management
- ✅ **Real-time portfolio tracking** with live price updates
- ✅ **Multiple account types** (401k, IRA, Roth IRA, HSA, Taxable, etc.)
- ✅ **Transaction history** with detailed cost basis tracking
- ✅ **Asset allocation** analysis and rebalancing insights

### Advanced Financial Analytics
- ✅ **30+ Financial Ratios** (P/E, P/B, ROE, ROA, Debt/Equity, etc.)
- ✅ **DCF Analysis** with intrinsic value calculations
- ✅ **Performance Attribution** (Brinson-Hood-Beebower model)
- ✅ **Risk Analytics** (Beta, Sharpe ratio, VaR, drawdown analysis)
- ✅ **Factor Analysis** (Fama-French 3/5 factor models)

### Professional Tools
- ✅ **Benchmark Comparison** (20+ indices including S&P 500, NASDAQ, Russell 2000)
- ✅ **Tax Optimization** (tax-loss harvesting, asset location analysis)
- ✅ **Dividend Tracking** with yield analysis and projections
- ✅ **Export Reports** (CSV, PDF, Excel formats)

### Modern Experience
- ✅ **Progressive Web App** (PWA) - install on mobile/desktop
- ✅ **Mobile Optimized** with touch-friendly interface
- ✅ **Real-time Updates** with automatic price refreshing
- ✅ **Offline Support** with service worker caching

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Charts:** Custom SVG visualizations
- **PWA:** Vite PWA plugin with Workbox
- **Mobile:** Capacitor for native app deployment

## 📊 Screenshots

### Portfolio Overview
- Comprehensive holdings table with financial ratios
- Real-time performance tracking
- Asset allocation visualization

### Performance Analytics
- Multi-timeframe performance charts
- Benchmark comparison analysis
- Risk-adjusted return metrics

### Mobile Experience
- Touch-optimized interface
- Pull-to-refresh functionality
- Native app feel with PWA

## 🚀 Deployment

### Web Deployment
```bash
# Netlify (recommended)
npm run deploy:netlify-cli

# Vercel
npm run deploy:vercel

# Manual
npm run build
# Upload dist/ contents to your hosting provider
```

### Mobile App (Android)
```bash
npm run android:prepare
npm run android:open
# Build signed APK/AAB in Android Studio
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables
```bash
# Required for real database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional: Market data APIs
VITE_ALPHA_VANTAGE_KEY=your_api_key
VITE_IEX_CLOUD_KEY=your_api_key

# App configuration
VITE_APP_NAME="Portfolio Tracker Pro"
VITE_APP_VERSION="1.0.0"
```

### Database Setup
See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete database setup instructions.

## 📈 Key Features Explained

### Financial Ratios Analysis
- **Valuation:** P/E, P/B, PEG, EV/FCF ratios
- **Profitability:** ROE, ROA, margins analysis
- **Financial Health:** Debt ratios, liquidity ratios
- **Growth:** Revenue growth, earnings growth

### Performance Attribution
- **Asset Allocation Effect:** Impact of sector weights
- **Security Selection Effect:** Impact of stock picking
- **Interaction Effect:** Combined allocation and selection
- **Benchmark Comparison:** vs S&P 500, NASDAQ, etc.

### Risk Analytics
- **Market Risk:** Beta, correlation analysis
- **Downside Risk:** Maximum drawdown, VaR
- **Risk-Adjusted Returns:** Sharpe, Sortino, Treynor ratios
- **Factor Exposure:** Size, value, momentum, quality factors

### Tax Optimization
- **Tax-Loss Harvesting:** Identify loss harvesting opportunities
- **Asset Location:** Optimize holdings across account types
- **Wash Sale Detection:** Avoid wash sale violations
- **Cost Basis Tracking:** FIFO, LIFO, specific lot methods

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation:** Check the guides in this repository
- **Issues:** Open a GitHub issue for bugs or feature requests
- **Deployment Help:** See DEPLOYMENT.md for deployment guidance

## 🎯 Roadmap

- [ ] **Options Trading** support
- [ ] **Cryptocurrency** portfolio tracking
- [ ] **International Markets** support
- [ ] **Social Features** (portfolio sharing)
- [ ] **AI-Powered Insights** and recommendations
- [ ] **Advanced Charting** with technical indicators

---

**Ready to track your portfolio like a pro?** Start with demo mode to explore all features, then set up your real database for live tracking!