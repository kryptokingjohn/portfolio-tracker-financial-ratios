import React, { useState } from 'react';
import { Target, TrendingUp, BarChart3, Award, Calendar } from 'lucide-react';
import { Holding } from '../types/portfolio';

interface BenchmarkData {
  name: string;
  ticker: string;
  description: string;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  tenYearReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  expenseRatio?: number;
  category: 'broad_market' | 'sector' | 'style' | 'international' | 'fixed_income';
}

interface BenchmarkComparisonProps {
  holdings: Holding[];
  portfolioMetrics?: any;
}

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({ holdings, portfolioMetrics }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'broad_market' | 'sector' | 'style' | 'international' | 'fixed_income'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | '1y' | '3y' | '5y' | '10y'>('1y');

  // Comprehensive benchmark universe
  const benchmarks: BenchmarkData[] = [
    // Broad Market
    {
      name: 'S&P 500',
      ticker: 'SPY',
      description: 'Large-cap U.S. stocks',
      ytdReturn: 24.2,
      oneYearReturn: 26.3,
      threeYearReturn: 10.5,
      fiveYearReturn: 13.1,
      tenYearReturn: 12.9,
      volatility: 16.8,
      sharpeRatio: 1.42,
      maxDrawdown: -12.5,
      expenseRatio: 0.09,
      category: 'broad_market'
    },
    {
      name: 'Total Stock Market',
      ticker: 'VTI',
      description: 'Entire U.S. stock market',
      ytdReturn: 23.1,
      oneYearReturn: 25.2,
      threeYearReturn: 9.8,
      fiveYearReturn: 12.4,
      tenYearReturn: 12.2,
      volatility: 17.2,
      sharpeRatio: 1.38,
      maxDrawdown: -13.1,
      expenseRatio: 0.03,
      category: 'broad_market'
    },
    {
      name: 'NASDAQ 100',
      ticker: 'QQQ',
      description: 'Large-cap technology stocks',
      ytdReturn: 27.8,
      oneYearReturn: 29.1,
      threeYearReturn: 8.9,
      fiveYearReturn: 18.2,
      tenYearReturn: 17.8,
      volatility: 22.4,
      sharpeRatio: 1.21,
      maxDrawdown: -18.7,
      expenseRatio: 0.20,
      category: 'broad_market'
    },
    {
      name: 'Russell 2000',
      ticker: 'IWM',
      description: 'Small-cap U.S. stocks',
      ytdReturn: 10.8,
      oneYearReturn: 11.5,
      threeYearReturn: 1.2,
      fiveYearReturn: 8.7,
      tenYearReturn: 9.1,
      volatility: 24.1,
      sharpeRatio: 0.68,
      maxDrawdown: -22.3,
      expenseRatio: 0.19,
      category: 'broad_market'
    },
    // Sector Benchmarks
    {
      name: 'Technology Select',
      ticker: 'XLK',
      description: 'Technology sector',
      ytdReturn: 28.5,
      oneYearReturn: 31.2,
      threeYearReturn: 12.8,
      fiveYearReturn: 19.4,
      tenYearReturn: 18.9,
      volatility: 25.3,
      sharpeRatio: 1.15,
      maxDrawdown: -21.4,
      expenseRatio: 0.10,
      category: 'sector'
    },
    {
      name: 'Healthcare Select',
      ticker: 'XLV',
      description: 'Healthcare sector',
      ytdReturn: 12.4,
      oneYearReturn: 15.7,
      threeYearReturn: 8.9,
      fiveYearReturn: 11.2,
      tenYearReturn: 13.8,
      volatility: 18.9,
      sharpeRatio: 0.89,
      maxDrawdown: -14.2,
      expenseRatio: 0.10,
      category: 'sector'
    },
    {
      name: 'Financial Select',
      ticker: 'XLF',
      description: 'Financial sector',
      ytdReturn: 18.9,
      oneYearReturn: 22.1,
      threeYearReturn: 7.8,
      fiveYearReturn: 9.4,
      tenYearReturn: 10.7,
      volatility: 21.7,
      sharpeRatio: 0.95,
      maxDrawdown: -19.8,
      expenseRatio: 0.10,
      category: 'sector'
    },
    // Style Benchmarks
    {
      name: 'Value Index',
      ticker: 'VTV',
      description: 'Large-cap value stocks',
      ytdReturn: 19.2,
      oneYearReturn: 21.8,
      threeYearReturn: 9.1,
      fiveYearReturn: 10.8,
      tenYearReturn: 11.4,
      volatility: 16.2,
      sharpeRatio: 1.28,
      maxDrawdown: -11.9,
      expenseRatio: 0.04,
      category: 'style'
    },
    {
      name: 'Growth Index',
      ticker: 'VUG',
      description: 'Large-cap growth stocks',
      ytdReturn: 26.8,
      oneYearReturn: 29.4,
      threeYearReturn: 10.2,
      fiveYearReturn: 15.1,
      tenYearReturn: 14.2,
      volatility: 19.8,
      sharpeRatio: 1.41,
      maxDrawdown: -15.7,
      expenseRatio: 0.04,
      category: 'style'
    },
    // International
    {
      name: 'Developed Markets',
      ticker: 'VEA',
      description: 'International developed markets',
      ytdReturn: 8.9,
      oneYearReturn: 12.4,
      threeYearReturn: 4.2,
      fiveYearReturn: 6.8,
      tenYearReturn: 7.1,
      volatility: 18.4,
      sharpeRatio: 0.61,
      maxDrawdown: -16.8,
      expenseRatio: 0.05,
      category: 'international'
    },
    {
      name: 'Emerging Markets',
      ticker: 'VWO',
      description: 'Emerging market stocks',
      ytdReturn: 6.2,
      oneYearReturn: 8.9,
      threeYearReturn: 1.8,
      fiveYearReturn: 4.1,
      tenYearReturn: 5.7,
      volatility: 22.8,
      sharpeRatio: 0.34,
      maxDrawdown: -24.1,
      expenseRatio: 0.08,
      category: 'international'
    },
    // Fixed Income
    {
      name: 'Aggregate Bond',
      ticker: 'BND',
      description: 'Total bond market',
      ytdReturn: 2.1,
      oneYearReturn: 3.8,
      threeYearReturn: -1.2,
      fiveYearReturn: 1.8,
      tenYearReturn: 2.9,
      volatility: 3.8,
      sharpeRatio: 0.45,
      maxDrawdown: -4.2,
      expenseRatio: 0.03,
      category: 'fixed_income'
    }
  ];

  const filteredBenchmarks = selectedCategory === 'all' 
    ? benchmarks 
    : benchmarks.filter(b => b.category === selectedCategory);

  // Mock portfolio performance
  const portfolioPerformance = {
    ytdReturn: 22.5,
    oneYearReturn: 24.8,
    threeYearReturn: 11.2,
    fiveYearReturn: 14.3,
    tenYearReturn: 13.7,
    volatility: 16.8,
    sharpeRatio: 1.42,
    maxDrawdown: -12.3
  };

  const getReturnForPeriod = (data: any, period: string) => {
    switch (period) {
      case 'ytd': return data.ytdReturn;
      case '1y': return data.oneYearReturn;
      case '3y': return data.threeYearReturn;
      case '5y': return data.fiveYearReturn;
      case '10y': return data.tenYearReturn;
      default: return data.oneYearReturn;
    }
  };

  const portfolioReturn = getReturnForPeriod(portfolioPerformance, selectedPeriod);

  const formatPercent = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatRatio = (num: number) => {
    return num.toFixed(2);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      broad_market: 'bg-blue-600/80 text-blue-200 border border-blue-500/30',
      sector: 'bg-green-600/80 text-green-200 border border-green-500/30',
      style: 'bg-purple-600/80 text-purple-200 border border-purple-500/30',
      international: 'bg-orange-600/80 text-orange-200 border border-orange-500/30',
      fixed_income: 'bg-gray-600/80 text-gray-200 border border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-600/80 text-gray-200 border border-gray-500/30';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      broad_market: 'Broad Market',
      sector: 'Sector',
      style: 'Style',
      international: 'International',
      fixed_income: 'Fixed Income'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'broad_market', 'sector', 'style', 'international', 'fixed_income'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors backdrop-blur-sm ${
                selectedCategory === category
                  ? 'bg-blue-600/80 text-white border border-blue-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
              }`}
            >
              {category === 'all' ? 'All Benchmarks' : getCategoryLabel(category)}
            </button>
          ))}
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
        >
          <option value="ytd">Year to Date</option>
          <option value="1y">1 Year</option>
          <option value="3y">3 Years</option>
          <option value="5y">5 Years</option>
          <option value="10y">10 Years</option>
        </select>
      </div>

      {/* Portfolio vs Benchmarks Summary */}
      <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="bg-blue-600 p-2 rounded-full mr-3">
            <Award className="h-4 w-4 text-white" />
          </div>
          Your Portfolio Performance ({selectedPeriod.toUpperCase()})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-200">Return</div>
            <div className="text-2xl font-bold text-white">{formatPercent(portfolioReturn)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-200">Volatility</div>
            <div className="text-2xl font-bold text-white">{formatPercent(portfolioPerformance.volatility)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-200">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-white">{formatRatio(portfolioPerformance.sharpeRatio)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-200">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">{formatPercent(portfolioPerformance.maxDrawdown)}</div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
        <div className="p-6 border-b border-gray-600/50">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="bg-green-600 p-2 rounded-full mr-3">
              <Target className="h-4 w-4 text-white" />
            </div>
            Benchmark Comparison
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Benchmark
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  vs Portfolio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Volatility
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sharpe Ratio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Max Drawdown
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Expense Ratio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600/50">
              {filteredBenchmarks.map((benchmark, index) => {
                const benchmarkReturn = getReturnForPeriod(benchmark, selectedPeriod);
                const outperformance = portfolioReturn - benchmarkReturn;
                
                return (
                  <tr key={benchmark.ticker} className={index % 2 === 0 ? 'bg-gray-700/20' : 'bg-gray-600/20'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{benchmark.name}</div>
                        <div className="text-sm text-gray-300">{benchmark.ticker}</div>
                        <div className="text-xs text-gray-400">{benchmark.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getCategoryColor(benchmark.category)}`}>
                        {getCategoryLabel(benchmark.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${benchmarkReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(benchmarkReturn)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${outperformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {outperformance >= 0 ? '+' : ''}{formatPercent(outperformance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                      {formatPercent(benchmark.volatility)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                      {formatRatio(benchmark.sharpeRatio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-400">
                      {formatPercent(benchmark.maxDrawdown)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                      {benchmark.expenseRatio ? `${benchmark.expenseRatio.toFixed(2)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Ranking */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="bg-purple-600 p-2 rounded-full mr-3">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          Performance Ranking ({selectedPeriod.toUpperCase()})
        </h3>
        
        <div className="space-y-3">
          {[
            { name: 'Your Portfolio', return: portfolioReturn, isPortfolio: true },
            ...filteredBenchmarks.map(b => ({ 
              name: b.name, 
              return: getReturnForPeriod(b, selectedPeriod), 
              isPortfolio: false 
            }))
          ]
            .sort((a, b) => b.return - a.return)
            .map((item, index) => (
              <div 
                key={item.name} 
                className={`flex items-center justify-between p-3 rounded-lg backdrop-blur-sm ${
                  item.isPortfolio ? 'bg-blue-900/60 border border-blue-500/30' : 'bg-gray-700/30 border border-gray-600/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`font-medium ${item.isPortfolio ? 'text-white' : 'text-gray-300'}`}>
                    {item.name}
                  </span>
                  {item.isPortfolio && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-600/80 text-blue-200 rounded-full backdrop-blur-sm border border-blue-500/30">
                      Your Portfolio
                    </span>
                  )}
                </div>
                <span className={`font-bold ${item.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(item.return)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};