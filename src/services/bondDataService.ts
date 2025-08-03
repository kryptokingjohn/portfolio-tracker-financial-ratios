// Bond Data Service - Mock data for bond-specific metrics
// TODO: Replace with real bond API when available

export interface BondInfo {
  symbol: string;
  name: string;
  duration: number; // Modified duration
  yield: number; // Yield to maturity
  creditRating: string;
  maturityDate: string;
  couponRate: number;
  faceValue: number;
}

export interface BondMetrics {
  basic: {
    duration: number;
    yield: number;
    creditRating: string; 
    maturityDate: string;
  };
  advanced?: {
    couponRate: number;
    modifiedDuration: number;
    convexity: number;
    creditSpread: number;
    yieldCurvePosition: string;
  };
}

// Mock bond data for known bond ETFs and instruments
const MOCK_BOND_DATA: { [symbol: string]: BondInfo } = {
  'TLT': {
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    duration: 17.8,
    yield: 4.2,
    creditRating: 'AAA',
    maturityDate: '2040+',
    couponRate: 0.0,
    faceValue: 100,
  },
  'IEF': {
    symbol: 'IEF', 
    name: 'iShares 7-10 Year Treasury Bond ETF',
    duration: 8.1,
    yield: 4.1,
    creditRating: 'AAA',
    maturityDate: '2030-2033',
    couponRate: 0.0,
    faceValue: 100,
  },
  'AGG': {
    symbol: 'AGG',
    name: 'iShares Core US Aggregate Bond ETF',
    duration: 6.2,
    yield: 4.3,
    creditRating: 'AA+',
    maturityDate: 'Mixed',
    couponRate: 0.0,
    faceValue: 100,
  },
  'BND': {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    duration: 6.1,
    yield: 4.2,
    creditRating: 'AA+',
    maturityDate: 'Mixed',
    couponRate: 0.0,
    faceValue: 100,
  },
  'LQD': {
    symbol: 'LQD',
    name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF',
    duration: 8.7,
    yield: 4.8,
    creditRating: 'A',
    maturityDate: 'Mixed',
    couponRate: 0.0,
    faceValue: 100,
  },
  'HYG': {
    symbol: 'HYG',
    name: 'iShares iBoxx $ High Yield Corporate Bond ETF',
    duration: 3.9,
    yield: 7.2,
    creditRating: 'BB',
    maturityDate: 'Mixed',
    couponRate: 0.0,
    faceValue: 100,
  },
  'SHY': {
    symbol: 'SHY',
    name: 'iShares 1-3 Year Treasury Bond ETF',
    duration: 1.9,
    yield: 4.8,
    creditRating: 'AAA',
    maturityDate: '2025-2027',
    couponRate: 0.0,
    faceValue: 100,
  },
  'MUB': {
    symbol: 'MUB',
    name: 'iShares National Muni Bond ETF',
    duration: 7.1,
    yield: 3.2,
    creditRating: 'AA',
    maturityDate: 'Mixed',
    couponRate: 0.0,
    faceValue: 100,
  },
};

/**
 * Fetches bond information (currently mock data)
 */
export async function fetchBondInfo(symbol: string): Promise<BondInfo | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const bondData = MOCK_BOND_DATA[symbol.toUpperCase()];
  if (!bondData) {
    console.warn(`No bond data found for symbol: ${symbol}`);
    return null;
  }
  
  return { ...bondData };
}

/**
 * Processes bond data into basic and advanced metrics
 */
export function processBondMetrics(bondInfo: BondInfo, isPremium: boolean): BondMetrics {
  const basic = {
    duration: bondInfo.duration,
    yield: bondInfo.yield,
    creditRating: bondInfo.creditRating,
    maturityDate: bondInfo.maturityDate,
  };
  
  if (!isPremium) {
    return { basic };
  }
  
  // Advanced metrics for Premium users
  const advanced = {
    couponRate: bondInfo.couponRate,
    modifiedDuration: bondInfo.duration * 0.95, // Approximation
    convexity: bondInfo.duration * 0.8, // Approximation
    creditSpread: bondInfo.creditRating === 'AAA' ? 0.1 : 
                  bondInfo.creditRating.startsWith('A') ? 0.5 : 2.0,
    yieldCurvePosition: bondInfo.duration < 3 ? 'Short-term' :
                       bondInfo.duration < 10 ? 'Intermediate' : 'Long-term',
  };
  
  return { basic, advanced };
}

/**
 * Formats duration for display
 */
export function formatDuration(duration: number): string {
  return `${duration.toFixed(1)} yrs`;
}

/**
 * Formats yield for display
 */
export function formatYield(yield_value: number): string {
  return `${yield_value.toFixed(2)}%`;
}

/**
 * Gets explanatory text for bond metrics
 */
export function getBondMetricExplanation(metric: string): string {
  const explanations: { [key: string]: string } = {
    duration: "Duration measures price sensitivity to interest rate changes. Higher duration = more volatile.",
    yield: "Yield to maturity represents the total return expected if held to maturity.",
    creditRating: "Credit rating indicates default risk. AAA is highest quality, below BBB is 'junk'.",
    maturityDate: "When the bond principal is repaid. Longer maturity typically means higher yield.",
    convexity: "Convexity measures how duration changes as interest rates change. Higher convexity = better price protection.",
    creditSpread: "Additional yield over risk-free treasuries to compensate for credit risk.",
  };
  
  return explanations[metric] || "";
}

/**
 * Cache for bond data
 */
const BOND_CACHE = new Map<string, { data: BondInfo; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cached bond info fetcher
 */
export async function getCachedBondInfo(symbol: string): Promise<BondInfo | null> {
  const cached = BOND_CACHE.get(symbol);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const freshData = await fetchBondInfo(symbol);
  if (freshData) {
    BOND_CACHE.set(symbol, { data: freshData, timestamp: now });
  }
  
  return freshData;
}