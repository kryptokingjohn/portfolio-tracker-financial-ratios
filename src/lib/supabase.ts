import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase configuration:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not set',
  hasKey: !!supabaseAnonKey,
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'Not set'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  console.log('App will run in demo mode with sample data.');
} else {
  console.log('Supabase configuration found, attempting connection...');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('account_types')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Database connection test successful');
    return { success: true, data };
  } catch (error) {
    console.error('Database connection test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Test authentication
export const testAuthentication = async () => {
  try {
    console.log('Testing authentication...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Authentication test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Authentication test successful, session:', !!session);
    return { success: true, session };
  } catch (error) {
    console.error('Authentication test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};