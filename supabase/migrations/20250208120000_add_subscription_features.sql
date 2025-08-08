-- Add new subscription features for trial, grandfathering, transaction tracking, and grace period
-- This migration adds the necessary fields to support the new subscription model

DO $$
BEGIN
  -- Add trial_ends_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE subscriptions ADD COLUMN trial_ends_at timestamptz;
  END IF;
  
  -- Add is_trialing column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'is_trialing') THEN
    ALTER TABLE subscriptions ADD COLUMN is_trialing boolean DEFAULT false;
  END IF;
  
  -- Add is_grandfathered column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'is_grandfathered') THEN
    ALTER TABLE subscriptions ADD COLUMN is_grandfathered boolean DEFAULT false;
  END IF;
  
  -- Add transaction_count column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'transaction_count') THEN
    ALTER TABLE subscriptions ADD COLUMN transaction_count integer DEFAULT 0;
  END IF;
  
  -- Add grace_period_ends_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'grace_period_ends_at') THEN
    ALTER TABLE subscriptions ADD COLUMN grace_period_ends_at timestamptz;
  END IF;
  
  -- Add billing_interval column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'billing_interval') THEN
    ALTER TABLE subscriptions ADD COLUMN billing_interval text CHECK (billing_interval IN ('month', 'year')) DEFAULT 'month';
  END IF;
  
  -- Add coupon_code column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'coupon_code') THEN
    ALTER TABLE subscriptions ADD COLUMN coupon_code text;
  END IF;

  -- Update status column to include new statuses
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete'));
    
  -- Create index on transaction_count for soft paywall queries
  CREATE INDEX IF NOT EXISTS idx_subscriptions_transaction_count ON subscriptions(transaction_count);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_is_grandfathered ON subscriptions(is_grandfathered);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at ON subscriptions(trial_ends_at);
  
END $$;

-- Function to increment transaction count
CREATE OR REPLACE FUNCTION increment_transaction_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  current_count integer;
BEGIN
  UPDATE subscriptions 
  SET 
    transaction_count = transaction_count + 1,
    updated_at = now()
  WHERE user_id = user_uuid
  RETURNING transaction_count INTO current_count;
  
  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can add transactions (soft paywall)
CREATE OR REPLACE FUNCTION can_add_transaction(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  user_sub record;
BEGIN
  SELECT 
    plan_type,
    transaction_count,
    is_grandfathered,
    status,
    trial_ends_at,
    is_trialing
  FROM subscriptions 
  WHERE user_id = user_uuid 
  INTO user_sub;
  
  -- If no subscription found, allow up to 50 transactions
  IF user_sub IS NULL THEN
    RETURN true;
  END IF;
  
  -- Grandfathered users have unlimited access
  IF user_sub.is_grandfathered THEN
    RETURN true;
  END IF;
  
  -- Premium users (active or trialing) have unlimited access
  IF user_sub.plan_type = 'premium' AND user_sub.status IN ('active', 'trialing') THEN
    -- Check if trial is still valid
    IF user_sub.is_trialing AND user_sub.trial_ends_at > now() THEN
      RETURN true;
    ELSIF NOT user_sub.is_trialing THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Basic users are limited to 50 transactions
  IF user_sub.plan_type = 'basic' AND user_sub.transaction_count < 50 THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start premium trial
CREATE OR REPLACE FUNCTION start_premium_trial(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    plan_type = 'premium',
    status = 'trialing',
    is_trialing = true,
    trial_ends_at = now() + INTERVAL '30 days',
    start_date = now(),
    updated_at = now()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate premium subscription (after successful payment)
CREATE OR REPLACE FUNCTION activate_premium_subscription(
  user_uuid uuid,
  stripe_sub_id text,
  stripe_cust_id text,
  billing_interval text DEFAULT 'month',
  coupon_code text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    plan_type = 'premium',
    status = 'active',
    is_trialing = false,
    trial_ends_at = NULL,
    stripe_subscription_id = stripe_sub_id,
    stripe_customer_id = stripe_cust_id,
    billing_interval = activate_premium_subscription.billing_interval,
    coupon_code = activate_premium_subscription.coupon_code,
    grace_period_ends_at = NULL,
    updated_at = now()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle failed payments (start grace period)
CREATE OR REPLACE FUNCTION handle_failed_payment(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    status = 'past_due',
    grace_period_ends_at = now() + INTERVAL '3 days',
    updated_at = now()
  WHERE user_id = user_uuid AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grandfather existing premium users
CREATE OR REPLACE FUNCTION grandfather_existing_premium_users()
RETURNS void AS $$
BEGIN
  -- Mark all existing premium users as grandfathered
  UPDATE subscriptions 
  SET 
    is_grandfathered = true,
    updated_at = now()
  WHERE plan_type = 'premium' AND stripe_subscription_id IS NULL;
  
  RAISE NOTICE 'Grandfathered % existing premium users', 
    (SELECT COUNT(*) FROM subscriptions WHERE is_grandfathered = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the grandfathering function
SELECT grandfather_existing_premium_users();