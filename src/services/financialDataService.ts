// Yahoo Finance API response interfaces
interface YahooFinanceData {
  quoteSummary: {
    result: [{
      summaryDetail?: {
        marketCap?: { raw: number };
        trailingPE?: { raw: number };
        pegRatio?: { raw: number };
        bookValue?: { raw: number };
        dividendRate?: { raw: number };
        dividendYield?: { raw: number };
        fiftyTwoWeekHigh?: { raw: number };
        fiftyTwoWeekLow?: { raw: number };
      };
      financialData?: {
        returnOnAssets?: { raw: number };
        returnOnEquity?: { raw: number };
        revenueGrowth?: { raw: number };
        profitMargins?: { raw: number };
        operatingMargins?: { raw: number };
        grossMargins?: { raw: number };
        currentRatio?: { raw: number };
        quickRatio?: { raw: number };
        debtToEquity?: { raw: number };
        totalCash?: { raw: number };
        totalDebt?: { raw: number };
        totalRevenue?: { raw: number };
        earningsGrowth?: { raw: number };
        targetHighPrice?: { raw: number };
        targetLowPrice?: { raw: number };
        targetMeanPrice?: { raw: number };
      };
      defaultKeyStatistics?: {
        trailingEps?: { raw: number };
        forwardEps?: { raw: number };
        pegRatio?: { raw: number };
        priceToBook?: { raw: number };
        enterpriseToRevenue?: { raw: number };
        enterpriseToEbitda?: { raw: number };
      };
      assetProfile?: {
        sector?: string;
        industry?: string;
        longBusinessSummary?: string;
        fullTimeEmployees?: number;
        website?: string;
      };
      price?: {
        regularMarketPrice?: { raw: number };
        shortName?: string;
        longName?: string;
      };
    }];
  };
}

export interface CompanyFinancials {
  // Basic Info
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  
  // Price Data
  currentPrice: number;
  yearHigh: number;
  yearLow: number;
  analystTarget: number;
  
  // Valuation Ratios
  pe: number;
  pb: number;
  peg: number;
  
  // Financial Health
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  
  // Profitability
  roe: number;
  roa: number;
  grossMargin: number;
  netMargin: number;
  operatingMargin: number;
  
  // Efficiency
  assetTurnover: number;
  revenueGrowth: number;
  
  // Dividend Info
  dividend: number;
  dividendYield: number;
  
  // Cash Flow (estimated)
  fcf1yr: number;
  fcf2yr: number;
  fcf3yr: number;
  fcf10yr: number;
  evFcf: number;
  sectorMedianEvFcf: number;
  intrinsicValue: number;
}

class FinancialDataService {
  private static readonly YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';
  
  private static async fetchFromYahoo(symbol: string): Promise<YahooFinanceData | null> {
    const modules = [
      'summaryDetail',
      'financialData', 
      'defaultKeyStatistics',
      'assetProfile',
      'price'
    ].join(',');
    
    const url = `${this.YAHOO_BASE_URL}/${symbol.toUpperCase()}?modules=${modules}`;

    try {
      console.log(`Fetching Yahoo Finance data for ${symbol}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: YahooFinanceData = await response.json();
      
      if (!data.quoteSummary?.result?.[0]) {
        console.warn(`No data found for symbol ${symbol}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, error);
      return null;
    }
  }

  static async getCompanyFinancials(symbol: string): Promise<CompanyFinancials | null> {
    try {
      const data = await this.fetchFromYahoo(symbol);
      
      if (!data) {
        console.warn(`No financial data found for ${symbol}`);
        return null;
      }

      const result = data.quoteSummary.result[0];
      const summary = result.summaryDetail || {};
      const financial = result.financialData || {};
      const keyStats = result.defaultKeyStatistics || {};
      const profile = result.assetProfile || {};
      const price = result.price || {};

      // Helper function to safely extract values
      const getValue = (obj: any): number => {
        return obj?.raw || 0;
      };

      // Calculate estimated cash flows based on revenue and margins
      const revenue = getValue(financial.totalRevenue);
      const netMargin = getValue(financial.profitMargins);
      const estimatedNetIncome = revenue * netMargin;
      const marketCap = getValue(summary.marketCap);
      
      const financials: CompanyFinancials = {
        // Basic Info
        symbol: symbol.toUpperCase(),
        name: price.longName || price.shortName || symbol,
        sector: profile.sector || 'Unknown',
        industry: profile.industry || 'Unknown',
        description: profile.longBusinessSummary || '',
        
        // Price Data
        currentPrice: getValue(price.regularMarketPrice),
        yearHigh: getValue(summary.fiftyTwoWeekHigh),
        yearLow: getValue(summary.fiftyTwoWeekLow),
        analystTarget: getValue(financial.targetMeanPrice),
        
        // Valuation Ratios
        pe: getValue(summary.trailingPE),
        pb: getValue(keyStats.priceToBook),
        peg: getValue(keyStats.pegRatio) || getValue(summary.pegRatio),
        
        // Financial Health
        debtToEquity: getValue(financial.debtToEquity),
        currentRatio: getValue(financial.currentRatio),
        quickRatio: getValue(financial.quickRatio),
        
        // Profitability (convert to percentages)
        roe: getValue(financial.returnOnEquity) * 100,
        roa: getValue(financial.returnOnAssets) * 100,
        grossMargin: getValue(financial.grossMargins) * 100,
        netMargin: getValue(financial.profitMargins) * 100,
        operatingMargin: getValue(financial.operatingMargins) * 100,
        
        // Efficiency
        assetTurnover: revenue && marketCap ? revenue / marketCap : 0,
        revenueGrowth: getValue(financial.revenueGrowth) * 100,
        
        // Dividend Info
        dividend: getValue(summary.dividendRate),
        dividendYield: getValue(summary.dividendYield) * 100,
        
        // Cash Flow (estimates based on financial data)
        fcf1yr: estimatedNetIncome * 1.2, // Estimate FCF as 120% of net income
        fcf2yr: estimatedNetIncome * 1.3,
        fcf3yr: estimatedNetIncome * 1.4,
        fcf10yr: estimatedNetIncome * 2.0,
        evFcf: getValue(keyStats.enterpriseToEbitda) || (getValue(summary.trailingPE) * 0.8),
        sectorMedianEvFcf: 15, // Industry average estimate
        intrinsicValue: getValue(financial.targetMeanPrice) || getValue(price.regularMarketPrice)
      };

      console.log(`Successfully fetched financial data for ${symbol}`);
      return financials;
    } catch (error) {
      console.error(`Error fetching financials for ${symbol}:`, error);
      return null;
    }
  }

  // Convenience method - just uses the main method since Yahoo Finance provides comprehensive data
  static async getDetailedFinancials(symbol: string): Promise<CompanyFinancials | null> {
    return this.getCompanyFinancials(symbol);
  }
}

export default FinancialDataService;