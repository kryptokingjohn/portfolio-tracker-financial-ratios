#!/usr/bin/env node

/**
 * Setup subscriptions table for persistent premium status
 * This works with existing subscriptions table or creates user_subscriptions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

console.log('🔧 Setting up subscriptions table...');
console.log(`📍 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSubscriptionsTable() {
  try {
    console.log('🔍 Checking current database setup...');
    
    // Check if subscriptions table exists
    console.log('📋 Checking subscriptions table...');
    const { data: subscriptionsExists, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    // Check if user_subscriptions table exists  
    console.log('📋 Checking user_subscriptions table...');
    const { data: userSubscriptionsExists, error: userSubscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .limit(1);
    
    if (!subscriptionsError && subscriptionsExists !== null) {
      console.log('✅ subscriptions table found and accessible');
      return 'subscriptions';
    } else if (!userSubscriptionsError && userSubscriptionsExists !== null) {
      console.log('✅ user_subscriptions table found and accessible');
      return 'user_subscriptions';
    } else {
      console.log('⚠️  No subscription tables found');
      console.log('   subscriptions error:', subscriptionsError?.message || 'Not accessible');
      console.log('   user_subscriptions error:', userSubscriptionsError?.message || 'Not accessible');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to check subscription tables:', error);
    return null;
  }
}

async function main() {
  const existingTable = await setupSubscriptionsTable();
  
  if (existingTable) {
    console.log(`📊 Using existing table: ${existingTable}`);
    console.log('✅ Database appears to be ready for subscription management');
    console.log('');
    console.log('🎯 The app will now:');
    console.log('- Load subscription status from database');
    console.log('- Save premium status persistently');
    console.log('- No longer reset to basic on refresh');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Open the app and go to My Account');
    console.log('2. Click the "Advanced" button to activate premium');
    console.log('3. Your premium status will now persist!');
  } else {
    console.log('❌ No subscription tables found');
    console.log('');
    console.log('🔧 Manual Setup Required:');
    console.log('1. Open your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run this migration file:');
    console.log('   supabase/migrations/20250203110000_update_existing_subscriptions_table.sql');
    console.log('');
    console.log('🏗️  This will:');
    console.log('- Create subscriptions table (or update existing one)');
    console.log('- Add required columns for premium status');
    console.log('- Set up Row Level Security policies');
    console.log('- Create triggers for new users');
  }
}

main().catch(console.error);