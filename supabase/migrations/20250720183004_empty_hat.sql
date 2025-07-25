/*
  # Insert Reference Data

  1. Account Types
    - All supported account types with their characteristics
    
  2. Transaction Types
    - All supported transaction types
    
  3. Sample Companies
    - Companies from the mock data with full financial metrics
    
  4. Benchmark Data
    - Market benchmarks for performance comparison
*/

-- Insert account types
INSERT INTO account_types (id, display_name, description, tax_treatment, contribution_limit, withdrawal_rules, tax_benefits, is_retirement_account) VALUES
('taxable', 'Taxable Brokerage', 'Standard investment account with no contribution limits', 'Taxed on dividends, interest, and capital gains', 'No limit', 'No restrictions', ARRAY['Tax-loss harvesting opportunities', 'Flexible access to funds'], false),
('401k', '401(k)', 'Employer-sponsored retirement plan with tax advantages', 'Pre-tax contributions, taxed on withdrawal', '$23,000 (2024), $30,500 if 50+', 'Penalty before 59½, RMDs at 73', ARRAY['Tax-deferred growth', 'Employer matching', 'Lower current taxable income'], true),
('traditional_ira', 'Traditional IRA', 'Individual retirement account with tax-deferred growth', 'Pre-tax contributions (if eligible), taxed on withdrawal', '$7,000 (2024), $8,000 if 50+', 'Penalty before 59½, RMDs at 73', ARRAY['Tax-deferred growth', 'Potential tax deduction'], true),
('roth_ira', 'Roth IRA', 'Individual retirement account with tax-free growth', 'After-tax contributions, tax-free withdrawals in retirement', '$7,000 (2024), $8,000 if 50+', 'Contributions withdrawable anytime, earnings after 59½', ARRAY['Tax-free growth', 'Tax-free withdrawals', 'No RMDs'], true),
('hsa', 'Health Savings Account', 'Triple tax-advantaged account for medical expenses', 'Pre-tax contributions, tax-free growth and withdrawals for medical', '$4,300 individual, $8,550 family (2024)', 'Tax-free for medical expenses, penalty for non-medical before 65', ARRAY['Triple tax advantage', 'Investment growth potential', 'Retirement healthcare fund'], false),
('sep_ira', 'SEP-IRA', 'Simplified Employee Pension for self-employed and small business', 'Pre-tax contributions, taxed on withdrawal', 'Up to 25% of compensation or $69,000 (2024)', 'Penalty before 59½, RMDs at 73', ARRAY['High contribution limits', 'Tax-deferred growth', 'Business tax deduction'], true),
('simple_ira', 'SIMPLE IRA', 'Savings Incentive Match Plan for small employers', 'Pre-tax contributions, taxed on withdrawal', '$16,000 (2024), $19,500 if 50+', 'Higher penalty in first 2 years, RMDs at 73', ARRAY['Employer matching', 'Tax-deferred growth', 'Lower administrative costs'], true),
('529', '529 Education', 'Tax-advantaged savings plan for education expenses', 'After-tax contributions, tax-free growth for education', 'Varies by state, typically $300,000+', 'Tax-free for qualified education expenses', ARRAY['Tax-free growth', 'State tax deductions (varies)', 'Education expense flexibility'], false),
('cash_money_market', 'Cash & Money Market', 'Liquid cash reserves and money market funds', 'Taxed on interest income', 'No limit', 'Immediate access', ARRAY['Liquidity', 'Capital preservation', 'Emergency fund'], false),
('trust', 'Trust Account', 'Assets held in trust for beneficiaries', 'Varies by trust type', 'Varies by trust terms', 'Per trust agreement', ARRAY['Estate planning', 'Asset protection', 'Tax efficiency (varies)'], false),
('custodial', 'Custodial Account', 'UTMA/UGMA accounts for minors', 'Taxed at child''s rate (kiddie tax rules apply)', 'Gift tax limits apply', 'For benefit of minor, control transfers at majority', ARRAY['Potential tax savings', 'Educational funding', 'Gift tax benefits'], false);

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

-- Insert sample companies with full financial data
INSERT INTO companies (
  ticker, company_name, sector, industry, asset_type, exchange, currency,
  market_cap, shares_outstanding,
  pe_ratio, pb_ratio, peg_ratio, ev_fcf, sector_median_ev_fcf,
  debt_to_equity, current_ratio, quick_ratio,
  roe, roa, gross_margin, net_margin, operating_margin,
  asset_turnover, revenue_growth,
  fcf_1yr, fcf_2yr, fcf_3yr, fcf_10yr,
  dividend_per_share, dividend_yield, dividend_frequency,
  intrinsic_value, analyst_target_price,
  description, website, employees, founded_year
) VALUES
(
  'AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'stocks', 'NASDAQ', 'USD',
  2800000000000, 15500000000,
  28.5, 8.2, 1.4, 18.2, 19.5,
  0.31, 1.07, 0.83,
  36.9, 22.4, 43.3, 25.7, 29.8,
  0.87, 7.8,
  2.8, 2.5, 2.3, 89.1,
  0.96, 0.55, 'quarterly',
  185.00, 190.00,
  'Leading technology company with strong ecosystem and services growth',
  'https://www.apple.com', 164000, 1976
),
(
  'MSFT', 'Microsoft Corporation', 'Technology', 'Software', 'stocks', 'NASDAQ', 'USD',
  2400000000000, 7400000000,
  32.1, 4.8, 1.8, 22.5, 19.5,
  0.35, 1.89, 1.77,
  43.7, 18.1, 69.8, 36.7, 42.1,
  0.49, 12.1,
  3.2, 2.9, 2.7, 65.2,
  2.72, 0.83, 'quarterly',
  340.00, 350.00,
  'Cloud computing leader with strong Azure growth and productivity software dominance',
  'https://www.microsoft.com', 221000, 1975
),
(
  'JNJ', 'Johnson & Johnson', 'Healthcare', 'Pharmaceuticals', 'stocks', 'NYSE', 'USD',
  420000000000, 2650000000,
  15.2, 1.8, 1.1, 12.8, 14.2,
  0.46, 1.32, 1.05,
  23.4, 9.8, 68.4, 20.3, 24.1,
  0.48, 5.2,
  1.9, 1.8, 1.7, 23.5,
  4.68, 2.95, 'quarterly',
  175.00, 180.00,
  'Diversified healthcare company with strong pharmaceutical pipeline and consistent dividend growth',
  'https://www.jnj.com', 152700, 1886
),
(
  'SPY', 'SPDR S&P 500 ETF Trust', 'Index Fund', 'Broad Market ETF', 'etfs', 'NYSE', 'USD',
  450000000000, 900000000,
  21.8, 3.2, 1.3, 0, 0,
  0, 0, 0,
  0, 0, 0, 0, 0,
  0, 0,
  0, 0, 0, 0,
  1.23, 0.28, 'quarterly',
  450.00, 455.00,
  'Tracks S&P 500 index providing broad market exposure with low expense ratio',
  'https://www.ssga.com', NULL, 1993
),
(
  'VTI', 'Vanguard Total Stock Market ETF', 'Index Fund', 'Total Market ETF', 'etfs', 'NYSE', 'USD',
  320000000000, 1400000000,
  22.1, 3.4, 1.4, 0, 0,
  0, 0, 0,
  0, 0, 0, 0, 0,
  0, 0,
  0, 0, 0, 0,
  0.89, 0.41, 'quarterly',
  225.00, 230.00,
  'Provides exposure to entire U.S. stock market with extremely low fees',
  'https://investor.vanguard.com', NULL, 2001
),
(
  'GOVT', 'U.S. Treasury Bond 10-Year', 'Fixed Income', 'Government Bonds', 'bonds', 'NYSE', 'USD',
  15000000000, 600000000,
  0, 0, 0, 0, 0,
  0, 0, 0,
  0, 0, 0, 0, 0,
  0, 0,
  0, 0, 0, 0,
  0.62, 2.51, 'monthly',
  25.00, 25.50,
  'Government bond ETF providing stable income and portfolio diversification',
  'https://www.ishares.com', NULL, 2012
);

-- Insert benchmark data
INSERT INTO benchmarks (
  ticker, name, description, category,
  ytd_return, one_year_return, three_year_return, five_year_return, ten_year_return,
  volatility, sharpe_ratio, max_drawdown, beta,
  inception_date, expense_ratio, aum
) VALUES
('SPY', 'S&P 500', 'Tracks the S&P 500 index of large-cap U.S. stocks', 'broad_market',
  24.2, 26.3, 10.5, 13.1, 12.9,
  16.5, 1.35, -12.8, 1.00,
  '1993-01-22', 0.0945, 450000000000),
('QQQ', 'NASDAQ 100', 'Tracks the NASDAQ-100 index of large-cap technology stocks', 'technology',
  27.8, 29.1, 8.9, 18.2, 17.8,
  22.1, 1.28, -18.5, 1.15,
  '1999-03-10', 0.20, 220000000000),
('IWM', 'Russell 2000', 'Tracks the Russell 2000 index of small-cap U.S. stocks', 'small_cap',
  10.8, 11.5, 1.2, 8.7, 9.1,
  24.8, 0.85, -22.3, 1.25,
  '2000-05-22', 0.19, 65000000000),
('VTI', 'Total Stock Market', 'Tracks the entire U.S. stock market', 'broad_market',
  23.1, 25.2, 9.8, 12.4, 12.2,
  17.2, 1.32, -13.1, 1.02,
  '2001-05-24', 0.03, 320000000000),
('VEA', 'International Developed', 'Tracks developed international markets excluding the U.S.', 'international',
  8.9, 12.4, 4.2, 6.8, 7.1,
  19.5, 0.78, -16.8, 0.85,
  '2007-07-20', 0.05, 95000000000);