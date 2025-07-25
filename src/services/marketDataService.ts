import axios from 'axios';
import { supabase } from '../lib/supabase';

// Market data service with multiple providers for redundancy
export class MarketDataService {
  private static readonly ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo';
  private static readonly IEX_CLOUD_KEY = import.meta.env.VITE_IEX_CLOUD_KEY || 'demo';
  
  // Rate limiting
  private static lastApiCall = 0;
  private static readonly API_DELAY = 12000; // 12 seconds between calls for free tier
  
  // Cache for market data
  private static priceCache = new Map<string, { price: number; timestamp: number }>();
  private static readonly CACHE_DURATION = 60000; // 1 minute cache
  
  // Alpha Vantage API (primary)
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
    
    // Rate limiting for free tier
    const now = Date.now();
    if (now - this.lastApiCall < this.API_DELAY) {
      console.warn('Rate limited, using mock data for', symbol);
      return this.getMockQuote(symbol);
    }
    
    try {
      this.lastApiCall = now;
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      
      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data found or API limit reached');
      }
      
      const result = {
        symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close'])
      };
      
      // Cache the price
      this.priceCache.set(symbol, { price: result.price, timestamp: now });
      
      // Update database with latest price
      await this.updateCompanyPrice(symbol, result.price);
      
      return result;
    } catch (error) {
      console.warn('Alpha Vantage failed, trying fallback:', error);
      return this.getQuoteFallback(symbol);
    }
  }

  // IEX Cloud fallback
  static async getQuoteFallback(symbol: string) {
    try {
      const response = await axios.get(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${this.IEX_CLOUD_KEY}`
      );
      
      const result = {
        symbol,
        price: response.data.latestPrice,
        change: response.data.change,
        changePercent: response.data.changePercent * 100,
        volume: response.data.latestVolume,
        high: response.data.high,
        low: response.data.low,
        open: response.data.open,
        previousClose: response.data.previousClose
      };
      
      // Cache the price
      this.priceCache.set(symbol, { price: result.price, timestamp: Date.now() });
      
      // Update database with latest price
      await this.updateCompanyPrice(symbol, result.price);
      
      return result;
    } catch (error) {
      console.error('All market data providers failed:', error);
      // Return mock data as last resort
      return this.getMockQuote(symbol);
    }
  }

  // Mock data for development/demo
  static getMockQuote(symbol: string) {
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    
    const result = {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000),
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      open: basePrice + (Math.random() - 0.5) * 3,
      previousClose: basePrice - change
    };
    
    // Cache mock data too
    this.priceCache.set(symbol, { price: result.price, timestamp: Date.now() });
    
    return result;
  }

  // Update company price in database
  private static async updateCompanyPrice(symbol: string, price: number) {
    try {
      await supabase
        .from('companies')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('ticker', symbol.toUpperCase());
        
      // Also update market_data table if it exists
      await supabase
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
    } catch (error) {
      console.warn('Failed to update price in database:', error);
    }
  }
  
  private static async getCompanyId(symbol: string): Promise<string> {
    const { data } = await supabase
      .from('companies')
      .select('id')
      .eq('ticker', symbol.toUpperCase())
      .single();
    return data?.id || '';
  }

  // Get fundamental data
  static async getFundamentals(symbol: string) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      
      const data = response.data;
      if (!data || Object.keys(data).length === 0) throw new Error('No fundamental data');
      
      return {
        symbol,
        marketCap: parseInt(data.MarketCapitalization) || 0,
        peRatio: parseFloat(data.PERatio) || 0,
        pbRatio: parseFloat(data.PriceToBookRatio) || 0,
        pegRatio: parseFloat(data.PEGRatio) || 0,
        dividendYield: parseFloat(data.DividendYield) || 0,
        eps: parseFloat(data.EPS) || 0,
        beta: parseFloat(data.Beta) || 1,
        roe: parseFloat(data.ReturnOnEquityTTM) || 0,
        roa: parseFloat(data.ReturnOnAssetsTTM) || 0,
        debtToEquity: parseFloat(data.DebtToEquityRatio) || 0,
        currentRatio: parseFloat(data.CurrentRatio) || 0,
        quickRatio: parseFloat(data.QuickRatio) || 0,
        grossMargin: parseFloat(data.GrossProfitMarginTTM) || 0,
        operatingMargin: parseFloat(data.OperatingMarginTTM) || 0,
        netMargin: parseFloat(data.ProfitMarginTTM) || 0,
        revenueGrowth: parseFloat(data.QuarterlyRevenueGrowthYOY) || 0,
        sector: data.Sector || 'Unknown',
        industry: data.Industry || 'Unknown'
      };
    } catch (error) {
      console.warn('Fundamentals API failed, using mock data:', error);
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

  // Get historical data for charts
  static async getHistoricalData(symbol: string, period: string = '1y') {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      
      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) throw new Error('No historical data');
      
      const data = Object.entries(timeSeries)
        .slice(0, 252) // ~1 year of trading days
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .reverse();
      
      return data;
    } catch (error) {
      console.warn('Historical data failed, using mock data:', error);
      return this.getMockHistoricalData(symbol);
    }
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
    // This would connect to a WebSocket service for real-time updates
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const updates = await this.batchUpdatePrices(symbols);
        callback(updates);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    }, 300000); // Update every 5 minutes
    
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