export interface Holding {
  id: string;
  company: string;
  ticker: string;
  type: 'stocks' | 'etfs' | 'bonds';
  accountType: 'taxable' | '401k' | 'traditional_ira' | 'roth_ira' | 'hsa' | 'sep_ira' | 'simple_ira' | '529' | 'cash_money_market' | 'trust' | 'custodial';
  
  // Position Info
  shares: number;
  costBasis: number;
  currentPrice: number;
  
  // Price Data
  yearHigh: number;
  yearLow: number;
  
  // Cash Flow Data
  fcf1yr: number;
  fcf2yr: number;
  fcf3yr: number;
  fcf10yr: number;
  
  // Valuation Metrics
  evFcf: number;
  sectorMedianEvFcf: number;
  intrinsicValue: number;
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
  
  // Additional Info
  narrative: string;
  description?: string; // FMP API description - will eventually replace narrative
  sector: string;
  dividend?: number;
  dividendYield?: number;
  
  // ETF-specific properties
  expenseRatio?: number;
  netAssets?: number; // AUM in millions
  inceptionDate?: string;
  etfCategory?: string; // 'Large Cap Blend', 'Dividend/Income', etc.
  
  // Bond-specific properties
  maturityDate?: string;
  couponRate?: number; // Annual coupon rate %
  yieldToMaturity?: number; // YTM %
  duration?: number; // Modified duration in years
  creditRating?: string; // AAA, AA+, BBB-, etc.
  bondType?: string; // 'Treasury', 'Corporate', 'Municipal', 'High Yield'
  faceValue?: number; // Par value
  callableDate?: string; // If callable bond
}

export interface Transaction {
  id: string;
  ticker: string;
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'spinoff' | 'merger' | 'rights' | 'return_of_capital' | 'fee' | 'interest';
  accountType?: string;
  date: string;
  shares?: number;
  price?: number;
  amount: number;
  fees?: number;
  notes?: string;
  splitRatio?: string; // For stock splits (e.g., "2:1")
  newTicker?: string; // For spinoffs/mergers
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dividendIncome: number;
  dividendYield: number;
}

export interface AttributionAnalysis {
  totalReturn: number;
  benchmarkReturn: number;
  activeReturn: number;
  assetAllocationEffect: number;
  securitySelectionEffect: number;
  interactionEffect: number;
  sectors: SectorAttribution[];
}

export interface SectorAttribution {
  sector: string;
  portfolioWeight: number;
  benchmarkWeight: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  allocationEffect: number;
  selectionEffect: number;
  interactionEffect: number;
  totalEffect: number;
}

export interface MarketData {
  price: number;
  volume?: number;
  marketCap?: number;
  beta?: number;
}