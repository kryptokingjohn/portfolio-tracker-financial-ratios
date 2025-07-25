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
      broad_market: 'bg-blue-100 text-blue-800',
      sector: 'bg-green-100 text-green-800',
      style: 'bg-purple-100 text-purple-800',
      international: 'bg-orange-100 text-orange-800',
      fixed_income: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? 'All Benchmarks' : getCategoryLabel(category)}
            </button>
          ))}
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ytd">Year to Date</option>
          <option value="1y">1 Year</option>
          <option value="3y">3 Years</option>
          <option value="5y">5 Years</option>
          <option value="10y">10 Years</option>
        </select>
      </div>

      {/* Portfolio vs Benchmarks Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Your Portfolio Performance ({selectedPeriod.toUpperCase()})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-700">Return</div>
            <div className="text-2xl font-bold text-blue-900">{formatPercent(portfolioReturn)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-700">Volatility</div>
            <div className="text-2xl font-bold text-blue-900">{formatPercent(portfolioPerformance.volatility)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-700">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-blue-900">{formatRatio(portfolioPerformance.sharpeRatio)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-blue-700">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-600">{formatPercent(portfolioPerformance.maxDrawdown)}</div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Benchmark Comparison
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benchmark
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  vs Portfolio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volatility
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sharpe Ratio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Drawdown
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense Ratio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBenchmarks.map((benchmark, index) => {
                const benchmarkReturn = getReturnForPeriod(benchmark, selectedPeriod);
                const outperformance = portfolioReturn - benchmarkReturn;
                
                return (
                  <tr key={benchmark.ticker} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{benchmark.name}</div>
                        <div className="text-sm text-gray-500">{benchmark.ticker}</div>
                        <div className="text-xs text-gray-400">{benchmark.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(benchmark.category)}`}>
                        {getCategoryLabel(benchmark.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(benchmarkReturn)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${outperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {outperformance >= 0 ? '+' : ''}{formatPercent(outperformance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatPercent(benchmark.volatility)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatRatio(benchmark.sharpeRatio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      {formatPercent(benchmark.maxDrawdown)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
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
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.isPortfolio ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
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
                  <span className={`font-medium ${item.isPortfolio ? 'text-blue-900' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  {item.isPortfolio && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      Your Portfolio
                    </span>
                  )}
                </div>
                <span className={`font-bold ${item.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(item.return)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};