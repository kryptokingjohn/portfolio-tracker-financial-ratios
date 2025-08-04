#!/usr/bin/env node

/**
 * Fix RLS policies for subscriptions table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSubscriptionRLS() {
  console.log('🔧 Analyzing subscriptions table RLS policies...\n');

  try {
    // First, let's see if we're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      console.log('🚨 You need to be logged in to test RLS policies');
      console.log('');
      console.log('📋 Manual Steps Required:');
      console.log('1. Open your app and log in with your user account');
      console.log('2. Try the "Advanced" button again');
      console.log('3. Or run the SQL migration in Supabase dashboard manually');
      return;
    }
    
    if (!user) {
      console.log('⚠️  No authenticated user found');
      console.log('🚨 You need to be logged in to test RLS policies'); 
      console.log('');
      console.log('📋 Manual Steps Required:');
      console.log('1. Open your app and log in with your user account');
      console.log('2. Try the "Advanced" button again');
      console.log('3. Or run the SQL migration in Supabase dashboard manually');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('👤 User ID:', user.id);
    
    // Now test if we can access subscriptions
    console.log('\n🔍 Testing subscriptions table access as authenticated user...');
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.log('❌ Still getting access error:', error.message);
      console.log('   Error code:', error.code);
      
      if (error.code === '42501') {
        console.log('\n🔒 RLS Policy Issue Detected!');
        console.log('');
        console.log('📝 The subscriptions table needs proper RLS policies.');
        console.log('');
        console.log('🛠️  SOLUTION - Run this SQL in your Supabase dashboard:');
        console.log('----------------------------------------');
        console.log('-- Add missing columns if needed');
        console.log('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);');
        console.log('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type text DEFAULT \'basic\';');
        console.log('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status text DEFAULT \'active\';');
        console.log('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;');
        console.log('');
        console.log('-- Create RLS policies');
        console.log('DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;');
        console.log('CREATE POLICY "Users can read own subscription" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);');
        console.log('');
        console.log('DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;');
        console.log('CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);');
        console.log('');
        console.log('DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;');
        console.log('CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);');
        console.log('----------------------------------------');
        console.log('');
        console.log('📍 Go to: https://supabase.com/dashboard → SQL Editor → Run the above SQL');
      }
      
      return;
    }
    
    console.log('✅ Successfully accessed subscriptions table!');
    
    if (data.length > 0) {
      console.log('📊 Found existing subscription:', data[0]);
    } else {
      console.log('📊 No existing subscription found - this is normal for new users');
      
      // Test if we can create a subscription
      console.log('\n🧪 Testing subscription creation...');
      
      const testSubscription = {
        user_id: user.id,
        plan_type: 'basic',
        status: 'active'
      };
      
      const { data: newSub, error: createError } = await supabase
        .from('subscriptions')
        .insert(testSubscription)
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Failed to create test subscription:', createError.message);
      } else {
        console.log('✅ Successfully created test subscription!');
        console.log('📊 Created subscription:', newSub);
        
        // Test premium activation
        console.log('\n🎯 Testing premium activation...');
        
        const { data: premiumSub, error: premiumError } = await supabase
          .from('subscriptions')
          .update({ plan_type: 'premium' })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (premiumError) {
          console.log('❌ Failed to activate premium:', premiumError.message);
        } else {
          console.log('✅ Successfully activated premium!');
          console.log('📊 Premium subscription:', premiumSub);
          console.log('');
          console.log('🎉 GREAT NEWS: The subscriptions table is working correctly!');
          console.log('💡 You can now use the "Advanced" button in the app to activate premium');
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixSubscriptionRLS().catch(console.error);