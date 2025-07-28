import React from 'react';
import { Holding, MarketData } from '../types/portfolio';
import { DCFCalculator } from '../utils/dcfCalculator';
import { DollarSign, BarChart3, TrendingUp, Target, AlertTriangle } from 'lucide-react';

interface AdvancedRatiosPanelProps {
  holding: Holding;
  marketData?: MarketData;
}

export const AdvancedRatiosPanel: React.FC<AdvancedRatiosPanelProps> = ({ holding, marketData }) => {
  // Estimate DCF inputs from holding data
  const dcfInputs = DCFCalculator.estimateInputs(holding, marketData);
  const dcfResult = DCFCalculator.calculate(dcfInputs, holding.currentPrice);

  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatRatio = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    return value.toFixed(2);
  };

  const getRatioColor = (value: number, good: number, bad: number) => {
    if (isNaN(value) || !isFinite(value)) return 'text-gray-500';
    if (value >= good) return 'text-green-600';
    if (value <= bad) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getUpside = () => {
    if (!dcfResult || isNaN(dcfResult.intrinsicValue) || !holding.currentPrice) return 0;
    return ((dcfResult.intrinsicValue - holding.currentPrice) / holding.currentPrice) * 100;
  };

  const upside = getUpside();

  return (
    <div className="space-y-8">
      {/* DCF Analysis */}
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <h3 className="text-2xl font-bold mb-6 text-blue-300 flex items-center">
          <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 mr-3">
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
          DCF Analysis
        </h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-blue-200 mb-2">Intrinsic Value</p>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(dcfResult?.intrinsicValue || 0)}
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-blue-200 mb-2">Current Price</p>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(holding.currentPrice)}
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-blue-200 mb-2">Upside/Downside</p>
            <p className={`text-4xl font-bold ${upside >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-blue-200 mb-2">Confidence</p>
            <p className="text-4xl font-bold text-purple-400">
              {dcfResult.confidence}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <h3 className="text-2xl font-bold mb-6 text-green-300 flex items-center">
          <div className="bg-green-600/20 p-2 rounded-full border border-green-500/30 mr-3">
            <BarChart3 className="h-6 w-6 text-green-400" />
          </div>
          Financial Ratios
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-600/30">
            <p className="text-sm font-medium text-green-200 mb-2">P/E Ratio</p>
            <p className={`text-3xl font-bold ${getRatioColor(holding.peRatio || 0, 15, 25).replace('text-gray-500', 'text-gray-300').replace('text-green-600', 'text-green-400').replace('text-red-600', 'text-red-400').replace('text-yellow-600', 'text-yellow-400')}`}>
              {formatRatio(holding.peRatio || 0)}
            </p>
            <p className="text-xs font-medium text-green-300 mt-1">Good: &lt;15, Bad: &gt;25</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-600/30">
            <p className="text-sm font-medium text-green-200 mb-2">P/B Ratio</p>
            <p className={`text-3xl font-bold ${getRatioColor(holding.pbRatio || 0, 1.5, 3).replace('text-gray-500', 'text-gray-300').replace('text-green-600', 'text-green-400').replace('text-red-600', 'text-red-400').replace('text-yellow-600', 'text-yellow-400')}`}>
              {formatRatio(holding.pbRatio || 0)}
            </p>
            <p className="text-xs font-medium text-green-300 mt-1">Good: &lt;1.5, Bad: &gt;3</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-600/30">
            <p className="text-sm font-medium text-green-200 mb-2">Debt/Equity</p>
            <p className={`text-3xl font-bold ${getRatioColor(holding.debtToEquity || 0, 0.3, 0.6).replace('text-gray-500', 'text-gray-300').replace('text-green-600', 'text-green-400').replace('text-red-600', 'text-red-400').replace('text-yellow-600', 'text-yellow-400')}`}>
              {formatRatio(holding.debtToEquity || 0)}
            </p>
            <p className="text-xs font-medium text-green-300 mt-1">Good: &lt;0.3, Bad: &gt;0.6</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-600/30">
            <p className="text-sm font-medium text-green-200 mb-2">ROE</p>
            <p className={`text-3xl font-bold ${getRatioColor((holding.roe || 0) * 100, 15, 10).replace('text-gray-500', 'text-gray-300').replace('text-green-600', 'text-green-400').replace('text-red-600', 'text-red-400').replace('text-yellow-600', 'text-yellow-400')}`}>
              {formatPercent(holding.roe || 0)}
            </p>
            <p className="text-xs font-medium text-green-300 mt-1">Good: &gt;15%, Bad: &lt;10%</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-600/30">
            <p className="text-sm font-medium text-green-200 mb-2">Current Ratio</p>
            <p className={`text-3xl font-bold ${getRatioColor(holding.currentRatio || 0, 2, 1).replace('text-gray-500', 'text-gray-300').replace('text-green-600', 'text-green-400').replace('text-red-600', 'text-red-400').replace('text-yellow-600', 'text-yellow-400')}`}>
              {formatRatio(holding.currentRatio || 0)}
            </p>
            <p className="text-xs font-medium text-green-300 mt-1">Good: &gt;2, Bad: &lt;1</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-600/30">
            <p className="text-sm font-medium text-green-200 mb-2">Dividend Yield</p>
            <p className={`text-3xl font-bold ${getRatioColor((holding.dividendYield || 0) * 100, 3, 0).replace('text-gray-500', 'text-gray-300').replace('text-green-600', 'text-green-400').replace('text-red-600', 'text-red-400').replace('text-yellow-600', 'text-yellow-400')}`}>
              {formatPercent(holding.dividendYield || 0)}
            </p>
            <p className="text-xs font-medium text-green-300 mt-1">Good: &gt;3%, Bad: 0%</p>
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      {dcfResult.sensitivity && (
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <h3 className="text-2xl font-bold mb-6 text-purple-300 flex items-center">
            <div className="bg-purple-600/20 p-2 rounded-full border border-purple-500/30 mr-3">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            Sensitivity Analysis
          </h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
              <p className="text-sm font-medium text-purple-200 mb-2">Bear Case</p>
              <p className="text-3xl font-bold text-red-400">
                {formatCurrency(dcfResult.sensitivity.bearCase)}
              </p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
              <p className="text-sm font-medium text-purple-200 mb-2">Base Case</p>
              <p className="text-3xl font-bold text-blue-400">
                {formatCurrency(dcfResult.sensitivity.baseCase)}
              </p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
              <p className="text-sm font-medium text-purple-200 mb-2">Bull Case</p>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(dcfResult.sensitivity.bullCase)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo Simulation */}
      <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm rounded-xl border border-orange-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <h3 className="text-2xl font-bold mb-6 text-orange-300 flex items-center">
          <div className="bg-orange-600/20 p-2 rounded-full border border-orange-500/30 mr-3">
            <Target className="h-6 w-6 text-orange-400" />
          </div>
          Monte Carlo Analysis
        </h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-orange-200 mb-2">90% Confidence</p>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency((dcfResult?.intrinsicValue || holding.currentPrice) * 1.15)}
            </p>
            <p className="text-xs text-orange-300 mt-2">Upside scenario</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-orange-200 mb-2">50% Confidence</p>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(dcfResult?.intrinsicValue || holding.currentPrice)}
            </p>
            <p className="text-xs text-orange-300 mt-2">Base case</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/30">
            <p className="text-sm font-medium text-orange-200 mb-2">10% Confidence</p>
            <p className="text-3xl font-bold text-red-400">
              {formatCurrency((dcfResult?.intrinsicValue || holding.currentPrice) * 0.85)}
            </p>
            <p className="text-xs text-orange-300 mt-2">Downside scenario</p>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="bg-yellow-600/20 p-2 rounded-full border border-yellow-500/30 flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-300 mb-3 text-lg">Investment Risk Disclosure</h4>
            <p className="text-sm text-yellow-100 leading-relaxed">
              These calculations are estimates based on current financial data and assumptions. 
              Actual results may vary significantly. Past performance does not guarantee future results. 
              Consider consulting with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};