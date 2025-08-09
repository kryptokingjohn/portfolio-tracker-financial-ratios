import React, { useState } from 'react';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Shield from 'lucide-react/dist/esm/icons/shield';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import { useAuth } from '../../hooks/useAuthSimple';
import { validateEmail, validatePassword, authRateLimiter, sanitizeText } from '../../utils/security';

export const LoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const { signIn, signUp } = useAuth();

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (!password) return { score: 0, feedback: '' };
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthLabel = strengthLabels[Math.min(score, 4)];
    
    return {
      score,
      feedback: feedback.length > 0 ? `${strengthLabel}: ${feedback.join(', ')}` : `${strengthLabel} password!`
    };
  };

  // Update password strength when password changes
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    if (!isLogin) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage(null);
    setValidationErrors([]);

    // 🚨 Security: Rate limiting for authentication attempts
    const clientId = `auth_${email}_${navigator.userAgent.slice(0, 50)}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      setMessage({
        type: 'error',
        text: `Too many attempts. Please wait before trying again. (${authRateLimiter.getRemainingAttempts(clientId)} attempts remaining)`
      });
      setLoading(false);
      return;
    }

    // 🚨 Security: Sanitize inputs
    const sanitizedEmail = sanitizeText(email.trim().toLowerCase(), 254);
    
    // 🚨 Security: Validate inputs
    const errors: string[] = [];
    
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error!);
    }
    
    if (!isLogin) {
      // Signup validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        errors.push(passwordValidation.error!);
      }
      
      // Password confirmation check
      if (password !== confirmPassword) {
        errors.push('Passwords do not match');
      }
      
      // Password strength requirement
      const strength = checkPasswordStrength(password);
      if (strength.score < 3) {
        errors.push('Password is too weak. Please use a stronger password.');
      }
    } else {
      // For login, just check basic password requirements
      if (!password || password.length < 1) {
        errors.push('Password is required');
      }
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // 🚨 Security: Log authentication attempt for audit trail
      console.log(`🔒 Authentication attempt: ${isLogin ? 'Sign In' : 'Sign Up'} for ${sanitizedEmail}`);
      
      const { error } = isLogin 
        ? await signIn(sanitizedEmail, password)
        : await signUp(sanitizedEmail, password);

      if (error) {
        // Comprehensive error handling with specific user-friendly messages
        if (error.message.includes('Invalid login credentials')) {
          setMessage({ 
            type: 'error', 
            text: '❌ Invalid email or password. Please double-check your credentials and try again.' 
          });
        } else if (error.message.includes('Email not confirmed')) {
          setMessage({ 
            type: 'info', 
            text: '📧 Please check your email and click the confirmation link before signing in.' 
          });
        } else if (error.message.includes('User already registered')) {
          setMessage({ 
            type: 'error', 
            text: '⚠️ An account with this email already exists. Please sign in instead.' 
          });
        } else if (error.message.includes('Signup not allowed')) {
          setMessage({ 
            type: 'error', 
            text: '🚫 Account registration is currently disabled. Please contact support.' 
          });
        } else if (error.message.includes('Password should be at least')) {
          setMessage({ 
            type: 'error', 
            text: '🔒 Password must be at least 6 characters long.' 
          });
        } else if (error.message.includes('Unable to validate email address')) {
          setMessage({ 
            type: 'error', 
            text: '📧 Please enter a valid email address.' 
          });
        } else if (error.message.includes('Email rate limit exceeded')) {
          setMessage({ 
            type: 'error', 
            text: '⏳ Too many attempts. Please wait a few minutes before trying again.' 
          });
        } else if (error.message.includes('signups disabled')) {
          setMessage({ 
            type: 'error', 
            text: '🚫 New account registration is currently disabled.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: `❌ ${error.message}` 
          });
        }
      } else {
        // Success messages
        if (isLogin) {
          setMessage({ 
            type: 'success', 
            text: '✅ Login successful! Redirecting to your portfolio...' 
          });
          
          // Clear form on successful login
          setTimeout(() => {
            setEmail('');
            setPassword('');
          }, 1000);
        } else {
          setMessage({ 
            type: 'success', 
            text: '🎉 Account created successfully!\n\n📧 IMPORTANT: Please check your email inbox (and spam folder) for a confirmation link. You must click this link to activate your account before signing in.' 
          });
          
          // Clear form on successful signup
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setPasswordStrength({ score: 0, feedback: '' });
        }
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: '❌ An unexpected error occurred. Please try again or contact support if the problem persists.' 
      });
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
            <div className="bg-black p-3 rounded-xl">
              <img 
                src="/icon-96x96.png" 
                alt="Portfolio Tracker Logo" 
                className="h-12 w-12"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Portfolio Tracker with Financial Ratios</h2>
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
          {/* Form Header with Visual Distinction */}
          <div className="text-center mb-6">
            <h3 className={`text-xl font-semibold mb-2 ${
              isLogin ? 'text-blue-300' : 'text-green-300'
            }`}>
              {isLogin ? '🔑 Sign In to Your Account' : '🚀 Create New Account'}
            </h3>
            <p className="text-gray-400 text-sm">
              {isLogin 
                ? 'Welcome back! Access your portfolio dashboard.' 
                : 'Join thousands of investors tracking their portfolios.'
              }
            </p>
          </div>
          
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator for Signup */}
              {!isLogin && password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score <= 2 ? 'bg-orange-500' :
                          passwordStrength.score <= 3 ? 'bg-yellow-500' :
                          passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.score <= 1 ? 'text-red-300' :
                    passwordStrength.score <= 2 ? 'text-orange-300' :
                    passwordStrength.score <= 3 ? 'text-yellow-300' :
                    passwordStrength.score <= 4 ? 'text-blue-300' : 'text-green-300'
                  }`}>
                    {passwordStrength.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field for Signup */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2">
                    <p className={`text-xs flex items-center ${
                      password === confirmPassword ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm font-medium mb-2">Please fix the following errors:</p>
                <ul className="text-red-200 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {message && (
              <div className={`rounded-lg p-4 border ${
                message.type === 'error' 
                  ? 'bg-red-500/20 border-red-500/50 text-red-200' 
                  : message.type === 'success'
                  ? 'bg-green-500/20 border-green-500/50 text-green-200'
                  : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
              }`}>
                <div className="text-sm font-medium whitespace-pre-line">{message.text}</div>
                {message.type === 'success' && !isLogin && (
                  <div className="mt-3 pt-3 border-t border-green-500/30">
                    <p className="text-xs text-green-300">
                      💡 Tip: If you don't receive the email within 5 minutes, check your spam folder or try again.
                    </p>
                  </div>
                )}
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
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage(null);
                  setValidationErrors([]);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setPasswordStrength({ score: 0, feedback: '' });
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
          
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Secure • Private • Professional</p>
        </div>
      </div>
    </div>
  );
};
