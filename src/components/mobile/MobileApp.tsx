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
import { MyAccountModal } from '../MyAccountModal';
import { Holding, Transaction } from '../../types/portfolio';
import { hapticFeedback } from '../../utils/deviceUtils';

interface MobileAppProps {
  holdings: Holding[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  isRefreshing?: boolean;
}

export const MobileApp: React.FC<MobileAppProps> = ({ 
  holdings, 
  transactions, 
  onAddTransaction, 
  onRefresh,
  loading = false,
  isRefreshing = false 
}) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMyAccountModalOpen, setIsMyAccountModalOpen] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState<'stocks' | 'etfs' | 'bonds' | 'all'>('all');

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
    
    hapticFeedback('medium');
    
    try {
      await onRefresh();
    } catch (error) {
      console.error('Mobile refresh error:', error);
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
      case 'accounts': return 'Accounts';
      case 'dividends': return 'Dividends';
      case 'tax': return 'Tax Optimization';
      case 'ratios': return 'Ratios Guide';
      case 'transactions': return 'Transactions';
      default: return 'Portfolio Tracker';
    }
  };

  const existingTickers = holdings.map(h => h.ticker);
  
  // Filter holdings based on selected filter
  const filteredHoldings = portfolioFilter === 'all' 
    ? holdings 
    : holdings.filter(holding => holding.type === portfolioFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <MobileHeader 
        title={getTabTitle()}
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        showAddButton={activeTab === 'portfolio' || activeTab === 'transactions'}
        loading={loading}
        isRefreshing={isRefreshing}
        onMenuClick={() => setIsMyAccountModalOpen(true)}
      />
      
      <MobilePullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <div className="px-4 py-4">
        {activeTab === 'portfolio' && (
          <>
            <div className="mb-6 w-full">
              <PortfolioSummary holdings={holdings} />
            </div>
            
            {/* Portfolio Filter Buttons */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {(['all', 'stocks', 'etfs', 'bonds'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      hapticFeedback('light');
                      setPortfolioFilter(filter);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                      portfolioFilter === filter
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter === 'all' ? 'All Holdings' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3 w-full">
              {filteredHoldings.map((holding) => (
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
          <div className="mobile-responsive-content">
            <PerformanceTab holdings={holdings} />
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="mobile-responsive-content">
            <AccountsTab holdings={holdings} transactions={transactions} />
          </div>
        )}

        {activeTab === 'dividends' && (
          <div className="mobile-responsive-content">
            <DividendsTab holdings={holdings} />
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
      
      {/* My Account Modal */}
      {isMyAccountModalOpen && (
        <MyAccountModal
          isOpen={isMyAccountModalOpen}
          onClose={() => setIsMyAccountModalOpen(false)}
        />
      )}
    </div>
  );
};