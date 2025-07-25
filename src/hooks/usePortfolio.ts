import { useState, useEffect } from 'react';
import { Holding, Transaction } from '../types/portfolio';
import { DatabaseService } from '../lib/database';
import { MarketDataService } from '../services/marketDataService';
import { PortfolioCalculator } from '../utils/portfolioCalculations';
import { DividendTracker } from '../utils/dividendTracker';
import { useAuth } from './useAuthSimple';

export const usePortfolio = () => {
  const { user, isDemoMode } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [dividendAnalysis, setDividendAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Load initial data
  useEffect(() => {
    if (user || isDemoMode) {
      loadPortfolioData();
    }
  }, [user, isDemoMode]);
  
  // Auto-refresh prices every 5 minutes
  useEffect(() => {
    if (!autoRefreshEnabled || holdings.length === 0) return;
    
    const interval = setInterval(() => {
      refreshPrices();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [holdings, autoRefreshEnabled]);

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
      // Load holdings and transactions in parallel
      const [holdingsData, transactionsData] = await Promise.all([
        DatabaseService.getHoldings(),
        DatabaseService.getTransactions()
      ]);

      console.log(`Loaded ${holdingsData.length} holdings and ${transactionsData.length} transactions`);
      
      // Update current prices for holdings
      const updatedHoldings = await updateHoldingPrices(holdingsData);

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
          return {
            ...holding,
            currentPrice: priceData.price,
            yearHigh: priceData.high || holding.yearHigh,
            yearLow: priceData.low || holding.yearLow
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
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Reload holdings to reflect the transaction
      await loadPortfolioData();
      
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
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

  const refreshPrices = async () => {
    try {
      setError(null);
      const updatedHoldings = await updateHoldingPrices(holdings);
      setHoldings(updatedHoldings);
      
      // Recalculate metrics with updated prices
      const metrics = PortfolioCalculator.calculatePortfolioMetrics(updatedHoldings);
      setPortfolioMetrics(metrics);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh prices');
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
  
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };
  
  const savePortfolioSnapshot = async () => {
    try {
      await DatabaseService.savePortfolioSnapshot(holdings);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error saving portfolio snapshot:', err);
      setError(err instanceof Error ? err.message : 'Failed to save portfolio snapshot');
    }
  };

  return {
    holdings,
    transactions,
    portfolioMetrics,
    dividendAnalysis,
    loading,
    error,
    lastUpdated,
    autoRefreshEnabled,
    addTransaction,
    updateHolding,
    deleteHolding,
    refreshPrices,
    toggleAutoRefresh,
    savePortfolioSnapshot,
    reload: loadPortfolioData
  };
};