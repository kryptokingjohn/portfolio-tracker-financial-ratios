// Financial Modeling Prep API Service
// Comprehensive financial data including prices, ratios, and fundamentals

import { API_CONFIG, isApiEnabled } from '../config/database';

interface FMPQuoteResponse {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  sharesOutstanding: number;
  timestamp: number;
}

interface FMPRatiosResponse {
  symbol: string;
  date: string;
  period: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  daysOfSalesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  daysOfPayablesOutstanding: number;
  cashConversionCycle: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  effectiveTaxRate: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  netIncomePerEBT: number;
  ebtPerEbit: number;
  ebitPerRevenue: number;
  debtRatio: number;
  debtEquityRatio: number;
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number;
  cashFlowToDebtRatio: number;
  companyEquityMultiplier: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  payoutRatio: number;
  operatingCashFlowSalesRatio: number;
  freeCashFlowOperatingCashFlowRatio: number;
  cashFlowCoverageRatios: number;
  shortTermCoverageRatios: number;
  capitalExpenditureCoverageRatio: number;
  dividendPaidAndCapexCoverageRatio: number;
  dividendPayoutRatio: number;
  priceBookValueRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceEarningsRatio: number;
  priceToFreeCashFlowsRatio: number;
  priceToOperatingCashFlowsRatio: number;
  priceCashFlowRatio: number;
  priceEarningsToGrowthRatio: number;
  priceSalesRatio: number;
  dividendYield: number;
  enterpriseValueMultiple: number;
  priceFairValue: number;
}

interface FMPKeyMetricsResponse {
  symbol: string;
  date: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDdevelopementToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesInReceivables: number;
  daysPayablesOutstanding: number;
  daysOfSalesInInventory: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
}

interface FMPCompanyProfileResponse {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

// Combined interface for our portfolio tracker
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

class FMPService {
  private static readonly BASE_URL = 'https://financialmodelingprep.com/api/v3';
  private static readonly API_KEY = import.meta.env.VITE_FMP_API_KEY || 'demo';
  
  // Cache for API responses
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = API_CONFIG.EXTENDED_CACHE_DURATION || 900000; // 30 minutes default
  
  // Rate limiting
  private static lastCall = 0;
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between calls for free tier
  
  // Convert ticker symbols to FMP format
  private static formatTickerForFMP(symbol: string): string {
    // Handle common ticker format differences for FMP API
    return symbol
      .replace(/\./g, '-')  // Replace dots with hyphens (BRK.B -> BRK-B)
      .replace(/\//g, '-')  // Replace forward slashes with hyphens (BRK/B -> BRK-B)
      .toUpperCase();
  }
  
  private static async makeRequest<T>(endpoint: string): Promise<T | null> {
    // Check if API calls are disabled
    if (!isApiEnabled()) {
      console.log(`🎭 FMP API disabled - skipping ${endpoint} (using mock data to save costs)`);
      return null;
    }
    
    // Rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastCall));
    }
    this.lastCall = Date.now();
    
    // Check cache
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    const url = `${this.BASE_URL}${endpoint}?apikey=${this.API_KEY}`;
    
    try {
      console.log(`🔍 FMP API Request: ${endpoint}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ FMP API rate limit exceeded');
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle error responses
      if (data.error || (Array.isArray(data) && data.length === 0)) {
        console.warn(`⚠️ FMP API returned no data for ${endpoint}`);
        return null;
      }
      
      // Cache successful response
      this.cache.set(cacheKey, { data, timestamp: now });
      
      console.log(`✅ FMP API Success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ FMP API Error for ${endpoint}:`, error);
      return null;
    }
  }
  
  // Get current stock quote with basic metrics
  static async getQuote(symbol: string): Promise<any> {
    const formattedSymbol = this.formatTickerForFMP(symbol);
    const data = await this.makeRequest<FMPQuoteResponse[]>(`/quote/${formattedSymbol}`);
    return data?.[0] || null;
  }
  
  // Get detailed financial ratios
  static async getRatios(symbol: string): Promise<FMPRatiosResponse | null> {
    const formattedSymbol = this.formatTickerForFMP(symbol);
    const data = await this.makeRequest<FMPRatiosResponse[]>(`/ratios/${formattedSymbol}`);
    return data?.[0] || null; // Get most recent ratios
  }
  
  // Get key metrics
  static async getKeyMetrics(symbol: string): Promise<FMPKeyMetricsResponse | null> {
    const formattedSymbol = this.formatTickerForFMP(symbol);
    const data = await this.makeRequest<FMPKeyMetricsResponse[]>(`/key-metrics/${formattedSymbol}`);
    return data?.[0] || null; // Get most recent metrics
  }
  
  // Get company profile
  static async getCompanyProfile(symbol: string): Promise<FMPCompanyProfileResponse | null> {
    const formattedSymbol = this.formatTickerForFMP(symbol);
    const data = await this.makeRequest<FMPCompanyProfileResponse[]>(`/profile/${formattedSymbol}`);
    return data?.[0] || null;
  }
  
  // Main method to get comprehensive company financials
  static async getCompanyFinancials(symbol: string): Promise<CompanyFinancials | null> {
    try {
      console.log(`📊 Fetching comprehensive financial data for ${symbol}...`);
      
      // Fetch data from multiple endpoints in parallel (with rate limiting handled by makeRequest)
      const [quote, ratios, keyMetrics, profile] = await Promise.all([
        this.getQuote(symbol),
        this.getRatios(symbol),
        this.getKeyMetrics(symbol),
        this.getCompanyProfile(symbol)
      ]);
      
      if (!quote && !profile) {
        console.warn(`⚠️ No basic data available for ${symbol}`);
        return null;
      }
      
      // Helper function to safely extract values
      const getValue = (value: any, fallback: number = 0): number => {
        if (value === null || value === undefined || isNaN(value)) {
          return fallback;
        }
        return Number(value);
      };
      
      // Better sector and industry mapping
      const getSectorInfo = (profile: any, quote: any, symbol: string) => {
        // Use profile data first
        if (profile?.sector && profile.sector !== 'N/A') {
          return {
            sector: profile.sector,
            industry: profile.industry || 'General'
          };
        }
        
        // Fallback based on common ticker patterns
        const symbolUpper = symbol.toUpperCase();
        if (symbolUpper.includes('ETF') || symbolUpper.endsWith('ETF')) {
          return { sector: 'ETF', industry: 'Exchange Traded Fund' };
        }
        
        // Technology sector common patterns
        if (['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'CRM', 'ORCL'].includes(symbolUpper)) {
          return { sector: 'Technology', industry: 'Software & Technology' };
        }
        
        // Financial sector patterns
        if (['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BRK.A', 'BRK.B'].includes(symbolUpper)) {
          return { sector: 'Financial Services', industry: 'Banking & Investment' };
        }
        
        // Healthcare patterns
        if (['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'CVS'].includes(symbolUpper)) {
          return { sector: 'Healthcare', industry: 'Pharmaceuticals & Healthcare' };
        }
        
        // Consumer patterns
        if (['KO', 'PEP', 'WMT', 'PG', 'HD', 'MCD', 'NKE'].includes(symbolUpper)) {
          return { sector: 'Consumer Goods', industry: 'Consumer Products' };
        }
        
        // Default with exchange info if available
        const exchange = quote?.exchange || profile?.exchange || 'Unknown Exchange';
        return { 
          sector: `${exchange} Listed`, 
          industry: 'Market Securities' 
        };
      };
      
      const sectorInfo = getSectorInfo(profile, quote, symbol);
      
      // Combine data from all sources
      const financials: CompanyFinancials = {
        // Basic Info
        symbol: symbol.toUpperCase(),
        name: profile?.companyName || quote?.name || symbol,
        sector: sectorInfo.sector,
        industry: sectorInfo.industry,
        description: profile?.description || `Financial data for ${symbol}`,
        
        // Price Data
        currentPrice: getValue(quote?.price) || getValue(profile?.price),
        yearHigh: getValue(quote?.yearHigh),
        yearLow: getValue(quote?.yearLow),
        analystTarget: getValue(profile?.dcf) || getValue(quote?.price), // Use DCF as target
        
        // Valuation Ratios
        pe: getValue(quote?.pe) || getValue(keyMetrics?.peRatio),
        pb: getValue(ratios?.priceToBookRatio) || getValue(keyMetrics?.pbRatio),
        peg: getValue(ratios?.priceEarningsToGrowthRatio),
        
        // Financial Health
        debtToEquity: getValue(ratios?.debtEquityRatio) || getValue(keyMetrics?.debtToEquity),
        currentRatio: getValue(ratios?.currentRatio) || getValue(keyMetrics?.currentRatio),
        quickRatio: getValue(ratios?.quickRatio),
        
        // Profitability (convert to percentages)
        roe: getValue(ratios?.returnOnEquity) * 100 || getValue(keyMetrics?.roe) * 100,
        roa: getValue(ratios?.returnOnAssets) * 100,
        grossMargin: getValue(ratios?.grossProfitMargin) * 100,
        netMargin: getValue(ratios?.netProfitMargin) * 100,
        operatingMargin: getValue(ratios?.operatingProfitMargin) * 100,
        
        // Efficiency
        assetTurnover: getValue(ratios?.assetTurnover),
        revenueGrowth: 0, // Would need historical data for this
        
        // Dividend Info
        dividend: getValue(profile?.lastDiv),
        dividendYield: getValue(ratios?.dividendYield) * 100 || getValue(keyMetrics?.dividendYield) * 100,
        
        // Cash Flow estimates
        fcf1yr: getValue(keyMetrics?.freeCashFlowPerShare) * getValue(quote?.sharesOutstanding) / 1000000 || 1000,
        fcf2yr: getValue(keyMetrics?.freeCashFlowPerShare) * getValue(quote?.sharesOutstanding) / 1000000 * 1.1 || 1100,
        fcf3yr: getValue(keyMetrics?.freeCashFlowPerShare) * getValue(quote?.sharesOutstanding) / 1000000 * 1.21 || 1210,
        fcf10yr: getValue(keyMetrics?.freeCashFlowPerShare) * getValue(quote?.sharesOutstanding) / 1000000 * 2 || 2000,
        evFcf: getValue(keyMetrics?.evToFreeCashFlow),
        sectorMedianEvFcf: 15, // Industry average
        intrinsicValue: getValue(profile?.dcf) || getValue(quote?.price)
      };
      
      console.log(`✅ Successfully compiled financial data for ${symbol}`);
      return financials;
      
    } catch (error) {
      console.error(`❌ Error fetching financial data for ${symbol}:`, error);
      return null;
    }
  }
  
  // Batch method for multiple symbols (with rate limiting)
  static async batchGetFinancials(symbols: string[]): Promise<(CompanyFinancials | null)[]> {
    console.log(`📊 Batch fetching financial data for ${symbols.length} symbols...`);
    
    const results: (CompanyFinancials | null)[] = [];
    
    // Process symbols sequentially to respect rate limits
    for (const symbol of symbols) {
      const financial = await this.getCompanyFinancials(symbol);
      results.push(financial);
    }
    
    console.log(`✅ Batch fetch completed: ${results.filter(r => r !== null).length}/${symbols.length} successful`);
    return results;
  }
  
  // Method for market data service compatibility
  static async getMarketData(symbol: string): Promise<any> {
    const quote = await this.getQuote(symbol);
    
    if (!quote) {
      return null;
    }
    
    return {
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changesPercentage,
      volume: quote.volume,
      high: quote.dayHigh,
      low: quote.dayLow,
      open: quote.open,
      previousClose: quote.previousClose
    };
  }
}

export default FMPService;