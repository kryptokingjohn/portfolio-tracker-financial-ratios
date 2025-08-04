-- Update existing subscriptions table for premium status tracking
-- This works with whatever subscriptions table structure already exists

-- Check if subscriptions table exists and add missing columns
DO $$
BEGIN
  -- Check if subscriptions table exists, if not create user_subscriptions
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    -- Create user_subscriptions table if no subscriptions table exists
    CREATE TABLE user_subscriptions (
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
    
    -- Create indexes
    CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
    CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
    
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
      
  ELSE
    -- subscriptions table exists, add missing columns if needed
    
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id') THEN
      ALTER TABLE subscriptions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add plan_type column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_type') THEN
      ALTER TABLE subscriptions ADD COLUMN plan_type text CHECK (plan_type IN ('basic', 'premium')) DEFAULT 'basic';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'status') THEN
      ALTER TABLE subscriptions ADD COLUMN status text CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')) DEFAULT 'active';
    END IF;
    
    -- Add cancel_at_period_end column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end') THEN
      ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end boolean DEFAULT false;
    END IF;
    
    -- Add start_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'start_date') THEN
      ALTER TABLE subscriptions ADD COLUMN start_date timestamptz DEFAULT now();
    END IF;
    
    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'end_date') THEN
      ALTER TABLE subscriptions ADD COLUMN end_date timestamptz;
    END IF;
    
    -- Ensure RLS is enabled
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    
    -- Create or replace RLS policies
    DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
    CREATE POLICY "Users can read own subscription" ON subscriptions 
      FOR SELECT TO authenticated 
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
    CREATE POLICY "Users can insert own subscription" ON subscriptions 
      FOR INSERT TO authenticated 
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
    CREATE POLICY "Users can update own subscription" ON subscriptions 
      FOR UPDATE TO authenticated 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    -- Create index on user_id if it doesn't exist
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
  END IF;
END $$;

-- Function to automatically create basic subscription for new users
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS trigger AS $$
DECLARE
  table_name text;
BEGIN
  -- Determine which table to use
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    table_name := 'subscriptions';
  ELSE
    table_name := 'user_subscriptions';
  END IF;
  
  -- Insert into the appropriate table
  IF table_name = 'subscriptions' THEN
    INSERT INTO subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'basic', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO user_subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'basic', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user subscriptions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_subscription();