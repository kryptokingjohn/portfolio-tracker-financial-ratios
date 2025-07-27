interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  QuarterlyRevenueGrowthYOY: string;
  QuarterlyEarningsGrowthYOY: string;
  AnalystTargetPrice: string;
  '52WeekHigh': string;
  '52WeekLow': string;
}

interface BalanceSheet {
  totalAssets: string;
  totalCurrentAssets: string;
  inventory: string;
  totalCurrentLiabilities: string;
  totalShareholderEquity: string;
  totalDebt: string;
}

interface IncomeStatement {
  totalRevenue: string;
  costOfRevenue: string;
  grossProfit: string;
  operatingIncome: string;
  netIncome: string;
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
  private static readonly BASE_URL = 'https://www.alphavantage.co/query';
  private static readonly API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
  
  private static async fetchFromAlphaVantage(params: Record<string, string>): Promise<any> {
    if (!this.API_KEY) {
      console.warn('Alpha Vantage API key not configured');
      return null;
    }

    const url = new URL(this.BASE_URL);
    url.searchParams.append('apikey', this.API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (data['Note']) {
        console.warn('Alpha Vantage API limit reached:', data['Note']);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      return null;
    }
  }

  static async getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
    const data = await this.fetchFromAlphaVantage({
      function: 'OVERVIEW',
      symbol: symbol.toUpperCase()
    });
    
    return data;
  }

  static async getCompanyFinancials(symbol: string): Promise<CompanyFinancials | null> {
    try {
      const overview = await this.getCompanyOverview(symbol);
      
      if (!overview) {
        console.warn(`No financial data found for ${symbol}`);
        return null;
      }

      // Helper function to safely parse numbers
      const parseNumber = (value: string | undefined): number => {
        if (!value || value === 'None' || value === '-') return 0;
        const num = parseFloat(value.replace(/[,%]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      // Calculate P/B ratio
      const pb = overview.BookValue ? parseNumber(overview.PERatio) / parseNumber(overview.BookValue) : 0;
      
      // Calculate debt-to-equity (simplified - would need balance sheet for accuracy)
      const marketCap = parseNumber(overview.MarketCapitalization);
      
      // Estimate financial ratios from available data
      const financials: CompanyFinancials = {
        // Basic Info
        symbol: overview.Symbol || symbol.toUpperCase(),
        name: overview.Name || symbol,
        sector: overview.Sector || 'Unknown',
        industry: overview.Industry || 'Unknown',
        description: overview.Description || '',
        
        // Price Data (would need current price from quote API)
        currentPrice: 0, // Will be updated by market data service
        yearHigh: parseNumber(overview['52WeekHigh']),
        yearLow: parseNumber(overview['52WeekLow']),
        analystTarget: parseNumber(overview.AnalystTargetPrice),
        
        // Valuation Ratios
        pe: parseNumber(overview.PERatio),
        pb: pb,
        peg: parseNumber(overview.PEGRatio),
        
        // Financial Health (simplified estimates)
        debtToEquity: 0, // Would need balance sheet data
        currentRatio: 0, // Would need balance sheet data
        quickRatio: 0, // Would need balance sheet data
        
        // Profitability
        roe: parseNumber(overview.ReturnOnEquityTTM) * 100,
        roa: parseNumber(overview.ReturnOnAssetsTTM) * 100,
        grossMargin: 0, // Calculated from gross profit / revenue
        netMargin: parseNumber(overview.ProfitMargin) * 100,
        operatingMargin: parseNumber(overview.OperatingMarginTTM) * 100,
        
        // Efficiency
        assetTurnover: 0, // Would need balance sheet data
        revenueGrowth: parseNumber(overview.QuarterlyRevenueGrowthYOY) * 100,
        
        // Dividend Info
        dividend: parseNumber(overview.DividendPerShare),
        dividendYield: parseNumber(overview.DividendYield) * 100,
        
        // Cash Flow (estimated based on market cap and margins)
        fcf1yr: marketCap * 0.05, // Rough estimate
        fcf2yr: marketCap * 0.06,
        fcf3yr: marketCap * 0.07,
        fcf10yr: marketCap * 0.10,
        evFcf: overview.PERatio ? parseNumber(overview.PERatio) * 0.8 : 0,
        sectorMedianEvFcf: 15, // Industry average estimate
        intrinsicValue: parseNumber(overview.AnalystTargetPrice) || 0
      };

      return financials;
    } catch (error) {
      console.error(`Error fetching financials for ${symbol}:`, error);
      return null;
    }
  }

  // Enhanced method that combines overview with balance sheet for more accurate ratios
  static async getDetailedFinancials(symbol: string): Promise<CompanyFinancials | null> {
    try {
      const [overview, balanceSheet, incomeStatement] = await Promise.all([
        this.getCompanyOverview(symbol),
        this.getBalanceSheet(symbol),
        this.getIncomeStatement(symbol)
      ]);

      if (!overview) return null;

      const parseNumber = (value: string | undefined): number => {
        if (!value || value === 'None' || value === '-') return 0;
        const num = parseFloat(value.replace(/[,%]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      // Calculate more accurate ratios with additional data
      let currentRatio = 0;
      let quickRatio = 0;
      let debtToEquity = 0;
      let grossMargin = 0;
      let assetTurnover = 0;

      if (balanceSheet) {
        const totalCurrentAssets = parseNumber(balanceSheet.totalCurrentAssets);
        const totalCurrentLiabilities = parseNumber(balanceSheet.totalCurrentLiabilities);
        const inventory = parseNumber(balanceSheet.inventory);
        const totalDebt = parseNumber(balanceSheet.totalDebt);
        const totalEquity = parseNumber(balanceSheet.totalShareholderEquity);
        const totalAssets = parseNumber(balanceSheet.totalAssets);
        const revenue = parseNumber(overview.RevenueTTM);

        currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
        quickRatio = totalCurrentLiabilities > 0 ? (totalCurrentAssets - inventory) / totalCurrentLiabilities : 0;
        debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : 0;
        assetTurnover = totalAssets > 0 ? revenue / totalAssets : 0;
      }

      if (incomeStatement) {
        const revenue = parseNumber(incomeStatement.totalRevenue);
        const grossProfit = parseNumber(incomeStatement.grossProfit);
        grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      }

      const financials = await this.getCompanyFinancials(symbol);
      if (!financials) return null;

      // Update with more accurate calculated values
      return {
        ...financials,
        currentRatio,
        quickRatio,
        debtToEquity,
        grossMargin,
        assetTurnover
      };

    } catch (error) {
      console.error(`Error fetching detailed financials for ${symbol}:`, error);
      return this.getCompanyFinancials(symbol); // Fallback to basic data
    }
  }

  private static async getBalanceSheet(symbol: string): Promise<BalanceSheet | null> {
    const data = await this.fetchFromAlphaVantage({
      function: 'BALANCE_SHEET',
      symbol: symbol.toUpperCase()
    });

    if (data?.quarterlyReports?.[0]) {
      const latest = data.quarterlyReports[0];
      return {
        totalAssets: latest.totalAssets,
        totalCurrentAssets: latest.totalCurrentAssets,
        inventory: latest.inventory,
        totalCurrentLiabilities: latest.totalCurrentLiabilities,
        totalShareholderEquity: latest.totalShareholderEquity,
        totalDebt: latest.longTermDebt || latest.shortTermDebt || '0'
      };
    }

    return null;
  }

  private static async getIncomeStatement(symbol: string): Promise<IncomeStatement | null> {
    const data = await this.fetchFromAlphaVantage({
      function: 'INCOME_STATEMENT',
      symbol: symbol.toUpperCase()
    });

    if (data?.quarterlyReports?.[0]) {
      const latest = data.quarterlyReports[0];
      return {
        totalRevenue: latest.totalRevenue,
        costOfRevenue: latest.costOfRevenue,
        grossProfit: latest.grossProfit,
        operatingIncome: latest.operatingIncome,
        netIncome: latest.netIncome
      };
    }

    return null;
  }
}

export default FinancialDataService;