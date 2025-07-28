// Database configuration and feature flags
export const DATABASE_CONFIG = {
  // Disable all database operations in production environments where RLS blocks access
  // This prevents 403/406 errors and allows the app to run in API-only mode
  ENABLE_DATABASE_OPERATIONS: false, // Set to true only if database access is confirmed
  
  // Environment detection
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
  
  // Feature flags
  ENABLE_TRANSACTION_STORAGE: false,
  ENABLE_PRICE_STORAGE: false,
  ENABLE_COMPANY_LOOKUPS: false,
};

export const isDatabaseEnabled = () => {
  return DATABASE_CONFIG.ENABLE_DATABASE_OPERATIONS && !DATABASE_CONFIG.IS_DEMO_MODE;
};

export const logDatabaseStatus = () => {
  if (isDatabaseEnabled()) {
    console.log('✅ Database operations enabled');
  } else {
    console.log('🔒 Database operations disabled - running in API-only mode');
  }
};