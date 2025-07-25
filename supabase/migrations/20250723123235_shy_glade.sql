/*
  # Database Schema Verification and Updates
  
  This migration ensures all tables have the correct structure and all required fields
  for the Portfolio Tracker application.
  
  1. Verify all tables exist
  2. Add any missing columns
  3. Update constraints and indexes
  4. Ensure RLS policies are correct
*/

-- Verify and update companies table with all required fields
DO $$
BEGIN
  -- Add missing columns to companies table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'exchange') THEN
    ALTER TABLE companies ADD COLUMN exchange text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'currency') THEN
    ALTER TABLE companies ADD COLUMN currency text DEFAULT 'USD';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'market_cap') THEN
    ALTER TABLE companies ADD COLUMN market_cap bigint;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'shares_outstanding') THEN
    ALTER TABLE companies ADD COLUMN shares_outstanding bigint;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'description') THEN
    ALTER TABLE companies ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'website') THEN
    ALTER TABLE companies ADD COLUMN website text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'employees') THEN
    ALTER TABLE companies ADD COLUMN employees integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'founded_year') THEN
    ALTER TABLE companies ADD COLUMN founded_year integer;
  END IF;
END $$;

-- Verify and update accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'broker') THEN
    ALTER TABLE accounts ADD COLUMN broker text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'account_number') THEN
    ALTER TABLE accounts ADD COLUMN account_number text;
  END IF;
END $$;

-- Verify and update holdings table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'holdings' AND column_name = 'first_purchase_date') THEN
    ALTER TABLE holdings ADD COLUMN first_purchase_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'holdings' AND column_name = 'last_transaction_date') THEN
    ALTER TABLE holdings ADD COLUMN last_transaction_date date;
  END IF;
END $$;

-- Create market_data table if it doesn't exist
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

-- Create indexes for market_data
CREATE INDEX IF NOT EXISTS idx_market_data_company_date ON market_data(company_id, date);

-- Enable RLS for market_data
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read access to market data" ON market_data FOR SELECT TO authenticated USING (true);

-- Create dividend_payments table if it doesn't exist
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

-- Create indexes for dividend_payments
CREATE INDEX IF NOT EXISTS idx_dividend_payments_user_id ON dividend_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_dividend_payments_pay_date ON dividend_payments(pay_date);

-- Enable RLS for dividend_payments
ALTER TABLE dividend_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own dividend payments" ON dividend_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own dividend payments" ON dividend_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own dividend payments" ON dividend_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create benchmarks table if it doesn't exist
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

-- Enable RLS for benchmarks
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read access to benchmarks" ON benchmarks FOR SELECT TO authenticated USING (true);

-- Insert default benchmark data
INSERT INTO benchmarks (ticker, name, description, category, ytd_return, one_year_return, three_year_return, five_year_return, ten_year_return, volatility, sharpe_ratio, max_drawdown, beta, expense_ratio) VALUES
('SPY', 'S&P 500', 'Large-cap U.S. stocks', 'broad_market', 0.242, 0.263, 0.105, 0.131, 0.129, 0.168, 1.42, -0.125, 1.0, 0.0009),
('QQQ', 'NASDAQ 100', 'Large-cap technology stocks', 'broad_market', 0.278, 0.291, 0.089, 0.182, 0.178, 0.224, 1.21, -0.187, 1.2, 0.0020),
('VTI', 'Total Stock Market', 'Entire U.S. stock market', 'broad_market', 0.231, 0.252, 0.098, 0.124, 0.122, 0.172, 1.38, -0.131, 1.0, 0.0003),
('IWM', 'Russell 2000', 'Small-cap U.S. stocks', 'broad_market', 0.108, 0.115, 0.012, 0.087, 0.091, 0.241, 0.68, -0.223, 1.3, 0.0019)
ON CONFLICT (ticker) DO NOTHING;

-- Verify all required indexes exist
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_holdings_company_id ON holdings(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- Update any missing constraints
ALTER TABLE companies ADD CONSTRAINT IF NOT EXISTS companies_ticker_key UNIQUE (ticker);
ALTER TABLE accounts ADD CONSTRAINT IF NOT EXISTS accounts_user_id_account_name_key UNIQUE (user_id, account_name);
ALTER TABLE holdings ADD CONSTRAINT IF NOT EXISTS holdings_user_id_account_id_company_id_key UNIQUE (user_id, account_id, company_id);

-- Verify RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;