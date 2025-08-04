#!/usr/bin/env node

/**
 * Check the structure of the subscriptions table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscriptionColumns() {
  console.log('🔍 Checking subscriptions table structure...\n');

  try {
    // Try to insert a test record to see what columns are available
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    console.log('1. Testing basic column structure...');
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing subscriptions table:', error.message);
      console.log('   Error code:', error.code);
      return;
    }
    
    console.log('✅ Can access subscriptions table');
    
    if (data && data.length > 0) {
      console.log('📊 Sample record columns:');
      const sampleRecord = data[0];
      Object.keys(sampleRecord).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleRecord[key]} (${sampleRecord[key]})`);
      });
    } else {
      console.log('📊 No existing records found');
    }
    
    console.log('\n2. Testing column requirements...');
    
    // Check required columns by trying to insert
    const requiredColumns = {
      user_id: testUserId,
      plan_type: 'basic', 
      status: 'active'
    };
    
    console.log('🧪 Testing with minimal required columns:', requiredColumns);
    
    const { data: insertTest, error: insertError } = await supabase
      .from('subscriptions')
      .insert(requiredColumns)
      .select();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      console.log('   Error code:', insertError.code);
      console.log('   Hint:', insertError.hint || 'None');
      console.log('   Details:', insertError.details || 'None');
      
      // Check if it's a missing column error
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('\n🔧 Missing columns detected!');
        console.log('   The subscriptions table needs additional columns.');
        console.log('   Run the SQL migration manually in Supabase dashboard.');
      } else if (insertError.code === '42501') {
        console.log('\n🔒 Permission error - RLS policies may be blocking access');
      }
    } else {
      console.log('✅ Insert test successful!');
      
      // Clean up test record
      if (insertTest && insertTest.length > 0) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', testUserId);
        console.log('🧹 Cleaned up test record');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkSubscriptionColumns().catch(console.error);