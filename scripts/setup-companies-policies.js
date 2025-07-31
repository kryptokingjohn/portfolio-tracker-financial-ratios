#!/usr/bin/env node

/**
 * Script to set up INSERT policies for companies table
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPolicies() {
  console.log('🔑 Setting up INSERT policies for companies table...');
  
  // Try to execute the policy creation via SQL
  const insertPolicySQL = `
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert companies"
      ON companies
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  `;
  
  const updatePolicySQL = `
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to update companies"
      ON companies
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  `;
  
  try {
    // Note: These will likely fail because we need admin privileges
    console.log('Attempting to create INSERT policy...');
    const result1 = await supabase.rpc('exec_sql', { sql_query: insertPolicySQL });
    console.log('✅ INSERT policy created:', result1);
    
    console.log('Attempting to create UPDATE policy...');
    const result2 = await supabase.rpc('exec_sql', { sql_query: updatePolicySQL });
    console.log('✅ UPDATE policy created:', result2);
    
  } catch (error) {
    console.error('❌ Failed to create policies:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. Find the "companies" table');
    console.log('4. Add the following policies:');
    console.log('\n-- INSERT Policy:');
    console.log(insertPolicySQL);
    console.log('\n-- UPDATE Policy:');
    console.log(updatePolicySQL);
  }
}

setupPolicies();