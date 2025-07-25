# 🏠 Local Development Setup Guide

Follow these steps to run the Portfolio Tracker locally with real Supabase database (no demo data).

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## 🚀 Step 1: Clone the Project

```bash
# Clone the repository
git clone <your-repo-url>
cd portfolio-tracker

# Or download and extract the ZIP file
```

## 📦 Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - React, TypeScript, Tailwind CSS
# - Supabase client
# - All UI and utility libraries
```

## 🔑 Step 3: Set Up Supabase Database

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in with GitHub or email
3. Click "New Project"
4. Fill in project details:
   - **Name**: `portfolio-tracker`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
5. Wait 2-3 minutes for project creation

### Get Your Credentials

1. In Supabase dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://abcdefgh.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📝 Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here

# App Configuration
VITE_APP_NAME="Portfolio Tracker Pro"
VITE_APP_VERSION="1.0.0"

# Optional: Market Data APIs (for real-time prices)
VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
VITE_IEX_CLOUD_KEY=your_iex_cloud_api_key
```

**⚠️ Important:** Replace the placeholder values with your actual Supabase credentials!

## 🗄️ Step 5: Set Up Database Schema

1. In Supabase dashboard → **SQL Editor**
2. Copy and paste this SQL to create all tables:

```sql
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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

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

INSERT INTO account_types (id, display_name, description, tax_treatment, contribution_limit, withdrawal_rules, tax_benefits, is_retirement_account) VALUES
('taxable', 'Taxable Brokerage', 'Standard investment account', 'Taxed on dividends, interest, and capital gains', 'No limit', 'No restrictions', ARRAY['Tax-loss harvesting opportunities', 'Flexible access to funds'], false),
('401k', '401(k)', 'Employer-sponsored retirement plan', 'Pre-tax contributions, taxed on withdrawal', '$23,000 (2024), $30,500 if 50+', 'Penalty before 59½, RMDs at 73', ARRAY['Tax-deferred growth', 'Employer matching', 'Lower current taxable income'], true),
('traditional_ira', 'Traditional IRA', 'Individual retirement account', 'Pre-tax contributions, taxed on withdrawal', '$7,000 (2024), $8,000 if 50+', 'Penalty before 59½, RMDs at 73', ARRAY['Tax-deferred growth', 'Potential tax deduction'], true),
('roth_ira', 'Roth IRA', 'Tax-free growth retirement account', 'After-tax contributions, tax-free withdrawals', '$7,000 (2024), $8,000 if 50+', 'Contributions withdrawable anytime, earnings after 59½', ARRAY['Tax-free growth', 'Tax-free withdrawals', 'No RMDs'], true),
('hsa', 'Health Savings Account', 'Triple tax-advantaged health account', 'Pre-tax contributions, tax-free growth and withdrawals for medical', '$4,300 individual, $8,550 family (2024)', 'Tax-free for medical expenses, penalty for non-medical before 65', ARRAY['Triple tax advantage', 'Investment growth potential', 'Retirement healthcare fund'], false);

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
('interest', 'Interest', 'Interest payment received', false, true, true);

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

CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

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

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

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

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_holdings_company_id ON holdings(company_id);

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

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

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

ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own portfolio snapshots" ON portfolio_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio snapshots" ON portfolio_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

3. Click **Run** to execute the SQL

## 🚀 Step 6: Start Local Development

```bash
# Start the development server
npm run dev

# The app will open at http://localhost:5173
```

## ✅ Step 7: Verify It's Working

### You should see:
1. **No demo mode banner** - The yellow "Continue with Demo Data" button should be gone
2. **Login screen** - Email/password fields for authentication
3. **Console logs** showing successful database connection:
   ```
   Supabase configuration found, attempting connection...
   Database connection test successful
   Authentication test successful
   ```

### Create Your Account:
1. Click "Don't have an account? Sign up"
2. Enter email and password
3. Sign up (email confirmation may be required)
4. Start adding your portfolio data!

## 🔧 Step 8: Configure Authentication (Optional)

In Supabase dashboard → **Authentication** → **Settings**:

1. **Email Settings:**
   - Disable email confirmation for testing (enable for production)
   - Configure email templates

2. **URL Configuration:**
   - Add `http://localhost:5173` to allowed origins
   - Add your production domain when deploying

## 📊 Step 9: Add Your Portfolio Data

Once logged in:
1. Click "Add Transaction" to add your first stock purchase
2. The app will automatically create companies and calculate metrics
3. Build your portfolio by adding more transactions

## 🆘 Troubleshooting

### Common Issues:

**"Demo mode" still showing:**
- Check `.env` file exists and has correct values
- Restart development server: `Ctrl+C` then `npm run dev`
- Check browser console for connection errors

**Database connection failed:**
- Verify Supabase URL and key are correct
- Ensure Supabase project is not paused
- Check network connection

**Authentication errors:**
- Run the database schema SQL again
- Check RLS policies are enabled
- Verify user table exists

### Getting Help:
- Check browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure Supabase project is active and accessible

---

**🎉 You're all set!** Your local development environment will now use real Supabase database instead of demo data.