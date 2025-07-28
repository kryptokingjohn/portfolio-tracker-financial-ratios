// Financial Data Service using Financial Modeling Prep API
// This replaces the Yahoo Finance integration with FMP

import FMPService, { CompanyFinancials } from './fmpService';
import { isApiEnabled, API_CONFIG } from '../config/database';

class FinancialDataService {
  // Main method for getting company financials - now uses FMP
  static async getCompanyFinancials(symbol: string): Promise<CompanyFinancials | null> {
    // Check if financial data API calls are disabled
    if (!isApiEnabled() || !API_CONFIG.ENABLE_FINANCIAL_DATA) {
      console.log(`🎭 Financial data API disabled - using mock data for ${symbol} (saves API costs for UI development)`);
      return this.generateFallbackData(symbol);
    }
    
    try {
      console.log(`📊 Getting financial data for ${symbol} via FMP...`);
      
      const financials = await FMPService.getCompanyFinancials(symbol);
      
      if (financials) {
        console.log(`✅ Successfully fetched FMP data for ${symbol}`);
        return financials;
      } else {
        console.warn(`⚠️ FMP data unavailable for ${symbol}, using fallback`);
        return this.generateFallbackData(symbol);
      }
    } catch (error) {
      console.error(`❌ Error fetching FMP data for ${symbol}:`, error);
      return this.generateFallbackData(symbol);
    }
  }

  // Generate fallback financial data with reasonable estimates
  private static generateFallbackData(symbol: string): CompanyFinancials {
    console.log(`📊 Generating fallback financial data for ${symbol}`);
    
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
    
    return {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      sector: 'Technology', // Default sector
      industry: 'Software',
      description: `Financial data temporarily unavailable for ${symbol}`,
      
      // Price Data
      currentPrice: Math.round(basePrice * 100) / 100,
      yearHigh: Math.round(basePrice * 1.2 * 100) / 100,
      yearLow: Math.round(basePrice * 0.8 * 100) / 100,
      analystTarget: Math.round(basePrice * 1.1 * 100) / 100,
      
      // Reasonable default ratios for tech stocks
      pe: 20 + Math.random() * 10,
      pb: 2.5 + Math.random() * 2,
      peg: 1.0 + Math.random() * 0.5,
      
      // Financial Health defaults
      debtToEquity: 0.2 + Math.random() * 0.3,
      currentRatio: 1.8 + Math.random() * 0.5,
      quickRatio: 1.5 + Math.random() * 0.4,
      
      // Profitability estimates
      roe: 12 + Math.random() * 8,
      roa: 6 + Math.random() * 4,
      grossMargin: 60 + Math.random() * 15,
      netMargin: 18 + Math.random() * 7,
      operatingMargin: 22 + Math.random() * 8,
      
      // Efficiency estimates
      assetTurnover: 0.3 + Math.random() * 0.3,
      revenueGrowth: 8 + Math.random() * 8,
      
      // Dividend defaults
      dividend: Math.random() < 0.3 ? Math.random() * 3 : 0, // 30% chance of dividend
      dividendYield: Math.random() < 0.3 ? Math.random() * 3 : 0,
      
      // Cash Flow estimates
      fcf1yr: 800 + Math.random() * 400,
      fcf2yr: 900 + Math.random() * 500,
      fcf3yr: 1000 + Math.random() * 600,
      fcf10yr: 1500 + Math.random() * 1000,
      evFcf: 15 + Math.random() * 10,
      sectorMedianEvFcf: 15,
      intrinsicValue: Math.round(basePrice * 1.05 * 100) / 100
    };
  }

  // Convenience method - uses the main method
  static async getDetailedFinancials(symbol: string): Promise<CompanyFinancials | null> {
    return this.getCompanyFinancials(symbol);
  }

  // Batch method for multiple symbols
  static async batchGetFinancials(symbols: string[]): Promise<(CompanyFinancials | null)[]> {
    // Check if financial data API calls are disabled
    if (!isApiEnabled() || !API_CONFIG.ENABLE_FINANCIAL_DATA) {
      console.log(`🎭 Batch financial data API disabled - using mock data for ${symbols.length} symbols (saves API costs)`);
      return symbols.map(symbol => this.generateFallbackData(symbol));
    }
    
    return FMPService.batchGetFinancials(symbols);
  }
}

export default FinancialDataService;
export { CompanyFinancials } from './fmpService';