import React, { useState } from 'react';
import { User, Settings, CreditCard, Receipt, X, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuthSimple';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../types/subscription';

interface MyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'subscription' | 'billing' | 'payment-history';

export const MyAccountModal: React.FC<MyAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const { subscription, currentPlan, upgradeToPremium, cancelSubscription, reactivateSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

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
          await upgradeToPremium();
          setMessage({ type: 'success', text: 'Successfully upgraded to Premium!' });
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

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'subscription' as TabType, label: 'Subscription', icon: Settings },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
    { id: 'payment-history' as TabType, label: 'Payment History', icon: Receipt }
  ];

  const mockPaymentHistory = [
    { id: '1', date: '2024-01-01', amount: 9.99, status: 'succeeded' as const, description: 'Premium Plan - Monthly' },
    { id: '2', date: '2023-12-01', amount: 9.99, status: 'succeeded' as const, description: 'Premium Plan - Monthly' },
    { id: '3', date: '2023-11-01', amount: 9.99, status: 'succeeded' as const, description: 'Premium Plan - Monthly' }
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
                    <button
                      onClick={() => handlePlanChange('upgrade')}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
                    >
                      {loading ? 'Processing...' : 'Upgrade to Premium - $9.99/month'}
                    </button>
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
                          {loading ? 'Processing...' : 'Cancel Subscription'}
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
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-300 mb-2">Payment Method</p>
                  <p className="text-gray-400 text-sm">
                    {currentPlan.type === 'basic' 
                      ? 'No payment method required for Basic plan'
                      : '•••• •••• •••• 4242 (Visa) - Expires 12/25'
                    }
                  </p>
                  {currentPlan.type === 'premium' && (
                    <button className="mt-3 text-blue-400 hover:text-blue-300 text-sm">
                      Update Payment Method
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payment-history' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                {currentPlan.type === 'basic' ? (
                  <p className="text-gray-400">No payment history for Basic plan</p>
                ) : (
                  <div className="space-y-3">
                    {mockPaymentHistory.map((payment) => (
                      <div key={payment.id} className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{payment.description}</p>
                          <p className="text-gray-400 text-sm">{payment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">${payment.amount}</p>
                          <p className={`text-xs ${
                            payment.status === 'succeeded' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {payment.status === 'succeeded' ? 'Paid' : 'Failed'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};