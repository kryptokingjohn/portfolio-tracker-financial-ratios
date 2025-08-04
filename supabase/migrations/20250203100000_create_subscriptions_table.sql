-- Create subscriptions table for persistent premium status
-- This replaces the unreliable localStorage approach

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'premium')) DEFAULT 'basic',
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')) DEFAULT 'active',
  stripe_subscription_id text,
  stripe_customer_id text,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own subscription" ON user_subscriptions 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON user_subscriptions 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create basic subscription for new users
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'basic', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_subscription();

-- Insert premium subscription for current user (replace with your actual user ID)
-- You'll need to run this manually with your specific user ID
-- INSERT INTO user_subscriptions (user_id, plan_type, status, stripe_subscription_id) 
-- VALUES ('your-user-id-here', 'premium', 'active', 'stripe-sub-id')
-- ON CONFLICT (user_id) DO UPDATE SET 
--   plan_type = 'premium', 
--   status = 'active', 
--   updated_at = now();