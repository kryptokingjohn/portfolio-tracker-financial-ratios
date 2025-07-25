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
import { Holding, Transaction } from '../../types/portfolio';
import { hapticFeedback } from '../../utils/deviceUtils';

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
      case 'accounts': return 'Accounts';
      case 'dividends': return 'Dividends';
      case 'tax': return 'Tax Optimization';
      case 'transactions': return 'Transactions';
      default: return 'Portfolio Tracker';
    }
  };

  const existingTickers = holdings.map(h => h.ticker);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            <div className="mb-6">
              <PortfolioSummary holdings={holdings} />
            </div>
            <div className="space-y-3">
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
          <PerformanceTab holdings={holdings} />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab holdings={holdings} />
        )}

        {activeTab === 'dividends' && (
          <DividendsTab holdings={holdings} />
        )}

        {activeTab === 'tax' && (
          <TaxOptimizationTab holdings={holdings} transactions={transactions} />
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