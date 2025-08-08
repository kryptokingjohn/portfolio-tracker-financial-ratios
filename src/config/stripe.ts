// Stripe configuration
export const stripeConfig = {
  // Use environment variable for publishable key - NEVER hardcode in source
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
  
  // Subscription plans - Basic (free) vs Premium (paid)
  plans: {
    basic: {
      name: 'Basic',
      price: 0,
      priceId: null, // Free plan
      interval: 'month',
      features: [
        'Up to 50 transactions',
        'Basic portfolio tracking',
        'Export to CSV',
        'Email support'
      ],
      transactionLimit: 50
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 9.99,
      annualPrice: 95.90, // 20% off annual
      monthlyPriceId: 'price_premium_monthly', // Replace with your actual price ID
      annualPriceId: 'price_premium_annual', // Replace with your actual price ID
      features: [
        'Unlimited transactions',
        'Advanced financial ratios',
        'Real-time market data',
        'QuickView & Advanced analysis',
        'Export to CSV, PDF, Excel, JSON',
        'Advanced charts & analytics',
        'All Performance tab features',
        'Priority support'
      ],
      popular: true,
      trialDays: 30
    }
  },
  
  // Discount coupons (to be created in Stripe dashboard)
  coupons: {
    SAVE50: {
      name: '50% Off First 3 Months',
      percentOff: 50,
      durationInMonths: 3,
      maxRedemptions: 20
    },
    SAVE25: {
      name: '25% Off First 3 Months', 
      percentOff: 25,
      durationInMonths: 3,
      maxRedemptions: 20
    },
    FREEYEAR: {
      name: '12 Months Free',
      percentOff: 100,
      durationInMonths: 12,
      maxRedemptions: 20
    },
    FREEMONTH: {
      name: '1 Month Free',
      percentOff: 100,
      durationInMonths: 1,
      maxRedemptions: 20
    }
  }
};

// Helper function to format currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};