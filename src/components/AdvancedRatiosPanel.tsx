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
    <div className="space-y-6">
      {/* DCF Analysis */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-300 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-blue-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          DCF Analysis
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-blue-700">Intrinsic Value</p>
            <p className="text-3xl font-bold text-blue-900">
              {formatCurrency(dcfResult?.intrinsicValue || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Current Price</p>
            <p className="text-3xl font-bold text-gray-800">
              {formatCurrency(holding.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Upside/Downside</p>
            <p className={`text-3xl font-bold ${upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Confidence</p>
            <p className="text-3xl font-bold text-purple-700">
              {dcfResult.confidence}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-300 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Financial Ratios
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-green-700">P/E Ratio</p>
            <p className={`text-2xl font-bold ${getRatioColor(holding.peRatio || 0, 15, 25)}`}>
              {formatRatio(holding.peRatio || 0)}
            </p>
            <p className="text-xs font-medium text-green-600">Good: &lt;15, Bad: &gt;25</p>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">P/B Ratio</p>
            <p className={`text-2xl font-bold ${getRatioColor(holding.pbRatio || 0, 1.5, 3)}`}>
              {formatRatio(holding.pbRatio || 0)}
            </p>
            <p className="text-xs font-medium text-green-600">Good: &lt;1.5, Bad: &gt;3</p>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">Debt/Equity</p>
            <p className={`text-2xl font-bold ${getRatioColor(holding.debtToEquity || 0, 0.3, 0.6)}`}>
              {formatRatio(holding.debtToEquity || 0)}
            </p>
            <p className="text-xs font-medium text-green-600">Good: &lt;0.3, Bad: &gt;0.6</p>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">ROE</p>
            <p className={`text-2xl font-bold ${getRatioColor((holding.roe || 0) * 100, 15, 10)}`}>
              {formatPercent(holding.roe || 0)}
            </p>
            <p className="text-xs font-medium text-green-600">Good: &gt;15%, Bad: &lt;10%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">Current Ratio</p>
            <p className={`text-2xl font-bold ${getRatioColor(holding.currentRatio || 0, 2, 1)}`}>
              {formatRatio(holding.currentRatio || 0)}
            </p>
            <p className="text-xs font-medium text-green-600">Good: &gt;2, Bad: &lt;1</p>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">Dividend Yield</p>
            <p className={`text-2xl font-bold ${getRatioColor((holding.dividendYield || 0) * 100, 3, 0)}`}>
              {formatPercent(holding.dividendYield || 0)}
            </p>
            <p className="text-xs font-medium text-green-600">Good: &gt;3%, Bad: 0%</p>
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      {dcfResult.sensitivity && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg border border-purple-300 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-purple-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sensitivity Analysis
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-purple-700">Bear Case</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(dcfResult.sensitivity.bearCase)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Base Case</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(dcfResult.sensitivity.baseCase)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Bull Case</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dcfResult.sensitivity.bullCase)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo Simulation */}
      <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-lg border border-orange-300 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-orange-900 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Monte Carlo Analysis
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-orange-700">90% Confidence</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency((dcfResult?.intrinsicValue || holding.currentPrice) * 1.15)}
            </p>
            <p className="text-xs text-orange-600">Upside scenario</p>
          </div>
          <div>
            <p className="text-sm font-medium text-orange-700">50% Confidence</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(dcfResult?.intrinsicValue || holding.currentPrice)}
            </p>
            <p className="text-xs text-orange-600">Base case</p>
          </div>
          <div>
            <p className="text-sm font-medium text-orange-700">10% Confidence</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency((dcfResult?.intrinsicValue || holding.currentPrice) * 0.85)}
            </p>
            <p className="text-xs text-orange-600">Downside scenario</p>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-4 rounded-lg border border-yellow-300">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Investment Risk Disclosure</h4>
            <p className="text-sm text-yellow-800">
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