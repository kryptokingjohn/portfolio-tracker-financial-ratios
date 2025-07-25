// Factor Analysis using Fama-French models
export interface FactorExposure {
  market: number; // Market beta
  size: number; // Small minus big (SMB)
  value: number; // High minus low (HML)
  profitability: number; // Robust minus weak (RMW)
  investment: number; // Conservative minus aggressive (CMA)
  momentum: number; // Up minus down (UMD)
}

export interface FactorAttribution {
  totalReturn: number;
  factorContributions: {
    market: number;
    size: number;
    value: number;
    profitability: number;
    investment: number;
    momentum: number;
    alpha: number;
  };
  rSquared: number;
  trackingError: number;
}

export class FactorAnalyzer {
  // Fama-French factor returns (mock data - in production, get from Kenneth French data library)
  private static readonly FACTOR_RETURNS = {
    market: 0.12, // Market excess return
    size: 0.02, // SMB return
    value: 0.03, // HML return
    profitability: 0.025, // RMW return
    investment: 0.015, // CMA return
    momentum: 0.08 // UMD return
  };

  static calculateFactorExposure(holdings: any[]): FactorExposure {
    let totalValue = 0;
    let weightedExposures = {
      market: 0,
      size: 0,
      value: 0,
      profitability: 0,
      investment: 0,
      momentum: 0
    };

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      totalValue += value;
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

  private static estimateStockFactorExposures(holding: any): FactorExposure {
    // Estimate factor exposures based on stock characteristics
    return {
      market: holding.beta || 1, // Use actual beta if available
      size: this.getSizeExposure(holding.marketCap),
      value: this.getValueExposure(holding.pbRatio, holding.peRatio),
      profitability: this.getProfitabilityExposure(holding.roe, holding.roa),
      investment: this.getInvestmentExposure(holding.revenueGrowth),
      momentum: this.getMomentumExposure(holding.currentPrice, holding.yearHigh, holding.yearLow)
    };
  }

  private static getSizeExposure(marketCap: number): number {
    // Negative for large cap, positive for small cap
    if (marketCap > 200000000000) return -0.5; // Large cap
    if (marketCap > 10000000000) return 0; // Mid cap
    return 0.5; // Small cap
  }

  private static getValueExposure(pbRatio: number, peRatio: number): number {
    // Positive for value stocks (low P/B, low P/E)
    const pbScore = pbRatio < 1.5 ? 0.3 : pbRatio > 3 ? -0.3 : 0;
    const peScore = peRatio < 15 ? 0.3 : peRatio > 25 ? -0.3 : 0;
    return (pbScore + peScore) / 2;
  }

  private static getProfitabilityExposure(roe: number, roa: number): number {
    // Positive for profitable companies
    const roeScore = roe > 15 ? 0.3 : roe < 5 ? -0.3 : 0;
    const roaScore = roa > 10 ? 0.3 : roa < 3 ? -0.3 : 0;
    return (roeScore + roaScore) / 2;
  }

  private static getInvestmentExposure(revenueGrowth: number): number {
    // Negative for high investment (high growth), positive for conservative
    if (revenueGrowth > 15) return -0.3; // High growth/investment
    if (revenueGrowth < 5) return 0.3; // Conservative
    return 0;
  }

  private static getMomentumExposure(currentPrice: number, yearHigh: number, yearLow: number): number {
    // Positive for stocks near 52-week highs
    const pricePosition = (currentPrice - yearLow) / (yearHigh - yearLow);
    if (pricePosition > 0.8) return 0.4; // Strong momentum
    if (pricePosition < 0.2) return -0.4; // Weak momentum
    return 0;
  }

  static calculateFactorAttribution(
    portfolioReturn: number, 
    factorExposures: FactorExposure
  ): FactorAttribution {
    const contributions = {
      market: factorExposures.market * this.FACTOR_RETURNS.market,
      size: factorExposures.size * this.FACTOR_RETURNS.size,
      value: factorExposures.value * this.FACTOR_RETURNS.value,
      profitability: factorExposures.profitability * this.FACTOR_RETURNS.profitability,
      investment: factorExposures.investment * this.FACTOR_RETURNS.investment,
      momentum: factorExposures.momentum * this.FACTOR_RETURNS.momentum,
      alpha: 0
    };

    // Calculate alpha (unexplained return)
    const explainedReturn = Object.values(contributions).reduce((sum, contrib) => sum + contrib, 0);
    contributions.alpha = portfolioReturn - explainedReturn;

    // Mock R-squared and tracking error
    const rSquared = 0.85; // Typical for diversified portfolio
    const trackingError = 0.04; // 4% tracking error

    return {
      totalReturn: portfolioReturn,
      factorContributions: contributions,
      rSquared,
      trackingError
    };
  }
}