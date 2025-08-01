import FMPService from './fmpService';
import { supabase } from '../lib/supabase';
import { isDatabaseEnabled, isApiEnabled, API_CONFIG } from '../config/database';

// Market data service using Financial Modeling Prep API
export class MarketDataService {
  private static readonly FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY || 'demo';
  
  // Rate limiting
  private static lastApiCall = 0;
  private static readonly API_DELAY = 12000; // 12 seconds between calls for free tier
  
  // Cache for market data
  private static priceCache = new Map<string, { price: number; timestamp: number }>();
  private static readonly CACHE_DURATION = API_CONFIG.PRICE_CACHE_DURATION || 60000; // 10 minutes default
  
  // Database permission tracking - start with false for production safety
  private static databaseAccessAllowed = false;
  private static databaseChecked = false;
  
  // Generate valid UUID for fallback data
  private static generateFallbackUUID(ticker: string): string {
    // Create a deterministic UUID based on the ticker
    // This ensures the same ticker always gets the same fallback UUID
    const hash = this.simpleHash(ticker.toUpperCase());
    const uuid = [
      hash.substr(0, 8),
      hash.substr(8, 4),
      '4' + hash.substr(12, 3), // Version 4 UUID
      (parseInt(hash.substr(15, 1), 16) & 3 | 8).toString(16) + hash.substr(16, 3), // Variant bits
      hash.substr(19, 12)
    ].join('-');
    return uuid;
  }
  
  // Simple hash function for generating deterministic UUIDs
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to hex and pad to 32 characters
    const hex = Math.abs(hash).toString(16).padEnd(32, '0');
    return hex.substr(0, 32);
  }
  
  // Test database permissions before attempting operations
  private static async checkDatabasePermissions(): Promise<boolean> {
    if (this.databaseChecked) {
      return this.databaseAccessAllowed;
    }
    
    try {
      // Test with a simple read operation first
      const { error } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
        
      if (error && (error.code === '42501' || error.code === '403' || error.code === 406)) {
        console.warn('🔒 Database access restricted - running in API-only mode');
        this.databaseAccessAllowed = false;
      } else {
        console.log('✅ Database access confirmed');
        this.databaseAccessAllowed = true;
      }
    } catch (error) {
      console.warn('🔒 Database connectivity issue - running in API-only mode:', error);
      this.databaseAccessAllowed = false;
    }
    
    this.databaseChecked = true;
    return this.databaseAccessAllowed;
  }
  
  // Primary quote method using FMP
  static async getQuote(symbol: string) {
    // Check cache first
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        symbol,
        price: cached.price,
        change: 0,
        changePercent: 0,
        volume: 0,
        high: cached.price * 1.02,
        low: cached.price * 0.98,
        open: cached.price,
        previousClose: cached.price
      };
    }
    
    // Check if API calls are disabled for UI development
    if (!isApiEnabled() || !API_CONFIG.ENABLE_PRICE_UPDATES) {
      console.log(`🎭 Price API disabled - using mock data for ${symbol} (saves API costs for UI development)`);
      return this.getMockQuote(symbol);
    }
    
    // For demo/production without API keys, use realistic mock data immediately
    if (this.FMP_API_KEY === 'demo' || !this.FMP_API_KEY) {
      console.log(`💰 Using realistic mock data for ${symbol} (no FMP API key configured)`);
      return this.getMockQuote(symbol);
    }
    
    try {
      console.log(`📈 Fetching current price for ${symbol} via FMP...`);
      
      const marketData = await FMPService.getMarketData(symbol);
      
      if (!marketData) {
        console.warn(`⚠️ FMP market data unavailable for ${symbol}, using mock data`);
        return this.getMockQuote(symbol);
      }
      
      const result = {
        symbol: marketData.symbol,
        price: marketData.price,
        change: marketData.change,
        changePercent: marketData.changePercent,
        volume: marketData.volume,
        high: marketData.high,
        low: marketData.low,
        open: marketData.open,
        previousClose: marketData.previousClose
      };
      
      // Cache the price
      this.priceCache.set(symbol, { price: result.price, timestamp: Date.now() });
      
      // Update database with latest price (non-blocking)
      this.updateCompanyPrice(symbol, result.price).catch(err => 
        console.warn('Failed to update price in DB:', err)
      );
      
      console.log(`✅ Successfully fetched FMP price for ${symbol}: $${result.price}`);
      return result;
      
    } catch (error) {
      console.warn(`❌ FMP failed for ${symbol}:`, error);
      return this.getMockQuote(symbol);
    }
  }


  // Mock data for development/demo with realistic prices for known stocks
  static getMockQuote(symbol: string) {
    // Realistic price ranges for common stocks
    const stockPrices: { [key: string]: number } = {
      'AAPL': 170 + Math.random() * 20,
      'MSFT': 330 + Math.random() * 30,
      'GOOGL': 120 + Math.random() * 15,
      'AMZN': 140 + Math.random() * 20,
      'TSLA': 200 + Math.random() * 50,
      'NFLX': 380 + Math.random() * 40,
      'NVDA': 420 + Math.random() * 80,
      'META': 260 + Math.random() * 30,
      'BRK.B': 350 + Math.random() * 20,
      'JPM': 150 + Math.random() * 15
    };
    
    const basePrice = stockPrices[symbol.toUpperCase()] || (100 + Math.random() * 200);
    const change = (Math.random() - 0.5) * (basePrice * 0.03); // ±3% daily change
    
    const result = {
      symbol,
      price: Math.round(basePrice * 100) / 100, // Round to 2 decimal places
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      volume: Math.floor(Math.random() * 50000000) + 1000000, // 1M to 51M volume
      high: Math.round((basePrice + Math.abs(change) * 0.5) * 100) / 100,
      low: Math.round((basePrice - Math.abs(change) * 0.5) * 100) / 100,
      open: Math.round((basePrice + (Math.random() - 0.5) * Math.abs(change)) * 100) / 100,
      previousClose: Math.round((basePrice - change) * 100) / 100
    };
    
    // Cache mock data with longer duration since it's realistic
    this.priceCache.set(symbol, { price: result.price, timestamp: Date.now() });
    
    console.log(`📊 Generated realistic mock quote for ${symbol}: $${result.price} (${result.changePercent > 0 ? '+' : ''}${result.changePercent}%)`);
    
    return result;
  }

  // Update company price in database
  private static async updateCompanyPrice(symbol: string, price: number) {
    // Skip database operations entirely if disabled at configuration level
    if (!isDatabaseEnabled()) {
      return; // Skip all database operations when disabled
    }
    
    // Check database permissions before attempting any operations
    const hasAccess = await this.checkDatabasePermissions();
    if (!hasAccess) {
      return; // Skip all database operations if permissions are restricted
    }
    
    try {
      // Try to update companies table
      const { error: companiesError } = await supabase
        .from('companies')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('ticker', symbol.toUpperCase());
        
      if (companiesError && (companiesError.code === '42501' || companiesError.code === '403')) {
        console.warn(`⚠️ Database permission issue detected - disabling all database updates for this session`);
        this.databaseAccessAllowed = false; // Disable all future database operations
        return;
      }
        
      // Try to update market_data table if companies update succeeded
      const { error: marketDataError } = await supabase
        .from('market_data')
        .upsert({
          company_id: (await this.getCompanyId(symbol)),
          date: new Date().toISOString().split('T')[0],
          close_price: price,
          adjusted_close: price,
          open_price: price,
          high_price: price * 1.01,
          low_price: price * 0.99,
          volume: Math.floor(Math.random() * 1000000)
        }, {
          onConflict: 'company_id,date'
        });
        
      if (marketDataError && (marketDataError.code === '42501' || marketDataError.code === '403')) {
        console.warn(`⚠️ Market data permission issue detected - disabling database updates for this session`);
        this.databaseAccessAllowed = false; // Disable all future database operations
        return;
      }
        
    } catch (error) {
      // Handle any other database errors gracefully
      console.warn(`📊 Database error detected - disabling database updates for this session:`, error);
      this.databaseAccessAllowed = false; // Disable all future database operations
    }
  }
  
  private static async getCompanyId(symbol: string): Promise<string> {
    // Skip database operations entirely if disabled at configuration level
    if (!isDatabaseEnabled()) {
      return this.generateFallbackUUID(symbol);
    }
    
    // Check database permissions before attempting access
    const hasAccess = await this.checkDatabasePermissions();
    if (!hasAccess) {
      return this.generateFallbackUUID(symbol);
    }
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('ticker', symbol.toUpperCase())
        .single();
        
      if (error && (error.code === '42501' || error.code === '403')) {
        console.warn(`⚠️ Permission issue accessing company ID - disabling database access`);
        this.databaseAccessAllowed = false;
        return this.generateFallbackUUID(symbol);
      }
        
      return data?.id || this.generateFallbackUUID(symbol);
    } catch (error) {
      console.warn(`📊 Database error accessing company ID - using fallback:`, error);
      this.databaseAccessAllowed = false;
      return this.generateFallbackUUID(symbol);
    }
  }

  // Get fundamental data using FMP
  static async getFundamentals(symbol: string) {
    try {
      console.log(`📊 Getting fundamentals for ${symbol} via FMP...`);
      
      const financials = await FMPService.getCompanyFinancials(symbol);
      
      if (!financials) {
        console.warn(`⚠️ FMP fundamentals unavailable for ${symbol}, using mock data`);
        return this.getMockFundamentals(symbol);
      }
      
      return {
        symbol: financials.symbol,
        marketCap: 0, // Would need separate endpoint for market cap
        peRatio: financials.pe,
        pbRatio: financials.pb,
        pegRatio: financials.peg,
        dividendYield: financials.dividendYield,
        eps: 0, // Would need separate endpoint for EPS
        beta: 1, // Would need separate endpoint for beta
        roe: financials.roe,
        roa: financials.roa,
        debtToEquity: financials.debtToEquity,
        currentRatio: financials.currentRatio,
        quickRatio: financials.quickRatio,
        grossMargin: financials.grossMargin,
        operatingMargin: financials.operatingMargin,
        netMargin: financials.netMargin,
        revenueGrowth: financials.revenueGrowth,
        sector: financials.sector,
        industry: financials.industry
      };
    } catch (error) {
      console.warn('FMP fundamentals failed, using mock data:', error);
      return this.getMockFundamentals(symbol);
    }
  }

  static getMockFundamentals(symbol: string) {
    return {
      symbol,
      marketCap: Math.floor(Math.random() * 1000000000000),
      peRatio: 15 + Math.random() * 20,
      pbRatio: 1 + Math.random() * 5,
      pegRatio: 0.5 + Math.random() * 2,
      dividendYield: Math.random() * 5,
      eps: Math.random() * 10,
      beta: 0.5 + Math.random() * 1.5,
      roe: 10 + Math.random() * 20,
      roa: 5 + Math.random() * 15,
      debtToEquity: Math.random() * 1,
      currentRatio: 1 + Math.random() * 2,
      quickRatio: 0.5 + Math.random() * 1.5,
      grossMargin: 20 + Math.random() * 50,
      operatingMargin: 10 + Math.random() * 30,
      netMargin: 5 + Math.random() * 25,
      revenueGrowth: -5 + Math.random() * 20,
      sector: ['Technology', 'Healthcare', 'Financial Services', 'Consumer Discretionary'][Math.floor(Math.random() * 4)],
      industry: 'Software'
    };
  }

  // Get historical data for charts - using mock data for now
  // FMP historical data would require separate endpoint implementation
  static async getHistoricalData(symbol: string, period: string = '1y') {
    console.log(`📈 Generating mock historical data for ${symbol} (${period})`);
    return this.getMockHistoricalData(symbol);
  }
  
  // Batch update prices for multiple symbols
  static async batchUpdatePrices(symbols: string[]) {
    const results = [];
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        results.push(quote);
        
        // Small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to update price for ${symbol}:`, error);
        results.push(this.getMockQuote(symbol));
      }
    }
    
    return results;
  }
  
  // Real-time price updates using WebSocket (for future implementation)
  static setupRealTimeUpdates(symbols: string[], callback: (data: any) => void) {
    // Check if auto-refresh is disabled
    if (API_CONFIG.DISABLE_AUTO_REFRESH || API_CONFIG.MANUAL_REFRESH_ONLY) {
      console.log('🔒 Auto-refresh disabled - updates require manual refresh only');
      return () => {}; // Return empty cleanup function
    }
    
    // This would connect to a WebSocket service for real-time updates
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const updates = await this.batchUpdatePrices(symbols);
        callback(updates);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    }, 900000); // Update every 15 minutes
    
    return () => clearInterval(interval);
  }

  static getMockHistoricalData(symbol: string) {
    const data = [];
    let price = 100 + Math.random() * 200;
    const today = new Date();
    
    for (let i = 252; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 0.05;
      price = price * (1 + change);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: price * (1 + (Math.random() - 0.5) * 0.02),
        high: price * (1 + Math.random() * 0.03),
        low: price * (1 - Math.random() * 0.03),
        close: price,
        volume: Math.floor(Math.random() * 10000000)
      });
    }
    
    return data;
  }
}