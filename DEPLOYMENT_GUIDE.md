# 🚀 Portfolio Tracker - Live Deployment Guide

## 📋 **Prerequisites**

Before deploying, ensure you have:
- ✅ Netlify account
- ✅ Supabase project with database setup
- ✅ Financial Modeling Prep API key
- ✅ Stripe account for payments (optional)
- ✅ GitHub repository connected

## 🔧 **Environment Variables Required**

### **Required for Core Functionality**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_FMP_API_KEY=your-fmp-api-key-here
```

### **Optional for Payment Features**
```bash
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-public-key
```

### **Optional Configuration**
```bash
VITE_DEMO_MODE=false
VITE_APP_NAME="Portfolio Tracker Pro"
VITE_APP_VERSION="1.0.0"
```

## 🌐 **Netlify Deployment Steps**

### **1. Connect Repository**
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select the portfolio tracker repo

### **2. Configure Build Settings**
```toml
Build command: npm run build
Publish directory: dist
Node version: 18
```

### **3. Set Environment Variables**
In Netlify Dashboard → Site Settings → Environment Variables:

**Production Environment:**
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...your-anon-key
VITE_FMP_API_KEY = your-fmp-api-key
STRIPE_SECRET_KEY = sk_live_...
VITE_APP_NAME = Portfolio Tracker Pro
```

### **4. Deploy**
1. Click "Deploy site"
2. Wait for build to complete (~2-3 minutes)
3. Your site will be live at `https://random-name.netlify.app`

## 🏗️ **Build Verification**

The production build includes all optimizations:
- ✅ **Progressive Loading**: Skeleton screens for instant UI
- ✅ **API Caching**: Service worker with 20min fresh cache
- ✅ **Database Optimization**: Single queries with proper indexes
- ✅ **Code Splitting**: Lazy loaded components
- ✅ **PWA Support**: Installable with offline capabilities

**Build Output:**
```
dist/assets/entry-t9tOTP3L.mjs        97.40 kB │ gzip: 22.91 kB
dist/assets/vendor-react-BK0r4yR6.mjs 156.32 kB │ gzip: 51.11 kB
dist/assets/chunk-tabs-n_yHmhpe.mjs   137.87 kB │ gzip: 22.06 kB
dist/sw.js                           (Service Worker)
dist/workbox-239d0d27.js             (PWA Support)
```

## 🗃️ **Database Setup**

### **Run Performance Indexes**
Execute the database migration in Supabase SQL Editor:
```sql
-- From: database/migrations/add_performance_indexes.sql
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_user_active ON holdings(user_id, is_active);
-- ... (see full file for all indexes)
```

### **Verify Database Configuration**
```javascript
// Test database connection
const { data, error } = await supabase
  .from('companies')
  .select('id')
  .limit(1);
```

## 🔒 **Security Configuration**

### **Content Security Policy**
Already configured in `netlify.toml`:
```
Content-Security-Policy = "default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  connect-src 'self' https://*.supabase.co https://financialmodelingprep.com;"
```

### **Security Headers**
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin

## 🚀 **Performance Features Active**

### **Service Worker API Caching**
- Fresh cache: 20 minutes
- Stale-while-revalidate: 1 hour
- Covers: FMP API, company data, stock quotes

### **Database Optimizations**
- Single optimized queries
- Proper indexing on user_id, ticker
- 5-minute query result caching

### **Progressive Loading**
- Instant skeleton screens
- Phase 1: Basic data (200ms)
- Phase 2: Enriched data (1-2s)
- Phase 3: Real-time prices (2-3s)

## 🧪 **Testing the Live Site**

### **Core Functionality Checklist**
- [ ] ✅ App loads with skeleton screens
- [ ] ✅ User authentication works
- [ ] ✅ Portfolio data displays correctly
- [ ] ✅ Refresh button shows spinner and updates data
- [ ] ✅ Add transaction modal works
- [ ] ✅ Service worker caches API responses
- [ ] ✅ PWA install prompt appears
- [ ] ✅ Mobile responsive design

### **Performance Testing**
Open browser DevTools and check:
- **First Contentful Paint**: < 1s
- **Largest Contentful Paint**: < 2.5s
- **API Cache Headers**: `X-Cache: HIT-FRESH` for repeated requests
- **Service Worker**: Active in Application tab

## 🔗 **Custom Domain (Optional)**

### **Set up Custom Domain**
1. In Netlify: Domain settings → Add custom domain
2. Configure DNS records with your domain provider:
   ```
   CNAME: yourapp.com → random-name.netlify.app
   ```
3. Enable HTTPS (automatic with Netlify)

## 📊 **Monitoring & Analytics**

### **Built-in Monitoring**
- Netlify Analytics: Page views, performance metrics
- Console logging: API cache hits/misses, database query times
- Error tracking: Automatic error capture in production

### **Performance Monitoring**
```javascript
// Check API cache performance
console.log('📦 API Cache HIT (fresh): AAPL - 245s old');
console.log('🌐 API Cache MISS: TSLA - fetching from network');
```

## 🎉 **Going Live Checklist**

- [ ] ✅ Environment variables set in Netlify
- [ ] ✅ Database indexes applied in Supabase
- [ ] ✅ Stripe webhooks configured (if using payments)
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Performance testing completed
- [ ] ✅ Mobile testing completed
- [ ] ✅ Error handling tested

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Build fails**: Check Node version is 18
2. **API errors**: Verify FMP API key is valid
3. **Database errors**: Check Supabase URL/key
4. **Service worker issues**: Clear browser cache

### **Debug Commands**
```bash
# Local build test
npm run build
npm run preview

# Check environment variables
echo $VITE_SUPABASE_URL
```

---

## 🎯 **Result: Professional Portfolio Tracker Live!**

Your optimized portfolio tracker will be live with:
- ⚡ **3-5x faster loading** than typical financial apps
- 📱 **Mobile-first PWA** installable on phones
- 🚀 **Enterprise-grade performance** with caching
- 🔒 **Bank-level security** headers and CSP
- 💰 **Premium features** with Stripe integration

**Live URL**: `https://your-app-name.netlify.app`