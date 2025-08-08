import React, { useState, Suspense, lazy } from 'react';
import { InstallPrompt } from '../InstallPrompt';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';
import { MobilePortfolioCard } from './MobilePortfolioCard';
import { MobilePullToRefresh } from './MobilePullToRefresh';
import { MobilePortfolioSkeleton, MobileSummarySkeleton, MobileFilterSkeleton } from './MobileSkeletonLoader';
import { PortfolioSummary } from '../PortfolioSummary';
import { LoadingScreen } from '../LoadingScreen';
import { Holding, Transaction } from '../../types/portfolio';
import { hapticFeedback } from '../../utils/deviceUtils';

// Lazy load heavy tab components for better mobile performance
const PerformanceTab = lazy(() => import('../PerformanceTab').then(m => ({ default: m.PerformanceTab })));
const AccountsTab = lazy(() => import('../AccountsTab').then(m => ({ default: m.AccountsTab })));
const DividendsTab = lazy(() => import('../DividendsTab').then(m => ({ default: m.DividendsTab })));
const TaxOptimizationTab = lazy(() => import('../TaxOptimizationTab').then(m => ({ default: m.TaxOptimizationTab })));
const TransactionHistory = lazy(() => import('../TransactionHistory').then(m => ({ default: m.TransactionHistory })));
const AddTransactionModal = lazy(() => import('../AddHoldingModal').then(m => ({ default: m.AddTransactionModal })));
const RatiosGuide = lazy(() => import('../RatiosGuide').then(m => ({ default: m.RatiosGuide })));
const MyAccountModal = lazy(() => import('../MyAccountModal').then(m => ({ default: m.MyAccountModal })));

// Mobile-optimized loading components
const MobileTabLoader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
    </div>
    <div className="text-center">
      <p className="text-gray-600 text-sm font-medium">{message}</p>
      <p className="text-gray-400 text-xs mt-1">Please wait...</p>
    </div>
  </div>
);

const MobileModalLoader: React.FC = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

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
            {loading || holdings.length === 0 ? (
              <>
                <MobileSummarySkeleton />
                <MobileFilterSkeleton />
                <MobilePortfolioSkeleton />
              </>
            ) : (
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
          </>
        )}

        {activeTab === 'performance' && (
          <div className="mobile-responsive-content">
            <Suspense fallback={<MobileTabLoader message="Loading performance data..." />}>
              <PerformanceTab holdings={holdings} />
            </Suspense>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="mobile-responsive-content">
            <Suspense fallback={<MobileTabLoader message="Loading accounts data..." />}>
              <AccountsTab holdings={holdings} transactions={transactions} />
            </Suspense>
          </div>
        )}

        {activeTab === 'dividends' && (
          <div className="mobile-responsive-content">
            <Suspense fallback={<MobileTabLoader message="Loading dividends data..." />}>
              <DividendsTab holdings={holdings} />
            </Suspense>
          </div>
        )}

        {activeTab === 'tax' && (
          <Suspense fallback={<MobileTabLoader message="Loading tax optimization..." />}>
            <TaxOptimizationTab holdings={holdings} transactions={transactions} />
          </Suspense>
        )}

        {activeTab === 'ratios' && (
          <Suspense fallback={<MobileTabLoader message="Loading ratios guide..." />}>
            <RatiosGuide />
          </Suspense>
        )}

        {activeTab === 'transactions' && (
          <Suspense fallback={<MobileTabLoader message="Loading transactions..." />}>
            <TransactionHistory transactions={transactions} />
          </Suspense>
        )}
        </div>
      </MobilePullToRefresh>

      <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <InstallPrompt />

      {isTransactionModalOpen && (
        <Suspense fallback={<MobileModalLoader />}>
          <AddTransactionModal
            onClose={() => setIsTransactionModalOpen(false)}
            onAdd={handleAddTransaction}
            existingTickers={existingTickers}
          />
        </Suspense>
      )}
      
      {/* My Account Modal */}
      {isMyAccountModalOpen && (
        <Suspense fallback={<MobileModalLoader />}>
          <MyAccountModal
            isOpen={isMyAccountModalOpen}
            onClose={() => setIsMyAccountModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};