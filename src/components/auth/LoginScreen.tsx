import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, TrendingUp, Shield, BarChart3, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuthSimple';

export const LoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, signUp, enterDemoMode, isDemoMode } = useAuth();

  // Check if we're in demo mode
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('demo') &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('demo') &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'demo_key' &&
    // Disable Supabase in StackBlitz environment
    !window.location.hostname.includes('stackblitz') &&
    !window.location.hostname.includes('webcontainer');

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setPasswordError('');

    // Validate password for sign up
    if (!isLogin && !validatePassword(password)) {
      setLoading(false);
      return;
    }

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(error.message);
        }
      } else if (!isLogin) {
        setError('Account created successfully! Please check your email for a confirmation link.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Portfolio Tracker w Financial Ratios</h2>
          <p className="mt-2 text-gray-300">
            Professional Portfolio Management with Comprehensive Financial Analytics
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Advanced Analytics</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Secure & Private</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <DollarSign className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Real-time Data</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Performance Tracking</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-yellow-200 text-sm">{passwordError}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
          
          {/* Demo Mode Option */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-3">Want to explore first?</p>
              <button
                onClick={enterDemoMode}
                className="w-full bg-yellow-600/80 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Demo Mode
              </button>
              <p className="text-gray-400 text-xs mt-2">
                Explore the app with sample portfolio data
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Secure • Private • Professional</p>
        </div>
      </div>
    </div>
  );
};