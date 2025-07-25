// Tax optimization utilities
import { Holding, Transaction } from '../types/portfolio';
import { CostBasisCalculator } from './costBasisCalculator';

export interface TaxOptimizationSuggestion {
  type: 'tax_loss_harvest' | 'asset_location' | 'rebalance_timing' | 'wash_sale_warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: number;
  action: string;
  holdings?: string[];
}

export interface AssetLocationAnalysis {
  taxable: {
    recommended: string[];
    current: string[];
    efficiency: number;
  };
  taxDeferred: {
    recommended: string[];
    current: string[];
    efficiency: number;
  };
  taxFree: {
    recommended: string[];
    current: string[];
    efficiency: number;
  };
}

export class TaxOptimizer {
  static analyzeTaxOptimization(
    holdings: Holding[], 
    transactions: Transaction[],
    taxRate: number = 0.24
  ): TaxOptimizationSuggestion[] {
    const suggestions: TaxOptimizationSuggestion[] = [];

    // Tax loss harvesting opportunities
    const lossHarvestingSuggestions = this.findTaxLossHarvestingOpportunities(holdings, taxRate);
    suggestions.push(...lossHarvestingSuggestions);

    // Asset location optimization
    const assetLocationSuggestions = this.analyzeAssetLocation(holdings);
    suggestions.push(...assetLocationSuggestions);

    // Wash sale warnings
    const washSaleWarnings = this.checkWashSaleRisks(transactions);
    suggestions.push(...washSaleWarnings);

    // Rebalancing timing
    const rebalancingSuggestions = this.analyzeRebalancingTiming(holdings);
    suggestions.push(...rebalancingSuggestions);

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static findTaxLossHarvestingOpportunities(
    holdings: Holding[], 
    taxRate: number
  ): TaxOptimizationSuggestion[] {
    const suggestions: TaxOptimizationSuggestion[] = [];
    
    holdings.forEach(holding => {
      const currentValue = holding.shares * holding.currentPrice;
      const totalCost = holding.shares * holding.costBasis;
      const unrealizedLoss = totalCost - currentValue;
      
      if (unrealizedLoss > 1000) { // Significant loss threshold
        const taxSavings = unrealizedLoss * taxRate;
        
        suggestions.push({
          type: 'tax_loss_harvest',
          priority: unrealizedLoss > 5000 ? 'high' : 'medium',
          title: `Tax Loss Harvesting: ${holding.ticker}`,
          description: `Realize ${unrealizedLoss.toFixed(0)} loss to offset gains and reduce taxes`,
          potentialSavings: taxSavings,
          action: `Consider selling ${holding.ticker} to harvest tax loss`,
          holdings: [holding.ticker]
        });
      }
    });

    return suggestions;
  }

  private static analyzeAssetLocation(holdings: Holding[]): TaxOptimizationSuggestion[] {
    const suggestions: TaxOptimizationSuggestion[] = [];
    
    // Find dividend-paying stocks in taxable accounts
    const taxableDividendHoldings = holdings.filter(h => 
      h.accountType === 'taxable' && 
      h.dividend && 
      h.dividend > 0 && 
      h.dividendYield && 
      h.dividendYield > 3
    );

    if (taxableDividendHoldings.length > 0) {
      const annualDividendTax = taxableDividendHoldings.reduce((sum, h) => {
        const annualDividend = h.shares * (h.dividend || 0);
        return sum + (annualDividend * 0.24); // Assume 24% tax rate
      }, 0);

      suggestions.push({
        type: 'asset_location',
        priority: annualDividendTax > 500 ? 'high' : 'medium',
        title: 'Move High-Dividend Assets to Tax-Advantaged Accounts',
        description: `High-dividend holdings in taxable accounts are generating unnecessary tax liability`,
        potentialSavings: annualDividendTax,
        action: 'Consider moving dividend-paying assets to IRA or 401(k)',
        holdings: taxableDividendHoldings.map(h => h.ticker)
      });
    }

    // Find growth stocks in tax-deferred accounts
    const taxDeferredGrowthHoldings = holdings.filter(h => 
      ['401k', 'traditional_ira'].includes(h.accountType) && 
      h.dividendYield && 
      h.dividendYield < 1 && 
      h.revenueGrowth > 15
    );

    if (taxDeferredGrowthHoldings.length > 0) {
      suggestions.push({
        type: 'asset_location',
        priority: 'medium',
        title: 'Consider Moving Growth Stocks to Taxable Accounts',
        description: 'Growth stocks with low dividends may be better suited for taxable accounts to benefit from capital gains rates',
        potentialSavings: 0, // Difficult to quantify
        action: 'Review asset location for tax efficiency',
        holdings: taxDeferredGrowthHoldings.map(h => h.ticker)
      });
    }

    return suggestions;
  }

  private static checkWashSaleRisks(transactions: Transaction[]): TaxOptimizationSuggestion[] {
    const suggestions: TaxOptimizationSuggestion[] = [];
    
    // Group transactions by ticker
    const tickerTransactions = transactions.reduce((acc, t) => {
      if (!acc[t.ticker]) acc[t.ticker] = [];
      acc[t.ticker].push(t);
      return acc;
    }, {} as { [ticker: string]: Transaction[] });

    Object.entries(tickerTransactions).forEach(([ticker, txns]) => {
      const washSales = CostBasisCalculator.detectWashSales(txns, ticker);
      
      if (washSales.length > 0) {
        const totalDisallowedLoss = washSales.reduce((sum, ws) => sum + ws.disallowedLoss, 0);
        
        suggestions.push({
          type: 'wash_sale_warning',
          priority: 'high',
          title: `Wash Sale Detected: ${ticker}`,
          description: `${washSales.length} potential wash sale(s) may disallow ${totalDisallowedLoss.toFixed(0)} in losses`,
          potentialSavings: -totalDisallowedLoss * 0.24, // Negative because it's a cost
          action: 'Review recent transactions and avoid repurchasing within 30 days',
          holdings: [ticker]
        });
      }
    });

    return suggestions;
  }

  private static analyzeRebalancingTiming(holdings: Holding[]): TaxOptimizationSuggestion[] {
    const suggestions: TaxOptimizationSuggestion[] = [];
    
    // Find holdings with large unrealized gains that might trigger rebalancing
    const largeGainHoldings = holdings.filter(h => {
      const currentValue = h.shares * h.currentPrice;
      const totalCost = h.shares * h.costBasis;
      const unrealizedGain = currentValue - totalCost;
      const gainPercent = (unrealizedGain / totalCost) * 100;
      
      return gainPercent > 50 && unrealizedGain > 10000;
    });

    if (largeGainHoldings.length > 0) {
      const totalTaxLiability = largeGainHoldings.reduce((sum, h) => {
        const currentValue = h.shares * h.currentPrice;
        const totalCost = h.shares * h.costBasis;
        const unrealizedGain = currentValue - totalCost;
        return sum + (unrealizedGain * 0.20); // Long-term capital gains rate
      }, 0);

      suggestions.push({
        type: 'rebalance_timing',
        priority: 'medium',
        title: 'Consider Tax-Efficient Rebalancing',
        description: 'Large unrealized gains may create significant tax liability if rebalanced',
        potentialSavings: 0,
        action: 'Consider rebalancing with new contributions or tax-loss harvesting',
        holdings: largeGainHoldings.map(h => h.ticker)
      });
    }

    return suggestions;
  }

  static calculateAssetLocationEfficiency(holdings: Holding[]): AssetLocationAnalysis {
    const analysis: AssetLocationAnalysis = {
      taxable: { recommended: [], current: [], efficiency: 0 },
      taxDeferred: { recommended: [], current: [], efficiency: 0 },
      taxFree: { recommended: [], current: [], efficiency: 0 }
    };

    holdings.forEach(holding => {
      const accountType = holding.accountType;
      const isHighDividend = (holding.dividendYield || 0) > 3;
      const isGrowthStock = (holding.dividendYield || 0) < 1 && holding.revenueGrowth > 15;
      const isBond = holding.type === 'bonds';

      // Current allocation
      if (accountType === 'taxable') {
        analysis.taxable.current.push(holding.ticker);
      } else if (['401k', 'traditional_ira', 'sep_ira', 'simple_ira'].includes(accountType)) {
        analysis.taxDeferred.current.push(holding.ticker);
      } else if (['roth_ira', 'hsa'].includes(accountType)) {
        analysis.taxFree.current.push(holding.ticker);
      }

      // Recommended allocation
      if (isBond || isHighDividend) {
        analysis.taxDeferred.recommended.push(holding.ticker);
      } else if (isGrowthStock) {
        analysis.taxFree.recommended.push(holding.ticker);
      } else {
        analysis.taxable.recommended.push(holding.ticker);
      }
    });

    // Calculate efficiency scores
    analysis.taxable.efficiency = this.calculateLocationEfficiency(
      analysis.taxable.current, 
      analysis.taxable.recommended
    );
    analysis.taxDeferred.efficiency = this.calculateLocationEfficiency(
      analysis.taxDeferred.current, 
      analysis.taxDeferred.recommended
    );
    analysis.taxFree.efficiency = this.calculateLocationEfficiency(
      analysis.taxFree.current, 
      analysis.taxFree.recommended
    );

    return analysis;
  }

  private static calculateLocationEfficiency(current: string[], recommended: string[]): number {
    if (recommended.length === 0) return 100;
    
    const matches = current.filter(ticker => recommended.includes(ticker)).length;
    return (matches / recommended.length) * 100;
  }
}