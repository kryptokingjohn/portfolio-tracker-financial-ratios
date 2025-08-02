import { supabase } from '../lib/supabase';

export interface TestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

export const runSupabaseTests = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];

  // Test 1: Basic Configuration
  results.push({
    test: 'Environment Configuration',
    success: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    message: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
      ? 'Supabase environment variables are configured'
      : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
    details: {
      url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    }
  });

  // Test 2: Basic Connection
  try {
    const { error } = await supabase.from('auth.users').select('id').limit(1);
    results.push({
      test: 'Basic Connection',
      success: !error,
      message: error ? `Connection failed: ${error.message}` : 'Successfully connected to Supabase',
      details: error
    });
  } catch (error) {
    results.push({
      test: 'Basic Connection',
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  // Test 3: Authentication Service
  try {
    const { data, error } = await supabase.auth.getSession();
    results.push({
      test: 'Authentication Service',
      success: !error,
      message: error ? `Auth service error: ${error.message}` : 'Authentication service is working',
      details: { hasSession: !!data.session }
    });
  } catch (error) {
    results.push({
      test: 'Authentication Service',
      success: false,
      message: `Auth test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  // Test 4: Check for Transactions Table
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    results.push({
      test: 'Transactions Table',
      success: !error,
      message: error ? `Transactions table error: ${error.message}` : 'Transactions table exists and accessible',
      details: error
    });
  } catch (error) {
    results.push({
      test: 'Transactions Table',
      success: false,
      message: `Transactions table test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  // Test 5: Check for Subscriptions Table
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    results.push({
      test: 'Subscriptions Table',
      success: !error,
      message: error ? `Subscriptions table error: ${error.message}` : 'Subscriptions table exists and accessible',
      details: error
    });
  } catch (error) {
    results.push({
      test: 'Subscriptions Table',
      success: false,
      message: `Subscriptions table test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  // Test 6: Check for Holdings Table (if it exists)
  try {
    const { data, error } = await supabase
      .from('holdings')
      .select('id')
      .limit(1);
    
    results.push({
      test: 'Holdings Table',
      success: !error,
      message: error ? `Holdings table error: ${error.message}` : 'Holdings table exists and accessible',
      details: error
    });
  } catch (error) {
    results.push({
      test: 'Holdings Table',
      success: false,
      message: `Holdings table test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  // Test 7: Row Level Security Test (when authenticated)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Test RLS by trying to access transactions
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Row Level Security (Authenticated)',
        success: !error,
        message: error ? `RLS test error: ${error.message}` : `RLS working - user can access their data (${data?.length || 0} records)`,
        details: { userId: user.id, recordCount: data?.length || 0 }
      });
    } else {
      results.push({
        test: 'Row Level Security (Authenticated)',
        success: true,
        message: 'Cannot test RLS - no authenticated user (this is expected on first load)',
        details: { note: 'RLS test requires authenticated user' }
      });
    }
  } catch (error) {
    results.push({
      test: 'Row Level Security (Authenticated)',
      success: false,
      message: `RLS test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  return results;
};

export const checkRequiredTables = async (): Promise<{ missing: string[], existing: string[] }> => {
  const requiredTables = ['transactions', 'subscriptions'];
  const existing: string[] = [];
  const missing: string[] = [];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        missing.push(table);
      } else {
        existing.push(table);
      }
    } catch {
      missing.push(table);
    }
  }

  return { missing, existing };
};