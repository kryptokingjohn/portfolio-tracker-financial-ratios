-- Database Performance Optimization Indexes
-- Add indexes to optimize common queries and improve loading times

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker_user ON transactions(user_id, company_id, transaction_date);

-- Holdings table indexes  
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_active ON holdings(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_holdings_company_id ON holdings(company_id);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_asset_type ON companies(asset_type);

-- Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_type ON accounts(user_id, account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_active);

-- Portfolio snapshots indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_transactions_complete_portfolio ON transactions(user_id, transaction_date DESC, transaction_type, company_id);
CREATE INDEX IF NOT EXISTS idx_holdings_complete_portfolio ON holdings(user_id, is_active, company_id, account_id);

-- Partial indexes for active records only (more efficient)
CREATE INDEX IF NOT EXISTS idx_holdings_active_only ON holdings(user_id, company_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_accounts_active_only ON accounts(user_id, account_type) WHERE is_active = true;

-- Comments for documentation
COMMENT ON INDEX idx_transactions_user_date IS 'Optimizes user transaction history queries with date ordering';
COMMENT ON INDEX idx_holdings_active_only IS 'Partial index for active holdings only - more efficient than full table index';
COMMENT ON INDEX idx_transactions_complete_portfolio IS 'Composite index for complete portfolio loading with single query';