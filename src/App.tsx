import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { AuthProvider } from './hooks/useAuthSimple';
import { LoginScreen } from './components/auth/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { QuickViewPage } from './components/QuickViewPage';
import { MobileApp } from './components/mobile/MobileApp';
import { PortfolioTable } from './components/PortfolioTable';
import { PortfolioSummary } from './components/PortfolioSummary';
import { MyAccountModal } from './components/MyAccountModal';

// Lazy load heavy components that aren't immediately needed
const AddTransactionModal = lazy(() => import('./components/AddHoldingModal').then(m => ({ default: m.AddTransactionModal })));
const EditTransactionModal = lazy(() => import('./components/EditTransactionModal').then(m => ({ default: m.EditTransactionModal })));
const TransactionHistory = lazy(() => import('./components/TransactionHistory').then(m => ({ default: m.TransactionHistory })));
const RatiosGuide = lazy(() => import('./components/RatiosGuide').then(m => ({ default: m.RatiosGuide })));
const PerformanceTab = lazy(() => import('./components/PerformanceTab').then(m => ({ default: m.PerformanceTab })));
const AccountsTab = lazy(() => import('./components/AccountsTab').then(m => ({ default: m.AccountsTab })));
const DividendsTab = lazy(() => import('./components/DividendsTab').then(m => ({ default: m.DividendsTab })));
const TaxOptimizationTab = lazy(() => import('./components/TaxOptimizationTab').then(m => ({ default: m.TaxOptimizationTab })));
const ExportModal = lazy(() => import('./components/ExportModal').then(m => ({ default: m.ExportModal })));
const PricingModal = lazy(() => import('./components/PricingModal').then(m => ({ default: m.PricingModal })));
const StripeCheckout = lazy(() => import('./components/StripeCheckout').then(m => ({ default: m.StripeCheckout })));
import { useAuth } from './hooks/useAuthSimple';
import { usePortfolio } from './hooks/usePortfolio';
import { useSubscription } from './hooks/useSubscription';
import { Holding, Transaction } from './types/portfolio';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import Info from 'lucide-react/dist/esm/icons/info';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import PieChart from 'lucide-react/dist/esm/icons/pie-chart';
import History from 'lucide-react/dist/esm/icons/history';
import Building from 'lucide-react/dist/esm/icons/building';
import Calculator from 'lucide-react/dist/esm/icons/calculator';
import Download from 'lucide-react/dist/esm/icons/download';  
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Crown from 'lucide-react/dist/esm/icons/crown';
import User from 'lucide-react/dist/esm/icons/user';
import Star from 'lucide-react/dist/esm/icons/star';
import Shield from 'lucide-react/dist/esm/icons/shield';
import { logDatabaseStatus, logApiStatus } from './config/database';

// Improved mobile detection - checks both screen size and device type
const isMobile = () => {
  // Check for actual mobile devices first
  const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Only use screen width for actual mobile devices or very small screens
  const isSmallScreen = window.innerWidth <= 480; // Much smaller threshold
  
  // Only consider mobile if it's an actual mobile device OR a very small screen
  return isMobileDevice || isSmallScreen;
};

const AppContent: React.FC = () => {
  // ALL HOOKS MUST BE CALLED CONSISTENTLY - NO EARLY RETURNS BEFORE THIS POINT
  const { user, loading, signOut } = useAuth();
  const { 
    holdings, 
    transactions, 
    loading: portfolioLoading, 
    error: portfolioError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshData,
    lastUpdated,
    savePortfolioSnapshot,
    dividendAnalysis
  } = usePortfolio();
  const { canAddHolding, getHoldingsLimitMessage, currentPlan, handleSuccessfulPayment } = useSubscription();
  
  // State hooks
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'transactions' | 'performance' | 'ratios' | 'accounts' | 'dividends' | 'tax'>('portfolio');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState<'stocks' | 'etfs' | 'bonds' | 'all'>('all');
  const [isMyAccountModalOpen, setIsMyAccountModalOpen] = useState(false);
  
  // Initialize database and API status logging
  useEffect(() => {
    logDatabaseStatus();
    logApiStatus();
    
    // Test Stripe configuration
    console.log('🚀 Starting Stripe configuration test...');
    fetch('/.netlify/functions/test-stripe-config')
      .then(response => {
        console.log('📡 Function response received:', response.status, response.statusText);
        return response.json();
      })
      .then(data => {
        console.log('💳 Stripe Configuration Test:', data);
        if (data.stripeConfigured) {
          console.log('✅ Stripe Secret Key is configured');
          console.log('🔑 Key prefix:', data.keyPrefix);
        } else {
          console.log('❌ Stripe Secret Key is NOT configured');
        }
      })
      .catch(error => {
        console.log('⚠️ Could not test Stripe configuration:', error);
        console.log('ℹ️ This might mean Netlify Functions are not deployed yet');
      });
  }, []);

  // Memoized handler functions for transaction editing - STABLE DEPENDENCIES
  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  }, []); // No dependencies needed

  const handleSaveTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateTransaction(id, updates);
      setIsEditModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  }, [updateTransaction]);

  const handleDeleteClick = useCallback((transactionId: string) => {
    setDeleteConfirmId(transactionId);
  }, []); // No dependencies needed

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirmId) {
      try {
        await deleteTransaction(deleteConfirmId);
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  }, [deleteConfirmId, deleteTransaction]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []); // No dependencies needed

  // Memoized computations
  const portfolioMetrics = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent
    };
  }, [holdings]);

  const filteredHoldings = useMemo(() => {
    return portfolioFilter === 'all' 
      ? holdings 
      : holdings.filter(holding => holding.type === portfolioFilter);
  }, [holdings, portfolioFilter]);

  const existingTickers = useMemo(() => holdings.map(h => h.ticker), [holdings]);

  // Check if this is a QuickView page AFTER all hooks
  const isQuickViewPage = window.location.pathname === '/quickview' || window.location.search.includes('ticker=');
  
  if (isQuickViewPage) {
    return <QuickViewPage />;
  }

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (portfolioLoading) {
    return <LoadingScreen message="Loading your portfolio..." />;
  }

  // Use mobile app for mobile devices
  if (isMobile()) {
    return (
      <MobileApp 
        holdings={holdings}
        transactions={transactions}
        onAddTransaction={addTransaction}
        onRefresh={refreshData}
        loading={portfolioLoading}
      />
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Error Banner */}
      {portfolioError && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 backdrop-blur-sm p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-200">
                <strong>Notice:</strong> {portfolioError}. Using demo data for now.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
                <img 
                  src="/icon-192x192.png" 
                  alt="Portfolio Tracker Icon" 
                  className="h-8 w-8 rounded"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">Portfolio Tracker with Financial Ratios</h1>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-sm text-gray-300">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-200 bg-blue-600/30 rounded-lg hover:bg-blue-600/40 transition-all backdrop-blur-sm border border-blue-500/30"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-200 bg-purple-600/30 rounded-lg hover:bg-purple-600/40 transition-all backdrop-blur-sm border border-purple-500/30"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => {
                  if (canAddHolding(holdings.length)) {
                    setIsTransactionModalOpen(true);
                  } else {
                    alert(getHoldingsLimitMessage(holdings.length));
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </button>
              <button
                onClick={() => setIsMyAccountModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <User className="h-4 w-4" />
                <span>My Account</span>
              </button>
              
              {/* Plan Status Indicator */}
              <div 
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all backdrop-blur-sm border ${
                  currentPlan.type === 'premium'
                    ? 'text-amber-200 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/30 shadow-lg'
                    : 'text-slate-300 bg-gradient-to-r from-slate-600/20 to-gray-600/20 border-slate-500/30'
                }`}
                title={`Current Plan: ${currentPlan.name}`}
              >
                {currentPlan.type === 'premium' ? (
                  <Shield className="h-4 w-4 fill-amber-300 text-amber-300" />
                ) : (
                  <Shield className="h-4 w-4 fill-slate-400 text-slate-400" />
                )}
                <span className="font-medium">{currentPlan.name}</span>
                {currentPlan.type === 'premium' && (
                  <span className="text-xs bg-amber-500/20 px-1.5 py-0.5 rounded-full">PRO</span>
                )}
              </div>
              
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-200 bg-red-600/30 rounded-lg hover:bg-red-600/40 transition-all backdrop-blur-sm border border-red-500/30"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-2">
            {(['portfolio', 'performance', 'accounts', 'dividends', 'transactions', 'tax', 'ratios'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 font-medium text-sm capitalize transition-all rounded-lg backdrop-blur-sm ${
                  activeTab === tab
                    ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/30 border border-transparent hover:border-gray-600/30'
                }`}
              >
                {tab === 'portfolio' && (
                  <span className="flex items-center">
                    <PieChart className="h-4 w-4 mr-1" />
                    Portfolio
                  </span>
                )}
                {tab === 'transactions' && (
                  <span className="flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    Transactions
                  </span>
                )}
                {tab === 'performance' && (
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Performance
                  </span>
                )}         
                {tab === 'accounts' && (
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    Accounts
                  </span>
                )}
                {tab === 'dividends' && (
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Dividends
                  </span>
                )}
                {tab === 'tax' && (
                  <span className="flex items-center">
                    <Calculator className="h-4 w-4 mr-1" />
                    Tax Optimization
                  </span>
                )}
                 {tab === 'ratios' && (
                  <span className="flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Ratios Guide
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <>
            {/* Portfolio Summary */}
            <PortfolioSummary holdings={holdings} />

            {/* Portfolio Filter */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {(['all', 'stocks', 'etfs', 'bonds'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPortfolioFilter(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all backdrop-blur-sm ${
                      portfolioFilter === filter
                        ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/30 border border-transparent hover:border-gray-600/30'
                    }`}
                  >
                    {filter === 'all' ? 'All Holdings' : filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Table */}
            <PortfolioTable holdings={filteredHoldings} filter={portfolioFilter} />
          </>
        )}

        {activeTab === 'transactions' && (
          <Suspense fallback={<LoadingScreen message="Loading transactions..." />}>
            <TransactionHistory 
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteClick}
            />
          </Suspense>
        )}

        {activeTab === 'performance' && (
          <Suspense fallback={<LoadingScreen message="Loading performance data..." />}>
            <PerformanceTab holdings={holdings} />
          </Suspense>
        )}

        {activeTab === 'ratios' && (
          <Suspense fallback={<LoadingScreen message="Loading ratios guide..." />}>
            <RatiosGuide />
          </Suspense>
        )}

        {activeTab === 'accounts' && (
          <Suspense fallback={<LoadingScreen message="Loading accounts data..." />}>
            <AccountsTab holdings={holdings} transactions={transactions} />
          </Suspense>
        )}

        {activeTab === 'dividends' && (
          <Suspense fallback={<LoadingScreen message="Loading dividends data..." />}>
            <DividendsTab holdings={holdings} dividendAnalysis={dividendAnalysis} />
          </Suspense>
        )}

        {activeTab === 'tax' && (
          <Suspense fallback={<LoadingScreen message="Loading tax optimization..." />}>
            <TaxOptimizationTab holdings={holdings} transactions={transactions} />
          </Suspense>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isTransactionModalOpen && (
        <Suspense fallback={<LoadingScreen message="Loading transaction form..." />}>
          <AddTransactionModal
            onClose={() => setIsTransactionModalOpen(false)}
            onAdd={addTransaction}
            existingTickers={existingTickers}
          />
        </Suspense>
      )}

      {/* Edit Transaction Modal */}
      {isEditModalOpen && editingTransaction && (
        <Suspense fallback={<LoadingScreen message="Loading edit form..." />}>
          <EditTransactionModal
            transaction={editingTransaction}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTransaction(null);
            }}
            onSave={handleSaveTransaction}
            existingTickers={existingTickers}
          />
        </Suspense>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Transaction</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone and will recalculate your portfolio holdings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors backdrop-blur-sm border border-gray-600/30"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
              >
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <Suspense fallback={<LoadingScreen message="Loading export options..." />}>
          <ExportModal
            onClose={() => setIsExportModalOpen(false)}
            holdings={holdings}
            transactions={transactions}
            portfolioMetrics={portfolioMetrics}
          />
        </Suspense>
      )}

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <Suspense fallback={<LoadingScreen message="Loading pricing options..." />}>
          <PricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
            onSelectPlan={(planId) => {
              setSelectedPlan(planId);
              setIsPricingModalOpen(false);
              setShowCheckout(true);
            }}
          />
        </Suspense>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-[9999] backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowCheckout(false)}
        >
          <div 
            className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] my-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-600/30 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Complete Your Subscription</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl border border-red-500/30 text-sm font-medium backdrop-blur-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <Suspense fallback={<LoadingScreen message="Loading checkout..." />}>
                <StripeCheckout
                  planId={selectedPlan}
                  onSuccess={(paymentResult) => {
                    // Update subscription status
                    handleSuccessfulPayment(paymentResult);
                    setShowCheckout(false);
                    setSelectedPlan(null);
                    // Handle successful subscription
                    alert('Subscription successful! Welcome to Portfolio Pro!');
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    alert('Payment failed. Please try again.');
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;