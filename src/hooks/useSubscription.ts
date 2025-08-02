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
          console.log('Loaded subscription from localStorage:', parsedSubscription.planType);
          return;
        } catch (error) {
          console.warn('Failed to parse stored subscription, using default');
        }
      }
      
      // For now, default new users to basic plan
      const defaultSubscription: UserSubscription = {
        id: `sub-${user.id}`,
        userId: user.id,
        planType: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage for persistence
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
      console.log('Initiating premium upgrade - opening Stripe checkout...');
      
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
      console.log('Processing successful payment:', paymentData);
      
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
        setSubscription(updatedSubscription);
        
        console.log('User upgraded to Premium plan');
        
        // TODO: Save to database
        // await saveSubscriptionToDatabase(updatedSubscription);
      }
    } catch (err) {
      console.error('Error processing successful payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
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
    canExportFormat,
    getHoldingsLimitMessage,
    upgradeToPremium,
    cancelSubscription,
    reactivateSubscription,
    handleSuccessfulPayment,
    reload: loadSubscriptionData
  };
};