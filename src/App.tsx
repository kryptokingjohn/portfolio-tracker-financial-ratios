import React, { useState, useEffect } from 'react';
import { AuthProvider } from './hooks/useAuthSimple';
import { LoginScreen } from './components/auth/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { QuickViewPage } from './components/QuickViewPage';
import { MobileApp } from './components/mobile/MobileApp';
import { PortfolioTable } from './components/PortfolioTable';
import { AddTransactionModal } from './components/AddHoldingModal';
import { TransactionHistory } from './components/TransactionHistory';
import { RatiosGuide } from './components/RatiosGuide';
import { PortfolioSummary } from './components/PortfolioSummary';
import { PerformanceTab } from './components/PerformanceTab';
import { AccountsTab } from './components/AccountsTab';
import { DividendsTab } from './components/DividendsTab';
import { TaxOptimizationTab } from './components/TaxOptimizationTab';
import { ExportModal } from './components/ExportModal';
import { PricingModal } from './components/PricingModal';
import { StripeCheckout } from './components/StripeCheckout';
import { useAuth } from './hooks/useAuthSimple';
import { usePortfolio } from './hooks/usePortfolio';
import { Holding, Transaction } from './types/portfolio';
import { TrendingUp, TrendingDown, Info, Plus, Edit3, DollarSign, PieChart, History, Building, Calculator, Download, LogOut, RefreshCw, Crown } from 'lucide-react';
import { logDatabaseStatus, logApiStatus } from './config/database';

// Detect if we're on mobile
const isMobile = () => {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const AppContent: React.FC = () => {
  // Initialize database and API status logging
  useEffect(() => {
    logDatabaseStatus();
    logApiStatus();
  }, []);

  // Check if this is a QuickView page
  const isQuickViewPage = window.location.pathname === '/quickview' || window.location.search.includes('ticker=');
  
  if (isQuickViewPage) {
    return <QuickViewPage />;
  }

  const { user, loading, isDemoMode, signOut } = useAuth();
  const { 
    holdings, 
    transactions, 
    loading: portfolioLoading, 
    error: portfolioError,
    addTransaction,
    refreshData,
    lastUpdated,
    savePortfolioSnapshot,
    dividendAnalysis
  } = usePortfolio();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'transactions' | 'performance' | 'ratios' | 'accounts' | 'dividends' | 'tax'>('portfolio');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState<'stocks' | 'etfs' | 'bonds' | 'all'>('all');

  if (loading) {
    return <LoadingScreen message={isDemoMode ? "Loading demo data..." : "Authenticating..."} />;
  }

  if (!user && !isDemoMode) {
    return <LoginScreen />;
  }

  if (portfolioLoading) {
    return <LoadingScreen message="Loading your portfolio..." />;
  }

  const filteredHoldings = portfolioFilter === 'all' 
    ? holdings 
    : holdings.filter(holding => holding.type === portfolioFilter);

  const existingTickers = holdings.map(h => h.ticker);

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

  // Calculate portfolio metrics for export modal
  const portfolioMetrics = {
    totalValue: holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0),
    totalCost: holdings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0),
    totalGainLoss: 0,
    totalGainLossPercent: 0
  };
  portfolioMetrics.totalGainLoss = portfolioMetrics.totalValue - portfolioMetrics.totalCost;
  portfolioMetrics.totalGainLossPercent = portfolioMetrics.totalCost > 0 ? 
    (portfolioMetrics.totalGainLoss / portfolioMetrics.totalCost) * 100 : 0;
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
              <div className="bg-blue-600 p-2 rounded-full">
                <PieChart className="h-6 w-6 text-white" />
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
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </button>
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade</span>
              </button>
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
            <PortfolioTable holdings={filteredHoldings} />
          </>
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory 
            transactions={transactions}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab holdings={holdings} />
        )}

        {activeTab === 'ratios' && (
          <RatiosGuide />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab holdings={holdings} />
        )}

        {activeTab === 'dividends' && (
          <DividendsTab holdings={holdings} dividendAnalysis={dividendAnalysis} />
        )}

        {activeTab === 'tax' && (
          <TaxOptimizationTab holdings={holdings} transactions={transactions} />
        )}
      </div>

      {/* Add Transaction Modal */}
      {isTransactionModalOpen && (
        <AddTransactionModal
          onClose={() => setIsTransactionModalOpen(false)}
          onAdd={addTransaction}
          existingTickers={existingTickers}
        />
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          holdings={holdings}
          transactions={transactions}
          portfolioMetrics={portfolioMetrics}
        />
      )}

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          onSelectPlan={(planId) => {
            setSelectedPlan(planId);
            setIsPricingModalOpen(false);
            setShowCheckout(true);
          }}
        />
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
              <StripeCheckout
                planId={selectedPlan}
                onSuccess={() => {
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
            </div>
          </div>
        </div>
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