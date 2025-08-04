import { useState, useEffect } from 'react';
import { UserSubscription, PlanType, SUBSCRIPTION_PLANS } from '../types/subscription';
import { useAuth } from './useAuthSimple';
import { supabase } from '../lib/supabase';

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

      if (!user) {
        setLoading(false);
        return;
      }

      console.log('🔄 Loading subscription from database for user:', user.id);

      // Load subscription from database using existing subscriptions table
      console.log('🔍 Querying subscriptions table for user:', user.id);
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('📊 Subscription query result:', { data: subscriptionData, error: subscriptionError });

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        // PGRST116 is "not found" - we'll handle that below
        console.error('Database subscription error:', subscriptionError);
        throw subscriptionError;
      }

      if (subscriptionData) {
        // Convert database format to app format
        const subscription: UserSubscription = {
          id: subscriptionData.id,
          userId: subscriptionData.user_id,
          planType: subscriptionData.plan_type,
          status: subscriptionData.status,
          startDate: subscriptionData.start_date,
          endDate: subscriptionData.end_date,
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          stripeSubscriptionId: subscriptionData.stripe_subscription_id,
          stripeCustomerId: subscriptionData.stripe_customer_id,
          createdAt: subscriptionData.created_at,
          updatedAt: subscriptionData.updated_at
        };

        console.log('✅ Subscription loaded from database:', subscription);
        setSubscription(subscription);
        return;
      }

      // No subscription found - create a basic one
      console.log('🆕 No subscription found, creating basic subscription');
      
      const newSubscription = {
        user_id: user.id,
        plan_type: 'basic' as const,
        status: 'active' as const,
        start_date: new Date().toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into subscriptions table
      console.log('📝 Creating new subscription in database for user:', user.id);
      const { data: createdSubscription, error: createError } = await supabase
        .from('subscriptions')
        .insert(newSubscription)
        .select()
        .single();
      
      console.log('📊 Subscription creation result:', { data: createdSubscription, error: createError });

      if (createError) {
        console.error('Failed to create subscription:', createError);
        throw createError;
      }

      // Convert to app format
      const subscription: UserSubscription = {
        id: createdSubscription.id,
        userId: createdSubscription.user_id,
        planType: createdSubscription.plan_type,
        status: createdSubscription.status,
        startDate: createdSubscription.start_date,
        cancelAtPeriodEnd: createdSubscription.cancel_at_period_end,
        createdAt: createdSubscription.created_at,
        updatedAt: createdSubscription.updated_at
      };

      console.log('✅ Basic subscription created:', subscription);
      setSubscription(subscription);

    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      
      // Fallback to basic subscription if database fails
      const fallbackSubscription: UserSubscription = {
        id: `fallback-${user?.id}`,
        userId: user?.id || '',
        planType: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSubscription(fallbackSubscription);
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
      if (!user) {
        console.error('❌ No user found for payment processing');
        return;
      }

      console.log('💳 Processing successful payment for user:', user.id);
      
      // Update subscription in database with Stripe payment data
      const subscriptionUpdate = {
        user_id: user.id,
        plan_type: 'premium',
        status: 'active',
        start_date: new Date().toISOString(),
        cancel_at_period_end: false,
        stripe_subscription_id: paymentData.subscriptionId,
        stripe_customer_id: paymentData.customerId,
        updated_at: new Date().toISOString()
      };
      
      // Update subscription in subscriptions table
      console.log('💳 Saving payment data to subscriptions table:', subscriptionUpdate);
      const { data: updatedSubscription, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionUpdate, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      console.log('📊 Payment save result:', { data: updatedSubscription, error });

      if (error) {
        console.error('❌ Failed to save payment to database:', error);
        throw error;
      }

      console.log('✅ Payment saved to database successfully');
      
      // Reload subscription data from database to ensure UI is in sync
      await loadSubscriptionData();
      
    } catch (err) {
      console.error('Error processing successful payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    }
  };

  // Manual premium activation - saves to database
  const activatePremium = async () => {
    console.log('🚀 activatePremium called');
    
    if (!user) {
      console.error('❌ No user logged in');
      console.log('🔍 User object:', user);
      return false;
    }

    console.log('✅ User authenticated:', { 
      id: user.id, 
      email: user.email,
      user_metadata: user.user_metadata 
    });

    try {
      console.log('🔧 Activating premium in database for user:', user.id);
      
      // Update subscription in database - try subscriptions table first
      let updatedSubscription;
      let error;
      
      const subscriptionUpdate = {
        user_id: user.id,
        plan_type: 'premium',
        status: 'active',
        start_date: new Date().toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      };
      
      // Update subscription in subscriptions table
      console.log('🔧 Activating premium in subscriptions table:', subscriptionUpdate);
      console.log('🔍 Supabase client auth status:', await supabase.auth.getUser());
      
      const { data: updatedSubscription, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionUpdate, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      console.log('📊 Premium activation result:', { data: updatedSubscription, error });
      
      if (error) {
        console.log('🔍 Detailed error info:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }

      if (error) {
        console.error('❌ Failed to activate premium in database:', error);
        return false;
      }

      console.log('✅ Premium activated in database!', updatedSubscription);
      
      // Reload subscription data from database
      await loadSubscriptionData();
      
      return true;
    } catch (error) {
      console.error('❌ Error activating premium:', error);
      return false;
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