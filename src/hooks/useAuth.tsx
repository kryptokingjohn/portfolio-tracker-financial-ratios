import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, testDatabaseConnection, testAuthentication } from '../lib/supabase';
import { DatabaseService } from '../lib/database';

// Check if Supabase is properly configured - but don't auto-enable demo mode
const hasValidSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('demo') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('demo');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Start with false - always show login first
  const [demoMode, setDemoMode] = useState(false);
  const [sessionTimeoutId, setSessionTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Auth initialization:', {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      hasValidSupabaseConfig
    });

    // Always try to connect to Supabase if configured
    if (!hasValidSupabaseConfig) {
      console.log('Invalid Supabase configuration - showing login screen');
      setLoading(false);
      return;
    }

    console.log('Attempting Supabase connection and database tests...');
    
    // Force loading to false after a very short time to prevent infinite loading
    const forceLoadingStop = setTimeout(() => {
      console.log('Force stopping loading state to show login screen');
      setLoading(false);
    }, 2000); // 2 second failsafe
    
    // Test database connection first
    const initializeDatabase = async () => {
      try {
        // Test database connection
        const dbTest = await testDatabaseConnection();
        if (!dbTest.success) {
          console.error('Database connection failed:', dbTest.error);
          console.log('Database connection failed - showing login screen (user can still try to authenticate)');
          setLoading(false);
          return;
        }
        
        // Verify database schema
        const schemaTest = await DatabaseService.verifyDatabaseSchema();
        if (!schemaTest.success) {
          console.error('Database schema verification failed:', schemaTest.message);
          console.log('Schema details:', schemaTest.details);
          console.log('Schema verification failed - showing login screen (user can still try to authenticate)');
          setLoading(false);
          return;
        }
        
        // Test authentication
        const authTest = await testAuthentication();
        if (!authTest.success) {
          console.error('Authentication test failed:', authTest.error);
          // Continue anyway, user might need to log in
        }
        
        console.log('Database tests passed, proceeding with session retrieval...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval failed:', error);
          setLoading(false);
          return;
        }
        
        console.log('Session retrieved successfully:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Ensure user profile exists before setting loading to false
        if (session?.user) {
          console.log('User found, ensuring profile exists...');
          try {
            await DatabaseService.ensureUserProfile(session.user);
            console.log('User profile ensured, loading complete');
          } catch (profileError) {
            console.error('Error ensuring user profile:', profileError);
          }
        } else {
          console.log('No active session, loading complete');
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Database initialization failed:', error);
        console.log('Database initialization failed - showing login screen (user can still authenticate)');
        setLoading(false);
      }
    };
    
    // Try to get initial session with timeout
    const initTimeout = setTimeout(() => {
      console.warn('Database initialization timeout - showing login screen');
      setLoading(false); // Just stop loading, don't switch to demo mode
    }, 5000); // Reduced to 5 second timeout
    
    // Initialize database
    initializeDatabase().finally(() => {
      clearTimeout(initTimeout);
      clearTimeout(forceLoadingStop);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Ensure user profile exists before setting loading to false
        if (session?.user) {
          try {
            console.log('Auth change: ensuring user profile...');
            await DatabaseService.ensureUserProfile(session.user);
            setLoading(false);
          } catch (error) {
            console.error('Error ensuring user profile on auth change:', error);
            // Still set loading to false even if profile creation fails
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(forceLoadingStop);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data.user) {
        console.log('Sign in successful, ensuring user profile...');
        // Ensure user profile exists
        await DatabaseService.ensureUserProfile(data.user);
      }
      
      if (error) {
        console.error('Sign in error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Sign in failed:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        return { error };
      }
      
      if (data.user) {
        console.log('Sign up successful, creating user profile...');
        // Create user profile
        await DatabaseService.ensureUserProfile(data.user);
      }
      
      return { error: null };
    } catch (profileError) {
      console.error('Error during sign up:', profileError);
      return { error: profileError };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const enterDemoMode = () => {
    console.log('Entering demo mode manually');
    setDemoMode(true);
    setLoading(false);
  };

  return {
    user,
    session,
    loading,
    isDemoMode: demoMode,
    signIn,
    signUp,
    signOut,
    enterDemoMode,
  };
};

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};