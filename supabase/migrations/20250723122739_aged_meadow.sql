-- Portfolio Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Create account types lookup table
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

-- Insert account types
INSERT INTO account_types (id, display_name, description, tax_treatment, contribution_limit, withdrawal_rules, tax_benefits, is_retirement_account) VALUES
('taxable', 'Taxable Brokerage', 'Standard investment account', 'Taxed on dividends, interest, and capital gains', 'No limit', 'No restrictions', ARRAY['Tax-loss harvesting opportunities', 'Flexible access to funds'], false),
('401k', '401(k)', 'Employer-sponsored retirement plan', 'Pre-tax contributions, taxed on withdrawal', '$23,000 (2024), $30,500 if 50+', 'Penalty before 59½, RMDs at 73', ARRAY['Tax-deferred growth', 'Employer matching', 'Lower current taxable income'], true),
('traditional_ira', 'Traditional IRA', 'Individual retirement account', 'Pre-tax contributions, taxed on withdrawal', '$7,000 (2024), $8,000 if 50+', 'Penalty before 59½, RMDs at 73', ARRAY['Tax-deferred growth', 'Potential tax deduction'], true),
('roth_ira', 'Roth IRA', 'Tax-free growth retirement account', 'After-tax contributions, tax-free withdrawals', '$7,000 (2024), $8,000 if 50+', 'Contributions withdrawable anytime, earnings after 59½', ARRAY['Tax-free growth', 'Tax-free withdrawals', 'No RMDs'], true),
('hsa', 'Health Savings Account', 'Triple tax-advantaged health account', 'Pre-tax contributions, tax-free growth and withdrawals for medical', '$4,300 individual, $8,550 family (2024)', 'Tax-free for medical expenses, penalty for non-medical before 65', ARRAY['Triple tax advantage', 'Investment growth potential', 'Retirement healthcare fund'], false),
('sep_ira', 'SEP-IRA', 'Simplified Employee Pension', 'Pre-tax contributions, taxed on withdrawal', 'Up to 25% of compensation or $69,000 (2024)', 'Penalty before 59½, RMDs at 73', ARRAY['High contribution limits', 'Tax-deferred growth', 'Business tax deduction'], true),
('simple_ira', 'SIMPLE IRA', 'Savings Incentive Match Plan', 'Pre-tax contributions, taxed on withdrawal', '$16,000 (2024), $19,500 if 50+', 'Higher penalty in first 2 years, RMDs at 73', ARRAY['Employer matching', 'Tax-deferred growth', 'Lower administrative costs'], true),
('529', '529 Education', 'Tax-advantaged education savings', 'After-tax contributions, tax-free growth for education', 'Varies by state, typically $300,000+', 'Tax-free for qualified education expenses', ARRAY['Tax-free growth', 'State tax deductions (varies)', 'Education expense flexibility'], false),
('cash_money_market', 'Cash & Money Market', 'Liquid cash reserves', 'Taxed on interest income', 'No limit', 'Immediate access', ARRAY['Liquidity', 'Capital preservation', 'Emergency fund'], false),
('trust', 'Trust Account', 'Assets held in trust', 'Varies by trust type', 'Varies by trust terms', 'Per trust agreement', ARRAY['Estate planning', 'Asset protection', 'Tax efficiency (varies)'], false),
('custodial', 'Custodial Account', 'UTMA/UGMA accounts for minors', 'Taxed at child''s rate', 'Gift tax limits apply', 'For benefit of minor', ARRAY['Potential tax savings', 'Educational funding', 'Gift tax benefits'], false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS and create policy
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to account types" ON account_types FOR SELECT TO authenticated USING (true);

-- Create transaction types lookup table
CREATE TABLE IF NOT EXISTS transaction_types (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  description text NOT NULL,
  affects_shares boolean DEFAULT true,
  affects_cash boolean DEFAULT true,
  is_income boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert transaction types
INSERT INTO transaction_types (id, display_name, description, affects_shares, affects_cash, is_income) VALUES
('buy', 'Buy', 'Purchase shares', true, true, false),
('sell', 'Sell', 'Sell shares', true, true, false),
('dividend', 'Dividend', 'Dividend payment received', false, true, true),
('split', 'Stock Split', 'Stock split adjustment', true, false, false),
('spinoff', 'Spinoff', 'Company spinoff', true, false, false),
('merger', 'Merger', 'Company merger', true, true, false),
('rights', 'Rights Offering', 'Rights offering participation', true, true, false),
('return_of_capital', 'Return of Capital', 'Return of capital distribution', false, true, true),
('fee', 'Fee', 'Account or transaction fee', false, true, false),
('interest', 'Interest', 'Interest payment received', false, true, true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS and create policy
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to transaction types" ON transaction_types FOR SELECT TO authenticated USING (true);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  industry text,
  asset_type text NOT NULL CHECK (asset_type IN ('stocks', 'etfs', 'bonds', 'crypto', 'commodities')),
  exchange text,
  currency text DEFAULT 'USD',
  market_cap bigint,
  shares_outstanding bigint,
  pe_ratio numeric(10,2),
  pb_ratio numeric(10,2),
  peg_ratio numeric(10,2),
  ev_fcf numeric(10,2),
  sector_median_ev_fcf numeric(10,2),
  debt_to_equity numeric(10,4),
  current_ratio numeric(10,4),
  quick_ratio numeric(10,4),
  roe numeric(10,4),
  roa numeric(10,4),
  gross_margin numeric(10,4),
  net_margin numeric(10,4),
  operating_margin numeric(10,4),
  asset_turnover numeric(10,4),
  revenue_growth numeric(10,4),
  fcf_1yr numeric(15,2),
  fcf_2yr numeric(15,2),
  fcf_3yr numeric(15,2),
  fcf_10yr numeric(15,2),
  dividend_per_share numeric(10,4),
  dividend_yield numeric(10,4),
  dividend_frequency text CHECK (dividend_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual')),
  ex_dividend_date date,
  intrinsic_value numeric(10,2),
  analyst_target_price numeric(10,2),
  description text,
  website text,
  employees integer,
  founded_year integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- Enable RLS and create policy
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to companies" ON companies FOR SELECT TO authenticated USING (true);

-- Create accounts table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Enable RLS and create policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own accounts" ON accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shares numeric(15,6) NOT NULL DEFAULT 0,
  average_cost_basis numeric(15,4) NOT NULL DEFAULT 0,
  current_price numeric(15,4),
  current_value numeric(15,2),
  total_cost numeric(15,2),
  unrealized_gain_loss numeric(15,2),
  unrealized_gain_loss_percent numeric(10,4),
  first_purchase_date date,
  last_transaction_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_id, company_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_holdings_company_id ON holdings(company_id);

-- Enable RLS and create policies
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own holdings" ON holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own holdings" ON holdings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own holdings" ON holdings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own holdings" ON holdings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_type text NOT NULL REFERENCES transaction_types(id),
  transaction_date date NOT NULL,
  shares numeric(15,6),
  price_per_share numeric(15,4),
  total_amount numeric(15,2) NOT NULL,
  fees numeric(15,2) DEFAULT 0,
  split_ratio text,
  new_company_id uuid REFERENCES companies(id),
  notes text,
  external_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- Enable RLS and create policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create dividend payments table
CREATE TABLE IF NOT EXISTS dividend_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id),
  ex_date date NOT NULL,
  record_date date,
  pay_date date NOT NULL,
  shares_held numeric(15,6) NOT NULL,
  dividend_per_share numeric(10,4) NOT NULL,
  total_dividend numeric(15,2) NOT NULL,
  tax_withheld numeric(15,2) DEFAULT 0,
  dividend_type text DEFAULT 'ordinary' CHECK (dividend_type IN ('ordinary', 'qualified', 'special', 'return_of_capital')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dividend_payments_user_id ON dividend_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_dividend_payments_pay_date ON dividend_payments(pay_date);

-- Enable RLS and create policies
ALTER TABLE dividend_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own dividend payments" ON dividend_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dividend payments" ON dividend_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dividend payments" ON dividend_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create portfolio snapshots table
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_value numeric(15,2) NOT NULL,
  total_cost numeric(15,2) NOT NULL,
  total_gain_loss numeric(15,2) NOT NULL,
  total_gain_loss_percent numeric(10,4) NOT NULL,
  annual_dividend_income numeric(15,2) DEFAULT 0,
  monthly_dividend_average numeric(15,2) DEFAULT 0,
  dividend_yield numeric(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable RLS and create policies
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own portfolio snapshots" ON portfolio_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio snapshots" ON portfolio_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create market data table
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date date NOT NULL,
  open_price numeric(15,4) NOT NULL,
  high_price numeric(15,4) NOT NULL,
  low_price numeric(15,4) NOT NULL,
  close_price numeric(15,4) NOT NULL,
  adjusted_close numeric(15,4) NOT NULL,
  volume bigint NOT NULL,
  week_52_high numeric(15,4),
  week_52_low numeric(15,4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_data_company_date ON market_data(company_id, date);

-- Enable RLS and create policy
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to market data" ON market_data FOR SELECT TO authenticated USING (true);

-- Create benchmarks table
CREATE TABLE IF NOT EXISTS benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  ytd_return numeric(10,4),
  one_year_return numeric(10,4),
  three_year_return numeric(10,4),
  five_year_return numeric(10,4),
  ten_year_return numeric(10,4),
  volatility numeric(10,4),
  sharpe_ratio numeric(10,4),
  max_drawdown numeric(10,4),
  beta numeric(10,4),
  inception_date date,
  expense_ratio numeric(10,6),
  aum bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to benchmarks" ON benchmarks FOR SELECT TO authenticated USING (true);