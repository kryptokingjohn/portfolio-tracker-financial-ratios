// Advanced Risk Analytics and Factor Analysis
import { Holding } from '../types/portfolio';

export interface RiskMetrics {
  portfolioBeta: number;
  sharpeRatio: number;
  sortinoRatio: number;
  informationRatio: number;
  treynorRatio: number;
  volatility: number;
  downside_deviation: number;
  maxDrawdown: number;
  valueAtRisk: number;
  expectedShortfall: number;
  trackingError: number;
}

export interface FactorExposure {
  market: number;
  size: number;
  value: number;
  profitability: number;
  investment: number;
  momentum: number;
  quality: number;
  lowVolatility: number;
}

export interface RiskDecomposition {
  systematicRisk: number;
  idiosyncraticRisk: number;
  factorRisk: number;
  specificRisk: number;
  totalRisk: number;
}

export interface CorrelationMatrix {
  [ticker: string]: {
    [ticker: string]: number;
  };
}

export interface DrawdownAnalysis {
  currentDrawdown: number;
  maxDrawdown: number;
  maxDrawdownDate: string;
  recoveryTime: number;
  underwaterPeriods: Array<{
    start: string;
    end: string;
    duration: number;
    maxDrawdown: number;
  }>;
}

export class RiskAnalytics {
  // Calculate comprehensive risk metrics
  static calculateRiskMetrics(
    holdings: Holding[], 
    portfolioReturns: number[], 
    benchmarkReturns: number[],
    riskFreeRate: number = 0.02
  ): RiskMetrics {
    const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const benchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    
    // Calculate volatility (standard deviation)
    const volatility = this.calculateVolatility(portfolioReturns);
    const benchmarkVolatility = this.calculateVolatility(benchmarkReturns);
    
    // Calculate beta
    const portfolioBeta = this.calculateBeta(portfolioReturns, benchmarkReturns);
    
    // Calculate downside deviation
    const downsideDeviation = this.calculateDownsideDeviation(portfolioReturns, riskFreeRate);
    
    // Calculate tracking error
    const trackingError = this.calculateTrackingError(portfolioReturns, benchmarkReturns);
    
    // Calculate risk-adjusted returns
    const sharpeRatio = volatility > 0 ? (portfolioReturn - riskFreeRate) / volatility : 0;
    const sortinoRatio = downsideDeviation > 0 ? (portfolioReturn - riskFreeRate) / downsideDeviation : 0;
    const informationRatio = trackingError > 0 ? (portfolioReturn - benchmarkReturn) / trackingError : 0;
    const treynorRatio = portfolioBeta > 0 ? (portfolioReturn - riskFreeRate) / portfolioBeta : 0;
    
    // Calculate VaR and Expected Shortfall
    const valueAtRisk = this.calculateVaR(portfolioReturns, 0.05);
    const expectedShortfall = this.calculateExpectedShortfall(portfolioReturns, 0.05);
    
    // Calculate maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);

    return {
      portfolioBeta,
      sharpeRatio,
      sortinoRatio: sortinoRatio,
      informationRatio,
      treynorRatio,
      volatility,
      downside_deviation: downsideDeviation,
      maxDrawdown,
      valueAtRisk,
      expectedShortfall,
      trackingError
    };
  }

  // Calculate factor exposures using Fama-French model
  static calculateFactorExposures(holdings: Holding[]): FactorExposure {
    let totalValue = 0;
    let weightedExposures = {
      market: 0,
      size: 0,
      value: 0,
      profitability: 0,
      investment: 0,
      momentum: 0,
      quality: 0,
      lowVolatility: 0
    };

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      totalValue += value;
    });

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      const weight = value / totalValue;
      
      // Estimate factor exposures based on stock characteristics
      const exposures = this.estimateStockFactorExposures(holding);
      
      Object.keys(weightedExposures).forEach(factor => {
        weightedExposures[factor as keyof typeof weightedExposures] += 
          weight * exposures[factor as keyof typeof exposures];
      });
    });

    return weightedExposures;
  }

  // Decompose portfolio risk into systematic and idiosyncratic components
  static decomposeRisk(holdings: Holding[], factorExposures: FactorExposure): RiskDecomposition {
    // Factor risk (systematic risk from factor exposures)
    const factorVariances = {
      market: 0.04,
      size: 0.02,
      value: 0.015,
      profitability: 0.01,
      investment: 0.008,
      momentum: 0.025,
      quality: 0.012,
      lowVolatility: 0.006
    };

    let factorRisk = 0;
    Object.entries(factorExposures).forEach(([factor, exposure]) => {
      const variance = factorVariances[factor as keyof typeof factorVariances] || 0.01;
      factorRisk += Math.pow(exposure, 2) * variance;
    });

    // Specific risk (idiosyncratic risk)
    let specificRisk = 0;
    let totalValue = 0;
    
    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      totalValue += value;
    });

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      const weight = value / totalValue;
      
      // Estimate specific risk based on company characteristics
      const stockSpecificRisk = this.estimateSpecificRisk(holding);
      specificRisk += Math.pow(weight, 2) * Math.pow(stockSpecificRisk, 2);
    });

    const systematicRisk = Math.sqrt(factorRisk);
    const idiosyncraticRisk = Math.sqrt(specificRisk);
    const totalRisk = Math.sqrt(factorRisk + specificRisk);

    return {
      systematicRisk,
      idiosyncraticRisk,
      factorRisk: systematicRisk,
      specificRisk: idiosyncraticRisk,
      totalRisk
    };
  }

  // Calculate correlation matrix between holdings
  static calculateCorrelationMatrix(holdings: Holding[]): CorrelationMatrix {
    const matrix: CorrelationMatrix = {};
    
    holdings.forEach(holding1 => {
      matrix[holding1.ticker] = {};
      holdings.forEach(holding2 => {
        if (holding1.ticker === holding2.ticker) {
          matrix[holding1.ticker][holding2.ticker] = 1.0;
        } else {
          // Estimate correlation based on sector and other factors
          matrix[holding1.ticker][holding2.ticker] = this.estimateCorrelation(holding1, holding2);
        }
      });
    });

    return matrix;
  }

  // Analyze drawdown periods
  static analyzeDrawdowns(returns: number[]): DrawdownAnalysis {
    let peak = 0;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    let maxDrawdownDate = '';
    let underwaterPeriods: DrawdownAnalysis['underwaterPeriods'] = [];
    let currentUnderwaterStart: string | null = null;

    returns.forEach((returnValue, index) => {
      const cumulativeReturn = returns.slice(0, index + 1).reduce((sum, r) => sum + r, 0);
      
      if (cumulativeReturn > peak) {
        peak = cumulativeReturn;
        if (currentUnderwaterStart) {
          // End of underwater period
          underwaterPeriods.push({
            start: currentUnderwaterStart,
            end: `Day ${index}`,
            duration: index - parseInt(currentUnderwaterStart.split(' ')[1]),
            maxDrawdown: currentDrawdown
          });
          currentUnderwaterStart = null;
        }
      } else {
        currentDrawdown = (cumulativeReturn - peak) / (1 + peak);
        if (currentDrawdown < maxDrawdown) {
          maxDrawdown = currentDrawdown;
          maxDrawdownDate = `Day ${index}`;
        }
        
        if (!currentUnderwaterStart) {
          currentUnderwaterStart = `Day ${index}`;
        }
      }
    });

    return {
      currentDrawdown,
      maxDrawdown,
      maxDrawdownDate,
      recoveryTime: 0, // Would calculate based on actual recovery
      underwaterPeriods
    };
  }

  // Helper methods
  private static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance);
  }

  private static calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const benchmarkMean = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    
    let covariance = 0;
    let benchmarkVariance = 0;
    
    for (let i = 0; i < portfolioReturns.length; i++) {
      covariance += (portfolioReturns[i] - portfolioMean) * (benchmarkReturns[i] - benchmarkMean);
      benchmarkVariance += Math.pow(benchmarkReturns[i] - benchmarkMean, 2);
    }
    
    return benchmarkVariance > 0 ? covariance / benchmarkVariance : 1;
  }

  private static calculateDownsideDeviation(returns: number[], threshold: number): number {
    const downsideReturns = returns.filter(r => r < threshold).map(r => r - threshold);
    if (downsideReturns.length === 0) return 0;
    
    const variance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length;
    return Math.sqrt(variance);
  }

  private static calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const differences = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    return this.calculateVolatility(differences);
  }

  private static calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  private static calculateExpectedShortfall(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const cutoff = Math.floor((1 - confidence) * sortedReturns.length);
    const tailReturns = sortedReturns.slice(0, cutoff);
    return tailReturns.length > 0 ? tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length : 0;
  }

  private static calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    
    returns.forEach(returnValue => {
      peak = Math.max(peak, returnValue);
      const drawdown = (returnValue - peak) / peak;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
    });
    
    return maxDrawdown;
  }

  private static estimateStockFactorExposures(holding: Holding): FactorExposure {
    return {
      market: 1.0, // All stocks have market exposure
      size: this.getSizeExposure(holding),
      value: this.getValueExposure(holding),
      profitability: this.getProfitabilityExposure(holding),
      investment: this.getInvestmentExposure(holding),
      momentum: this.getMomentumExposure(holding),
      quality: this.getQualityExposure(holding),
      lowVolatility: this.getLowVolatilityExposure(holding)
    };
  }

  private static getSizeExposure(holding: Holding): number {
    // Estimate based on current price as proxy for market cap
    if (holding.currentPrice > 200) return -0.5; // Large cap
    if (holding.currentPrice > 50) return 0; // Mid cap
    return 0.5; // Small cap
  }

  private static getValueExposure(holding: Holding): number {
    const pbScore = holding.pb < 1.5 ? 0.3 : holding.pb > 3 ? -0.3 : 0;
    const peScore = holding.pe < 15 ? 0.3 : holding.pe > 25 ? -0.3 : 0;
    return (pbScore + peScore) / 2;
  }

  private static getProfitabilityExposure(holding: Holding): number {
    const roeScore = holding.roe > 15 ? 0.3 : holding.roe < 5 ? -0.3 : 0;
    const roaScore = holding.roa > 10 ? 0.3 : holding.roa < 3 ? -0.3 : 0;
    return (roeScore + roaScore) / 2;
  }

  private static getInvestmentExposure(holding: Holding): number {
    if (holding.revenueGrowth > 15) return -0.3; // High growth/investment
    if (holding.revenueGrowth < 5) return 0.3; // Conservative
    return 0;
  }

  private static getMomentumExposure(holding: Holding): number {
    const pricePosition = (holding.currentPrice - holding.yearLow) / (holding.yearHigh - holding.yearLow);
    if (pricePosition > 0.8) return 0.4; // Strong momentum
    if (pricePosition < 0.2) return -0.4; // Weak momentum
    return 0;
  }

  private static getQualityExposure(holding: Holding): number {
    const qualityScore = (
      (holding.roe > 15 ? 1 : 0) +
      (holding.debtToEquity < 0.3 ? 1 : 0) +
      (holding.currentRatio > 1.5 ? 1 : 0) +
      (holding.grossMargin > 30 ? 1 : 0)
    ) / 4;
    return qualityScore * 0.5 - 0.25; // Scale to -0.25 to 0.25
  }

  private static getLowVolatilityExposure(holding: Holding): number {
    // Estimate based on sector and financial stability
    const stableSectors = ['Utilities', 'Consumer Staples', 'Healthcare'];
    const sectorStability = stableSectors.includes(holding.sector) ? 0.3 : -0.1;
    const financialStability = holding.debtToEquity < 0.3 && holding.currentRatio > 1.5 ? 0.2 : -0.1;
    return sectorStability + financialStability;
  }

  private static estimateSpecificRisk(holding: Holding): number {
    // Base specific risk
    let specificRisk = 0.15; // 15% base specific risk
    
    // Adjust based on company characteristics
    if (holding.type === 'etfs') specificRisk *= 0.3; // ETFs have lower specific risk
    if (holding.sector === 'Technology') specificRisk *= 1.2; // Tech stocks more volatile
    if (holding.currentRatio < 1) specificRisk *= 1.3; // Financial distress increases risk
    if (holding.debtToEquity > 0.6) specificRisk *= 1.2; // High leverage increases risk
    
    return Math.min(specificRisk, 0.4); // Cap at 40%
  }

  private static estimateCorrelation(holding1: Holding, holding2: Holding): number {
    let correlation = 0.3; // Base market correlation
    
    // Same sector increases correlation
    if (holding1.sector === holding2.sector) correlation += 0.4;
    
    // Same asset type increases correlation
    if (holding1.type === holding2.type) correlation += 0.2;
    
    // Similar size (based on price as proxy) increases correlation
    const sizeDiff = Math.abs(holding1.currentPrice - holding2.currentPrice) / Math.max(holding1.currentPrice, holding2.currentPrice);
    if (sizeDiff < 0.5) correlation += 0.1;
    
    return Math.min(correlation, 0.95); // Cap at 95%
  }
}