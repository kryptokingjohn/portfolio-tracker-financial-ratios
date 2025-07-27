import React, { useState } from 'react';
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
import { useAuth } from './hooks/useAuthSimple';
import { usePortfolio } from './hooks/usePortfolio';
import { Holding, Transaction } from './types/portfolio';
import { TrendingUp, TrendingDown, Info, Plus, Edit3, DollarSign, PieChart, History, Building, Calculator, Download, LogOut } from 'lucide-react';

// Detect if we're on mobile
const isMobile = () => {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const AppContent: React.FC = () => {
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
    refreshPrices,
    lastUpdated,
    autoRefreshEnabled,
    toggleAutoRefresh,
    savePortfolioSnapshot,
    dividendAnalysis
  } = usePortfolio();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'transactions' | 'performance' | 'ratios' | 'accounts' | 'dividends' | 'tax'>('portfolio');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
        onRefresh={refreshPrices}
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
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {portfolioError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Notice:</strong> {portfolioError}. Using demo data for now.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <PieChart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Tracker with Financial Ratios</h1>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={toggleAutoRefresh}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  autoRefreshEnabled 
                    ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-all"
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
          <nav className="flex space-x-8">
            {(['portfolio', 'performance', 'accounts', 'dividends', 'transactions', 'tax', 'ratios'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <div className="flex space-x-4">
                {(['all', 'stocks', 'etfs', 'bonds'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPortfolioFilter(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      portfolioFilter === filter
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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