import { useState, useEffect } from 'react';
import { Holding, Transaction } from '../types/portfolio';
import { DatabaseService } from '../lib/database';
import { MarketDataService } from '../services/marketDataService';
import { PortfolioCalculator } from '../utils/portfolioCalculations';
import { DividendTracker } from '../utils/dividendTracker';
import { useAuth } from './useAuthSimple';
import FinancialDataService from '../services/financialDataService';
import { detectAssetType } from '../utils/assetTypeDetector';

export const usePortfolio = () => {
  const { user, isDemoMode } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [dividendAnalysis, setDividendAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    if (user || isDemoMode) {
      loadPortfolioData();
    }
  }, [user, isDemoMode]);
  
  // Remove auto-refresh functionality - now using manual refresh only

  const loadPortfolioData = async () => {
    try {
      console.log('Loading portfolio data...');
      setLoading(true);
      setError(null);

      // If in demo mode, use mock data
      if (isDemoMode) {
        console.log('Loading demo data...');
        const { mockPortfolioData } = await import('../data/mockData');
        setHoldings(mockPortfolioData);
        setTransactions([]);
        
        // Calculate metrics for mock data
        const metrics = PortfolioCalculator.calculatePortfolioMetrics(mockPortfolioData);
        setPortfolioMetrics(metrics);
        setDividendAnalysis(null);
        
        setLastUpdated(new Date());
        setLoading(false);
        console.log('Demo data loaded successfully');
        return;
      }

      console.log('Loading real portfolio data from database...');
      // Load transactions and calculate holdings from them
      const transactionsData = await DatabaseService.getTransactions();

      console.log(`Loaded ${transactionsData.length} transactions`);
      
      // Calculate holdings from all transactions
      const calculatedHoldings = calculateHoldingsFromTransactions(transactionsData);
      console.log(`Calculated ${calculatedHoldings.length} holdings from transactions`);
      
      // Enrich with financial data
      const enrichedHoldings = await enrichHoldingsWithFinancialData(calculatedHoldings);
      console.log(`Enriched holdings with financial data`);
      
      // Update current prices for holdings
      const updatedHoldings = await updateHoldingPrices(enrichedHoldings);

      setHoldings(updatedHoldings);
      setTransactions(transactionsData);
      
      // Calculate portfolio metrics
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(updatedHoldings);
      setPortfolioMetrics(metrics);
      
      // Calculate dividend analysis
      const divAnalysis = DividendTracker.analyzeDividends(updatedHoldings, transactionsData);
      setDividendAnalysis(divAnalysis);
      
      setLastUpdated(new Date());
      console.log('Portfolio data loaded successfully');
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
      
      // Fallback to mock data if database fails
      console.log('Falling back to demo data due to error');
      const { mockPortfolioData } = await import('../data/mockData');
      setHoldings(mockPortfolioData);
      setTransactions([]);
      
      // Calculate metrics for mock data
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(mockPortfolioData);
      setPortfolioMetrics(metrics);
      setDividendAnalysis(null);
      
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const updateHoldingPrices = async (holdings: Holding[]): Promise<Holding[]> => {
    if (holdings.length === 0) return holdings;
    
    // Get unique tickers
    const tickers = [...new Set(holdings.map(h => h.ticker))];
    
    try {
      // Batch update prices
      const priceUpdates = await MarketDataService.batchUpdatePrices(tickers);
      const priceMap = new Map(priceUpdates.map(p => [p.symbol, p]));
      
      return holdings.map(holding => {
        const priceData = priceMap.get(holding.ticker);
        if (priceData) {
          // Update asset type with any available API data
          const detectedType = detectAssetType(
            holding.ticker, 
            priceData.name || holding.company,
            (priceData as any).isEtf, // If available from API
            (priceData as any).exchange // If available from API
          );
          
          return {
            ...holding,
            currentPrice: priceData.price,
            yearHigh: priceData.high || holding.yearHigh,
            yearLow: priceData.low || holding.yearLow,
            type: detectedType,
            company: priceData.name || holding.company, // Update company name if available
          };
        }
        return holding;
      });
    } catch (error) {
      console.warn('Batch price update failed, falling back to individual updates:', error);
      
      // Fallback to individual updates
      return await Promise.all(
        holdings.map(async (holding) => {
          try {
            const marketData = await MarketDataService.getQuote(holding.ticker);
            
            // Update asset type with any available API data
            const detectedType = detectAssetType(
              holding.ticker, 
              (marketData as any).name || holding.company,
              (marketData as any).isEtf,
              (marketData as any).exchange
            );
            
            return {
              ...holding,
              currentPrice: marketData.price,
              yearHigh: marketData.high || holding.yearHigh,
              yearLow: marketData.low || holding.yearLow,
              type: detectedType,
              company: (marketData as any).name || holding.company,
            };
          } catch (error) {
            console.warn(`Failed to update price for ${holding.ticker}:`, error);
            return holding;
          }
        })
      );
    }
  };

  const updateHoldingPricesOld = async (holdings: Holding[]): Promise<Holding[]> => {
    const updatedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const marketData = await MarketDataService.getQuote(holding.ticker);
          return {
            ...holding,
            currentPrice: marketData.price,
            yearHigh: marketData.high || holding.yearHigh,
            yearLow: marketData.low || holding.yearLow
          };
        } catch (error) {
          console.warn(`Failed to update price for ${holding.ticker}:`, error);
          return holding;
        }
      })
    );

    return updatedHoldings;
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      setError(null);
      const newTransaction = await DatabaseService.createTransaction(transaction);
      
      // Update transactions first
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      
      // Recalculate all holdings from all transactions
      const recalculatedHoldings = calculateHoldingsFromTransactions(updatedTransactions);
      const updatedHoldings = await updateHoldingPrices(recalculatedHoldings);
      setHoldings(updatedHoldings);
      
      // Recalculate all metrics
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(updatedHoldings);
      setPortfolioMetrics(metrics);
      
      const divAnalysis = DividendTracker.analyzeDividends(updatedHoldings, updatedTransactions);
      setDividendAnalysis(divAnalysis);
      
      setLastUpdated(new Date());
      
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      
      // Provide helpful guidance for database permission issues
      if (errorMessage.includes('Database permission issue') || errorMessage.includes('row-level security')) {
        setError('Database access restricted. Try using Demo Mode instead to explore the portfolio tracker features.');
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setError(null);
      const updatedTransaction = await DatabaseService.updateTransaction(id, updates);
      
      // Update transactions array
      const updatedTransactions = transactions.map(t => t.id === id ? updatedTransaction : t);
      setTransactions(updatedTransactions);
      
      // Recalculate all holdings from all transactions
      const recalculatedHoldings = calculateHoldingsFromTransactions(updatedTransactions);
      const updatedHoldings = await updateHoldingPrices(recalculatedHoldings);
      setHoldings(updatedHoldings);
      
      // Recalculate all metrics
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(updatedHoldings);
      setPortfolioMetrics(metrics);
      
      const divAnalysis = DividendTracker.analyzeDividends(updatedHoldings, updatedTransactions);
      setDividendAnalysis(divAnalysis);
      
      setLastUpdated(new Date());
      
      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      
      // Provide helpful guidance for database permission issues
      if (errorMessage.includes('Database permission issue') || errorMessage.includes('row-level security')) {
        setError('Database access restricted. Try using Demo Mode instead to explore the portfolio tracker features.');
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError(null);
      await DatabaseService.deleteTransaction(id);
      
      // Remove transaction from array
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      // Recalculate all holdings from remaining transactions
      const recalculatedHoldings = calculateHoldingsFromTransactions(updatedTransactions);
      const updatedHoldings = await updateHoldingPrices(recalculatedHoldings);
      setHoldings(updatedHoldings);
      
      // Recalculate all metrics
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(updatedHoldings);
      setPortfolioMetrics(metrics);
      
      const divAnalysis = DividendTracker.analyzeDividends(updatedHoldings, updatedTransactions);
      setDividendAnalysis(divAnalysis);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error deleting transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      
      // Provide helpful guidance for database permission issues
      if (errorMessage.includes('Database permission issue') || errorMessage.includes('row-level security')) {
        setError('Database access restricted. Try using Demo Mode instead to explore the portfolio tracker features.');
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  const updateHolding = async (id: string, updates: Partial<Holding>) => {
    try {
      setError(null);
      const updatedHolding = await DatabaseService.updateHolding(id, updates);
      setHoldings(prev => prev.map(h => h.id === id ? updatedHolding : h));
      setLastUpdated(new Date());
      return updatedHolding;
    } catch (err) {
      console.error('Error updating holding:', err);
      setError(err instanceof Error ? err.message : 'Failed to update holding');
      throw err;
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      setError(null);
      await DatabaseService.deleteHolding(id);
      setHoldings(prev => prev.filter(h => h.id !== id));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error deleting holding:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete holding');
      throw err;
    }
  };

  const refreshData = async () => {
    try {
      setError(null);
      console.log('🔄 Refreshing all portfolio data...');
      
      // Update prices for all holdings
      const updatedHoldings = await updateHoldingPrices(holdings);
      
      // Re-enrich with latest financial data if not in demo mode
      let finalHoldings = updatedHoldings;
      if (!isDemoMode && updatedHoldings.length > 0) {
        console.log('📊 Refreshing financial ratios and company data...');
        finalHoldings = await enrichHoldingsWithFinancialData(updatedHoldings);
      }
      
      setHoldings(finalHoldings);
      
      // Recalculate all metrics with updated data
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(finalHoldings);
      setPortfolioMetrics(metrics);
      
      // Recalculate dividend analysis
      const divAnalysis = DividendTracker.analyzeDividends(finalHoldings, transactions);
      setDividendAnalysis(divAnalysis);
      
      setLastUpdated(new Date());
      console.log('✅ Portfolio data refresh completed');
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  };
  
  const updateHoldingsFromTransaction = async (transaction: Transaction) => {
    try {
      // Process transaction and update holdings
      const updatedHoldings = await processTransactionUpdate(holdings, transaction);
      setHoldings(updatedHoldings);
      
      // Recalculate metrics
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(updatedHoldings);
      setPortfolioMetrics(metrics);
      
      const divAnalysis = DividendTracker.analyzeDividends(updatedHoldings, [...transactions, transaction]);
      setDividendAnalysis(divAnalysis);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error updating holdings from transaction:', err);
      // Fallback to full reload
      await loadPortfolioData();
    }
  };
  
  const processTransactionUpdate = async (currentHoldings: Holding[], transaction: Transaction): Promise<Holding[]> => {
    const existingHoldingIndex = currentHoldings.findIndex(h => h.ticker === transaction.ticker);
    
    if (transaction.type === 'buy') {
      if (existingHoldingIndex >= 0) {
        // Update existing holding
        const holding = currentHoldings[existingHoldingIndex];
        const newShares = holding.shares + (transaction.shares || 0);
        const newTotalCost = (holding.shares * holding.costBasis) + (transaction.amount || 0);
        const newCostBasis = newShares > 0 ? newTotalCost / newShares : holding.costBasis;
        
        const updatedHoldings = [...currentHoldings];
        updatedHoldings[existingHoldingIndex] = {
          ...holding,
          shares: newShares,
          costBasis: newCostBasis
        };
        return updatedHoldings;
      } else {
        // Create new holding (would need to fetch company data)
        return currentHoldings; // For now, trigger full reload
      }
    } else if (transaction.type === 'sell') {
      if (existingHoldingIndex >= 0) {
        const holding = currentHoldings[existingHoldingIndex];
        const newShares = Math.max(0, holding.shares - (transaction.shares || 0));
        
        const updatedHoldings = [...currentHoldings];
        if (newShares === 0) {
          // Remove holding if all shares sold
          updatedHoldings.splice(existingHoldingIndex, 1);
        } else {
          updatedHoldings[existingHoldingIndex] = {
            ...holding,
            shares: newShares
          };
        }
        return updatedHoldings;
      }
    }
    
    return currentHoldings;
  };
  
  // Removed toggleAutoRefresh - no longer needed
  
  const savePortfolioSnapshot = async () => {
    try {
      await DatabaseService.savePortfolioSnapshot(holdings);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error saving portfolio snapshot:', err);
      setError(err instanceof Error ? err.message : 'Failed to save portfolio snapshot');
    }
  };

  // Enrich holdings with financial data
  const enrichHoldingsWithFinancialData = async (holdings: Holding[]): Promise<Holding[]> => {
    const enrichedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        try {
          console.log(`Fetching financial data for ${holding.ticker}...`);
          const financialData = await FinancialDataService.getCompanyFinancials(holding.ticker);
          
          if (financialData) {
            return {
              ...holding,
              company: financialData.name || holding.company,
              sector: financialData.sector || holding.sector,
              pe: financialData.pe,
              pb: financialData.pb,
              peg: financialData.peg,
              debtToEquity: financialData.debtToEquity,
              currentRatio: financialData.currentRatio,
              quickRatio: financialData.quickRatio,
              roe: financialData.roe,
              roa: financialData.roa,
              grossMargin: financialData.grossMargin,
              netMargin: financialData.netMargin,
              operatingMargin: financialData.operatingMargin,
              assetTurnover: financialData.assetTurnover,
              revenueGrowth: financialData.revenueGrowth,
              yearHigh: financialData.yearHigh || holding.yearHigh,
              yearLow: financialData.yearLow || holding.yearLow,
              dividend: financialData.dividend || holding.dividend,
              dividendYield: financialData.dividendYield || holding.dividendYield,
              fcf1yr: financialData.fcf1yr,
              fcf2yr: financialData.fcf2yr,
              fcf3yr: financialData.fcf3yr,
              fcf10yr: financialData.fcf10yr,
              evFcf: financialData.evFcf,
              sectorMedianEvFcf: financialData.sectorMedianEvFcf,
              intrinsicValue: financialData.intrinsicValue || holding.intrinsicValue,
              description: financialData.description, // FMP API description
              narrative: financialData.description?.includes('temporarily unavailable') 
                ? `Estimated financial data (API temporarily unavailable)`
                : `Financial data from Financial Modeling Prep`
            };
          }
          
          return holding; // Return original if no financial data
        } catch (error) {
          console.warn(`Failed to fetch financial data for ${holding.ticker}:`, error);
          return holding; // Return original on error
        }
      })
    );
    
    return enrichedHoldings;
  };

  // Calculate holdings from all transactions
  const calculateHoldingsFromTransactions = (transactions: Transaction[]): Holding[] => {
    // Use ticker-accountType combination as key to support same ticker in multiple accounts
    const holdingsMap = new Map<string, Holding>();

    // Sort transactions by date to ensure proper chronological processing
    const sortedTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTransactions.forEach(transaction => {
      const ticker = transaction.ticker;
      const accountType = transaction.accountType || 'taxable';
      const holdingKey = `${ticker}-${accountType}`;
      const existing = holdingsMap.get(holdingKey);

      if (transaction.type === 'buy') {
        if (existing) {
          // Update existing holding with proper cost basis calculation
          const existingTotalCost = existing.shares * existing.costBasis;
          const transactionCost = (transaction.shares || 0) * (transaction.price || 0);
          const newShares = existing.shares + (transaction.shares || 0);
          const newTotalCost = existingTotalCost + transactionCost;
          const newCostBasis = newShares > 0 ? newTotalCost / newShares : existing.costBasis;

          holdingsMap.set(holdingKey, {
            ...existing,
            shares: newShares,
            costBasis: newCostBasis,
            accountType: accountType
          });
        } else {
          // Create new holding with all required fields
          holdingsMap.set(holdingKey, {
            id: `holding-${ticker}-${accountType}`,
            ticker: ticker,
            company: ticker,
            shares: transaction.shares || 0,
            costBasis: transaction.price || 0,
            currentPrice: transaction.price || 0,
            type: detectAssetType(ticker) as any,
            sector: 'Financial Services', // Default sector that won't show as "Unknown"
            accountType: accountType, // Use transaction's account type
            // Price Data
            yearHigh: transaction.price || 0,
            yearLow: transaction.price || 0,
            // Cash Flow Data
            fcf1yr: 0,
            fcf2yr: 0,
            fcf3yr: 0,
            fcf10yr: 0,
            // Valuation Metrics
            evFcf: 0,
            sectorMedianEvFcf: 0,
            intrinsicValue: transaction.price || 0,
            pe: 0,
            pb: 0,
            peg: 0,
            // Financial Health
            debtToEquity: 0,
            currentRatio: 0,
            quickRatio: 0,
            // Profitability
            roe: 0,
            roa: 0,
            grossMargin: 0,
            netMargin: 0,
            operatingMargin: 0,
            // Efficiency
            assetTurnover: 0,
            revenueGrowth: 0,
            // Additional Info
            narrative: `Calculated from transactions`,
            dividend: 0,
            dividendYield: 0
          });
        }
      } else if (transaction.type === 'sell' && existing) {
        // Reduce shares for sell transactions using FIFO (First In, First Out)
        const sharesBeingSold = transaction.shares || 0;
        const newShares = Math.max(0, existing.shares - sharesBeingSold);
        
        if (newShares > 0) {
          // Keep the same cost basis per share for remaining shares
          holdingsMap.set(holdingKey, {
            ...existing,
            shares: newShares,
            accountType: accountType
          });
        } else {
          // Position completely sold out
          holdingsMap.delete(holdingKey);
        }
      } else if (transaction.type === 'dividend' && existing) {
        // Dividend transactions don't affect share count, but we could track them
        // For now, dividends don't change the holding itself
        // (dividend tracking is handled separately)
      } else if (transaction.type === 'split' && existing) {
        // Handle stock splits
        const splitRatio = transaction.price || 1; // Use price field for split ratio
        const newShares = existing.shares * splitRatio;
        const newCostBasis = existing.costBasis / splitRatio;
        
        holdingsMap.set(holdingKey, {
          ...existing,
          shares: newShares,
          costBasis: newCostBasis,
          accountType: accountType
        });
      } else if (transaction.type === 'transfer' && existing) {
        // Handle transfers between accounts
        // Note: This requires more complex logic if transferring between different account types
        // For now, treat as neutral (no change to shares in current account)
      }
    });

    // Return all holdings with shares > 0
    return Array.from(holdingsMap.values()).filter(holding => holding.shares > 0);
  };

  return {
    holdings,
    transactions,
    portfolioMetrics,
    dividendAnalysis,
    loading,
    error,
    lastUpdated,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateHolding,
    deleteHolding,
    refreshData,
    savePortfolioSnapshot,
    reload: loadPortfolioData
  };
};