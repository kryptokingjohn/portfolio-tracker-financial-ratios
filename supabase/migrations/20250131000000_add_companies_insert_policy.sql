-- Add INSERT policy for companies table to allow population
-- This allows authenticated users to insert company data

CREATE POLICY "Allow authenticated users to insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow upserts (updates during conflicts)
CREATE POLICY "Allow authenticated users to update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);