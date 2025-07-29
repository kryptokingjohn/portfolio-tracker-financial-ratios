// Stripe configuration
export const stripeConfig = {
  // Use your publishable key here (starts with pk_test_ or pk_live_)
  publishableKey: 'pk_live_51RqCR0Ps18njWuYee4uw1W8MPygaXoovMOHvjOjeGJhWyECgT5fWrZroJH0zX3bCcB4Jq24LupESvz1ZvPmphYjp00ZGBnSEAr', // Replace with your actual key
  
  // Subscription plans
  plans: {
    basic: {
      name: 'Basic Plan',
      price: 9.99,
      priceId: 'price_basic_monthly', // Replace with your actual price ID
      interval: 'month',
      features: [
        'Up to 25 holdings',
        'Basic financial ratios',
        'Portfolio performance tracking',
        'Export to CSV',
        'Email support'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: 19.99,
      priceId: 'price_pro_monthly', // Replace with your actual price ID
      interval: 'month',
      features: [
        'Unlimited holdings',
        'Advanced financial analysis',
        'Real-time market data',
        'Export to PDF, Excel, JSON',
        'Advanced charts & analytics',
        'Priority support',
        'Custom alerts'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: 49.99,
      priceId: 'price_enterprise_monthly', // Replace with your actual price ID
      interval: 'month',
      features: [
        'Everything in Pro',
        'Multi-portfolio management',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'White-label options'
      ]
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