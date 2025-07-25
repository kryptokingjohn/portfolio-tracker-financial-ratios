// Performance Attribution Calculator
// Implements Brinson-Hood-Beebower attribution model

import { Holding, AttributionAnalysis, SectorAttribution } from '../types/portfolio';

interface BenchmarkData {
  [sector: string]: {
    weight: number;
    return: number;
  };
}

// S&P 500 sector weights and mock returns (in production, this would come from real data)
const SP500_BENCHMARK: BenchmarkData = {
  'Technology': { weight: 0.28, return: 0.25 },
  'Healthcare': { weight: 0.13, return: 0.15 },
  'Financial Services': { weight: 0.11, return: 0.18 },
  'Consumer Discretionary': { weight: 0.10, return: 0.22 },
  'Communication Services': { weight: 0.09, return: 0.12 },
  'Industrials': { weight: 0.08, return: 0.16 },
  'Consumer Staples': { weight: 0.06, return: 0.08 },
  'Energy': { weight: 0.04, return: 0.35 },
  'Utilities': { weight: 0.03, return: 0.05 },
  'Real Estate': { weight: 0.03, return: 0.10 },
  'Materials': { weight: 0.03, return: 0.20 },
  'Index Fund': { weight: 0.02, return: 0.24 }, // For ETFs
  'Fixed Income': { weight: 0.00, return: 0.02 } // For bonds
};

export class AttributionCalculator {
  
  static calculateAttribution(holdings: Holding[]): AttributionAnalysis {
    // Calculate portfolio metrics
    const portfolioMetrics = this.calculatePortfolioMetrics(holdings);
    const sectorAttributions = this.calculateSectorAttributions(holdings);
    
    // Calculate total effects
    const totalAllocationEffect = sectorAttributions.reduce((sum, sector) => sum + sector.allocationEffect, 0);
    const totalSelectionEffect = sectorAttributions.reduce((sum, sector) => sum + sector.selectionEffect, 0);
    const totalInteractionEffect = sectorAttributions.reduce((sum, sector) => sum + sector.interactionEffect, 0);
    
    // Calculate benchmark return (weighted average)
    const benchmarkReturn = Object.entries(SP500_BENCHMARK).reduce((sum, [sector, data]) => {
      return sum + (data.weight * data.return);
    }, 0);
    
    const activeReturn = portfolioMetrics.totalReturn - benchmarkReturn;
    
    return {
      totalReturn: portfolioMetrics.totalReturn,
      benchmarkReturn,
      activeReturn,
      assetAllocationEffect: totalAllocationEffect,
      securitySelectionEffect: totalSelectionEffect,
      interactionEffect: totalInteractionEffect,
      sectors: sectorAttributions
    };
  }
  
  private static calculatePortfolioMetrics(holdings: Holding[]) {
    let totalValue = 0;
    let totalCost = 0;
    
    holdings.forEach(holding => {
      const currentValue = holding.shares * holding.currentPrice;
      const cost = holding.shares * holding.costBasis;
      totalValue += currentValue;
      totalCost += cost;
    });
    
    const totalReturn = totalCost > 0 ? (totalValue - totalCost) / totalCost : 0;
    
    return { totalReturn, totalValue, totalCost };
  }
  
  private static calculateSectorAttributions(holdings: Holding[]): SectorAttribution[] {
    // Group holdings by sector
    const sectorGroups = this.groupBySector(holdings);
    const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    
    const attributions: SectorAttribution[] = [];
    
    // Calculate attribution for each sector
    Object.entries(sectorGroups).forEach(([sector, sectorHoldings]) => {
      const sectorValue = sectorHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
      const sectorCost = sectorHoldings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0);
      
      const portfolioWeight = sectorValue / totalPortfolioValue;
      const benchmarkWeight = SP500_BENCHMARK[sector]?.weight || 0;
      const portfolioReturn = sectorCost > 0 ? (sectorValue - sectorCost) / sectorCost : 0;
      const benchmarkReturn = SP500_BENCHMARK[sector]?.return || 0;
      
      // Brinson-Hood-Beebower Attribution Formula
      const allocationEffect = (portfolioWeight - benchmarkWeight) * benchmarkReturn;
      const selectionEffect = benchmarkWeight * (portfolioReturn - benchmarkReturn);
      const interactionEffect = (portfolioWeight - benchmarkWeight) * (portfolioReturn - benchmarkReturn);
      const totalEffect = allocationEffect + selectionEffect + interactionEffect;
      
      attributions.push({
        sector,
        portfolioWeight,
        benchmarkWeight,
        portfolioReturn,
        benchmarkReturn,
        allocationEffect,
        selectionEffect,
        interactionEffect,
        totalEffect
      });
    });
    
    return attributions.sort((a, b) => Math.abs(b.totalEffect) - Math.abs(a.totalEffect));
  }
  
  private static groupBySector(holdings: Holding[]): { [sector: string]: Holding[] } {
    return holdings.reduce((groups, holding) => {
      const sector = holding.sector;
      if (!groups[sector]) {
        groups[sector] = [];
      }
      groups[sector].push(holding);
      return groups;
    }, {} as { [sector: string]: Holding[] });
  }
  
  // Calculate rolling attribution over time periods
  static calculateRollingAttribution(holdings: Holding[], periods: number = 12): AttributionAnalysis[] {
    // This would use historical data in production
    // For now, return mock rolling data
    const results: AttributionAnalysis[] = [];
    
    for (let i = 0; i < periods; i++) {
      const mockAttribution = this.calculateAttribution(holdings);
      // Add some variation for demonstration
      const variation = (Math.random() - 0.5) * 0.02;
      mockAttribution.assetAllocationEffect += variation;
      mockAttribution.securitySelectionEffect += variation * 0.5;
      results.push(mockAttribution);
    }
    
    return results;
  }
}