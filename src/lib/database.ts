import { supabase } from './supabase';
import { Holding, Transaction } from '../types/portfolio';

export interface DatabaseHolding {
  id: string;
  user_id: string;
  account_id: string;
  company_id: string;
  shares: number;
  average_cost_basis: number;
  current_price?: number;
  current_value?: number;
  total_cost?: number;
  unrealized_gain_loss?: number;
  unrealized_gain_loss_percent?: number;
  first_purchase_date?: string;
  last_transaction_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTransaction {
  id: string;
  user_id: string;
  account_id: string;
  company_id: string;
  transaction_type: string;
  transaction_date: string;
  shares?: number;
  price_per_share?: number;
  total_amount: number;
  fees?: number;
  split_ratio?: string;
  new_company_id?: string;
  notes?: string;
  external_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCompany {
  id: string;
  ticker: string;
  company_name: string;
  sector: string;
  industry?: string;
  asset_type: string;
  exchange?: string;
  currency: string;
  market_cap?: number;
  shares_outstanding?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  peg_ratio?: number;
  ev_fcf?: number;
  sector_median_ev_fcf?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  quick_ratio?: number;
  roe?: number;
  roa?: number;
  gross_margin?: number;
  net_margin?: number;
  operating_margin?: number;
  asset_turnover?: number;
  revenue_growth?: number;
  fcf_1yr?: number;
  fcf_2yr?: number;
  fcf_3yr?: number;
  fcf_10yr?: number;
  dividend_per_share?: number;
  dividend_yield?: number;
  dividend_frequency?: string;
  ex_dividend_date?: string;
  intrinsic_value?: number;
  analyst_target_price?: number;
  description?: string;
  website?: string;
  employees?: number;
  founded_year?: number;
  created_at: string;
  updated_at: string;
}

export class DatabaseService {
  // Database permission tracking - start with false for production safety
  private static databaseAccessAllowed = false;
  private static databaseChecked = false;
  
  // Test database permissions before attempting operations
  private static async checkDatabasePermissions(): Promise<boolean> {
    if (this.databaseChecked) {
      return this.databaseAccessAllowed;
    }
    
    try {
      // Test with a simple read operation first
      const { error } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
        
      if (error && (error.code === '42501' || error.code === '403' || error.code === 406)) {
        console.warn('🔒 Database access restricted - transactions will use demo mode');
        this.databaseAccessAllowed = false;
      } else {
        console.log('✅ Database access confirmed for transactions');
        this.databaseAccessAllowed = true;
      }
    } catch (error) {
      console.warn('🔒 Database connectivity issue - transactions will use demo mode:', error);
      this.databaseAccessAllowed = false;
    }
    
    this.databaseChecked = true;
    return this.databaseAccessAllowed;
  }
  
  // User Profile Management
  static async ensureUserProfile(user: any) {
    try {
      console.log('Creating/verifying user profile for:', user.email);
      
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!checkError && existingUser) {
        console.log('User profile already exists');
        return existingUser;
      }
      
      console.log('Creating new user profile...');
      // User doesn't exist, create profile
      const { data: profile, error } = await supabase
        .from('users') 
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        // If error is duplicate key, try to get existing user
        if (error.code === '23505') {
          console.log('User already exists, fetching existing profile...');
          const { data: existingProfile, error: getError } = await supabase
          .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (getError) {
            console.error('Error getting existing user profile:', getError);
            throw new Error(`Failed to get existing user profile: ${getError.message}`);
          }
          
          return existingProfile;
        }
        
        console.error('Error creating user profile:', error);
        throw new Error(`Failed to create user profile: ${error.message}`);
      }
      
      console.log('User profile created successfully');
      return profile;
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      throw error;
    }
  }

  static async ensureUserProfileLegacy(user: any) {
    const { data: existingProfile, error: getError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (getError && getError.code === 'PGRST116') {
      // User doesn't exist, create profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
      }
    }
  }

  // Database schema verification
  static async verifyDatabaseSchema(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Verifying database schema...');
      
      const requiredTables = [
        'users', 'account_types', 'transaction_types', 'companies', 
        'accounts', 'holdings', 'transactions', 'portfolio_snapshots'
      ];
      
      const tableStatus = [];
      
      for (const table of requiredTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            tableStatus.push({ table, status: 'error', error: error.message });
          } else {
            tableStatus.push({ table, status: 'ok', recordCount: data?.length || 0 });
          }
        } catch (err) {
          tableStatus.push({ table, status: 'missing', error: err });
        }
      }
      
      const failedTables = tableStatus.filter(t => t.status !== 'ok');
      
      if (failedTables.length > 0) {
        console.error('❌ Database schema verification failed:', failedTables);
        return {
          success: false,
          message: `${failedTables.length} tables have issues`,
          details: { tableStatus, failedTables }
        };
      }
      
      console.log('✅ Database schema verification successful');
      console.log('📊 Table status:', tableStatus);
      
      return {
        success: true,
        message: 'All required tables are accessible',
        details: { tableStatus }
      };
      
    } catch (error) {
      console.error('❌ Schema verification error:', error);
      return {
        success: false,
        message: 'Schema verification failed',
        details: { error }
      };
    }
  }

  // User Management
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Holdings Management
  static async getHoldings(): Promise<Holding[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('holdings')
      .select(`
        *,
        companies!holdings_company_id_fkey (
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
          intrinsic_value
        ),
        accounts!holdings_account_id_fkey (
          account_type,
          account_name
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    return data.map(this.mapDatabaseHoldingToHolding);
  }

  static async createHolding(holding: Omit<Holding, 'id'>): Promise<Holding> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // First, ensure the company exists
    const company = await this.ensureCompanyExists(holding);
    
    // Get or create account
    const account = await this.ensureAccountExists(holding.accountType, user.id);

    const { data, error } = await supabase
      .from('holdings')
      .insert({
        user_id: user.id,
        account_id: account.id,
        company_id: company.id,
        shares: holding.shares,
        average_cost_basis: holding.costBasis,
        current_price: holding.currentPrice,
        current_value: holding.shares * holding.currentPrice,
        total_cost: holding.shares * holding.costBasis,
        unrealized_gain_loss: (holding.shares * holding.currentPrice) - (holding.shares * holding.costBasis),
        unrealized_gain_loss_percent: ((holding.shares * holding.currentPrice) - (holding.shares * holding.costBasis)) / (holding.shares * holding.costBasis) * 100,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapDatabaseHoldingToHolding(data);
  }

  static async updateHolding(id: string, updates: Partial<Holding>): Promise<Holding> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('holdings')
      .update({
        shares: updates.shares,
        average_cost_basis: updates.costBasis,
        current_price: updates.currentPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return this.mapDatabaseHoldingToHolding(data);
  }

  static async deleteHolding(id: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('holdings')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Transactions Management
  static async getTransactions(): Promise<Transaction[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        companies!transactions_company_id_fkey (ticker, company_name)
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    return data.map(this.mapDatabaseTransactionToTransaction);
  }

  static async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    // Check database permissions first
    const hasAccess = await this.checkDatabasePermissions();
    if (!hasAccess) {
      throw new Error('Database access restricted. Please use Demo Mode to explore the portfolio tracker features.');
    }
    
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Ensure company exists
    const company = await this.getOrCreateCompany(transaction.ticker);
    
    // Get or create default account
    const account = await this.ensureAccountExists('taxable', user.id);

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: account.id,
        company_id: company.id,
        transaction_type: transaction.type,
        transaction_date: transaction.date,
        shares: transaction.shares,
        price_per_share: transaction.price,
        total_amount: transaction.amount,
        fees: transaction.fees,
        split_ratio: transaction.splitRatio,
        new_company_id: transaction.newTicker ? (await this.getOrCreateCompany(transaction.newTicker)).id : null,
        notes: transaction.notes
      })
      .select(`
        *,
        companies!transactions_company_id_fkey (ticker, company_name)
      `)
      .single();

    if (error) {
      // If RLS policy blocks transaction insert, provide helpful error message
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        console.error('❌ Database permission issue: Cannot create transactions due to row-level security policy');
        throw new Error('Database permission issue: Cannot create transactions. Please check your authentication or use demo mode.');
      }
      throw error;
    }

    return this.mapDatabaseTransactionToTransaction(data);
  }

  // Helper Methods
  static async savePortfolioSnapshot(holdings: Holding[]): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let totalValue = 0;
    let totalCost = 0;
    let totalDividendIncome = 0;

    holdings.forEach(holding => {
      const currentValue = holding.shares * holding.currentPrice;
      const cost = holding.shares * holding.costBasis;
      const dividendIncome = holding.dividend ? holding.shares * holding.dividend : 0;
      
      totalValue += currentValue;
      totalCost += cost;
      totalDividendIncome += dividendIncome;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const dividendYield = totalValue > 0 ? (totalDividendIncome / totalValue) * 100 : 0;

    const { error } = await supabase
      .from('portfolio_snapshots')
      .upsert({
        user_id: user.id,
        snapshot_date: new Date().toISOString().split('T')[0],
        total_value: totalValue,
        total_cost: totalCost,
        total_gain_loss: totalGainLoss,
        total_gain_loss_percent: totalGainLossPercent,
        annual_dividend_income: totalDividendIncome,
        monthly_dividend_average: totalDividendIncome / 12,
        dividend_yield: dividendYield
      }, {
        onConflict: 'user_id,snapshot_date'
      });

    if (error) throw error;
  }

  static async getPortfolioHistory(days: number = 30): Promise<any[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('snapshot_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private static async ensureCompanyExists(holding: Omit<Holding, 'id'>): Promise<DatabaseCompany> {
    return await this.getOrCreateCompany(holding.ticker, {
      company_name: holding.company,
      sector: holding.sector,
      asset_type: holding.type,
      pe_ratio: holding.pe,
      pb_ratio: holding.pb,
      peg_ratio: holding.peg,
      ev_fcf: holding.evFcf,
      sector_median_ev_fcf: holding.sectorMedianEvFcf,
      debt_to_equity: holding.debtToEquity,
      current_ratio: holding.currentRatio,
      quick_ratio: holding.quickRatio,
      roe: holding.roe,
      roa: holding.roa,
      gross_margin: holding.grossMargin,
      net_margin: holding.netMargin,
      operating_margin: holding.operatingMargin,
      asset_turnover: holding.assetTurnover,
      revenue_growth: holding.revenueGrowth,
      fcf_1yr: holding.fcf1yr,
      fcf_2yr: holding.fcf2yr,
      fcf_3yr: holding.fcf3yr,
      fcf_10yr: holding.fcf10yr,
      dividend_per_share: holding.dividend,
      dividend_yield: holding.dividendYield,
      intrinsic_value: holding.intrinsicValue
    });
  }

  private static async getOrCreateCompany(ticker: string, companyData?: Partial<DatabaseCompany>): Promise<DatabaseCompany> {
    // Check database permissions before attempting any operations
    const hasAccess = await this.checkDatabasePermissions();
    if (!hasAccess) {
      // Return fallback company immediately if database access is restricted
      console.warn(`⚠️ Database permission issue for ${ticker}, using fallback company data`);
      return {
        id: `fallback-${ticker.toUpperCase()}`,
        ticker: ticker.toUpperCase(),
        company_name: companyData?.company_name || ticker,
        sector: companyData?.sector || 'Unknown',
        industry: companyData?.industry || 'Unknown',
        asset_type: companyData?.asset_type || 'stocks',
        exchange: companyData?.exchange || 'Unknown',
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as DatabaseCompany;
    }
    
    // First try to get existing company
    const { data: existing, error: getError } = await supabase
      .from('companies')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .single();

    if (!getError && existing) {
      return existing;
    }

    // Create new company
    const { data, error } = await supabase
      .from('companies')
      .insert({
        ticker: ticker.toUpperCase(),
        company_name: companyData?.company_name || ticker,
        sector: companyData?.sector || 'Unknown',
        asset_type: companyData?.asset_type || 'stocks',
        currency: 'USD',
        ...companyData
      })
      .select()
      .single();

    if (error) {
      // If RLS policy blocks insert, return a fallback company object
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        console.warn(`⚠️ Database permission issue for ${ticker}, using fallback company data`);
        return {
          id: `fallback-${ticker.toUpperCase()}`,
          ticker: ticker.toUpperCase(),
          company_name: companyData?.company_name || ticker,
          sector: companyData?.sector || 'Unknown',
          industry: companyData?.industry || 'Unknown',
          asset_type: companyData?.asset_type || 'stocks',
          exchange: companyData?.exchange || 'Unknown',
          currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as DatabaseCompany;
      }
      throw error;
    }
    return data;
  }

  private static async ensureAccountExists(accountType: string, userId: string): Promise<any> {
    try {
      console.log('Ensuring account exists:', accountType);
      
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

      if (error) {
        console.error('Error ensuring account exists:', error);
        throw new Error(`Failed to ensure account exists: ${error.message}`);
      }
      
      return account;
    } catch (error) {
      console.error('Error in ensureAccountExists:', error);
      throw error;
    }
  }

  private static async getUserAccounts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  // Mapping Functions
  private static mapDatabaseHoldingToHolding(dbHolding: any): Holding {
    const company = dbHolding.companies;
    const account = dbHolding.accounts;
    
    return {
      id: dbHolding.id,
      company: company.company_name,
      ticker: company.ticker,
      type: company.asset_type,
      accountType: account.account_type,
      shares: dbHolding.shares,
      costBasis: dbHolding.average_cost_basis,
      currentPrice: dbHolding.current_price || 0,
      yearHigh: 0, // Will be populated from market data
      yearLow: 0, // Will be populated from market data
      fcf1yr: company.fcf_1yr || 0,
      fcf2yr: company.fcf_2yr || 0,
      fcf3yr: company.fcf_3yr || 0,
      fcf10yr: company.fcf_10yr || 0,
      evFcf: company.ev_fcf || 0,
      sectorMedianEvFcf: company.sector_median_ev_fcf || 0,
      intrinsicValue: company.intrinsic_value || 0,
      pe: company.pe_ratio || 0,
      pb: company.pb_ratio || 0,
      peg: company.peg_ratio || 0,
      debtToEquity: company.debt_to_equity || 0,
      currentRatio: company.current_ratio || 0,
      quickRatio: company.quick_ratio || 0,
      roe: company.roe || 0,
      roa: company.roa || 0,
      grossMargin: company.gross_margin || 0,
      netMargin: company.net_margin || 0,
      operatingMargin: company.operating_margin || 0,
      assetTurnover: company.asset_turnover || 0,
      revenueGrowth: company.revenue_growth || 0,
      narrative: company.description || '',
      sector: company.sector,
      dividend: company.dividend_per_share,
      dividendYield: company.dividend_yield
    };
  }

  private static mapDatabaseTransactionToTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      ticker: dbTransaction.companies.ticker,
      type: dbTransaction.transaction_type,
      date: dbTransaction.transaction_date,
      shares: dbTransaction.shares,
      price: dbTransaction.price_per_share,
      amount: dbTransaction.total_amount,
      fees: dbTransaction.fees,
      notes: dbTransaction.notes,
      splitRatio: dbTransaction.split_ratio,
      newTicker: dbTransaction.new_company_id ? 'NEW' : undefined // Would need to lookup actual ticker
    };
  }
}