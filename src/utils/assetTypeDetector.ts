// Asset Type Detection Utilities
// Comprehensive detection for stocks, ETFs, bonds, and other instruments

export type AssetType = 'stocks' | 'etfs' | 'bonds';

interface ETFData {
  ticker: string;
  name: string;
  category: string;
}

// Known ETF patterns and comprehensive list
const KNOWN_ETFS: ETFData[] = [
  // Equity ETFs
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'Large Cap Blend' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'Total Stock Market' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', category: 'Technology' },
  { ticker: 'IWM', name: 'iShares Russell 2000 ETF', category: 'Small Cap' },
  { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', category: 'International' },
  { ticker: 'VWO', name: 'Vanguard Emerging Markets Stock Index Fund', category: 'Emerging Markets' },
  
  // Dividend/Income ETFs
  { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', category: 'Dividend/Income' },
  { ticker: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF', category: 'Dividend/Income' },
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', category: 'Dividend' },
  { ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'Dividend' },
  { ticker: 'SPHD', name: 'Invesco S&P 500 High Dividend Low Volatility ETF', category: 'Dividend' },
  
  // Sector ETFs
  { ticker: 'XLK', name: 'Technology Select Sector SPDR Fund', category: 'Technology' },
  { ticker: 'XLF', name: 'Financial Select Sector SPDR Fund', category: 'Financial' },
  { ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', category: 'Energy' },
  { ticker: 'XLV', name: 'Health Care Select Sector SPDR Fund', category: 'Healthcare' },
  { ticker: 'XLI', name: 'Industrial Select Sector SPDR Fund', category: 'Industrial' },
  
  // Bond ETFs
  { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'Aggregate Bond' },
  { ticker: 'AGG', name: 'iShares Core US Aggregate Bond ETF', category: 'Aggregate Bond' },
  { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', category: 'Treasury' },
  { ticker: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', category: 'Treasury' },
  { ticker: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', category: 'Corporate Bond' },
  
  // International ETFs
  { ticker: 'EFA', name: 'iShares MSCI EAFE ETF', category: 'International Developed' },
  { ticker: 'EEM', name: 'iShares MSCI Emerging Markets ETF', category: 'Emerging Markets' },
  { ticker: 'FXI', name: 'iShares China Large-Cap ETF', category: 'China' },
  
  // Commodity ETFs
  { ticker: 'GLD', name: 'SPDR Gold Shares', category: 'Gold' },
  { ticker: 'SLV', name: 'iShares Silver Trust', category: 'Silver' },
  { ticker: 'USO', name: 'United States Oil Fund', category: 'Oil' },
  
  // Real Estate ETFs
  { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'Real Estate' },
  { ticker: 'IYR', name: 'iShares US Real Estate ETF', category: 'Real Estate' },
];

const ETF_TICKER_MAP = new Map(KNOWN_ETFS.map(etf => [etf.ticker.toUpperCase(), etf]));

// Common ETF naming patterns
const ETF_NAME_PATTERNS = [
  /ETF$/i,
  /Exchange.Traded.Fund/i,
  /SPDR/i,
  /iShares/i,
  /Vanguard.*ETF/i,
  /Invesco.*ETF/i,
  /Schwab.*ETF/i,
  /Select.*Sector/i,
  /Trust$/i,
  /Fund.*ETF/i
];

// ETF ticker patterns
const ETF_TICKER_PATTERNS = [
  /^[A-Z]{2,4}$/, // Most ETFs are 2-4 letters
  /^V[A-Z]{2}$/, // Vanguard pattern
  /^I[A-Z]{2}$/, // iShares pattern
  /^XL[A-Z]$/, // SPDR Sector patterns
  /^SPY|QQQ|IWM|GLD|SLV|TLT|AGG|BND$/ // Major ETFs
];

/**
 * Determines if a ticker is an ETF based on comprehensive detection logic
 */
export function detectAssetType(
  ticker: string, 
  companyName?: string, 
  isEtfFromApi?: boolean,
  exchange?: string
): AssetType {
  const tickerUpper = ticker.toUpperCase();
  
  // 1. Direct API confirmation (most reliable)
  if (isEtfFromApi === true) {
    return 'etfs';
  }
  
  // 2. Known ETF lookup (high confidence)
  if (ETF_TICKER_MAP.has(tickerUpper)) {
    return 'etfs';
  }
  
  // 3. Company/fund name analysis
  if (companyName) {
    const nameUpper = companyName.toUpperCase();
    
    // Check for ETF in name patterns
    for (const pattern of ETF_NAME_PATTERNS) {
      if (pattern.test(companyName)) {
        return 'etfs';
      }
    }
    
    // Bond fund detection
    if (nameUpper.includes('BOND') || nameUpper.includes('TREASURY') || nameUpper.includes('FIXED INCOME')) {
      return 'bonds';
    }
    
    // Additional ETF indicators
    if (nameUpper.includes('INDEX') || nameUpper.includes('SECTOR') || nameUpper.includes('FACTOR')) {
      return 'etfs';
    }
  }
  
  // 4. Exchange-based detection
  if (exchange) {
    const exchangeUpper = exchange.toUpperCase();
    // Some exchanges are more likely to have ETFs
    if (exchangeUpper.includes('ARCA') || exchangeUpper.includes('BATS')) {
      // These exchanges have many ETFs, but still need other indicators
      if (companyName && ETF_NAME_PATTERNS.some(pattern => pattern.test(companyName))) {
        return 'etfs';
      }
    }
  }
  
  // 5. Ticker pattern analysis (lower confidence)
  if (tickerUpper.length <= 4) {
    for (const pattern of ETF_TICKER_PATTERNS) {
      if (pattern.test(tickerUpper)) {
        // Need additional confirmation for ticker patterns
        if (companyName && (
          companyName.toUpperCase().includes('FUND') ||
          companyName.toUpperCase().includes('TRUST') ||
          companyName.toUpperCase().includes('ETF')
        )) {
          return 'etfs';
        }
      }
    }
  }
  
  // Default to stocks if no ETF or bond indicators found
  return 'stocks';
}

/**
 * Gets ETF-specific information if available
 */
export function getETFInfo(ticker: string): ETFData | null {
  return ETF_TICKER_MAP.get(ticker.toUpperCase()) || null;
}

/**
 * Gets the display category for an asset
 */
export function getAssetCategory(ticker: string, assetType: AssetType): string {
  if (assetType === 'etfs') {
    const etfInfo = getETFInfo(ticker);
    return etfInfo?.category || 'ETF';
  }
  
  if (assetType === 'bonds') {
    return 'Fixed Income';
  }
  
  return 'Equity';
}

/**
 * Determines if an asset should show ETF-specific metrics
 */
export function shouldShowETFMetrics(assetType: AssetType): boolean {
  return assetType === 'etfs';
}

/**
 * Determines if an asset should show bond-specific metrics
 */
export function shouldShowBondMetrics(assetType: AssetType): boolean {
  return assetType === 'bonds';
}