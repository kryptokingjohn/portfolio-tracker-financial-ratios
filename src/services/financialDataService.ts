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
  // Multiple CORS proxy options for reliability
  private static readonly CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];
  private static readonly YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';
  
  private static async fetchFromYahoo(symbol: string): Promise<YahooFinanceData | null> {
    const modules = [
      'summaryDetail',
      'financialData', 
      'defaultKeyStatistics',
      'assetProfile',
      'price'
    ].join(',');
    
    const targetUrl = `${this.YAHOO_BASE_URL}/${symbol.toUpperCase()}?modules=${modules}`;

    // Try each CORS proxy in sequence
    for (let i = 0; i < this.CORS_PROXIES.length; i++) {
      const proxy = this.CORS_PROXIES[i];
      let url: string;
      
      if (proxy.includes('allorigins')) {
        url = `${proxy}${encodeURIComponent(targetUrl)}`;
      } else {
        url = `${proxy}${encodeURIComponent(targetUrl)}`;
      }

      try {
        console.log(`Attempting to fetch Yahoo Finance data for ${symbol} via proxy ${i + 1}...`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.warn(`Proxy ${i + 1} failed with status ${response.status}`);
          continue;
        }
        
        let data: YahooFinanceData;
        
        if (proxy.includes('allorigins')) {
          const responseData = await response.json();
          data = JSON.parse(responseData.contents);
        } else {
          data = await response.json();
        }
        
        if (data.quoteSummary?.result?.[0]) {
          console.log(`Successfully fetched data for ${symbol} via proxy ${i + 1}`);
          return data;
        }
        
        console.warn(`No data found for symbol ${symbol} via proxy ${i + 1}`);
      } catch (error) {
        console.warn(`Proxy ${i + 1} failed for ${symbol}:`, error);
        continue;
      }
    }
    
    console.error(`All CORS proxies failed for ${symbol}`);
    return null;
  }

  // Generate fallback financial data with reasonable estimates
  private static generateFallbackData(symbol: string): CompanyFinancials {
    console.log(`Generating fallback financial data for ${symbol}`);
    
    return {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      sector: 'Technology', // Default sector
      industry: 'Software',
      description: `Financial data temporarily unavailable for ${symbol}`,
      
      // Price Data (placeholder values)
      currentPrice: 100,
      yearHigh: 120,
      yearLow: 80,
      analystTarget: 110,
      
      // Reasonable default ratios for tech stocks
      pe: 25,
      pb: 3.5,
      peg: 1.2,
      
      // Financial Health defaults
      debtToEquity: 0.3,
      currentRatio: 2.1,
      quickRatio: 1.8,
      
      // Profitability estimates
      roe: 15,
      roa: 8,
      grossMargin: 65,
      netMargin: 20,
      operatingMargin: 25,
      
      // Efficiency estimates
      assetTurnover: 0.4,
      revenueGrowth: 12,
      
      // Dividend defaults
      dividend: 0,
      dividendYield: 0,
      
      // Cash Flow estimates
      fcf1yr: 1000,
      fcf2yr: 1200,
      fcf3yr: 1400,
      fcf10yr: 2000,
      evFcf: 20,
      sectorMedianEvFcf: 15,
      intrinsicValue: 105
    };
  }

  static async getCompanyFinancials(symbol: string): Promise<CompanyFinancials | null> {
    try {
      const data = await this.fetchFromYahoo(symbol);
      
      if (!data) {
        console.warn(`Yahoo Finance API unavailable for ${symbol}, using fallback data`);
        return this.generateFallbackData(symbol);
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

      console.log(`Successfully fetched live financial data for ${symbol}`);
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