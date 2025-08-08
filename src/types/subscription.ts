export type PlanType = 'basic' | 'premium';

export interface SubscriptionPlan {
  type: PlanType;
  name: string;
  price: number;
  features: string[];
  holdingsLimit: number | null; // null means unlimited
  hasQuickView: boolean;
  hasAdvanced: boolean;
  hasRealTimeData: boolean;
  exportFormats: ('csv' | 'pdf' | 'excel' | 'json')[];
  hasAdvancedCharts: boolean;
  supportType: 'email' | 'priority';
}

export interface UserSubscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
  startDate: string;
  endDate?: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  trialEndsAt?: string;
  isTrialing: boolean;
  isGrandfathered: boolean; // For existing database-activated users
  transactionCount: number; // Track transaction usage
  gracePeriodEndsAt?: string; // For failed payments
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  paymentDate: string;
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  basic: {
    type: 'basic',
    name: 'Basic',
    price: 0,
    features: [
      'Up to 50 transactions',
      'Basic portfolio tracking',
      'Export to CSV',
      'Email support'
    ],
    holdingsLimit: null, // No holdings limit, just transaction limit
    hasQuickView: false,
    hasAdvanced: false,
    hasRealTimeData: false,
    exportFormats: ['csv'],
    hasAdvancedCharts: false,
    supportType: 'email'
  },
  premium: {
    type: 'premium',
    name: 'Premium',
    price: 9.99,
    features: [
      'Unlimited transactions',
      'Advanced financial ratios',
      'QuickView & Advanced buttons',
      'Real-time market data',
      'Export to CSV, PDF, Excel, JSON',
      'Advanced charts & analytics',
      'All Performance tab features',
      'Priority support',
      '30-day free trial'
    ],
    holdingsLimit: null,
    hasQuickView: true,
    hasAdvanced: true,
    hasRealTimeData: true,
    exportFormats: ['csv', 'pdf', 'excel', 'json'],
    hasAdvancedCharts: true,
    supportType: 'priority'
  }
};