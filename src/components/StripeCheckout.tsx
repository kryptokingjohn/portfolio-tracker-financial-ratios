import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { stripeConfig } from '../config/stripe';

// Initialize Stripe
const stripePromise = loadStripe(stripeConfig.publishableKey);

interface StripeCheckoutProps {
  planId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<StripeCheckoutProps> = ({ planId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // In a real app, you'd call your backend to create a Stripe checkout session
      // For now, we'll simulate the checkout process
      
      const plan = stripeConfig.plans[planId as keyof typeof stripeConfig.plans];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll just show success
      // In production, you'd redirect to Stripe Checkout or use Stripe Elements
      console.log(`Processing payment for ${plan.name} - ${plan.priceId}`);
      
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const plan = stripeConfig.plans[planId as keyof typeof stripeConfig.plans];
  if (!plan) {
    return <div className="text-red-400">Invalid plan selected</div>;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Complete Your Subscription</h3>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">{plan.name}</span>
          <span className="text-white font-semibold">${plan.price}/{plan.interval}</span>
        </div>
        <div className="text-sm text-gray-400">
          You'll be charged ${plan.price} every {plan.interval}. Cancel anytime.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Demo form - in production, use Stripe Elements for card input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Information (Demo)
          </label>
          <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">
              This is a demo. In production, Stripe Elements would render here.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Card input, security, and processing handled by Stripe
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
          } text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Subscribe to ${plan.name}`
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Secured by Stripe. Your payment information is encrypted and secure.
      </div>
    </div>
  );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};