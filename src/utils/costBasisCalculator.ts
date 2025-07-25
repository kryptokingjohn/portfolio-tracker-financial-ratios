// Cost basis calculation utilities for tax purposes
import { Transaction } from '../types/portfolio';

export type CostBasisMethod = 'FIFO' | 'LIFO' | 'SpecificLot' | 'AverageCost';

export interface LotInfo {
  id: string;
  date: string;
  shares: number;
  costBasis: number;
  remainingShares: number;
}

export interface CostBasisResult {
  method: CostBasisMethod;
  totalShares: number;
  averageCostBasis: number;
  totalCostBasis: number;
  lots: LotInfo[];
  realizedGains: number;
  unrealizedGains: number;
}

export interface SaleResult {
  soldShares: number;
  proceeds: number;
  costBasis: number;
  realizedGain: number;
  lots: Array<{
    lotId: string;
    sharesSold: number;
    costBasis: number;
    salePrice: number;
    gain: number;
    date: string;
    saleDate: string;
  }>;
}

export class CostBasisCalculator {
  static calculateCostBasis(
    transactions: Transaction[], 
    ticker: string, 
    method: CostBasisMethod = 'FIFO'
  ): CostBasisResult {
    const tickerTransactions = transactions
      .filter(t => t.ticker === ticker && ['buy', 'sell'].includes(t.type))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let lots: LotInfo[] = [];
    let totalRealizedGains = 0;

    tickerTransactions.forEach((transaction, index) => {
      if (transaction.type === 'buy' && transaction.shares && transaction.price) {
        // Add new lot
        lots.push({
          id: `${ticker}-${index}`,
          date: transaction.date,
          shares: transaction.shares,
          costBasis: transaction.price,
          remainingShares: transaction.shares
        });
      } else if (transaction.type === 'sell' && transaction.shares && transaction.price) {
        // Process sale
        const saleResult = this.processSale(lots, transaction.shares, transaction.price, transaction.date, method);
        totalRealizedGains += saleResult.realizedGain;
        lots = lots.filter(lot => lot.remainingShares > 0);
      }
    });

    const totalShares = lots.reduce((sum, lot) => sum + lot.remainingShares, 0);
    const totalCostBasis = lots.reduce((sum, lot) => sum + (lot.remainingShares * lot.costBasis), 0);
    const averageCostBasis = totalShares > 0 ? totalCostBasis / totalShares : 0;

    return {
      method,
      totalShares,
      averageCostBasis,
      totalCostBasis,
      lots,
      realizedGains: totalRealizedGains,
      unrealizedGains: 0 // Would need current price to calculate
    };
  }

  private static processSale(
    lots: LotInfo[], 
    sharesToSell: number, 
    salePrice: number, 
    saleDate: string,
    method: CostBasisMethod
  ): SaleResult {
    let remainingToSell = sharesToSell;
    let totalProceeds = sharesToSell * salePrice;
    let totalCostBasis = 0;
    const soldLots: SaleResult['lots'] = [];

    // Sort lots based on method
    const sortedLots = [...lots].sort((a, b) => {
      switch (method) {
        case 'FIFO':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'LIFO':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'AverageCost':
          return 0; // Will be handled differently
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    if (method === 'AverageCost') {
      // Calculate average cost basis
      const totalShares = lots.reduce((sum, lot) => sum + lot.remainingShares, 0);
      const totalCost = lots.reduce((sum, lot) => sum + (lot.remainingShares * lot.costBasis), 0);
      const avgCostBasis = totalShares > 0 ? totalCost / totalShares : 0;
      
      totalCostBasis = sharesToSell * avgCostBasis;
      
      // Reduce shares proportionally from all lots
      lots.forEach(lot => {
        const sharesToReduceFromLot = (lot.remainingShares / totalShares) * sharesToSell;
        lot.remainingShares = Math.max(0, lot.remainingShares - sharesToReduceFromLot);
      });
    } else {
      // FIFO, LIFO, or Specific Lot
      for (const lot of sortedLots) {
        if (remainingToSell <= 0) break;
        
        const sharesToTakeFromLot = Math.min(remainingToSell, lot.remainingShares);
        const costBasisForSale = sharesToTakeFromLot * lot.costBasis;
        
        soldLots.push({
          lotId: lot.id,
          sharesSold: sharesToTakeFromLot,
          costBasis: lot.costBasis,
          salePrice,
          gain: (salePrice - lot.costBasis) * sharesToTakeFromLot,
          date: lot.date,
          saleDate
        });
        
        totalCostBasis += costBasisForSale;
        lot.remainingShares -= sharesToTakeFromLot;
        remainingToSell -= sharesToTakeFromLot;
      }
    }

    return {
      soldShares: sharesToSell,
      proceeds: totalProceeds,
      costBasis: totalCostBasis,
      realizedGain: totalProceeds - totalCostBasis,
      lots: soldLots
    };
  }

  static detectWashSales(transactions: Transaction[], ticker: string): Array<{
    saleDate: string;
    purchaseDate: string;
    shares: number;
    disallowedLoss: number;
  }> {
    const washSales: Array<{
      saleDate: string;
      purchaseDate: string;
      shares: number;
      disallowedLoss: number;
    }> = [];

    const tickerTransactions = transactions
      .filter(t => t.ticker === ticker)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const sales = tickerTransactions.filter(t => t.type === 'sell');
    const purchases = tickerTransactions.filter(t => t.type === 'buy');

    sales.forEach(sale => {
      if (!sale.shares || !sale.price) return;
      
      const saleDate = new Date(sale.date);
      const washSaleStart = new Date(saleDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days before
      const washSaleEnd = new Date(saleDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days after

      // Check for purchases within wash sale period
      purchases.forEach(purchase => {
        if (!purchase.shares || !purchase.price) return;
        
        const purchaseDate = new Date(purchase.date);
        
        if (purchaseDate >= washSaleStart && purchaseDate <= washSaleEnd && purchaseDate.getTime() !== saleDate.getTime()) {
          // This might be a wash sale if the sale was at a loss
          const saleLoss = (sale.price - (sale.price || 0)) * sale.shares; // Simplified - would need cost basis
          
          if (saleLoss < 0) {
            washSales.push({
              saleDate: sale.date,
              purchaseDate: purchase.date,
              shares: Math.min(sale.shares, purchase.shares),
              disallowedLoss: Math.abs(saleLoss)
            });
          }
        }
      });
    });

    return washSales;
  }

  static generateTaxReport(transactions: Transaction[], year: number): {
    shortTermGains: number;
    longTermGains: number;
    totalGains: number;
    washSales: Array<any>;
    dividends: number;
  } {
    const yearTransactions = transactions.filter(t => 
      new Date(t.date).getFullYear() === year
    );

    let shortTermGains = 0;
    let longTermGains = 0;
    let dividends = 0;

    // Group by ticker and calculate gains
    const tickers = [...new Set(yearTransactions.map(t => t.ticker))];
    
    tickers.forEach(ticker => {
      const tickerTransactions = yearTransactions.filter(t => t.ticker === ticker);
      
      // Calculate realized gains (simplified)
      const sales = tickerTransactions.filter(t => t.type === 'sell');
      sales.forEach(sale => {
        // This is simplified - in reality would need to match with specific purchase lots
        const holdingPeriod = 365; // Mock holding period
        const gain = (sale.amount || 0) - ((sale.shares || 0) * (sale.price || 0)); // Simplified
        
        if (holdingPeriod > 365) {
          longTermGains += gain;
        } else {
          shortTermGains += gain;
        }
      });

      // Sum dividends
      const dividendTransactions = tickerTransactions.filter(t => t.type === 'dividend');
      dividends += dividendTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    });

    return {
      shortTermGains,
      longTermGains,
      totalGains: shortTermGains + longTermGains,
      washSales: [], // Would implement full wash sale detection
      dividends
    };
  }
}