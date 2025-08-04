import { supabase } from './supabase';
import { Holding, Transaction } from '../types/portfolio';
import { isDatabaseEnabled } from '../config/database';

/**
 * Optimized Database Service
 * 
 * Key optimizations:
 * 1. Single query for complete portfolio data (instead of separate queries)
 * 2. Efficient joins with proper indexing
 * 3. Batch operations for multiple records
 * 4. Reduced round-trip database calls
 * 5. Smart caching of common queries
 */
export class OptimizedDatabaseService {
  private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for database queries

  /**
   * Single optimized query to get complete user portfolio
   * Replaces multiple separate queries with one efficient join
   */
  static async getCompleteUserPortfolio(userId: string): Promise<{
    transactions: Transaction[];
    companies: Map<string, any>;
    accounts: Map<string, any>;
  }> {
    const cacheKey = `portfolio_${userId}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log('📊 Using cached portfolio data');
      return cached.data;
    }

    console.log('🔍 Fetching complete portfolio with single optimized query...');
    
    try {
      // Single query with all necessary joins
      const { data: portfolioData, error } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_type,
          transaction_date,
          shares,
          price_per_share,
          total_amount,
          fees,
          split_ratio,
          notes,
          companies!transactions_company_id_fkey (
            id,
            ticker,
            company_name,
            sector,
            industry,
            asset_type,
            pe_ratio,
            pb_ratio,
            peg_ratio,
            ev_fcf,
            sector_median_ev_fcf,
            debt_to_equity,
            current_ratio,
            quick_ratio,
            roe,
            roa,
            gross_margin,
            net_margin,
            operating_margin,
            asset_turnover,
            revenue_growth,
            fcf_1yr,
            fcf_2yr,
            fcf_3yr,
            fcf_10yr,
            dividend_per_share,
            dividend_yield,
            intrinsic_value,
            description
          ),
          accounts!transactions_account_id_fkey (
            id,
            account_type,
            account_name
          )
        `)
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      // Process results efficiently
      const transactions: Transaction[] = [];
      const companiesMap = new Map<string, any>();
      const accountsMap = new Map<string, any>();

      portfolioData.forEach((row: any) => {
        // Build transaction
        const transaction: Transaction = {
          id: row.id,
          ticker: row.companies.ticker,
          type: row.transaction_type,
          accountType: row.accounts?.account_type || 'taxable',
          date: row.transaction_date,
          shares: row.shares,
          price: row.price_per_share,
          amount: row.total_amount,
          fees: row.fees,
          notes: row.notes,
          splitRatio: row.split_ratio
        };
        transactions.push(transaction);

        // Cache company data (avoid duplicates)
        if (row.companies && !companiesMap.has(row.companies.ticker)) {
          companiesMap.set(row.companies.ticker, row.companies);
        }

        // Cache account data (avoid duplicates)
        if (row.accounts && !accountsMap.has(row.accounts.id)) {
          accountsMap.set(row.accounts.id, row.accounts);
        }
      });

      const result = {
        transactions,
        companies: companiesMap,
        accounts: accountsMap
      };

      // Cache the results
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });

      console.log(`✅ Portfolio loaded: ${transactions.length} transactions, ${companiesMap.size} companies`);
      return result;

    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
      throw error;
    }
  }

  /**
   * Batch create multiple transactions efficiently
   * Reduces database round-trips for bulk operations
   */
  static async batchCreateTransactions(
    userId: string,
    transactions: Omit<Transaction, 'id'>[]
  ): Promise<Transaction[]> {
    if (!isDatabaseEnabled()) {
      throw new Error('Database operations are disabled');
    }

    console.log(`🔄 Batch creating ${transactions.length} transactions...`);

    try {
      // Prepare batch insert data
      const insertData = await Promise.all(
        transactions.map(async (transaction) => {
          // Get or create company and account efficiently
          const [company, account] = await Promise.all([
            this.getOrCreateCompanyOptimized(transaction.ticker),
            this.getOrCreateAccountOptimized(transaction.accountType || 'taxable', userId)
          ]);

          return {
            user_id: userId,
            company_id: company.id,
            account_id: account.id,
            transaction_type: transaction.type,
            transaction_date: transaction.date,
            shares: transaction.shares,
            price_per_share: transaction.price,
            total_amount: transaction.amount,
            fees: transaction.fees,
            split_ratio: transaction.splitRatio,
            notes: transaction.notes
          };
        })
      );

      // Single batch insert
      const { data, error } = await supabase
        .from('transactions')
        .insert(insertData)
        .select(`
          *,
          companies!transactions_company_id_fkey (ticker, company_name),
          accounts!transactions_account_id_fkey (account_type)
        `);

      if (error) throw error;

      // Clear cache since data has changed
      this.clearUserCache(userId);

      const createdTransactions = data.map(this.mapDatabaseTransactionToTransaction);
      console.log(`✅ Batch created ${createdTransactions.length} transactions`);
      
      return createdTransactions;

    } catch (error) {
      console.error('❌ Batch transaction creation failed:', error);
      throw error;
    }
  }

  /**
   * Optimized company lookup with caching
   */
  private static async getOrCreateCompanyOptimized(ticker: string): Promise<any> {
    const cacheKey = `company_${ticker.toUpperCase()}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl * 2) { // Longer cache for companies
      return cached.data;
    }

    try {
      // Try to get existing company first
      const { data: existing, error: getError } = await supabase
        .from('companies')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .single();

      if (!getError && existing) {
        this.queryCache.set(cacheKey, {
          data: existing,
          timestamp: Date.now(),
          ttl: this.CACHE_TTL * 2
        });
        return existing;
      }

      // Create new company if not exists
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert({
          ticker: ticker.toUpperCase(),
          company_name: ticker.toUpperCase(),
          sector: 'Unknown',
          asset_type: 'stocks',
          currency: 'USD'
        })
        .select()
        .single();

      if (createError) throw createError;

      this.queryCache.set(cacheKey, {
        data: newCompany,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL * 2
      });

      return newCompany;

    } catch (error) {
      console.error(`❌ Error with company ${ticker}:`, error);
      // Return fallback company
      return {
        id: this.generateFallbackUUID(ticker),
        ticker: ticker.toUpperCase(),
        company_name: ticker.toUpperCase(),
        sector: 'Unknown',
        asset_type: 'stocks',
        currency: 'USD'
      };
    }
  }

  /**
   * Optimized account lookup with caching
   */
  private static async getOrCreateAccountOptimized(accountType: string, userId: string): Promise<any> {
    const cacheKey = `account_${userId}_${accountType}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const { data: account, error } = await supabase
        .from('accounts')
        .upsert({
          user_id: userId,
          account_type: accountType,
          account_name: `${accountType.replace('_', ' ').toUpperCase()} Account`,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,account_name'
        })
        .select()
        .single();

      if (error) throw error;

      this.queryCache.set(cacheKey, {
        data: account,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });

      return account;

    } catch (error) {
      console.error('❌ Error with account:', error);
      throw error;
    }
  }

  /**
   * Batch update transactions efficiently
   */
  static async batchUpdateTransactions(
    updates: Array<{ id: string; updates: Partial<Transaction> }>
  ): Promise<Transaction[]> {
    console.log(`🔄 Batch updating ${updates.length} transactions...`);

    try {
      const results = await Promise.all(
        updates.map(async ({ id, updates: transactionUpdates }) => {
          const updateData: any = {
            updated_at: new Date().toISOString()
          };

          // Map transaction fields to database fields
          if (transactionUpdates.type) updateData.transaction_type = transactionUpdates.type;
          if (transactionUpdates.date) updateData.transaction_date = transactionUpdates.date;
          if (transactionUpdates.shares !== undefined) updateData.shares = transactionUpdates.shares;
          if (transactionUpdates.price !== undefined) updateData.price_per_share = transactionUpdates.price;
          if (transactionUpdates.amount !== undefined) updateData.total_amount = transactionUpdates.amount;
          if (transactionUpdates.fees !== undefined) updateData.fees = transactionUpdates.fees;
          if (transactionUpdates.notes !== undefined) updateData.notes = transactionUpdates.notes;

          const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .select(`
              *,
              companies!transactions_company_id_fkey (ticker, company_name),
              accounts!transactions_account_id_fkey (account_type)
            `)
            .single();

          if (error) throw error;
          return this.mapDatabaseTransactionToTransaction(data);
        })
      );

      console.log(`✅ Batch updated ${results.length} transactions`);
      return results;

    } catch (error) {
      console.error('❌ Batch update failed:', error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific user
   */
  private static clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.queryCache.keys())
      .filter(key => key.includes(userId));
    
    keysToDelete.forEach(key => this.queryCache.delete(key));
    console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for user`);
  }

  /**
   * Clear all expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.queryCache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`🗑️ Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Get current user efficiently
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Helper methods
  private static generateFallbackUUID(ticker: string): string {
    const hash = this.simpleHash(ticker.toUpperCase());
    return [
      hash.substr(0, 8),
      hash.substr(8, 4),
      '4' + hash.substr(12, 3),
      (parseInt(hash.substr(15, 1), 16) & 3 | 8).toString(16) + hash.substr(16, 3),
      hash.substr(19, 12)
    ].join('-');
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padEnd(32, '0').substr(0, 32);
  }

  private static mapDatabaseTransactionToTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      ticker: dbTransaction.companies.ticker,
      type: dbTransaction.transaction_type,
      accountType: dbTransaction.accounts?.account_type || 'taxable',
      date: dbTransaction.transaction_date,
      shares: dbTransaction.shares,
      price: dbTransaction.price_per_share,
      amount: dbTransaction.total_amount,
      fees: dbTransaction.fees,
      notes: dbTransaction.notes,
      splitRatio: dbTransaction.split_ratio
    };
  }
}