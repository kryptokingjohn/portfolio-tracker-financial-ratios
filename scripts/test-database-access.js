#!/usr/bin/env node

/**
 * Test database access and diagnose RLS issues
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseAccess() {
  console.log('🔍 Testing database access...\n');

  // Test 1: Companies table read access
  console.log('1. Testing companies table read access...');
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('ticker, company_name')
      .limit(5);
    
    if (error) {
      console.log('❌ Companies read failed:', error.message);
      console.log('   Error code:', error.code);
    } else {
      console.log(`✅ Companies read successful: ${companies.length} companies found`);
      companies.forEach(c => console.log(`   - ${c.ticker}: ${c.company_name}`));
    }
  } catch (err) {
    console.log('❌ Companies read exception:', err.message);
  }

  // Test 2: Try to create a user record
  console.log('\n2. Testing user authentication and record creation...');
  try {
    // Check if we can read users table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (userError) {
      console.log('❌ Users table access failed:', userError.message);
      console.log('   Error code:', userError.code);
    } else {
      console.log(`✅ Users table accessible: ${users.length} users found`);
    }
  } catch (err) {
    console.log('❌ Users table exception:', err.message);
  }

  // Test 3: Try to create an account
  console.log('\n3. Testing accounts table access...');
  try {
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('id, account_name')
      .limit(1);
    
    if (accountError) {
      console.log('❌ Accounts table access failed:', accountError.message);
      console.log('   Error code:', accountError.code);
    } else {
      console.log(`✅ Accounts table accessible: ${accounts.length} accounts found`);
    }
  } catch (err) {
    console.log('❌ Accounts table exception:', err.message);
  }

  // Test 4: Check authentication status
  console.log('\n4. Testing authentication status...');
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth check failed:', authError.message);
    } else if (user) {
      console.log('✅ User is authenticated:', user.email);
    } else {
      console.log('⚠️ No authenticated user found');
    }
  } catch (err) {
    console.log('❌ Auth exception:', err.message);
  }

  console.log('\n📋 Diagnosis Summary:');
  console.log('=====================');
  console.log('If you see errors above, the issue is likely:');
  console.log('1. 🔒 RLS policies are blocking access (most likely)');
  console.log('2. 👤 No authenticated user session');
  console.log('3. 🚫 Missing required policies for user operations');
  
  console.log('\n🔧 Recommended fixes:');
  console.log('1. Temporarily disable RLS on user-related tables');
  console.log('2. Add policies for authenticated users to access their own data');
  console.log('3. Or use demo mode until authentication is properly set up');
}

testDatabaseAccess().catch(console.error);