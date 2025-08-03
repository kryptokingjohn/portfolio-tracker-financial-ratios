// ETF Data Service - Fetches ETF-specific data from Financial Modeling Prep API

const FMP_API_KEY = 'dlzQb3cU7yOPGnNy8agxl9e7PI7pkAtH';
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

export interface ETFInfo {
  symbol: string;
  name: string;
  expenseRatio: number;
  aum: number; // Assets Under Management
  dividendYield?: number;
  holdingsCount: number;
  inceptionDate: string;
  domicile: string;
  etfCompany: string;
  website: string;
  sectorWeightings?: { [sector: string]: number };
  avgVolume: number;
  nav: number;
}

export interface ETFMetrics {
  basic: {
    expenseRatio: number;
    aum: number;
    dividendYield?: number;
    holdingsCount: number;
  };
  advanced?: {
    sectorWeightings: { [sector: string]: number };
    topSectors: Array<{ sector: string; percentage: number }>;
    avgVolume: number;
    nav: number;
    trackingInfo: string;
  };
}

/**
 * Fetches ETF information from Financial Modeling Prep API
 */
export async function fetchETFInfo(symbol: string): Promise<ETFInfo | null> {
  try {
    const url = `${FMP_BASE_URL}/etf/info?symbol=${symbol}&apikey=${FMP_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ETF API response not ok: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`No ETF data found for symbol: ${symbol}`);
      return null;
    }
    
    const etfData = Array.isArray(data) ? data[0] : data;
    
    return {
      symbol: etfData.symbol || symbol,
      name: etfData.name || '',
      expenseRatio: parseFloat(etfData.expenseRatio) || 0,
      aum: parseFloat(etfData.aum) || 0,
      dividendYield: etfData.dividendYield ? parseFloat(etfData.dividendYield) : undefined,
      holdingsCount: parseInt(etfData.holdingsCount) || 0,
      inceptionDate: etfData.inceptionDate || '',
      domicile: etfData.domicile || '',
      etfCompany: etfData.etfCompany || '',
      website: etfData.website || '',
      sectorWeightings: etfData.sectorWeightings || {},
      avgVolume: parseFloat(etfData.avgVolume) || 0,
      nav: parseFloat(etfData.nav) || 0,
    };
  } catch (error) {
    console.error(`Error fetching ETF info for ${symbol}:`, error);
    return null;
  }
}

/**
 * Processes ETF data into basic and advanced metrics
 */
export function processETFMetrics(etfInfo: ETFInfo, isPremium: boolean): ETFMetrics {
  const basic = {
    expenseRatio: etfInfo.expenseRatio,
    aum: etfInfo.aum,
    dividendYield: etfInfo.dividendYield,
    holdingsCount: etfInfo.holdingsCount,
  };
  
  if (!isPremium) {
    return { basic };
  }
  
  // Advanced metrics for Premium users
  const sectorWeightings = etfInfo.sectorWeightings || {};
  const topSectors = Object.entries(sectorWeightings)
    .map(([sector, percentage]) => ({ sector, percentage: Number(percentage) }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  
  const advanced = {
    sectorWeightings,
    topSectors,
    avgVolume: etfInfo.avgVolume,
    nav: etfInfo.nav,
    trackingInfo: `${etfInfo.holdingsCount} holdings from ${etfInfo.etfCompany}`,
  };
  
  return { basic, advanced };
}

/**
 * Formats AUM (Assets Under Management) for display
 */
export function formatAUM(aum: number): string {
  if (aum >= 1e12) {
    return `$${(aum / 1e12).toFixed(1)}T`;
  } else if (aum >= 1e9) {
    return `$${(aum / 1e9).toFixed(1)}B`;
  } else if (aum >= 1e6) {
    return `$${(aum / 1e6).toFixed(1)}M`;
  } else {
    return `$${aum.toLocaleString()}`;
  }
}

/**
 * Cache for ETF data to avoid repeated API calls
 */
const ETF_CACHE = new Map<string, { data: ETFInfo; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cached ETF info fetcher
 */
export async function getCachedETFInfo(symbol: string): Promise<ETFInfo | null> {
  const cached = ETF_CACHE.get(symbol);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const freshData = await fetchETFInfo(symbol);
  if (freshData) {
    ETF_CACHE.set(symbol, { data: freshData, timestamp: now });
  }
  
  return freshData;
}