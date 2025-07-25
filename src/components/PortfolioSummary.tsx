import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Clock } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { PortfolioCalculator } from '../utils/portfolioCalculations';

interface PortfolioSummaryProps {
  holdings: Holding[];
  portfolioMetrics?: any;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ holdings, portfolioMetrics }) => {
  const summary = portfolioMetrics || PortfolioCalculator.calculatePortfolioMetrics(holdings);

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-8 w-8 text-blue-700" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-blue-700">Total Portfolio Value</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalValue)}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-8 w-8 text-gray-700" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-700">Total Cost Basis</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalCost)}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {summary.totalGainLoss >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-700" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-700" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-green-700">Total Gain/Loss</div>
            <div className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(summary.totalGainLoss)}
            </div>
            <div className={`text-sm ${summary.totalGainLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatPercent(summary.totalGainLossPercent)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {summary.dayChange >= 0 ? (
              <TrendingUp className="h-8 w-8 text-orange-700" />
            ) : (
              <TrendingDown className="h-8 w-8 text-orange-700" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-orange-700">Today's Change</div>
            <div className={`text-2xl font-bold ${summary.dayChange >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(summary.dayChange || 0)}
            </div>
            <div className={`text-sm ${summary.dayChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatPercent(summary.dayChangePercent || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Percent className="h-8 w-8 text-purple-700" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-purple-700">Dividend Yield</div>
            <div className="text-2xl font-bold text-purple-900">{formatPercent(summary.dividendYield)}</div>
            <div className="text-sm text-purple-600">Annual: {formatCurrency(summary.dividendIncome)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};