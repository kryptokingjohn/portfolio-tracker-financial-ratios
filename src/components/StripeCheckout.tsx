import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface StripeCheckoutProps {
  planId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  planId, 
  onSuccess, 
  onError 
}) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Get Stripe publishable key from environment
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    return (
      <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-medium">Configuration Error</p>
          <p className="text-red-400 text-sm">
            Stripe publishable key not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate card details
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        throw new Error('Please fill in all card details');
      }

      // Basic card number validation
      const cleanCardNumber = cardDetails.number.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        throw new Error('Please enter a valid card number');
      }

      // Basic expiry validation
      const [month, year] = cardDetails.expiry.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        throw new Error('Please enter a valid expiry date (MM/YY)');
      }
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const cardYear = parseInt(year);
      const cardMonth = parseInt(month);
      
      if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
        throw new Error('Card has expired');
      }
      
      if (cardMonth < 1 || cardMonth > 12) {
        throw new Error('Please enter a valid month (01-12)');
      }

      // CVC validation
      if (cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
        throw new Error('Please enter a valid CVC');
      }

      // CRITICAL: This is a production system - do not process payments without real Stripe integration
      console.warn('🚨 PRODUCTION SECURITY ISSUE: Fake payment processing detected');
      console.log('Card Details Entered:', { 
        name: cardDetails.name,
        number: '**** **** **** ' + cleanCardNumber.slice(-4),
        expiry: cardDetails.expiry,
        cvc: '***'
      });

      // Instead of fake success, show an error that real Stripe integration is required
      throw new Error('Production payment processing not configured. Real Stripe integration required to process payments.');

      // TODO: Replace with real Stripe integration:
      // 1. Load Stripe.js and create payment method
      // 2. Send payment method to your backend API
      // 3. Create subscription via Stripe API on backend
      // 4. Handle 3D Secure authentication
      // 5. Only call onSuccess() after confirmed payment

    } catch (error) {
      console.error('Payment failed:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-6">
      {/* Production Warning */}
      <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-medium">Payment Processing Not Active</p>
          <p className="text-red-400 text-sm">
            This is a demo payment form. Real Stripe backend integration is required to process actual payments.
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-center space-x-3">
        <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-blue-300 font-medium">Secure Payment</p>
          <p className="text-blue-400 text-sm">
            When properly configured, your payment information will be encrypted and processed securely by Stripe.
          </p>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Premium Plan</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Monthly subscription</span>
          <span className="text-white font-semibold">$9.99/month</span>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          <p>✓ Unlimited holdings</p>
          <p>✓ Advanced financial analysis</p>
          <p>✓ All export formats</p>
          <p>✓ Priority support</p>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardDetails.name}
            onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={cardDetails.expiry}
              onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MM/YY"
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cardDetails.cvc}
              onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Demo Payment Form - Backend Required</span>
            </div>
          )}
        </button>
      </form>

      {/* Test Card Notice for Development */}
      {import.meta.env.DEV && (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 font-medium text-sm">Development Mode</p>
          <p className="text-yellow-400 text-xs mt-1">
            Use test card: 4242 4242 4242 4242, any future expiry, any CVC
          </p>
        </div>
      )}

      {/* Terms */}
      <p className="text-xs text-gray-400 text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy. 
        You can cancel anytime from your account settings.
      </p>
    </div>
  );
};

export default StripeCheckout;