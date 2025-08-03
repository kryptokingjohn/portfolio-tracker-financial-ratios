import { useState, useEffect } from 'react';
import { UserSubscription, PlanType, SUBSCRIPTION_PLANS } from '../types/subscription';
import { useAuth } from './useAuthSimple';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscription data
  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For authenticated users, check for existing subscription or default to basic
      if (!user) {
        setLoading(false);
        return;
      }

      // TODO: Replace with actual database call
      // const subscriptionData = await DatabaseService.getUserSubscription(user.id);
      
      // Temporary: Check localStorage for subscription state (for testing Premium features)
      const storedSubscription = localStorage.getItem(`subscription_${user.id}`);
      if (storedSubscription) {
        try {
          const parsedSubscription = JSON.parse(storedSubscription);
          setSubscription(parsedSubscription);
          return;
        } catch (error) {
          console.warn('Failed to parse stored subscription, using default');
        }
      }
      
      // Check if this is a returning user with a premium account
      // Look for any indication of premium status before defaulting to basic
      const hasStripeData = localStorage.getItem('stripe_payment_success') || 
                           localStorage.getItem('premium_activated') ||
                           user.email?.includes('premium'); // Any other premium indicators
      
      const defaultSubscription: UserSubscription = {
        id: `sub-${user.id}`,
        userId: user.id,
        planType: hasStripeData ? 'premium' : 'basic', // Preserve premium if indicators exist
        status: 'active',
        startDate: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage for persistence (only if no existing subscription)
      localStorage.setItem(`subscription_${user.id}`, JSON.stringify(defaultSubscription));
      setSubscription(defaultSubscription);
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  // Get current plan details
  const getCurrentPlan = () => {
    if (!subscription) return SUBSCRIPTION_PLANS.basic;
    return SUBSCRIPTION_PLANS[subscription.planType];
  };

  // Check if user can add more holdings
  const canAddHolding = (currentHoldingsCount: number) => {
    const plan = getCurrentPlan();
    if (plan.holdingsLimit === null) return true; // Unlimited
    return currentHoldingsCount < plan.holdingsLimit;
  };

  // Check if user has access to QuickView
  const hasQuickViewAccess = () => {
    return getCurrentPlan().hasQuickView;
  };

  // Check if user has access to Advanced features
  const hasAdvancedAccess = () => {
    return getCurrentPlan().hasAdvanced;
  };

  // Check if user has access to real-time data
  const hasRealTimeAccess = () => {
    return getCurrentPlan().hasRealTimeData;
  };

  // Check if user has access to advanced charts
  const hasAdvancedChartsAccess = () => {
    return getCurrentPlan().hasAdvancedCharts;
  };

  // Check if user is on premium plan
  const isPremium = () => {
    return subscription?.planType === 'premium';
  };

  // Check if user can export in specific format
  const canExportFormat = (format: 'csv' | 'pdf' | 'excel' | 'json') => {
    return getCurrentPlan().exportFormats.includes(format);
  };

  // Get holdings limit message
  const getHoldingsLimitMessage = (currentCount: number) => {
    const plan = getCurrentPlan();
    if (plan.holdingsLimit === null) return null;
    
    const remaining = plan.holdingsLimit - currentCount;
    if (remaining <= 0) {
      return `You've reached your ${plan.holdingsLimit} holding limit. Upgrade to Premium for unlimited holdings.`;
    }
    if (remaining <= 2) {
      return `You have ${remaining} holding${remaining === 1 ? '' : 's'} remaining. Upgrade to Premium for unlimited holdings.`;
    }
    return null;
  };

  // Upgrade to premium - returns true if should open Stripe checkout
  const upgradeToPremium = async (): Promise<boolean> => {
    try {
      setError(null);
      
      // Return true to indicate that Stripe checkout should be opened
      return true;
    } catch (err) {
      console.error('Error starting premium upgrade:', err);
      setError(err instanceof Error ? err.message : 'Failed to start premium upgrade');
      return false;
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      setError(null);
      // TODO: Implement Stripe cancellation
      
      if (subscription) {
        const updatedSubscription: UserSubscription = {
          ...subscription,
          cancelAtPeriodEnd: true,
          updatedAt: new Date().toISOString()
        };
        setSubscription(updatedSubscription);
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    try {
      setError(null);
      // TODO: Implement Stripe reactivation
      
      if (subscription) {
        const updatedSubscription: UserSubscription = {
          ...subscription,
          cancelAtPeriodEnd: false,
          updatedAt: new Date().toISOString()
        };
        setSubscription(updatedSubscription);
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    }
  };

  // Handle successful payment from Stripe
  const handleSuccessfulPayment = async (paymentData: any) => {
    try {
      
      if (subscription && user) {
        const updatedSubscription: UserSubscription = {
          ...subscription,
          planType: 'premium',
          status: 'active',
          updatedAt: new Date().toISOString(),
          stripeSubscriptionId: paymentData.subscriptionId,
          stripeCustomerId: paymentData.customerId
        };
        
        // Save to localStorage for persistence (temporary solution)
        localStorage.setItem(`subscription_${user.id}`, JSON.stringify(updatedSubscription));
        localStorage.setItem('premium_activated', 'true'); // Additional marker
        setSubscription(updatedSubscription);
        
        
        // TODO: Save to database
        // await saveSubscriptionToDatabase(updatedSubscription);
      }
    } catch (err) {
      console.error('Error processing successful payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    }
  };

  // Manual premium activation (temporary debugging function)
  const activatePremium = () => {
    if (user) {
      const premiumSubscription: UserSubscription = {
        id: `sub-${user.id}`,
        userId: user.id,
        planType: 'premium',
        status: 'active',
        startDate: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`subscription_${user.id}`, JSON.stringify(premiumSubscription));
      localStorage.setItem('premium_activated', 'true');
      setSubscription(premiumSubscription);
      console.log('Premium activated manually');
    }
  };

  // Open Stripe Customer Portal
  const openBillingPortal = async () => {
    try {
      // Use direct Stripe Customer Portal link
      const portalUrl = 'https://billing.stripe.com/p/login/aFafZj5F20DhcOYdHZ0VO00';
      window.open(portalUrl, '_blank');
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    }
  };

  // Get detailed subscription information from Stripe
  const getSubscriptionDetails = async () => {
    try {
      if (!subscription?.stripeCustomerId) {
        return null;
      }

      const response = await fetch(`/.netlify/functions/get-subscription-details?customerId=${subscription.stripeCustomerId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get subscription details');
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting subscription details:', err);
      setError(err instanceof Error ? err.message : 'Failed to get subscription details');
      return null;
    }
  };


  return {
    subscription,
    currentPlan: getCurrentPlan(),
    loading,
    error,
    canAddHolding,
    hasQuickViewAccess,
    hasAdvancedAccess,
    hasRealTimeAccess,
    hasAdvancedChartsAccess,
    isPremium,
    canExportFormat,
    getHoldingsLimitMessage,
    upgradeToPremium,
    cancelSubscription,
    reactivateSubscription,
    handleSuccessfulPayment,
    openBillingPortal,
    getSubscriptionDetails,
    activatePremium, // Temporary function to restore premium status
    reload: loadSubscriptionData
  };
};