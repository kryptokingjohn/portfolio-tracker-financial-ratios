import React, { useState } from 'react';
import { X, Check, Crown, Zap, Building2 } from 'lucide-react';
import { stripeConfig, formatPrice } from '../config/stripe';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  if (!isOpen) return null;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Zap className="h-6 w-6 text-green-400" />;
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-400" />;
      case 'enterprise':
        return <Building2 className="h-6 w-6 text-blue-400" />;
      default:
        return <Zap className="h-6 w-6 text-green-400" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'border-green-500/30 bg-green-600/10';
      case 'pro':
        return 'border-purple-500/30 bg-purple-600/10';
      case 'enterprise':
        return 'border-blue-500/30 bg-blue-600/10';
      default:
        return 'border-green-500/30 bg-green-600/10';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-[9999] backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] my-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-600/30 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl border border-red-500/30 text-sm font-medium backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-12">
            <h3 className="text-xl text-gray-300 mb-4">
              Unlock the full potential of your portfolio tracking
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose the plan that best fits your investment needs. All plans come with a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(stripeConfig.plans).map(([planId, plan]) => (
              <div
                key={planId}
                className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-purple-500/50 bg-purple-600/20 ring-2 ring-purple-500/30' 
                    : getPlanColor(planId)
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="mb-4 flex justify-center">
                    <div className={`p-3 rounded-full ${getPlanColor(planId)} border border-current/30`}>
                      {getPlanIcon(planId)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{formatPrice(plan.price)}</span>
                    <span className="text-gray-400">/{plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(planId)}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                      : planId === 'basic'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              All plans include SSL security, regular backups, and 99.9% uptime guarantee.
              <br />
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};