# 🚀 Deployment Guide

This guide covers deploying your Portfolio Tracker to both web platforms and the Android Play Store.

## 📋 Prerequisites

### For Web Deployment
- [ ] Production Supabase project set up
- [ ] Environment variables configured
- [ ] Domain name (optional but recommended)

### For Android Deployment
- [ ] Android Studio installed
- [ ] Java 11+ installed
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Signing keystore created

## 🌐 Web Deployment

### Option 1: Netlify (Recommended)

1. **Prepare build:**
   ```bash
   npm run deploy:netlify
   ```

2. **Deploy:**
   **Option A - Drag & Drop:**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Open your file manager and navigate to the `dist` folder
   - Select ALL FILES INSIDE the dist folder (not the folder itself)
   - Drag the selected files to the Netlify drop zone
   
   **Option B - Netlify CLI (Recommended):**
   ```bash
   npm install -g netlify-cli
   npm run deploy:netlify-cli
   ```
   - Or connect your GitHub repository for auto-deployment

3. **Configure environment variables:**
   - In Netlify dashboard: Site settings > Environment variables
   - Add:
     ```
     VITE_SUPABASE_URL=your_production_supabase_url
     VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
     ```

4. **Custom domain (optional):**
   - Domain settings > Add custom domain
   - Configure DNS records as instructed

### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run deploy:vercel
   ```

3. **Configure environment variables:**
   - In Vercel dashboard: Project > Settings > Environment Variables

### Option 3: Traditional Hosting

1. **Build:**
   ```bash
   npm run deploy:prepare
   ```

2. **Upload:**
   - Upload contents of `dist` folder to your web server
   - Configure server for Single Page Application (SPA)
   - Ensure HTTPS is enabled

## 📱 Android Play Store Deployment

### Step 1: Prepare Android Build

```bash
npm run android:prepare
```

### Step 2: Open in Android Studio

```bash
npm run android:open
```

### Step 3: Configure for Release

1. **Update version:**
   - Edit `android/app/build.gradle`
   - Increment `versionCode` and `versionName`

2. **Create signing key:**
   - Build > Generate Signed Bundle/APK
   - Create new keystore (save securely!)
   - Remember keystore password and key alias

3. **Build release bundle:**
   - Build > Generate Signed Bundle/APK
   - Choose "Android App Bundle"
   - Select release variant
   - Sign with your keystore

### Step 4: Play Store Submission

1. **Google Play Console:**
   - Create app listing
   - Upload AAB file
   - Add screenshots (phone, tablet, TV)
   - Write app description
   - Set content rating
   - Complete privacy policy

2. **Review process:**
   - Initial review: 1-3 days
   - Updates: Few hours to 1 day

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env` file with:

```bash
# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
VITE_APP_NAME="Portfolio Tracker Pro"
VITE_APP_VERSION="1.0.0"

# Optional: Market Data APIs
VITE_ALPHA_VANTAGE_KEY=your_api_key
VITE_IEX_CLOUD_KEY=your_api_key
```

### Database Setup

1. **Create production Supabase project**
2. **Run migrations:**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or manually run SQL migrations from supabase/migrations/
   ```
3. **Configure Row Level Security (RLS)**
4. **Set up authentication providers**

## 📊 Performance Optimization

### Already Configured
- ✅ PWA with service worker
- ✅ Code splitting
- ✅ Image optimization
- ✅ Caching strategies
- ✅ Bundle optimization

### Additional Optimizations
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Image compression
- [ ] Lazy loading for heavy components

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys restricted to domains
- [ ] Content Security Policy configured
- [ ] Database RLS policies tested
- [ ] Authentication flows secured

## 📈 Monitoring & Analytics

### Recommended Tools
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics 4
- **Performance:** Web Vitals
- **Uptime:** UptimeRobot

### Setup
1. Add tracking scripts to `index.html`
2. Configure error boundaries
3. Set up performance monitoring
4. Create uptime alerts

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance optimized
- [ ] Security headers configured

### Post-Deployment
- [ ] Verify all features work
- [ ] Test authentication flows
- [ ] Check mobile responsiveness
- [ ] Validate PWA installation
- [ ] Monitor error rates

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Verify environment variables

**Database Connection:**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure user profiles exist

**Android Build Issues:**
- Update Android Studio
- Check ANDROID_HOME path
- Verify Java version (11+)

### Getting Help
- Check browser console for errors
- Review Supabase logs
- Use `npx cap doctor` for Android issues
- Check deployment platform logs

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review error logs
3. Test in development environment
4. Contact platform support if needed

---

**Ready to deploy?** Start with web deployment using Netlify for the fastest path to production!