import React from 'react';
import { ChevronDown, ChevronUp, Info, TrendingUp, Shield, BarChart3, DollarSign, Calendar, Percent } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { AdvancedRatiosPanel } from './AdvancedRatiosPanel';

interface QuickViewChartProps {
  holding: Holding;
  isExpanded: boolean;
  onToggle: () => void;
}
import { MarketDataService } from '../services/marketDataService';

export const QuickViewChart: React.FC<QuickViewChartProps> = ({ holding, isExpanded, onToggle }) => {
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
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-green-400">
          {holding.ticker} - {holding.company} Financial Ratios
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {showAdvanced && (
        <div className="mb-6">
          <AdvancedRatiosPanel holding={holding} marketData={marketData} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valuation Ratios */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <DollarSign className="h-5 w-5 text-blue-400 mr-2" />
            <h4 className="text-lg font-medium text-blue-400">Valuation Ratios</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Determine if a stock is overvalued or undervalued relative to earnings, book value, and growth prospects.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">P/E Ratio</span>
              <span className="text-white font-semibold">{formatNumber(holding.pe)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">P/B Ratio</span>
              <span className="text-white font-semibold">{formatNumber(holding.pb)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">PEG Ratio</span>
              <span className="text-white font-semibold">{formatNumber(holding.peg)}x</span>
            </div>
          </div>
        </div>

        {/* Financial Health */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Shield className="h-5 w-5 text-yellow-400 mr-2" />
            <h4 className="text-lg font-medium text-yellow-400">Financial Health</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Assess the company's ability to meet obligations and manage debt effectively.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Debt-to-Equity</span>
              <span className="text-white font-semibold">{formatNumber(holding.debtToEquity, 2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Current Ratio</span>
              <span className="text-white font-semibold">{formatNumber(holding.currentRatio, 2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Quick Ratio</span>
              <span className="text-white font-semibold">{formatNumber(holding.quickRatio, 2)}x</span>
            </div>
          </div>
        </div>

        {/* Profitability */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
            <h4 className="text-lg font-medium text-green-400">Profitability</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Measure how efficiently the company generates profits from its assets and equity.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">ROE</span>
              <span className="text-white font-semibold">{formatPercent(holding.roe)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">ROA</span>
              <span className="text-white font-semibold">{formatPercent(holding.roa)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Gross Margin</span>
              <span className="text-white font-semibold">{formatPercent(holding.grossMargin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Net Margin</span>
              <span className="text-white font-semibold">{formatPercent(holding.netMargin)}</span>
            </div>
          </div>
        </div>

        {/* Operating Efficiency */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />
            <h4 className="text-lg font-medium text-purple-400">Operating Efficiency</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Evaluate how well management uses company resources to generate revenue and control costs.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Operating Margin</span>
              <span className="text-white font-semibold">{formatPercent(holding.operatingMargin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Asset Turnover</span>
              <span className="text-white font-semibold">{formatNumber(holding.assetTurnover, 2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Revenue Growth</span>
              <span className="text-white font-semibold">{formatPercent(holding.revenueGrowth)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onToggle}
          className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
        >
          <ChevronUp className="h-4 w-4 mr-2" />
          Close QuickView
        </button>
      </div>
    </div>
  );

  const renderETFChart = () => (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-green-400">
          {holding.ticker} - {holding.company} Performance Metrics
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Performance Returns */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
            <h4 className="text-lg font-medium text-green-400">Performance Returns</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Track historical returns and alpha to evaluate fund performance against benchmarks.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">1-Year Return</span>
              <span className="text-green-400 font-semibold">+24.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">3-Year Return</span>
              <span className="text-green-400 font-semibold">+10.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">5-Year Return</span>
              <span className="text-green-400 font-semibold">+15.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Alpha</span>
              <span className="text-green-400 font-semibold">+0.1%</span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Shield className="h-5 w-5 text-red-400 mr-2" />
            <h4 className="text-lg font-medium text-red-400">Risk Metrics</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Understand volatility, correlation to market, and risk-adjusted returns for informed decisions.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Beta</span>
              <span className="text-white font-semibold">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Sharpe Ratio</span>
              <span className="text-white font-semibold">1.42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Standard Deviation</span>
              <span className="text-white font-semibold">17.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tracking Error</span>
              <span className="text-white font-semibold">0.02%</span>
            </div>
          </div>
        </div>

        {/* Fund Details */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <h4 className="text-lg font-medium text-blue-400">Fund Details</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Critical fund characteristics affecting long-term returns and investment costs.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Expense Ratio</span>
              <span className="text-white font-semibold">0.03%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Assets Under Management</span>
              <span className="text-white font-semibold">$1.3B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />
          <h4 className="text-lg font-medium text-purple-400">Risk Assessment</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-white font-medium">Beta:</span>
            <span className="text-gray-300 ml-2">Measures volatility relative to market. More volatile than market.</span>
          </div>
          <div>
            <span className="text-white font-medium">Sharpe Ratio:</span>
            <span className="text-gray-300 ml-2">Risk-adjusted return measure. Good risk-adjusted returns.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBondChart = () => (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-green-400">
          {holding.ticker} - {holding.company} Bond Metrics
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield & Income */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Percent className="h-5 w-5 text-green-400 mr-2" />
            <h4 className="text-lg font-medium text-green-400">Yield & Income</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Current income generation and yield characteristics of the bond investment.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Current Yield</span>
              <span className="text-white font-semibold">{formatPercent(holding.dividendYield || 2.51)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Annual Income</span>
              <span className="text-white font-semibold">{formatCurrency(holding.shares * (holding.dividend || 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Yield to Maturity</span>
              <span className="text-white font-semibold">4.2%</span>
            </div>
          </div>
        </div>

        {/* Risk Characteristics */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Shield className="h-5 w-5 text-blue-400 mr-2" />
            <h4 className="text-lg font-medium text-blue-400">Risk Characteristics</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Interest rate sensitivity and credit quality assessment for risk management.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Duration</span>
              <span className="text-white font-semibold">6.8 years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Credit Rating</span>
              <span className="text-white font-semibold">AAA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Interest Rate Risk</span>
              <span className="text-yellow-400 font-semibold">Moderate</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-purple-400 mr-2" />
            <h4 className="text-lg font-medium text-purple-400">Performance Metrics</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Historical performance and volatility characteristics of the bond fund.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">1-Year Return</span>
              <span className="text-green-400 font-semibold">+2.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">3-Year Return</span>
              <span className="text-red-400 font-semibold">-1.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Volatility</span>
              <span className="text-white font-semibold">3.2%</span>
            </div>
          </div>
        </div>

        {/* Fund Information */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Calendar className="h-5 w-5 text-orange-400 mr-2" />
            <h4 className="text-lg font-medium text-orange-400">Fund Information</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Key fund characteristics and management details for investment evaluation.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Expense Ratio</span>
              <span className="text-white font-semibold">0.05%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Maturity</span>
              <span className="text-white font-semibold">8.5 years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Assets Under Management</span>
              <span className="text-white font-semibold">$45.2B</span>
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
        className="flex items-center space-x-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
      >
        <BarChart3 className="h-3 w-3" />
        <span>QuickView</span>
        <ChevronDown className="h-3 w-3" />
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