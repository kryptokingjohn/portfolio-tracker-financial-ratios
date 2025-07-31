// Database and API configuration and feature flags
export const DATABASE_CONFIG = {
  // Disable all database operations in production environments where RLS blocks access
  // This prevents 403/406 errors and allows the app to run in API-only mode
  ENABLE_DATABASE_OPERATIONS: true, // Set to true only if database access is confirmed
  
  // Environment detection
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
  
  // Feature flags
  ENABLE_TRANSACTION_STORAGE: true,
  ENABLE_PRICE_STORAGE: true,
  ENABLE_COMPANY_LOOKUPS: true,
};

// API configuration to control expensive external API calls
export const API_CONFIG = {
  // Disable FMP API calls to save costs during UI development
  // When disabled, uses realistic mock data instead
  ENABLE_FMP_API_CALLS: true, // Set to true only when you need real market data
  
  // Control specific API endpoints
  ENABLE_PRICE_UPDATES: true,       // Market quotes and price data
  ENABLE_FINANCIAL_DATA: true,      // Company financials and ratios
  ENABLE_COMPANY_PROFILES: true,    // Company information lookups
  
  // Development modes
  USE_MOCK_DATA_ONLY: false,        // Force mock data for UI development
  CACHE_API_RESPONSES: true,        // Cache responses to reduce API calls
  
  // API optimization settings
  EXTENDED_CACHE_DURATION: 1800000, // 30 minutes (vs 15 minutes default)
  PRICE_CACHE_DURATION: 600000,     // 10 minutes (vs 1 minute default)
  DISABLE_AUTO_REFRESH: false,      // Set to true to disable automatic updates
  MANUAL_REFRESH_ONLY: true,        // Set to true for manual-only updates (RECOMMENDED for API limits)
};

export const isDatabaseEnabled = () => {
  return DATABASE_CONFIG.ENABLE_DATABASE_OPERATIONS && !DATABASE_CONFIG.IS_DEMO_MODE;
};

export const isApiEnabled = () => {
  return API_CONFIG.ENABLE_FMP_API_CALLS && !API_CONFIG.USE_MOCK_DATA_ONLY;
};

export const logDatabaseStatus = () => {
  if (isDatabaseEnabled()) {
    console.log('✅ Database operations enabled');
  } else {
    console.log('🔒 Database operations disabled - running in API-only mode');
  }
};

export const logApiStatus = () => {
  if (isApiEnabled()) {
    console.log('🌐 FMP API calls enabled - using live market data');
  } else {
    console.log('🎭 FMP API calls disabled - using mock data (saves API costs)');
  }
};