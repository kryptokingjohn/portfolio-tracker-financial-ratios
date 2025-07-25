import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target, Award, PieChart, Activity } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { AttributionAnalysisComponent } from './AttributionAnalysis';
import { RiskAnalyticsTab } from './RiskAnalyticsTab';
import { AdvancedCharting } from './AdvancedCharting';
import { BenchmarkComparison } from './BenchmarkComparison';

interface PerformanceTabProps {
  holdings: Holding[];
}

interface BenchmarkData {
  name: string;
  ticker: string;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  tenYearReturn: number;
  currentPrice: number;
  description: string;
}

interface PerformanceMetrics {
  totalReturn: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  tenYearReturn: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  beta: number;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ holdings }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | '1y' | '3y' | '5y' | '10y'>('1y');
  const [selectedAllocationView, setSelectedAllocationView] = useState<'cap' | 'sector' | 'type'>('cap');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'attribution' | 'risk' | 'charts' | 'benchmarks'>('overview');

  // Mock benchmark data - in a real app, this would come from an API
  const benchmarks: BenchmarkData[] = [
    {
      name: 'S&P 500',
      ticker: 'SPY',
      ytdReturn: 24.2,
      oneYearReturn: 26.3,
      threeYearReturn: 10.5,
      fiveYearReturn: 13.1,
      tenYearReturn: 12.9,
      currentPrice: 445.50,
      description: 'Tracks the S&P 500 index of large-cap U.S. stocks'
    },
    {
      name: 'NASDAQ 100',
      ticker: 'QQQ',
      ytdReturn: 27.8,
      oneYearReturn: 29.1,
      threeYearReturn: 8.9,
      fiveYearReturn: 18.2,
      tenYearReturn: 17.8,
      currentPrice: 398.75,
      description: 'Tracks the NASDAQ-100 index of large-cap technology stocks'
    },
    {
      name: 'Russell 2000',
      ticker: 'IWM',
      ytdReturn: 10.8,
      oneYearReturn: 11.5,
      threeYearReturn: 1.2,
      fiveYearReturn: 8.7,
      tenYearReturn: 9.1,
      currentPrice: 218.45,
      description: 'Tracks the Russell 2000 index of small-cap U.S. stocks'
    },
    {
      name: 'Total Stock Market',
      ticker: 'VTI',
      ytdReturn: 23.1,
      oneYearReturn: 25.2,
      threeYearReturn: 9.8,
      fiveYearReturn: 12.4,
      tenYearReturn: 12.2,
      currentPrice: 218.75,
      description: 'Tracks the entire U.S. stock market'
    },
    {
      name: 'International Developed',
      ticker: 'VEA',
      ytdReturn: 8.9,
      oneYearReturn: 12.4,
      threeYearReturn: 4.2,
      fiveYearReturn: 6.8,
      tenYearReturn: 7.1,
      currentPrice: 52.30,
      description: 'Tracks developed international markets excluding the U.S.'
    }
  ];

  // Calculate portfolio performance metrics
  const calculatePortfolioMetrics = (): PerformanceMetrics => {
    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach(holding => {
      const currentValue = holding.shares * holding.currentPrice;
      const cost = holding.shares * holding.costBasis;
      totalValue += currentValue;
      totalCost += cost;
    });

    const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    // Mock performance data - in a real app, this would be calculated from historical data
    return {
      totalReturn,
      ytdReturn: 22.5,
      oneYearReturn: 24.8,
      threeYearReturn: 11.2,
      fiveYearReturn: 14.3,
      tenYearReturn: 13.7,
      sharpeRatio: 1.42,
      volatility: 16.8,
      maxDrawdown: -12.3,
      beta: 1.05
    };
  };

  const portfolioMetrics = calculatePortfolioMetrics();

  // Calculate asset allocation data
  const calculateAssetAllocation = () => {
    let totalValue = 0;
    holdings.forEach(holding => {
      totalValue += holding.shares * holding.currentPrice;
    });

    // Market Cap allocation (simplified categorization based on company size)
    const capAllocation = {
      'Large Cap': 0,
      'Mid Cap': 0,
      'Small Cap': 0,
      'Bonds': 0,
      'ETFs': 0
    };

    // Sector allocation
    const sectorAllocation: { [key: string]: number } = {};

    // Asset type allocation
    const typeAllocation = {
      'Stocks': 0,
      'ETFs': 0,
      'Bonds': 0
    };

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      const percentage = (value / totalValue) * 100;

      // Market cap categorization (simplified)
      if (holding.type === 'bonds') {
        capAllocation['Bonds'] += percentage;
      } else if (holding.type === 'etfs') {
        capAllocation['ETFs'] += percentage;
      } else {
        // Simplified market cap classification based on current price
        if (holding.currentPrice > 200) {
          capAllocation['Large Cap'] += percentage;
        } else if (holding.currentPrice > 50) {
          capAllocation['Mid Cap'] += percentage;
        } else {
          capAllocation['Small Cap'] += percentage;
        }
      }

      // Sector allocation
      if (!sectorAllocation[holding.sector]) {
        sectorAllocation[holding.sector] = 0;
      }
      sectorAllocation[holding.sector] += percentage;

      // Type allocation
      if (holding.type === 'stocks') {
        typeAllocation['Stocks'] += percentage;
      } else if (holding.type === 'etfs') {
        typeAllocation['ETFs'] += percentage;
      } else {
        typeAllocation['Bonds'] += percentage;
      }
    });

    return { capAllocation, sectorAllocation, typeAllocation };
  };

  // Calculate key portfolio metrics for visualization
  const calculateKeyMetrics = () => {
    let totalValue = 0;
    let weightedPE = 0;
    let weightedPB = 0;
    let weightedROE = 0;
    let weightedDebtToEquity = 0;
    let weightedDividendYield = 0;
    let weightedRevenueGrowth = 0;

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      totalValue += value;
    });

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      const weight = value / totalValue;

      if (holding.type === 'stocks') {
        weightedPE += holding.pe * weight;
        weightedPB += holding.pb * weight;
        weightedROE += holding.roe * weight;
        weightedDebtToEquity += holding.debtToEquity * weight;
        weightedRevenueGrowth += holding.revenueGrowth * weight;
      }

      if (holding.dividendYield) {
        weightedDividendYield += holding.dividendYield * weight;
      }
    });

    return {
      weightedPE,
      weightedPB,
      weightedROE,
      weightedDebtToEquity,
      weightedDividendYield,
      weightedRevenueGrowth
    };
  };

  const { capAllocation, sectorAllocation, typeAllocation } = calculateAssetAllocation();
  const keyMetrics = calculateKeyMetrics();

  const getReturnForPeriod = (metrics: PerformanceMetrics | BenchmarkData, period: string) => {
    switch (period) {
      case 'ytd': return metrics.ytdReturn;
      case '1y': return metrics.oneYearReturn;
      case '3y': return metrics.threeYearReturn;
      case '5y': return metrics.fiveYearReturn;
      case '10y': return metrics.tenYearReturn;
      default: return metrics.oneYearReturn;
    }
  };

  const portfolioReturn = getReturnForPeriod(portfolioMetrics, selectedPeriod);

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  // Mock historical performance data for chart
  const generateChartData = () => {
    let dataPoints: any[] = [];
    let labels: string[] = [];
    
    // Generate data points based on selected period
    switch (selectedPeriod) {
      case 'ytd':
        // Year to date - monthly data from January to current month
        const currentMonth = new Date().getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels = monthNames.slice(0, currentMonth + 1);
        break;
      case '1y':
        // 1 year - monthly data for 12 months
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
      case '3y':
        // 3 years - quarterly data
        labels = ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
        break;
      case '5y':
        // 5 years - yearly data
        labels = ['2020', '2021', '2022', '2023', '2024'];
        break;
      case '10y':
        // 10 years - yearly data
        labels = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        break;
      default:
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    return labels.map((label, index) => {
      const dataPoint: any = {
        period: label,
        portfolio: 100 + (portfolioReturn / 12) * (index + 1) + (Math.random() - 0.5) * 4
      };
      
      // Add all benchmarks to the data point
      benchmarks.forEach(benchmark => {
        const benchmarkReturn = getReturnForPeriod(benchmark, selectedPeriod);
        const timeMultiplier = labels.length;
        dataPoint[benchmark.ticker] = 100 + (benchmarkReturn / timeMultiplier) * (index + 1) + (Math.random() - 0.5) * 3;
      });
      
      return dataPoint;
    });
  };

  const chartData = generateChartData();

  const getAllocationData = () => {
    switch (selectedAllocationView) {
      case 'cap':
        return Object.entries(capAllocation).filter(([_, value]) => value > 0);
      case 'sector':
        return Object.entries(sectorAllocation).filter(([_, value]) => value > 0);
      case 'type':
        return Object.entries(typeAllocation).filter(([_, value]) => value > 0);
      default:
        return Object.entries(capAllocation).filter(([_, value]) => value > 0);
    }
  };

  const allocationData = getAllocationData();
  const allocationColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Performance Overview', icon: TrendingUp },
            { id: 'attribution', label: 'Attribution Analysis', icon: Target },
            { id: 'risk', label: 'Risk Analytics', icon: BarChart3 },
            { id: 'charts', label: 'Advanced Charts', icon: Activity },
            { id: 'benchmarks', label: 'Benchmark Comparison', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'attribution' && (
        <AttributionAnalysisComponent holdings={holdings} />
      )}

      {activeSubTab === 'risk' && (
        <RiskAnalyticsTab holdings={holdings} />
      )}

      {activeSubTab === 'charts' && (
        <AdvancedCharting holdings={holdings} portfolioMetrics={portfolioMetrics} />
      )}

      {activeSubTab === 'benchmarks' && (
        <BenchmarkComparison holdings={holdings} portfolioMetrics={portfolioMetrics} />
      )}

      {activeSubTab === 'overview' && (
        <>
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-700" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-blue-700">Total Return</div>
              <div className={`text-2xl font-bold ${portfolioMetrics.totalReturn >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {formatPercent(portfolioMetrics.totalReturn)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-700" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-purple-700">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-purple-900">{formatNumber(portfolioMetrics.sharpeRatio)}</div>
              <div className="text-xs text-purple-600">Risk-adjusted return</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-700" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-orange-700">Volatility</div>
              <div className="text-2xl font-bold text-orange-900">{formatPercent(portfolioMetrics.volatility)}</div>
              <div className="text-xs text-orange-600">Annual standard deviation</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-700" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-red-700">Max Drawdown</div>
              <div className="text-2xl font-bold text-red-800">{formatPercent(portfolioMetrics.maxDrawdown)}</div>
              <div className="text-xs text-red-600">Largest peak-to-trough decline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-purple-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-600" />
            Asset Allocation
          </h3>
          <select
            value={selectedAllocationView}
            onChange={(e) => setSelectedAllocationView(e.target.value as any)}
            className="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
          >
            <option value="cap">By Market Cap</option>
            <option value="sector">By Sector</option>
            <option value="type">By Asset Type</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Visualization */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {allocationData.reduce((acc, [label, percentage], index) => {
                  const startAngle = acc.currentAngle;
                  const angle = (percentage / 100) * 360;
                  const endAngle = startAngle + angle;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');

                  acc.elements.push(
                    <path
                      key={label}
                      d={pathData}
                      fill={allocationColors[index % allocationColors.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                  
                  acc.currentAngle = endAngle;
                  return acc;
                }, { elements: [] as JSX.Element[], currentAngle: 0 }).elements}
              </svg>
            </div>
          </div>

          {/* Legend and Data */}
          <div className="space-y-3">
            {allocationData.map(([label, percentage], index) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: allocationColors[index % allocationColors.length] }}
                  ></div>
                  <span className="font-semibold text-purple-900">{label}</span>
                </div>
                <span className="text-sm font-bold text-purple-700">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Portfolio Metrics */}
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg shadow-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-6 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-indigo-600" />
          Key Portfolio Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Valuation Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-indigo-900 border-b border-indigo-200 pb-2">Valuation</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Weighted P/E Ratio</span>
                <span className="font-bold text-indigo-900">{keyMetrics.weightedPE.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Weighted P/B Ratio</span>
                <span className="font-bold text-indigo-900">{keyMetrics.weightedPB.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Dividend Yield</span>
                <span className="font-semibold text-green-600">{keyMetrics.weightedDividendYield.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Profitability Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-indigo-900 border-b border-indigo-200 pb-2">Profitability</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Weighted ROE</span>
                <span className="font-semibold text-green-600">{keyMetrics.weightedROE.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Revenue Growth</span>
                <span className="font-semibold text-blue-600">{keyMetrics.weightedRevenueGrowth.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-indigo-900 border-b border-indigo-200 pb-2">Risk</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Debt/Equity Ratio</span>
                <span className="font-bold text-indigo-900">{keyMetrics.weightedDebtToEquity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600">Portfolio Beta</span>
                <span className="font-bold text-indigo-900">{portfolioMetrics.beta.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Bar Chart */}
        <div className="mt-8">
          <h4 className="font-semibold text-indigo-900 mb-4">Portfolio vs Market Averages</h4>
          <div className="space-y-4">
            {[
              { label: 'P/E Ratio', portfolio: keyMetrics.weightedPE, market: 21.5, unit: '' },
              { label: 'P/B Ratio', portfolio: keyMetrics.weightedPB, market: 3.2, unit: '' },
              { label: 'ROE', portfolio: keyMetrics.weightedROE, market: 15.8, unit: '%' },
              { label: 'Dividend Yield', portfolio: keyMetrics.weightedDividendYield, market: 1.8, unit: '%' },
              { label: 'Revenue Growth', portfolio: keyMetrics.weightedRevenueGrowth, market: 6.2, unit: '%' }
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-indigo-700">{metric.label}</span>
                  <div className="flex space-x-4">
                    <span className="font-semibold text-blue-600">Portfolio: {metric.portfolio.toFixed(1)}{metric.unit}</span>
                    <span className="font-medium text-gray-500">Market: {metric.market}{metric.unit}</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ 
                        width: `${Math.min((metric.portfolio / (Math.max(metric.portfolio, metric.market) * 1.2)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 w-1 h-3 bg-gray-600 rounded-full shadow-sm"
                    style={{ 
                      left: `${Math.min((metric.market / (Math.max(metric.portfolio, metric.market) * 1.2)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-blue-600" />
            Performance vs Benchmarks
          </h3>
          <div>
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Your Portfolio</div>
            <div className={`text-2xl font-bold ${portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(portfolioReturn)}
            </div>
          </div>
          
          {benchmarks.map((benchmark, index) => {
            const benchmarkReturn = getReturnForPeriod(benchmark, selectedPeriod);
            const outperformance = portfolioReturn - benchmarkReturn;
            const colors = ['bg-gray-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50', 'bg-indigo-50'];
            
            return (
              <div key={benchmark.ticker} className={`text-center p-4 ${colors[index % colors.length]} rounded-lg`}>
                <div className="text-xs font-medium text-gray-500 mb-1">{benchmark.ticker}</div>
                <div className={`text-lg font-bold ${benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(benchmarkReturn)}
                </div>
                <div className={`text-xs ${outperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {outperformance >= 0 ? '+' : ''}{formatPercent(outperformance)} vs you
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {benchmarks.map(benchmark => (
            <div key={benchmark.ticker} className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-1">
                {benchmark.name} ({benchmark.ticker})
              </div>
              <div>{benchmark.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Performance Chart ({selectedPeriod.toUpperCase()})
        </h3>
        
        {/* Simple Line Chart Visualization */}
        <div className="h-80 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 relative border border-blue-100">
          <svg viewBox="0 0 800 300" className="w-full h-full">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line
                key={`grid-${i}`}
                x1="60"
                y1={50 + i * 40}
                x2="750"
                y2={50 + i * 40}
                stroke="#dbeafe"
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <text
                key={`y-label-${i}`}
                x="50"
                y={55 + i * 40}
                textAnchor="end"
                className="text-xs fill-blue-600 font-medium"
              >
                {(125 - i * 10)}%
              </text>
            ))}
            
            {/* X-axis labels */}
            {chartData.map((point, index) => {
              // Only show every other label for longer time periods to avoid crowding
              const showLabel = selectedPeriod === '3y' ? index % 2 === 0 : 
                               selectedPeriod === '5y' ? true :
                               selectedPeriod === '10y' ? index % 2 === 0 : true;
              
              if (!showLabel) return null;
              
              return (
              <text
                key={`x-label-${index}`}
                x={60 + (index * (690 / (chartData.length - 1)))}
                y="280"
                textAnchor="middle"
                className={`${selectedPeriod === '10y' || selectedPeriod === '3y' ? 'text-xs' : 'text-xs'} fill-blue-600 font-medium`}
              >
                {point.period}
              </text>
              );
            })}
            
            {/* Portfolio line */}
            <polyline
              fill="none"
              stroke="url(#portfolioGradient)"
              strokeWidth="4"
              points={chartData.map((point, index) => 
                `${60 + (index * (690 / (chartData.length - 1)))},${250 - ((point.portfolio - 75) * 4)}`
              ).join(' ')}
            />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            
            {/* Benchmark lines */}
            {benchmarks.map((benchmark, benchmarkIndex) => {
              const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
              return (
                <polyline
                  key={benchmark.ticker}
                  fill="none"
                  stroke={colors[benchmarkIndex % colors.length]}
                  strokeWidth="3"
                  strokeDasharray={benchmarkIndex > 0 ? "5,5" : "none"}
                  points={chartData.map((point, index) => 
                    `${60 + (index * (690 / (chartData.length - 1)))},${250 - ((point[benchmark.ticker] - 75) * 4)}`
                  ).join(' ')}
                />
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg shadow-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-sm"></div>
                <span className="font-medium text-blue-900">Your Portfolio</span>
              </div>
              {benchmarks.map((benchmark, index) => {
                const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                return (
                  <div key={benchmark.ticker} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="font-medium text-gray-700">{benchmark.ticker}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          All Benchmarks Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benchmark
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YTD
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1 Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  3 Years
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  5 Years
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  10 Years
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="bg-blue-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-900">Your Portfolio</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${portfolioMetrics.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(portfolioMetrics.ytdReturn)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${portfolioMetrics.oneYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(portfolioMetrics.oneYearReturn)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${portfolioMetrics.threeYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(portfolioMetrics.threeYearReturn)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${portfolioMetrics.fiveYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(portfolioMetrics.fiveYearReturn)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${portfolioMetrics.tenYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(portfolioMetrics.tenYearReturn)}
                  </span>
                </td>
              </tr>
              {benchmarks.map((benchmark, index) => (
                <tr key={benchmark.ticker} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{benchmark.name}</div>
                    <div className="text-sm text-gray-500">{benchmark.ticker}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm ${benchmark.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(benchmark.ytdReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm ${benchmark.oneYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(benchmark.oneYearReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm ${benchmark.threeYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(benchmark.threeYearReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm ${benchmark.fiveYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(benchmark.fiveYearReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm ${benchmark.tenYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(benchmark.tenYearReturn)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Beta</div>
            <div className="text-xl font-bold text-gray-900">{formatNumber(portfolioMetrics.beta)}</div>
            <div className="text-xs text-gray-500">vs S&P 500</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Sharpe Ratio</div>
            <div className="text-xl font-bold text-gray-900">{formatNumber(portfolioMetrics.sharpeRatio)}</div>
            <div className="text-xs text-gray-500">Risk-adjusted return</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Volatility</div>
            <div className="text-xl font-bold text-gray-900">{formatPercent(portfolioMetrics.volatility)}</div>
            <div className="text-xs text-gray-500">Annual std deviation</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Max Drawdown</div>
            <div className="text-xl font-bold text-red-600">{formatPercent(portfolioMetrics.maxDrawdown)}</div>
            <div className="text-xs text-gray-500">Worst decline</div>
          </div>
        </div>
      </div>
        </>
      )}

    </div>
  );
};