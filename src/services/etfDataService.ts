// ETF Data Service - Fetches ETF-specific data from Financial Modeling Prep API

const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY || process.env.REACT_APP_FMP_API_KEY || '';
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

// Validate API key on module load
if (!FMP_API_KEY) {
  console.error('🚨 SECURITY: FMP_API_KEY not found in environment variables');
}

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
 * Fetches ETF sector weightings from Financial Modeling Prep API
 */
export async function fetchETFSectorWeightings(symbol: string): Promise<{ [sector: string]: number } | null> {
  try {
    const url = `https://financialmodelingprep.com/api/v3/etf-sector-weightings/${symbol}?apikey=${FMP_API_KEY}`;
    console.log(`🔍 Fetching ETF sector weightings from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ETF sector weightings API response not ok: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`No ETF sector weightings found for symbol: ${symbol}`);
      return null;
    }
    
    // The API returns an array of objects with sector names and weightings
    const sectorWeightings: { [sector: string]: number } = {};
    
    // Handle both array and object responses
    const sectorData = Array.isArray(data) ? data : [data];
    
    sectorData.forEach((item: any) => {
      // The API might return different field names, try common variations
      const sectorName = item.sector || item.sectorName || item.name;
      
      // Handle percentage strings like "35.06%" by removing % and parsing
      let weight = 0;
      if (item.weightPercentage) {
        weight = parseFloat(item.weightPercentage.replace('%', ''));
      } else {
        weight = parseFloat(item.weight || item.weighting || item.percentage || 0);
      }
      
      if (sectorName && weight > 0) {
        sectorWeightings[sectorName] = weight;
      }
    });
    
    console.log(`✅ Fetched sector weightings for ${symbol}:`, sectorWeightings);
    return sectorWeightings;
    
  } catch (error) {
    console.error(`Error fetching ETF sector weightings for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetches ETF information from Financial Modeling Prep API
 */
export async function fetchETFInfo(symbol: string): Promise<ETFInfo | null> {
  try {
    // Fetch basic ETF info and sector weightings in parallel
    const [basicInfoResponse, sectorWeightings] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v4/etf-info?symbol=${symbol}&apikey=${FMP_API_KEY}`),
      fetchETFSectorWeightings(symbol)
    ]);
    
    if (!basicInfoResponse.ok) {
      throw new Error(`ETF API response not ok: ${basicInfoResponse.status}`);
    }
    
    const data = await basicInfoResponse.json();
    
    if (!data || data.length === 0) {
      console.warn(`No ETF data found for symbol: ${symbol}`);
      return null;
    }
    
    const etfData = Array.isArray(data) ? data[0] : data;
    
    console.log(`✅ Fetched ETF info for ${symbol}:`, {
      basic: !!etfData,
      sectorWeightingsCount: sectorWeightings ? Object.keys(sectorWeightings).length : 0
    });
    
    return {
      symbol: etfData.symbol || symbol,  
      name: etfData.name || '',
      expenseRatio: parseFloat(etfData.expenseRatio) || 0,
      aum: parseFloat(etfData.aum) || 0, // v4 API uses 'aum' directly instead of 'assetsUnderManagement'
      dividendYield: etfData.dividendYield ? parseFloat(etfData.dividendYield) : undefined,
      holdingsCount: parseInt(etfData.holdingsCount) || 0,
      inceptionDate: etfData.inceptionDate || '',
      domicile: etfData.domicile || '',
      etfCompany: etfData.etfCompany || '',
      website: etfData.website || '',
      sectorWeightings: sectorWeightings || {}, // Use the dedicated sector endpoint data
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
  
  // Debug: Log sector data processing
  console.log(`🔍 Processing ETF sectors for ${etfInfo.symbol}:`, {
    rawSectorWeightings: sectorWeightings,
    sectorCount: Object.keys(sectorWeightings).length,
    sampleEntries: Object.entries(sectorWeightings).slice(0, 3)
  });
  
  const topSectors = Object.entries(sectorWeightings)
    .map(([sector, percentage]) => ({ sector, percentage: Number(percentage) }))
    .filter(item => !isNaN(item.percentage) && item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  
  console.log(`🎯 Top sectors calculated for ${etfInfo.symbol}:`, topSectors);
  
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