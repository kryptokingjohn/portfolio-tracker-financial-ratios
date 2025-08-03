-- Fix market_data table RLS policies to allow INSERT and UPDATE operations
-- This resolves the 403 errors when updating market data

-- Add INSERT policy for market_data table
CREATE POLICY "Allow authenticated users to insert market data"
  ON market_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for market_data table
CREATE POLICY "Allow authenticated users to update market data"
  ON market_data
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also ensure companies table has proper INSERT/UPDATE policies (these may already exist)
-- This is needed for the market data service to create/update company records

-- Create or replace INSERT policy for companies
DROP POLICY IF EXISTS "Allow authenticated users to insert companies" ON companies;
CREATE POLICY "Allow authenticated users to insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create or replace UPDATE policy for companies
DROP POLICY IF EXISTS "Allow authenticated users to update companies" ON companies;
CREATE POLICY "Allow authenticated users to update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);