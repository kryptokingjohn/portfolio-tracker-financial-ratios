import React, { useState } from 'react';
import { InstallPrompt } from '../InstallPrompt';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';
import { MobilePortfolioCard } from './MobilePortfolioCard';
import { MobilePullToRefresh } from './MobilePullToRefresh';
import { PortfolioSummary } from '../PortfolioSummary';
import { PerformanceTab } from '../PerformanceTab';
import { AccountsTab } from '../AccountsTab';
import { DividendsTab } from '../DividendsTab';
import { TaxOptimizationTab } from '../TaxOptimizationTab';
import { TransactionHistory } from '../TransactionHistory';
import { AddTransactionModal } from '../AddHoldingModal';
import { RatiosGuide } from '../RatiosGuide';
import { Holding, Transaction } from '../../types/portfolio';
import { hapticFeedback } from '../../utils/deviceUtils';
import { useAuth } from '../../hooks/useAuthSimple';
import { useSubscription } from '../../hooks/useSubscription';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';

interface MobileAppProps {
  holdings: Holding[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

export const MobileApp: React.FC<MobileAppProps> = ({ 
  holdings, 
  transactions, 
  onAddTransaction, 
  onRefresh,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, signOut } = useAuth();
  const { subscription, currentPlan, upgradeToPremium } = useSubscription();

  const openQuickView = (ticker: string, company: string, type: string) => {
    const params = new URLSearchParams({ ticker, company, type });
    const url = `${window.location.origin}/?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    hapticFeedback('light');
    onAddTransaction(transaction);
    setIsTransactionModalOpen(false);
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    hapticFeedback('medium');
    
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    hapticFeedback('light');
    setActiveTab(tab);
  };
  const getTabTitle = () => {
    switch (activeTab) {
      case 'portfolio': return 'Portfolio';
      case 'performance': return 'Performance';
      case 'account': return 'My Account';
      case 'dividends': return 'Dividends';
      case 'tax': return 'Tax Optimization';
      case 'ratios': return 'Ratios Guide';
      case 'transactions': return 'Transactions';
      default: return 'Portfolio Tracker';
    }
  };

  const existingTickers = holdings.map(h => h.ticker);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <MobileHeader 
        title={getTabTitle()}
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        showAddButton={activeTab === 'portfolio' || activeTab === 'transactions'}
        loading={loading}
      />
      
      <MobilePullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <div className="px-4 py-4">
        {activeTab === 'portfolio' && (
          <>
            <div className="mb-6 w-full">
              <PortfolioSummary holdings={holdings} />
            </div>
            <div className="space-y-3 w-full">
              {holdings.map((holding) => (
                <MobilePortfolioCard
                  key={holding.id}
                  holding={holding}
                  onQuickView={openQuickView}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            {/* Mobile-optimized Performance Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                {holdings.length > 0 ? (
                  holdings.slice(0, 5).map((holding) => {
                    const currentValue = holding.shares * holding.currentPrice;
                    const totalCost = holding.shares * holding.costBasis;
                    const gainLoss = currentValue - totalCost;
                    const gainLossPercent = (gainLoss / totalCost) * 100;
                    
                    return (
                      <div key={holding.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{holding.ticker}</div>
                          <div className="text-sm text-gray-500">${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                          <div className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No holdings to display</p>
                )}
                {holdings.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500">Showing top 5 holdings</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-4">
            {/* User Profile Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white p-3 rounded-full">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user?.email || 'User'}</div>
                  <div className="text-sm text-gray-500">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{currentPlan.name}</div>
                    <div className="text-sm text-gray-500">{currentPlan.description}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentPlan.type === 'premium' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentPlan.type.toUpperCase()}
                  </div>
                </div>
                
                {currentPlan.type === 'basic' && (
                  <button
                    onClick={() => upgradeToPremium()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                  >
                    <img 
                      src="/premium_starincircle.png" 
                      alt="Premium" 
                      className="h-5 w-5 mr-2"
                    />
                    Upgrade to Premium - $9.99/month
                  </button>
                )}
                
                {currentPlan.type === 'premium' && subscription && (
                  <div className="text-sm text-gray-500">
                    {subscription.cancelAtPeriodEnd 
                      ? `Expires: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : `Next billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="font-medium text-gray-900">Payment History</span>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="font-medium text-gray-900">Export Data</span>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="font-medium text-gray-900">Settings</span>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <button 
                onClick={signOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dividends' && (
          <div className="space-y-4">
            {/* Mobile-optimized Dividends Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dividend Income</h3>
              <div className="space-y-4">
                {holdings.filter(h => h.dividendYield > 0).length > 0 ? (
                  holdings
                    .filter(h => h.dividendYield > 0)
                    .sort((a, b) => b.dividendYield - a.dividendYield)
                    .slice(0, 8)
                    .map((holding) => {
                      const currentValue = holding.shares * holding.currentPrice;
                      const annualDividend = currentValue * (holding.dividendYield / 100);
                      
                      return (
                        <div key={holding.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{holding.ticker}</div>
                            <div className="text-sm text-gray-500">
                              {holding.dividendYield.toFixed(2)}% yield
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              ${annualDividend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${(annualDividend / 12).toFixed(2)}/mo
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-gray-500 text-center py-4">No dividend-paying holdings</p>
                )}
              </div>
              
              {/* Total Dividend Summary */}
              {holdings.filter(h => h.dividendYield > 0).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-600">Total Annual Dividends:</div>
                    <div className="text-lg font-bold text-green-600">
                      ${holdings.reduce((total, holding) => {
                        const currentValue = holding.shares * holding.currentPrice;
                        return total + (currentValue * (holding.dividendYield / 100));
                      }, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <TaxOptimizationTab holdings={holdings} transactions={transactions} />
        )}

        {activeTab === 'ratios' && (
          <RatiosGuide />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory transactions={transactions} />
        )}
        </div>
      </MobilePullToRefresh>

      <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <InstallPrompt />

      {isTransactionModalOpen && (
        <AddTransactionModal
          onClose={() => setIsTransactionModalOpen(false)}
          onAdd={handleAddTransaction}
          existingTickers={existingTickers}
        />
      )}
    </div>
  );
};