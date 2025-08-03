import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

// Get Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripeCheckoutProps {
  planId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Secure checkout form component using Stripe Elements
const CheckoutForm: React.FC<StripeCheckoutProps> = ({ planId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== PAYMENT FORM SUBMISSION ===');
    console.log('Stripe loaded:', !!stripe);
    console.log('Elements loaded:', !!elements);
    console.log('Customer name:', customerName);
    
    if (!stripe || !elements) {
      const error = 'Stripe has not loaded yet. Please try again.';
      console.error(error);
      onError(error);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    console.log('Card element found:', !!cardElement);
    
    if (!cardElement) {
      const error = 'Card element not found. Please refresh and try again.';
      console.error(error);
      onError(error);
      return;
    }

    if (!customerName.trim()) {
      const error = 'Please enter your name.';
      console.error(error);
      onError(error);
      return;
    }

    setLoading(true);

    try {
      console.log('Creating payment method with Stripe Elements...');
      console.log('Customer name:', customerName.trim());
      console.log('Card element:', cardElement);
      
      // Create payment method using Stripe Elements (secure, PCI-compliant)
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerName.trim()
        }
      });

      if (paymentMethodError) {
        console.error('Stripe payment method error:', paymentMethodError);
        throw new Error(paymentMethodError.message || 'Failed to create payment method');
      }

      if (!paymentMethod) {
        console.error('No payment method returned from Stripe');
        throw new Error('Failed to create payment method');
      }

      console.log('Payment method created successfully:', paymentMethod.id);
      
      // Send only the secure payment method ID to our server
      const response = await fetch('/.netlify/functions/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentMethodId: paymentMethod.id,
          customerName: customerName.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment failed');
      }

      const result = await response.json();
      
      // Handle 3D Secure or other required actions
      if (result.requiresAction && result.paymentIntentClientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.paymentIntentClientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message || 'Payment confirmation failed');
        }
      }
      
      console.log('Subscription created successfully');
      onSuccess();

    } catch (error) {
      console.error('Payment failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Payment failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      }
      
      onError(errorMessage || 'Unknown payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-center space-x-3">
        <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-blue-300 font-medium">Secure Payment</p>
          <p className="text-blue-400 text-sm">
            Your payment information is encrypted and processed securely by Stripe. Card details never touch our servers.
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
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Card Information
          </label>
          <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                  complete: {
                    color: '#10b981',
                  },
                },
                hidePostalCode: true,
                disabled: false,
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Subscribe to Premium - $9.99/month</span>
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

// Main wrapper component with Stripe Elements provider
export const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  console.log('Stripe publishable key configured:', !!stripePublishableKey);
  console.log('Stripe promise:', !!stripePromise);
  
  if (!stripePromise) {
    console.error('Stripe publishable key missing:', stripePublishableKey);
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

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;