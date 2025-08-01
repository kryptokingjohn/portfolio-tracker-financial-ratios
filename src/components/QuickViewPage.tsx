import React, { useEffect, useState } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Shield from 'lucide-react/dist/esm/icons/shield';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Percent from 'lucide-react/dist/esm/icons/percent';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Info from 'lucide-react/dist/esm/icons/info';
import { Holding } from '../types/portfolio';
import { mockPortfolioData } from '../data/mockData';

export const QuickViewPage: React.FC = () => {
  const [holding, setHolding] = useState<Holding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const ticker = urlParams.get('ticker');
    const company = urlParams.get('company');
    const type = urlParams.get('type');

    if (ticker) {
      // Find the holding from mock data
      const foundHolding = mockPortfolioData.find(h => h.ticker === ticker);
      if (foundHolding) {
        setHolding(foundHolding);
      }
    }
    setLoading(false);
  }, []);

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

  const goBack = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Holding not found</div>
      </div>
    );
  }

  const renderStockChart = () => (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600/20 p-4 rounded-full border border-blue-500/30">
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {holding.ticker} - {holding.company}
              </h1>
              <p className="text-blue-300 text-lg">Financial Ratios Analysis</p>
            </div>
          </div>
          <button
            onClick={goBack}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 rounded-xl transition-all shadow-lg hover:shadow-xl border border-gray-600/30 backdrop-blur-sm font-medium text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Valuation Ratios */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-blue-500/50">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600/20 p-3 rounded-full border border-blue-500/30 mr-4">
                <DollarSign className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-300">Valuation Ratios</h2>
            </div>
            <p className="text-blue-200/80 text-sm mb-8 leading-relaxed">
              Determine if a stock is overvalued or undervalued relative to earnings, book value, and growth prospects.
            </p>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-blue-200 text-lg font-medium">P/E Ratio</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.pe)}x</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-blue-200 text-lg font-medium">P/B Ratio</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.pb)}x</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-blue-200 text-lg font-medium">PEG Ratio</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.peg)}x</span>
              </div>
            </div>
          </div>

          {/* Financial Health */}
          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-yellow-500/50">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-600/20 p-3 rounded-full border border-yellow-500/30 mr-4">
                <Shield className="h-7 w-7 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-300">Financial Health</h2>
            </div>
            <p className="text-yellow-200/80 text-sm mb-8 leading-relaxed">
              Assess the company's ability to meet obligations and manage debt effectively.
            </p>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-yellow-200 text-lg font-medium">Debt-to-Equity</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.debtToEquity, 2)}x</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-yellow-200 text-lg font-medium">Current Ratio</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.currentRatio, 2)}x</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-yellow-200 text-lg font-medium">Quick Ratio</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.quickRatio, 2)}x</span>
              </div>
            </div>
          </div>

          {/* Profitability */}
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl border border-green-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-green-500/50">
            <div className="flex items-center mb-6">
              <div className="bg-green-600/20 p-3 rounded-full border border-green-500/30 mr-4">
                <TrendingUp className="h-7 w-7 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-300">Profitability</h2>
            </div>
            <p className="text-green-200/80 text-sm mb-8 leading-relaxed">
              Measure how efficiently the company generates profits from its assets and equity.
            </p>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-green-200 text-lg font-medium">ROE</span>
                <span className="text-white font-bold text-2xl">{formatPercent(holding.roe)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-green-200 text-lg font-medium">ROA</span>
                <span className="text-white font-bold text-2xl">{formatPercent(holding.roa)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-green-200 text-lg font-medium">Gross Margin</span>
                <span className="text-white font-bold text-2xl">{formatPercent(holding.grossMargin)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-green-200 text-lg font-medium">Net Margin</span>
                <span className="text-white font-bold text-2xl">{formatPercent(holding.netMargin)}</span>
              </div>
            </div>
          </div>

          {/* Operating Efficiency */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-purple-500/50">
            <div className="flex items-center mb-6">
              <div className="bg-purple-600/20 p-3 rounded-full border border-purple-500/30 mr-4">
                <BarChart3 className="h-7 w-7 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-purple-300">Operating Efficiency</h2>
            </div>
            <p className="text-purple-200/80 text-sm mb-8 leading-relaxed">
              Evaluate how well management uses company resources to generate revenue and control costs.
            </p>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-purple-200 text-lg font-medium">Operating Margin</span>
                <span className="text-white font-bold text-2xl">{formatPercent(holding.operatingMargin)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-purple-200 text-lg font-medium">Asset Turnover</span>
                <span className="text-white font-bold text-2xl">{formatNumber(holding.assetTurnover, 2)}x</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800/40 rounded-lg p-4">
                <span className="text-purple-200 text-lg font-medium">Revenue Growth</span>
                <span className="text-white font-bold text-2xl">{formatPercent(holding.revenueGrowth)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderETFChart = () => (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-400">
            {holding.ticker} - {holding.company} Performance Metrics
          </h1>
          <button
            onClick={goBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Performance Returns */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold text-green-400">Performance Returns</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Track historical returns and alpha to evaluate fund performance against benchmarks.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">1-Year Return</span>
                <span className="text-green-400 font-bold text-xl">+24.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">3-Year Return</span>
                <span className="text-green-400 font-bold text-xl">+10.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">5-Year Return</span>
                <span className="text-green-400 font-bold text-xl">+15.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Alpha</span>
                <span className="text-green-400 font-bold text-xl">+0.1%</span>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-red-400 mr-3" />
              <h2 className="text-xl font-semibold text-red-400">Risk Metrics</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Understand volatility, correlation to market, and risk-adjusted returns for informed decisions.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Beta</span>
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Sharpe Ratio</span>
                <span className="text-white font-bold text-xl">1.42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Standard Deviation</span>
                <span className="text-white font-bold text-xl">17.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Tracking Error</span>
                <span className="text-white font-bold text-xl">0.02%</span>
              </div>
            </div>
          </div>

          {/* Fund Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Info className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-blue-400">Fund Details</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Critical fund characteristics affecting long-term returns and investment costs.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Expense Ratio</span>
                <span className="text-white font-bold text-xl">0.03%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Assets Under Management</span>
                <span className="text-white font-bold text-xl">$1.3B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
            <h2 className="text-xl font-semibold text-purple-400">Risk Assessment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-white font-semibold text-lg">Beta: </span>
              <span className="text-gray-300">Measures volatility relative to market. More volatile than market.</span>
            </div>
            <div>
              <span className="text-white font-semibold text-lg">Sharpe Ratio: </span>
              <span className="text-gray-300">Risk-adjusted return measure. Good risk-adjusted returns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBondChart = () => (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-400">
            {holding.ticker} - {holding.company} Bond Metrics
          </h1>
          <button
            onClick={goBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Yield & Income */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Percent className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold text-green-400">Yield & Income</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Current income generation and yield characteristics of the bond investment.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Current Yield</span>
                <span className="text-white font-bold text-xl">{formatPercent(holding.dividendYield || 2.51)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Annual Income</span>
                <span className="text-white font-bold text-xl">{formatCurrency(holding.shares * (holding.dividend || 0))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Yield to Maturity</span>
                <span className="text-white font-bold text-xl">4.2%</span>
              </div>
            </div>
          </div>

          {/* Risk Characteristics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-blue-400">Risk Characteristics</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Interest rate sensitivity and credit quality assessment for risk management.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Duration</span>
                <span className="text-white font-bold text-xl">6.8 years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Credit Rating</span>
                <span className="text-white font-bold text-xl">AAA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Interest Rate Risk</span>
                <span className="text-yellow-400 font-bold text-xl">Moderate</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400 mr-3" />
              <h2 className="text-xl font-semibold text-purple-400">Performance Metrics</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Historical performance and volatility characteristics of the bond fund.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">1-Year Return</span>
                <span className="text-green-400 font-bold text-xl">+2.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">3-Year Return</span>
                <span className="text-red-400 font-bold text-xl">-1.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Volatility</span>
                <span className="text-white font-bold text-xl">3.2%</span>
              </div>
            </div>
          </div>

          {/* Fund Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-orange-400 mr-3" />
              <h2 className="text-xl font-semibold text-orange-400">Fund Information</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Key fund characteristics and management details for investment evaluation.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Expense Ratio</span>
                <span className="text-white font-bold text-xl">0.05%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Average Maturity</span>
                <span className="text-white font-bold text-xl">8.5 years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg">Assets Under Management</span>
                <span className="text-white font-bold text-xl">$45.2B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {holding.type === 'stocks' && renderStockChart()}
      {holding.type === 'etfs' && renderETFChart()}
      {holding.type === 'bonds' && renderBondChart()}
    </>
  );
};