import React, { useState, useEffect, Suspense } from 'react';
import { User, Settings, CreditCard, Receipt, X, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuthSimple';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../types/subscription';

// Lazy load Stripe checkout
const StripeCheckout = React.lazy(() => import('./StripeCheckout'));

interface MyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'subscription' | 'billing' | 'payment-history';

export const MyAccountModal: React.FC<MyAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const { subscription, currentPlan, upgradeToPremium, cancelSubscription, reactivateSubscription, handleSuccessfulPayment, openBillingPortal, getSubscriptionDetails, activatePremium } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load subscription details when billing tab is active
  useEffect(() => {
    if (activeTab === 'billing' || activeTab === 'payment-history') {
      loadSubscriptionDetails();
    }
  }, [activeTab]);

  const loadSubscriptionDetails = async () => {
    try {
      const details = await getSubscriptionDetails();
      setSubscriptionDetails(details);
    } catch (error) {
      console.error('Failed to load subscription details:', error);
    }
  };

  if (!isOpen) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (profileData.newPassword && profileData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Prepare updates object
      const updates: { email?: string; password?: string } = {};
      
      // Only include email if it's different from current
      if (profileData.email !== user?.email) {
        updates.email = profileData.email;
      }
      
      // Only include password if provided
      if (profileData.newPassword) {
        updates.password = profileData.newPassword;
      }

      // If no updates, show message
      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'success', text: 'No changes to update' });
        return;
      }

      // Call the updateUserProfile function
      const { error } = await updateUserProfile(updates);
      
      if (error) {
        throw error;
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setProfileData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (action: 'upgrade' | 'cancel' | 'reactivate') => {
    setLoading(true);
    setMessage(null);

    try {
      switch (action) {
        case 'upgrade':
          const shouldOpenCheckout = await upgradeToPremium();
          if (shouldOpenCheckout) {
            setShowStripeCheckout(true);
            setMessage({ type: 'success', text: 'Opening Stripe checkout...' });
          }
          break;
        case 'cancel':
          await cancelSubscription();
          setMessage({ type: 'success', text: 'Subscription will be cancelled at the end of the billing period' });
          break;
        case 'reactivate':
          await reactivateSubscription();
          setMessage({ type: 'success', text: 'Subscription reactivated successfully' });
          break;
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Operation failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = (paymentData: any) => {
    setShowStripeCheckout(false);
    handleSuccessfulPayment(paymentData);
    setMessage({ type: 'success', text: '🎉 Successfully upgraded to Premium! Welcome to Portfolio Pro!' });
  };

  const handleStripeError = (error: any) => {
    setShowStripeCheckout(false);
    setMessage({ type: 'error', text: `Payment failed: ${error.message}` });
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'subscription' as TabType, label: 'Subscription', icon: Settings },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
    { id: 'payment-history' as TabType, label: 'Payment History', icon: Receipt }
  ];


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">My Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900/30 border-r border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                  : 'bg-red-600/20 border border-red-500/30 text-red-300'
              }`}>
                {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span>{message.text}</span>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Subscription Details</h3>
                
                {/* Current Plan */}
                <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Current Plan</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      currentPlan.type === 'premium'
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'bg-gray-600/20 text-gray-300'
                    }`}>
                      {currentPlan.name}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    ${currentPlan.price}/month {currentPlan.price === 0 && '(Free)'}
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>


                {/* Plan Actions */}
                <div className="space-y-4">
                  {currentPlan.type === 'basic' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => handlePlanChange('upgrade')}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
                      >
                        {loading ? 'Processing...' : 'Upgrade to Premium - $9.99/month'}
                      </button>
                      
                      {/* Temporary: Restore Premium Status */}
                      <button
                        onClick={() => {
                          console.log('🔧 Restore Premium button clicked');
                          const success = activatePremium();
                          if (success) {
                            setMessage({ type: 'success', text: 'Premium status restored! Refreshing...' });
                            // Force page reload to ensure UI updates
                            setTimeout(() => {
                              window.location.reload();
                            }, 1500);
                          } else {
                            setMessage({ type: 'error', text: 'Failed to restore premium status' });
                          }
                          setTimeout(() => setMessage(null), 3000);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        🔧 Restore Premium (Debug)
                      </button>
                    </div>
                  )}
                  
                  {currentPlan.type === 'premium' && (
                    <div className="space-y-2">
                      {subscription?.cancelAtPeriodEnd ? (
                        <div>
                          <p className="text-yellow-400 text-sm mb-2">
                            Your subscription will be cancelled at the end of the billing period.
                          </p>
                          <button
                            onClick={() => handlePlanChange('reactivate')}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            {loading ? 'Processing...' : 'Reactivate Subscription'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePlanChange('cancel')}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {loading ? 'Processing...' : 'Cancel Premium Subscription'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Plan Comparison */}
                <div className="mt-8">
                  <h4 className="text-white font-medium mb-4">Plan Comparison</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                      <div key={plan.type} className={`border rounded-lg p-4 ${
                        plan.type === currentPlan.type
                          ? 'border-blue-500 bg-blue-600/10'
                          : 'border-gray-600 bg-gray-700/20'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">{plan.name}</h5>
                          {plan.type === currentPlan.type && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Current</span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          ${plan.price}/month {plan.price === 0 && '(Free)'}
                        </p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Check className="h-3 w-3 text-green-400" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-gray-500">+{plan.features.length - 3} more features</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Payment Method</h4>
                    {currentPlan.type === 'basic' ? (
                      <p className="text-gray-300 text-sm">
                        No payment method required for Basic plan
                      </p>
                    ) : subscription?.stripeCustomerId ? (
                      <div>
                        <p className="text-gray-300 text-sm mb-3">
                          Payment methods are securely managed through Stripe
                        </p>
                        <button 
                          onClick={openBillingPortal}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Manage Payment Methods
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-400 text-sm mb-3">
                          No payment method on file. Payment method will be added when you upgrade to Premium.
                        </p>
                        <button
                          onClick={() => setActiveTab('subscription')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Upgrade to Premium
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Next Billing Date</h4>
                    <p className="text-gray-300 text-sm">
                      {currentPlan.type === 'basic' 
                        ? 'No billing for Basic plan'
                        : subscription?.cancelAtPeriodEnd 
                          ? 'Subscription will end at current period'
                          : subscriptionDetails?.subscription?.currentPeriodEnd 
                            ? `Next billing date: ${new Date(subscriptionDetails.subscription.currentPeriodEnd * 1000).toLocaleDateString()}`
                            : 'Next billing date: Loading...'
                      }
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Billing Portal</h4>
                    {currentPlan.type === 'premium' && subscription?.stripeCustomerId ? (
                      <div>
                        <p className="text-gray-300 text-sm mb-3">
                          Access your complete billing history, download invoices, and manage your subscription
                        </p>
                        <button 
                          onClick={openBillingPortal}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Open Billing Portal
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Billing portal will be available after you upgrade to Premium and complete your first payment.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment-history' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                {subscriptionDetails?.invoices?.length > 0 ? (
                  <div className="space-y-3">
                    {subscriptionDetails.invoices.map((invoice: any) => (
                      <div key={invoice.id} className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-500' : 
                              invoice.status === 'open' ? 'bg-yellow-500' : 
                              invoice.status === 'draft' ? 'bg-gray-500' :
                              'bg-red-500'
                            }`}></div>
                            <span className="text-white font-medium">
                              ${(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase() || 'USD'}
                            </span>
                            <span className="text-gray-400 text-sm capitalize">
                              {invoice.status === 'paid' ? 'Paid' : 
                               invoice.status === 'open' ? 'Pending' : 
                               invoice.status}
                            </span>
                            {invoice.amountPaid > 0 && invoice.amountPaid !== invoice.amount && (
                              <span className="text-green-400 text-xs">
                                (Paid: ${(invoice.amountPaid / 100).toFixed(2)})
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mt-1">
                            {new Date(invoice.created * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {invoice.hostedInvoiceUrl && (
                            <button
                              onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              View
                            </button>
                          )}
                          {invoice.invoicePdf && (
                            <button
                              onClick={() => window.open(invoice.invoicePdf, '_blank')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Download PDF
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700/30 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium mb-2">No Payment History</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      {currentPlan.type === 'basic' 
                        ? 'You are currently on the free Basic plan. No payments required.'
                        : 'No payment records found. Payment history will appear here after your first transaction.'
                      }
                    </p>
                    {currentPlan.type === 'basic' && (
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Upgrade to Premium
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {showStripeCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-600/30 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
              <button
                onClick={() => setShowStripeCheckout(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl border border-red-500/30 text-sm font-medium backdrop-blur-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-300">Loading checkout...</span>
                </div>
              }>
                <StripeCheckout
                  planId="premium"
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};