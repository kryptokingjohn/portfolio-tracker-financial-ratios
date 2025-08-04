#!/usr/bin/env node

/**
 * Test the subscriptions table structure after SQL migration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTableStructure() {
  console.log('🔍 Testing subscriptions table after SQL migration...\n');
  
  try {
    // Method 1: Try to get any record to see column structure
    console.log('1. Testing table access...');
    const { data, error, count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .limit(0); // Get no records, just metadata
    
    if (error) {
      console.log('❌ Table access error:', error.message);
      console.log('   Error code:', error.code);
      
      if (error.code === '42501') {
        console.log('🔒 RLS is still blocking access');
        console.log('🚨 The SQL migration may not have been applied correctly');
        console.log('');
        console.log('💡 Double-check that you ran ALL the SQL commands in Supabase dashboard');
        console.log('💡 Especially the RLS policy creation commands');
      } else if (error.code === '42P01') {
        console.log('❌ Table does not exist');
      } else {
        console.log('❓ Unexpected error - check Supabase dashboard logs');
      }
      return;
    }
    
    console.log('✅ Can access subscriptions table');
    console.log(`📊 Table has ${count || 0} records`);
    
    // Method 2: Test column structure with a dummy query
    console.log('\n2. Testing column structure...');
    
    const testColumns = [
      'id', 'user_id', 'plan_type', 'status', 
      'cancel_at_period_end', 'start_date', 'updated_at'
    ];
    
    for (const column of testColumns) {
      try {
        const { error: colError } = await supabase
          .from('subscriptions')
          .select(column)
          .limit(0);
        
        if (colError) {
          console.log(`❌ Column '${column}': ${colError.message}`);
        } else {
          console.log(`✅ Column '${column}': exists`);
        }
      } catch (e) {
        console.log(`❌ Column '${column}': error testing`);
      }
    }
    
    // Method 3: Test if we can simulate the upsert operation
    console.log('\n3. Testing upsert operation (without auth)...');
    
    const testUpsert = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      plan_type: 'premium',
      status: 'active',
      cancel_at_period_end: false,
      start_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(testUpsert, { onConflict: 'user_id' })
      .select();
    
    if (upsertError) {
      console.log('❌ Upsert test failed:', upsertError.message);
      console.log('   Error code:', upsertError.code);
      
      if (upsertError.code === '42501') {
        console.log('🔒 RLS policies are working (blocking anonymous access)');
        console.log('✅ This is actually GOOD - means RLS is protecting the table');
        console.log('💡 The issue is likely authentication in the app');
      } else if (upsertError.message.includes('violates not-null constraint')) {
        console.log('❌ Missing required columns or constraints');
      } else if (upsertError.message.includes('does not exist')) {
        console.log('❌ Column missing from table structure');
      }
    } else {
      console.log('⚠️  Upsert succeeded without auth - RLS may not be working properly');
    }
    
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('If you see "RLS policies are working" above,');
    console.log('then the table structure is correct!');
    console.log('');
    console.log('The issue is likely:');
    console.log('1. 🔐 User not properly authenticated in the app');
    console.log('2. 🔑 Auth token not being sent with database requests');
    console.log('3. 👤 User ID mismatch between auth and database');
    console.log('');
    console.log('Next: Check browser console when clicking "Advanced" button');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testTableStructure().catch(console.error);