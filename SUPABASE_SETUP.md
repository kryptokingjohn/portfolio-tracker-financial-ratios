# 🗄️ Supabase Database Setup Guide

Follow these steps to set up a real Supabase database for your Portfolio Tracker app.

## 📋 Step 1: Create Supabase Project

1. **Go to** [supabase.com](https://supabase.com)
2. **Click "Start your project"**
3. **Sign up/Sign in** with GitHub, Google, or email
4. **Create a new project:**
   - Organization: Choose or create one
   - Project name: `portfolio-tracker`
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to your users

## 🔑 Step 2: Get Your Credentials

1. **In your Supabase dashboard**, go to **Settings > API**
2. **Copy these values:**
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## 📝 Step 3: Configure Environment Variables

1. **Create a `.env` file** in your project root:
   ```bash
   # Replace with your actual Supabase credentials
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # App Configuration
   VITE_APP_NAME="Portfolio Tracker Pro"
   VITE_APP_VERSION="1.0.0"
   
   # Optional: Market Data APIs
   VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
   VITE_IEX_CLOUD_KEY=your_iex_cloud_api_key
   ```

## 🗃️ Step 4: Set Up Database Schema

### Option A: Use Supabase Dashboard (Recommended)

1. **Go to** your Supabase project dashboard
2. **Click "SQL Editor"** in the sidebar
3. **Copy and paste** the following SQL to create all tables:

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
('hsa', 'Health Savings Account', 'Triple tax-advantaged health account', 'Pre-tax contributions, tax-free growth and withdrawals for medical', '$4,300 individual, $8,550 family (2024)', 'Tax-free for medical expenses, penalty for non-medical before 65', ARRAY['Triple tax advantage', 'Investment growth potential', 'Retirement healthcare fund'], false);

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
('interest', 'Interest', 'Interest payment received', false, true, true);

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
```

4. **Click "Run"** to execute the SQL

### Option B: Use Migration Files

If you prefer to use the existing migration files:

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase:**
   ```bash
   supabase init
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-id
   ```

4. **Push migrations:**
   ```bash
   supabase db push
   ```

## 🔐 Step 5: Configure Authentication

1. **In Supabase dashboard**, go to **Authentication > Settings**
2. **Configure email settings:**
   - Enable email confirmations (or disable for testing)
   - Set up email templates
3. **Add your domain** to allowed origins:
   - Add `http://localhost:5173` for development
   - Add your production domain when deploying

## 🧪 Step 6: Test the Connection

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **The app should now:**
   - Show the login screen (not demo mode)
   - Allow you to create an account
   - Connect to your real database

## 🚀 Step 7: Add Sample Data (Optional)

Once you can log in, you can:
1. **Add transactions** using the "Add Transaction" button
2. **Import data** from CSV files
3. **Manually enter** your portfolio holdings

## ⚠️ **Important Notes:**

- **Keep your credentials secure** - never commit the `.env` file to git
- **Use different projects** for development and production
- **Set up proper RLS policies** for security
- **Regular backups** are recommended

## 🆘 **Troubleshooting:**

**Can't connect?**
- Double-check your URL and key
- Ensure the project is not paused
- Check browser console for errors

**Authentication issues?**
- Verify email confirmation settings
- Check allowed origins in Supabase
- Ensure RLS policies are correct

**Database errors?**
- Run the SQL schema setup again
- Check table permissions
- Verify foreign key relationships

---

Once you complete these steps, your app will use a real database instead of demo data!