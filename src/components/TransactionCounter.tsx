import React from 'react';
import { Activity, Crown } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface TransactionCounterProps {
  onUpgradeClick: () => void;
}

export const TransactionCounter: React.FC<TransactionCounterProps> = ({ onUpgradeClick }) => {
  const { subscription, isTrialActive, getTrialDaysRemaining } = useSubscription();

  if (!subscription) return null;

  // Don't show counter for premium users or grandfathered users
  if (subscription.isGrandfathered || 
      (subscription.planType === 'premium' && subscription.status === 'active') ||
      (subscription.isTrialing && isTrialActive())) {
    
    // Show trial status for trialing users
    if (subscription.isTrialing && isTrialActive()) {
      const daysRemaining = getTrialDaysRemaining();
      return (
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <Crown className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            Premium Trial: {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
          </span>
        </div>
      );
    }
    
    return null;
  }

  // Basic users - show transaction counter
  const remaining = Math.max(0, 50 - subscription.transactionCount);
  const percentage = (subscription.transactionCount / 50) * 100;
  
  // Color scheme based on usage
  let colorClasses = 'from-green-50 to-emerald-50 border-green-200';
  let textColor = 'text-green-700';
  let iconColor = 'text-green-600';
  
  if (remaining <= 10) {
    colorClasses = 'from-orange-50 to-yellow-50 border-orange-200';
    textColor = 'text-orange-700';
    iconColor = 'text-orange-600';
  }
  
  if (remaining <= 5) {
    colorClasses = 'from-red-50 to-rose-50 border-red-200';
    textColor = 'text-red-700';
    iconColor = 'text-red-600';
  }

  return (
    <div className={`flex items-center justify-between space-x-3 px-4 py-3 bg-gradient-to-r ${colorClasses} border rounded-lg`}>
      <div className="flex items-center space-x-2">
        <Activity className={`h-4 w-4 ${iconColor}`} />
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${textColor}`}>
            {remaining} transaction{remaining !== 1 ? 's' : ''} remaining
          </span>
          <span className="text-xs text-gray-600">
            {subscription.transactionCount}/50 used
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Progress bar */}
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              remaining <= 5 ? 'bg-red-500' : 
              remaining <= 10 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {remaining <= 10 && (
          <button
            onClick={onUpgradeClick}
            className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
};