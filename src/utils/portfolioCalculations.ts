// Portfolio calculation utilities
export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dividendIncome: number;
  dividendYield: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface HoldingCalculations {
  currentValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
  dayChange: number;
  dayChangePercent: number;
  annualDividendIncome: number;
  yieldOnCost: number;
}

export class PortfolioCalculator {
  static calculateHoldingMetrics(holding: any, previousPrice?: number): HoldingCalculations {
    const currentValue = holding.shares * holding.currentPrice;
    const totalCost = holding.shares * holding.costBasis;
    const gainLoss = currentValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
    
    // Day change calculation
    const prevPrice = previousPrice || holding.currentPrice * 0.99; // Mock previous price
    const dayChange = holding.shares * (holding.currentPrice - prevPrice);
    const dayChangePercent = prevPrice > 0 ? ((holding.currentPrice - prevPrice) / prevPrice) * 100 : 0;
    
    // Dividend calculations
    const annualDividendIncome = holding.dividend ? holding.shares * holding.dividend : 0;
    const yieldOnCost = holding.costBasis > 0 && holding.dividend ? 
      (holding.dividend / holding.costBasis) * 100 : 0;

    return {
      currentValue,
      totalCost,
      gainLoss,
      gainLossPercent,
      weight: 0, // Will be calculated at portfolio level
      dayChange,
      dayChangePercent,
      annualDividendIncome,
      yieldOnCost
    };
  }

  static calculatePortfolioMetrics(holdings: any[]): PortfolioMetrics {
    let totalValue = 0;
    let totalCost = 0;
    let totalDividendIncome = 0;
    let totalDayChange = 0;

    holdings.forEach(holding => {
      const metrics = this.calculateHoldingMetrics(holding);
      totalValue += metrics.currentValue;
      totalCost += metrics.totalCost;
      totalDividendIncome += metrics.annualDividendIncome;
      totalDayChange += metrics.dayChange;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const dividendYield = totalValue > 0 ? (totalDividendIncome / totalValue) * 100 : 0;
    const dayChangePercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      dividendIncome: totalDividendIncome,
      dividendYield,
      dayChange: totalDayChange,
      dayChangePercent
    };
  }

  static calculateAssetAllocation(holdings: any[]) {
    const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    
    const allocations = {
      byType: {} as { [key: string]: number },
      bySector: {} as { [key: string]: number },
      byAccount: {} as { [key: string]: number }
    };

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;

      // By asset type
      if (!allocations.byType[holding.type]) {
        allocations.byType[holding.type] = 0;
      }
      allocations.byType[holding.type] += weight;

      // By sector
      if (!allocations.bySector[holding.sector]) {
        allocations.bySector[holding.sector] = 0;
      }
      allocations.bySector[holding.sector] += weight;

      // By account type
      if (!allocations.byAccount[holding.accountType]) {
        allocations.byAccount[holding.accountType] = 0;
      }
      allocations.byAccount[holding.accountType] += weight;
    });

    return allocations;
  }

  static calculateRebalancingNeeds(holdings: any[], targetAllocations: { [key: string]: number }) {
    const currentAllocations = this.calculateAssetAllocation(holdings);
    const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    
    const rebalancingNeeds: { [key: string]: { current: number; target: number; difference: number; dollarAmount: number } } = {};

    Object.entries(targetAllocations).forEach(([asset, target]) => {
      const current = currentAllocations.byType[asset] || 0;
      const difference = target - current;
      const dollarAmount = (difference / 100) * totalValue;

      rebalancingNeeds[asset] = {
        current,
        target,
        difference,
        dollarAmount
      };
    });

    return rebalancingNeeds;
  }
}