import React from 'react';
import { ChevronDown, ChevronUp, Info, TrendingUp, Shield, BarChart3, DollarSign, Calendar, Percent } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { AdvancedRatiosPanel } from './AdvancedRatiosPanel';

interface QuickViewChartProps {
  holding: Holding;
  isExpanded: boolean;
  onToggle: () => void;
  hideCloseButton?: boolean;
  hideAdvancedButton?: boolean;
}
import { MarketDataService } from '../services/marketDataService';

export const QuickViewChart: React.FC<QuickViewChartProps> = ({ holding, isExpanded, onToggle, hideCloseButton = false, hideAdvancedButton = false }) => {
  const formatNumber = (num: number, decimals: number = 1) => {
    if (num === 0) return '0';
    return num.toFixed(decimals);
  };

  const formatPercent = (num: number) => {
    if (num === 0) return '0%';
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const [marketData, setMarketData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isExpanded && !marketData) {
      setLoading(true);
      MarketDataService.getQuote(holding.ticker)
        .then(data => setMarketData(data))
        .catch(err => console.warn('Market data failed:', err))
        .finally(() => setLoading(false));
    }
  }, [isExpanded, holding.ticker, marketData]);

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const renderStockChart = () => (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-gray-600/30 rounded-xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600/20 p-3 rounded-full border border-blue-500/30">
            <BarChart3 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {holding.ticker} - {holding.company}
            </h3>
            <p className="text-blue-300">Financial Ratios Analysis</p>
          </div>
        </div>
        {!hideAdvancedButton && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl border border-blue-500/30 text-sm font-medium backdrop-blur-sm"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-600/30 p-6 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 mr-3">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                Advanced Analysis - {holding.ticker}
              </h3>
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl border border-red-500/30 text-sm font-medium backdrop-blur-sm"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <AdvancedRatiosPanel holding={holding} marketData={marketData} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Valuation Ratios */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 mr-3">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-blue-300">Valuation Ratios</h4>
          </div>
          <p className="text-blue-200/80 text-sm mb-6 leading-relaxed">
            Determine if a stock is overvalued or undervalued relative to earnings, book value, and growth prospects.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">P/E Ratio</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.pe)}x</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">P/B Ratio</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.pb)}x</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">PEG Ratio</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.peg)}x</span>
            </div>
          </div>
        </div>

        {/* Financial Health */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-yellow-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-600/20 p-2 rounded-full border border-yellow-500/30 mr-3">
              <Shield className="h-5 w-5 text-yellow-400" />
            </div>
            <h4 className="text-xl font-semibold text-yellow-300">Financial Health</h4>
          </div>
          <p className="text-yellow-200/80 text-sm mb-6 leading-relaxed">
            Assess the company's ability to meet obligations and manage debt effectively.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-yellow-200 font-medium">Debt-to-Equity</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.debtToEquity, 2)}x</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-yellow-200 font-medium">Current Ratio</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.currentRatio, 2)}x</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-yellow-200 font-medium">Quick Ratio</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.quickRatio, 2)}x</span>
            </div>
          </div>
        </div>

        {/* Profitability */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-green-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-green-600/20 p-2 rounded-full border border-green-500/30 mr-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-green-300">Profitability</h4>
          </div>
          <p className="text-green-200/80 text-sm mb-6 leading-relaxed">
            Measure how efficiently the company generates profits from its assets and equity.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">ROE</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.roe)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">ROA</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.roa)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">Gross Margin</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.grossMargin)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">Net Margin</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.netMargin)}</span>
            </div>
          </div>
        </div>

        {/* Operating Efficiency */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600/20 p-2 rounded-full border border-purple-500/30 mr-3">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-purple-300">Operating Efficiency</h4>
          </div>
          <p className="text-purple-200/80 text-sm mb-6 leading-relaxed">
            Evaluate how well management uses company resources to generate revenue and control costs.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Operating Margin</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.operatingMargin)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Asset Turnover</span>
              <span className="text-white font-bold text-lg">{formatNumber(holding.assetTurnover, 2)}x</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Revenue Growth</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.revenueGrowth)}</span>
            </div>
          </div>
        </div>
      </div>

      {!hideCloseButton && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onToggle}
            className="px-8 py-3 bg-gradient-to-r from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center border border-gray-600/30 backdrop-blur-sm font-medium"
          >
            <ChevronUp className="h-5 w-5 mr-2" />
            Close QuickView
          </button>
        </div>
      )}
    </div>
  );

  const renderETFChart = () => (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-gray-600/30 rounded-xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-green-600/20 p-3 rounded-full border border-green-500/30">
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {holding.ticker} - {holding.company}
            </h3>
            <p className="text-green-300">Performance Metrics</p>
          </div>
        </div>
        {!hideCloseButton && (
          <button
            onClick={onToggle}
            className="px-8 py-3 bg-gradient-to-r from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center border border-gray-600/30 backdrop-blur-sm font-medium"
          >
            <ChevronUp className="h-5 w-5 mr-2" />
            Close QuickView
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Performance Returns */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-green-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-green-600/20 p-2 rounded-full border border-green-500/30 mr-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-green-300">Performance Returns</h4>
          </div>
          <p className="text-green-200/80 text-sm mb-6 leading-relaxed">
            Track historical returns and alpha to evaluate fund performance against benchmarks.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">1-Year Return</span>
              <span className="text-green-400 font-bold text-lg">+24.8%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">3-Year Return</span>
              <span className="text-green-400 font-bold text-lg">+10.2%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">5-Year Return</span>
              <span className="text-green-400 font-bold text-lg">+15.1%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">Alpha</span>
              <span className="text-green-400 font-bold text-lg">+0.1%</span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm rounded-xl border border-red-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-red-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-red-600/20 p-2 rounded-full border border-red-500/30 mr-3">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <h4 className="text-xl font-semibold text-red-300">Risk Metrics</h4>
          </div>
          <p className="text-red-200/80 text-sm mb-6 leading-relaxed">
            Understand volatility, correlation to market, and risk-adjusted returns for informed decisions.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-red-200 font-medium">Beta</span>
              <span className="text-white font-bold text-lg">1.0</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-red-200 font-medium">Sharpe Ratio</span>
              <span className="text-white font-bold text-lg">1.42</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-red-200 font-medium">Standard Deviation</span>
              <span className="text-white font-bold text-lg">17.8%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-red-200 font-medium">Tracking Error</span>
              <span className="text-white font-bold text-lg">0.02%</span>
            </div>
          </div>
        </div>

        {/* Fund Details */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 mr-3">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-blue-300">Fund Details</h4>
          </div>
          <p className="text-blue-200/80 text-sm mb-6 leading-relaxed">
            Critical fund characteristics affecting long-term returns and investment costs.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Expense Ratio</span>
              <span className="text-white font-bold text-lg">{holding.expenseRatio ? `${formatNumber(holding.expenseRatio, 2)}%` : '0.03%'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Assets Under Management</span>
              <span className="text-white font-bold text-lg">{holding.netAssets ? `$${formatNumber(holding.netAssets / 1000, 1)}B` : '$1.3B'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Category</span>
              <span className="text-white font-bold text-lg">{holding.etfCategory || 'ETF'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Dividend Yield</span>
              <span className="text-white font-bold text-lg">{holding.dividendYield ? `${formatNumber(holding.dividendYield, 2)}%` : '0.00%'}</span>
            </div>
          </div>
        </div>

        {/* Additional Analysis */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600/20 p-2 rounded-full border border-purple-500/30 mr-3">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-purple-300">ETF Analysis</h4>
          </div>
          <p className="text-purple-200/80 text-sm mb-6 leading-relaxed">
            Key characteristics and performance indicators for this exchange-traded fund.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Trading Volume</span>
              <span className="text-white font-bold text-lg">High Liquidity</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Market Cap Focus</span>
              <span className="text-white font-bold text-lg">{holding.etfCategory?.includes('Large') ? 'Large Cap' : holding.etfCategory?.includes('Small') ? 'Small Cap' : 'Diversified'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Investment Style</span>
              <span className="text-white font-bold text-lg">{holding.etfCategory?.includes('Growth') ? 'Growth' : holding.etfCategory?.includes('Value') ? 'Value' : 'Blend'}</span>
            </div>
          </div>
        </div>

        {/* Holdings & Composition */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-yellow-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-600/20 p-2 rounded-full border border-yellow-500/30 mr-3">
              <Info className="h-5 w-5 text-yellow-400" />
            </div>
            <h4 className="text-xl font-semibold text-yellow-300">Holdings & Composition</h4>
          </div>
          <p className="text-yellow-200/80 text-sm mb-6 leading-relaxed">
            Portfolio concentration and diversification characteristics of the fund.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-yellow-200 font-medium">Number of Holdings</span>
              <span className="text-white font-bold text-lg">{holding.etfCategory?.includes('S&P 500') ? '500+' : holding.etfCategory?.includes('Total') ? '3,000+' : '100+'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-yellow-200 font-medium">Top 10 Concentration</span>
              <span className="text-white font-bold text-lg">{holding.etfCategory?.includes('S&P 500') ? '28%' : '25%'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-yellow-200 font-medium">Rebalancing</span>
              <span className="text-white font-bold text-lg">Quarterly</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-orange-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-orange-600/20 p-2 rounded-full border border-orange-500/30 mr-3">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <h4 className="text-xl font-semibold text-orange-300">Performance Metrics</h4>
          </div>
          <p className="text-orange-200/80 text-sm mb-6 leading-relaxed">
            Historical performance and risk-adjusted return characteristics.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-orange-200 font-medium">Inception Date</span>
              <span className="text-white font-bold text-lg">{holding.etfCategory?.includes('S&P 500') ? '1993' : '2001'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-orange-200 font-medium">Average Daily Volume</span>
              <span className="text-white font-bold text-lg">{holding.ticker === 'SPY' ? '85M' : '3M'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-orange-200 font-medium">Tracking Error</span>
              <span className="text-white font-bold text-lg">0.03%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBondChart = () => (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-gray-600/30 rounded-xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-green-600/20 p-3 rounded-full border border-green-500/30">
            <Percent className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {holding.ticker} - {holding.company}
            </h3>
            <p className="text-green-300">Bond Metrics</p>
          </div>
        </div>
        {!hideCloseButton && (
          <button
            onClick={onToggle}
            className="px-8 py-3 bg-gradient-to-r from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center border border-gray-600/30 backdrop-blur-sm font-medium"
          >
            <ChevronUp className="h-5 w-5 mr-2" />
            Close QuickView
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Yield & Income */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-green-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-green-600/20 p-2 rounded-full border border-green-500/30 mr-3">
              <Percent className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-green-300">Yield & Income</h4>
          </div>
          <p className="text-green-200/80 text-sm mb-6 leading-relaxed">
            Current income generation and yield characteristics of the bond investment.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">Current Yield</span>
              <span className="text-white font-bold text-lg">{formatPercent(holding.dividendYield || 2.51)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">Annual Income</span>
              <span className="text-white font-bold text-lg">{formatCurrency(holding.shares * (holding.dividend || 0))}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-green-200 font-medium">Yield to Maturity</span>
              <span className="text-white font-bold text-lg">{holding.yieldToMaturity ? `${formatNumber(holding.yieldToMaturity, 2)}%` : '4.2%'}</span>
            </div>
          </div>
        </div>

        {/* Risk Characteristics */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 mr-3">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-blue-300">Risk Characteristics</h4>
          </div>
          <p className="text-blue-200/80 text-sm mb-6 leading-relaxed">
            Interest rate sensitivity and credit quality assessment for risk management.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Duration</span>
              <span className="text-white font-bold text-lg">{holding.duration ? `${formatNumber(holding.duration, 1)} years` : '6.8 years'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Credit Rating</span>
              <span className="text-white font-bold text-lg">{holding.creditRating || 'AAA'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-blue-200 font-medium">Interest Rate Risk</span>
              <span className="text-yellow-400 font-bold text-lg">Moderate</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600/20 p-2 rounded-full border border-purple-500/30 mr-3">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-purple-300">Performance Metrics</h4>
          </div>
          <p className="text-purple-200/80 text-sm mb-6 leading-relaxed">
            Historical performance and volatility characteristics of the bond fund.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">1-Year Return</span>
              <span className="text-green-400 font-bold text-lg">+2.1%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">3-Year Return</span>
              <span className="text-red-400 font-bold text-lg">-1.8%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-purple-200 font-medium">Volatility</span>
              <span className="text-white font-bold text-lg">3.2%</span>
            </div>
          </div>
        </div>

        {/* Fund Information */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-orange-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-orange-600/20 p-2 rounded-full border border-orange-500/30 mr-3">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <h4 className="text-xl font-semibold text-orange-300">Fund Information</h4>
          </div>
          <p className="text-orange-200/80 text-sm mb-6 leading-relaxed">
            Key fund characteristics and management details for investment evaluation.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-orange-200 font-medium">Expense Ratio</span>
              <span className="text-white font-bold text-lg">{holding.expenseRatio ? `${formatNumber(holding.expenseRatio, 2)}%` : '0.15%'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-orange-200 font-medium">Bond Type</span>
              <span className="text-white font-bold text-lg">{holding.bondType || 'Treasury'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-orange-200 font-medium">Assets Under Management</span>
              <span className="text-white font-bold text-lg">{holding.netAssets ? `$${formatNumber(holding.netAssets / 1000, 1)}B` : '$45.2B'}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-cyan-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-cyan-600/20 p-2 rounded-full border border-cyan-500/30 mr-3">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
            <h4 className="text-xl font-semibold text-cyan-300">Portfolio Allocation</h4>
          </div>
          <p className="text-cyan-200/80 text-sm mb-6 leading-relaxed">
            Breakdown of bond holdings by sector, maturity, and credit quality.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-cyan-200 font-medium">Average Maturity</span>
              <span className="text-white font-bold text-lg">{holding.duration ? `${formatNumber(holding.duration, 1)} years` : '8.5 years'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-cyan-200 font-medium">Number of Holdings</span>
              <span className="text-white font-bold text-lg">{holding.bondType === 'Treasury' ? '200+' : '500+'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-cyan-200 font-medium">Weighted Avg Credit Rating</span>
              <span className="text-white font-bold text-lg">{holding.creditRating || 'AA'}</span>
            </div>
          </div>
        </div>

        {/* Interest Rate Environment */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6 hover:shadow-xl transition-all duration-300 hover:border-indigo-500/50">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-600/20 p-2 rounded-full border border-indigo-500/30 mr-3">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <h4 className="text-xl font-semibold text-indigo-300">Interest Rate Impact</h4>
          </div>
          <p className="text-indigo-200/80 text-sm mb-6 leading-relaxed">
            Analysis of interest rate sensitivity and potential price impact scenarios.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-indigo-200 font-medium">Duration Risk</span>
              <span className="text-white font-bold text-lg">{holding.duration && holding.duration > 10 ? 'High' : holding.duration && holding.duration > 5 ? 'Moderate' : 'Low'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-indigo-200 font-medium">Rate Sensitivity</span>
              <span className="text-white font-bold text-lg">{holding.duration ? `${formatNumber(holding.duration * -1, 1)}%` : '-6.8%'} per 1% rate ↑</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-3">
              <span className="text-indigo-200 font-medium">Convexity</span>
              <span className="text-white font-bold text-lg">Positive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-4 py-2 text-xs bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg hover:shadow-lg transition-all border border-blue-500/30 backdrop-blur-sm font-medium"
      >
        <BarChart3 className="h-4 w-4" />
        <span>QuickView</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="mt-4">
      {holding.type === 'stocks' && renderStockChart()}
      {holding.type === 'etfs' && renderETFChart()}
      {holding.type === 'bonds' && renderBondChart()}
    </div>
  );
};