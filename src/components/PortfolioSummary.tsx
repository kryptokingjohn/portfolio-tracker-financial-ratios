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
      <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="bg-blue-600 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-blue-200">Total Portfolio Value</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.totalValue)}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl border border-gray-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="bg-gray-600 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-300">Total Cost Basis</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.totalCost)}</div>
          </div>
        </div>
      </div>

      <div className={`bg-gradient-to-br backdrop-blur-sm rounded-xl border p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
        summary.totalGainLoss >= 0 
          ? 'from-green-900/60 to-green-800/60 border-green-500/30' 
          : 'from-red-900/60 to-red-800/60 border-red-500/30'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-full ${summary.totalGainLoss >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              {summary.totalGainLoss >= 0 ? (
                <TrendingUp className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${summary.totalGainLoss >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              Total Gain/Loss
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(summary.totalGainLoss)}
            </div>
            <div className={`text-sm ${summary.totalGainLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatPercent(summary.totalGainLossPercent)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="bg-purple-600 p-3 rounded-full">
              <Percent className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-purple-200">Dividend Yield</div>
            <div className="text-2xl font-bold text-white">{formatPercent(summary.dividendYield)}</div>
            <div className="text-sm text-purple-300">Annual: {formatCurrency(summary.dividendIncome)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};