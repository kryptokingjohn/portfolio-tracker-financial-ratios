import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { email?: string; password?: string }) => Promise<{ error: any }>;
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
  const [loading, setLoading] = useState(true); // Start with loading to check for existing session
  const [sessionTimeoutId, setSessionTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Function to handle session timeout (5 minutes)
  const startSessionTimeout = () => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      console.log('Session timeout after 5 minutes - signing out');
      signOut();
    }, 5 * 60 * 1000); // 5 minutes
    
    setSessionTimeoutId(timeoutId);
  };

  // Function to clear session timeout
  const clearSessionTimeout = () => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          startSessionTimeout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session) {
          startSessionTimeout();
        } else {
          clearSessionTimeout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearSessionTimeout();
    };
  }, []);

  useEffect(() => {
    console.log('Auth initialization - login screen shows immediately');

    // Listen for auth state changes only
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated - starting 5-minute session timeout');
          startSessionTimeout();
        } else {
          console.log('User signed out - clearing session timeout');
          clearSessionTimeout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearSessionTimeout();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Add timeout for Supabase requests (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      
      const { error } = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      return { error };
    } catch (err: any) {
      console.warn('Sign in failed:', err.message);
      if (err.message === 'Connection timeout' || err.message?.includes('ERR_TIMED_OUT')) {
        return { error: { message: 'Connection timeout. You can continue in demo mode.' } };
      }
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Add timeout for Supabase requests (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      const signUpPromise = supabase.auth.signUp({ email, password });
      
      const { error } = await Promise.race([signUpPromise, timeoutPromise]) as any;
      
      return { error };
    } catch (err: any) {
      console.warn('Sign up failed:', err.message);
      if (err.message === 'Connection timeout' || err.message?.includes('ERR_TIMED_OUT')) {
        return { error: { message: 'Connection timeout. You can continue in demo mode.' } };
      }
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    clearSessionTimeout();
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (updates: { email?: string; password?: string }) => {
    try {
      setLoading(true);

      // Update email if provided
      if (updates.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: updates.email });
        if (emailError) return { error: emailError };
      }

      // Update password if provided
      if (updates.password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: updates.password });
        if (passwordError) return { error: passwordError };
      }

      return { error: null };
    } catch (err: any) {
      console.warn('Profile update failed:', err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};