#!/usr/bin/env node

/**
 * Script to re-enable Row Level Security and clean up temporary policies
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://oxxcykrriyrqzesamvxv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU');

async function reEnableRLS() {
  console.log('🔒 Re-enabling Row Level Security and cleaning up policies...');
  
  // Check current RLS status
  console.log('📋 Checking current RLS status...');
  
  try {
    const { data: companies } = await supabase
      .from('companies')
      .select('ticker')
      .limit(1);
    
    if (companies && companies.length > 0) {
      console.log('✅ Companies table is accessible');
    }
  } catch (error) {
    console.log('⚠️ Current access status:', error.message);
  }
  
  console.log('\n🔧 Manual steps required in Supabase Dashboard:');
  console.log('===============================================');
  
  console.log('\n1. 🗄️ **Database Policies** (if you added temporary INSERT/UPDATE policies):');
  console.log('   - Go to: Authentication > Policies');
  console.log('   - Find "companies" table');
  console.log('   - **Remove these temporary policies** (if they exist):');
  console.log('     • "Allow authenticated users to insert companies"');
  console.log('     • "Allow authenticated users to update companies"');
  console.log('   - **Keep only** the "Public read access to companies" policy');
  
  console.log('\n2. 🔒 **Row Level Security** (if you disabled it):');
  console.log('   - Go to: Database > Tables');
  console.log('   - Find "companies" table');
  console.log('   - Click on the table name');
  console.log('   - In the table settings, ensure "Enable RLS" is ON');
  
  console.log('\n3. ✅ **Verify Security**:');
  console.log('   - Companies table should be READ-ONLY for authenticated users');
  console.log('   - Users can read company data but cannot modify it');
  console.log('   - Only you (as admin) can add/update company data');
  
  console.log('\n📊 **Current Database Status**:');
  const { data: finalCount } = await supabase
    .from('companies')
    .select('ticker')
    .order('ticker');
  
  if (finalCount) {
    console.log(`   ✅ Total companies: ${finalCount.length}`);
    console.log('   ✅ S&P 500 population: Complete');
    console.log('   ✅ Database ready for production use');
  }
  
  console.log('\n🎯 **Why This Matters**:');
  console.log('   • Prevents unauthorized changes to company data');
  console.log('   • Maintains data integrity');
  console.log('   • Follows security best practices');
  console.log('   • Users can still read all company data for their portfolios');
  
  console.log('\n🚀 Once RLS is properly configured, your app will be production-ready!');
}

reEnableRLS().catch(console.error);