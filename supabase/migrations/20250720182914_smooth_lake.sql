/*
  # Portfolio Tracker Database Schema

  1. New Tables
    - `users` - User authentication and profile information
    - `accounts` - Investment account types (401k, IRA, taxable, etc.)
    - `holdings` - Individual stock/ETF/bond positions
    - `transactions` - All buy/sell/dividend transactions
    - `companies` - Company fundamental data and metrics
    - `market_data` - Historical price and market data
    - `dividends` - Dividend payment records
    - `benchmarks` - Market benchmark data for performance comparison

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Separate policies for read/write operations

  3. Key Features
    - Comprehensive foreign key relationships
    - Proper indexing for performance
    - Audit fields (created_at, updated_at)
    - Flexible account type system
    - Complete transaction tracking
    - Historical data support
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Account types lookup table
CREATE TABLE IF NOT EXISTS account_types (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  description text NOT NULL,
  tax_treatment text NOT NULL,
  contribution_limit text,
  withdrawal_rules text,
  tax_benefits text[],
  is_retirement_account boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Investment accounts
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type text NOT NULL REFERENCES account_types(id),
  account_name text NOT NULL,
  account_number text,
  broker text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_name)
);

-- Companies and their fundamental data
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  industry text,
  asset_type text NOT NULL CHECK (asset_type IN ('stocks', 'etfs', 'bonds', 'crypto', 'commodities')),
  exchange text,
  currency text DEFAULT 'USD',
  
  -- Fundamental metrics
  market_cap bigint,
  shares_outstanding bigint,
  
  -- Valuation ratios
  pe_ratio decimal(10,2),
  pb_ratio decimal(10,2),
  peg_ratio decimal(10,2),
  ev_fcf decimal(10,2),
  sector_median_ev_fcf decimal(10,2),
  
  -- Financial health
  debt_to_equity decimal(10,4),
  current_ratio decimal(10,4),
  quick_ratio decimal(10,4),
  
  -- Profitability
  roe decimal(10,4),
  roa decimal(10,4),
  gross_margin decimal(10,4),
  net_margin decimal(10,4),
  operating_margin decimal(10,4),
  
  -- Efficiency and growth
  asset_turnover decimal(10,4),
  revenue_growth decimal(10,4),
  
  -- Cash flow (in billions)
  fcf_1yr decimal(15,2),
  fcf_2yr decimal(15,2),
  fcf_3yr decimal(15,2),
  fcf_10yr decimal(15,2),
  
  -- Dividend information
  dividend_per_share decimal(10,4),
  dividend_yield decimal(10,4),
  dividend_frequency text CHECK (dividend_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual')),
  ex_dividend_date date,
  
  -- Valuation
  intrinsic_value decimal(10,2),
  analyst_target_price decimal(10,2),
  
  -- Metadata
  description text,
  website text,
  employees integer,
  founded_year integer,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Market data for price history
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date date NOT NULL,
  open_price decimal(15,4) NOT NULL,
  high_price decimal(15,4) NOT NULL,
  low_price decimal(15,4) NOT NULL,
  close_price decimal(15,4) NOT NULL,
  adjusted_close decimal(15,4) NOT NULL,
  volume bigint NOT NULL,
  
  -- 52-week data (calculated fields)
  week_52_high decimal(15,4),
  week_52_low decimal(15,4),
  
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, date)
);

-- Holdings (current positions)
CREATE TABLE IF NOT EXISTS holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Position details
  shares decimal(15,6) NOT NULL DEFAULT 0,
  average_cost_basis decimal(15,4) NOT NULL DEFAULT 0,
  
  -- Calculated fields (updated via triggers or functions)
  current_price decimal(15,4),
  current_value decimal(15,2),
  total_cost decimal(15,2),
  unrealized_gain_loss decimal(15,2),
  unrealized_gain_loss_percent decimal(10,4),
  
  -- Position metadata
  first_purchase_date date,
  last_transaction_date date,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_id, company_id)
);

-- Transaction types lookup
CREATE TABLE IF NOT EXISTS transaction_types (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  description text NOT NULL,
  affects_shares boolean DEFAULT true,
  affects_cash boolean DEFAULT true,
  is_income boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- All transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_type text NOT NULL REFERENCES transaction_types(id),
  
  -- Transaction details
  transaction_date date NOT NULL,
  shares decimal(15,6),
  price_per_share decimal(15,4),
  total_amount decimal(15,2) NOT NULL,
  fees decimal(15,2) DEFAULT 0,
  
  -- Special transaction fields
  split_ratio text, -- For stock splits (e.g., "2:1")
  new_company_id uuid REFERENCES companies(id), -- For spinoffs/mergers
  
  -- Metadata
  notes text,
  external_transaction_id text, -- For broker integration
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dividend payments (separate from transactions for detailed tracking)
CREATE TABLE IF NOT EXISTS dividend_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id), -- Link to transaction record
  
  -- Dividend details
  ex_date date NOT NULL,
  record_date date,
  pay_date date NOT NULL,
  shares_held decimal(15,6) NOT NULL,
  dividend_per_share decimal(10,4) NOT NULL,
  total_dividend decimal(15,2) NOT NULL,
  tax_withheld decimal(15,2) DEFAULT 0,
  
  -- Dividend classification
  dividend_type text DEFAULT 'ordinary' CHECK (dividend_type IN ('ordinary', 'qualified', 'special', 'return_of_capital')),
  
  created_at timestamptz DEFAULT now()
);

-- Benchmark data for performance comparison
CREATE TABLE IF NOT EXISTS benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'broad_market', 'sector', 'international', etc.
  
  -- Performance data
  ytd_return decimal(10,4),
  one_year_return decimal(10,4),
  three_year_return decimal(10,4),
  five_year_return decimal(10,4),
  ten_year_return decimal(10,4),
  
  -- Risk metrics
  volatility decimal(10,4),
  sharpe_ratio decimal(10,4),
  max_drawdown decimal(10,4),
  beta decimal(10,4),
  
  -- Metadata
  inception_date date,
  expense_ratio decimal(10,6),
  aum bigint, -- Assets under management
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio snapshots for historical tracking
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  
  -- Portfolio totals
  total_value decimal(15,2) NOT NULL,
  total_cost decimal(15,2) NOT NULL,
  total_gain_loss decimal(15,2) NOT NULL,
  total_gain_loss_percent decimal(10,4) NOT NULL,
  
  -- Income tracking
  annual_dividend_income decimal(15,2) DEFAULT 0,
  monthly_dividend_average decimal(15,2) DEFAULT 0,
  dividend_yield decimal(10,4) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_holdings_company_id ON holdings(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_market_data_company_date ON market_data(company_id, date);
CREATE INDEX IF NOT EXISTS idx_dividend_payments_user_id ON dividend_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_dividend_payments_pay_date ON dividend_payments(pay_date);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for accounts
CREATE POLICY "Users can read own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for holdings
CREATE POLICY "Users can read own holdings"
  ON holdings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON holdings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON holdings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON holdings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for dividend payments
CREATE POLICY "Users can read own dividend payments"
  ON dividend_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dividend payments"
  ON dividend_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dividend payments"
  ON dividend_payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio snapshots
CREATE POLICY "Users can read own portfolio snapshots"
  ON portfolio_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio snapshots"
  ON portfolio_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public read access for reference tables
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to account types"
  ON account_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to transaction types"
  ON transaction_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to market data"
  ON market_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to benchmarks"
  ON benchmarks
  FOR SELECT
  TO authenticated
  USING (true);