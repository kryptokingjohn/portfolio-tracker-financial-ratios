import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { AuthProvider } from './hooks/useAuthSimple';
import { LoginScreen } from './components/auth/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { QuickViewPage } from './components/QuickViewPage';
import { MobileApp } from './components/mobile/MobileApp';
import { PortfolioTable } from './components/PortfolioTable';
import { PortfolioSummary } from './components/PortfolioSummary';
import { MyAccountModal } from './components/MyAccountModal';
import { TransactionCounter } from './components/TransactionCounter';
import { PortfolioSummarySkeleton, PortfolioTableSkeleton, TransactionHistorySkeleton } from './components/skeletons';

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
  
  // Use a more reasonable mobile breakpoint for modern phones and tablets
  const isSmallScreen = window.innerWidth <= 768; // Standard mobile breakpoint
  
  // Consider mobile if it's a mobile device OR small screen (tablets in portrait)
  return isMobileDevice || isSmallScreen;
};

const AppContent: React.FC = () => {
  // ALL HOOKS MUST BE CALLED CONSISTENTLY - NO EARLY RETURNS BEFORE THIS POINT
  const { user, loading, signOut, handleUserActivity } = useAuth();
  const { 
    holdings, 
    transactions, 
    loading: portfolioLoading, 
    error: portfolioError,
    summaryLoading,
    holdingsLoading,
    marketDataLoading,
    isRefreshing,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshData,
    lastUpdated,
    savePortfolioSnapshot,
    dividendAnalysis
  } = usePortfolio();
  const { 
    canAddHolding, 
    canAddTransaction,
    getTransactionLimitMessage, 
    currentPlan, 
    handleSuccessfulPayment, 
    subscription,
    isTrialActive,
    getTrialDaysRemaining,
    startPremiumTrial 
  } = useSubscription();
  
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
    
    // Premium subscriptions now use proper database storage via Stripe checkout
    console.log('💳 Premium subscriptions: Use "Upgrade to Premium" button in My Account');
    console.log('🗃️ Subscription data: Stored persistently in Supabase database');
    
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

  // Set up user activity tracking for session security
  useEffect(() => {
    if (!user || !handleUserActivity) return; // Only track activity when user is authenticated
    
    // Activity events to track
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity updates to avoid excessive calls
    let lastActivityUpdate = 0;
    const throttleDelay = 30000; // 30 seconds
    
    const throttledActivityHandler = () => {
      const now = Date.now();
      if (now - lastActivityUpdate > throttleDelay) {
        handleUserActivity();
        lastActivityUpdate = now;
      }
    };
    
    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivityHandler, true);
    });
    
    // Cleanup listeners
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivityHandler, true);
      });
    };
  }, [user, handleUserActivity]);

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

  // Quick view and advanced view handlers
  const openQuickView = useCallback((holding: any) => {
    // For now, just log - can be enhanced to show a modal
    console.log('Opening quick view for:', holding.ticker);
    // Could set a state to show quick view modal
  }, []);

  const openAdvancedView = useCallback((holding: any) => {
    // For now, just log - can be enhanced to show advanced analysis
    console.log('Opening advanced view for:', holding.ticker);
    // Could set a state to show advanced analysis modal
  }, []);

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
        isRefreshing={isRefreshing}
      />
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg transition-all"
      >
        Skip to main content
      </a>
      {/* Background Refresh Indicator */}
      {isRefreshing && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center space-x-2 text-blue-300 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating portfolio data in background...</span>
            </div>
          </div>
        </div>
      )}
      
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
          <div className="flex items-center h-16">
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
            
            {/* Last updated text - centered and properly contained */}
            <div className="flex-1 flex justify-center items-center px-4">
              {lastUpdated && (
                <div className="text-sm text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            {/* All buttons aligned to the right */}
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-200 bg-blue-600/30 rounded-lg hover:bg-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm border border-blue-500/30"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
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
                  if (canAddTransaction()) {
                    setIsTransactionModalOpen(true);
                  } else {
                    const limitMessage = getTransactionLimitMessage();
                    if (limitMessage) {
                      alert(limitMessage);
                      setIsPricingModalOpen(true); // Open pricing modal for upgrade
                    }
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
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  currentPlan.type === 'premium'
                    ? 'text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                    : 'text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                }`}
                title={`Current Plan: ${currentPlan.name}`}
              >
                {currentPlan.type === 'premium' ? (
                  <img 
                    src="/premium_starincircle.png" 
                    alt="Premium" 
                    className="h-4 w-4 flex-shrink-0"
                  />
                ) : (
                  <Shield className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="font-medium">{currentPlan.name}</span>
                {currentPlan.type === 'premium' && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded font-bold ml-1">
                    PRO
                  </span>
                )}
              </div>
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
        <main id="main-content">
        {activeTab === 'portfolio' && (
          <>
            {/* Portfolio Summary - Progressive Loading */}
            {summaryLoading ? (
              <PortfolioSummarySkeleton />
            ) : (
              <PortfolioSummary holdings={holdings} />
            )}
            
            {/* Transaction Counter - Show transaction usage for basic users */}
            <div className="mb-6">
              <TransactionCounter onUpgradeClick={() => setIsPricingModalOpen(true)} />
            </div>

            {/* Portfolio Filter - Always show immediately */}
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
                    disabled={holdingsLoading}
                  >
                    {filter === 'all' ? 'All Holdings' : filter.toUpperCase()}
                  </button>
                ))}
              </div>
              
              {/* Loading indicator for filters */}
              {holdingsLoading && (
                <div className="mt-2 text-sm text-gray-400 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Loading holdings...</span>
                </div>
              )}
            </div>

            {/* Portfolio Table - Progressive Loading */}
            {holdingsLoading ? (
              <PortfolioTableSkeleton 
                rows={8}
                showETFColumns={portfolioFilter === 'etfs' || portfolioFilter === 'all'}
                showBondColumns={portfolioFilter === 'bonds' || portfolioFilter === 'all'}
              />
            ) : (
              <>
                <PortfolioTable holdings={filteredHoldings} filter={portfolioFilter} />
                
                {/* Market data loading indicator */}
                {marketDataLoading && (
                  <div className="mt-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <div className="text-blue-300">
                        <div className="font-medium">Updating market prices...</div>
                        <div className="text-sm text-blue-400">Real-time data loading in progress</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            {holdingsLoading ? (
              <TransactionHistorySkeleton rows={10} />
            ) : (
              <Suspense fallback={<LoadingScreen message="Loading transactions..." />}>
                <TransactionHistory 
                  transactions={transactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteClick}
                />
              </Suspense>
            )}
          </>
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
        </main>

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