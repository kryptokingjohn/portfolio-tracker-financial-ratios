import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Target } from 'lucide-react';
import { Holding } from '../types/portfolio';

interface AdvancedChartingProps {
  holdings: Holding[];
  portfolioMetrics?: any;
}

export const AdvancedCharting: React.FC<AdvancedChartingProps> = ({ holdings, portfolioMetrics }) => {
  const [selectedChart, setSelectedChart] = useState<'performance' | 'allocation' | 'risk' | 'correlation'>('performance');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y'>('1Y');

  // Generate mock performance data
  const generatePerformanceData = () => {
    const dataPoints = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 252;
    const data = [];
    let portfolioValue = 100;
    let benchmarkValue = 100;
    
    for (let i = 0; i < dataPoints; i++) {
      const portfolioReturn = (Math.random() - 0.48) * 0.02; // Slight positive bias
      const benchmarkReturn = (Math.random() - 0.5) * 0.015;
      
      portfolioValue *= (1 + portfolioReturn);
      benchmarkValue *= (1 + benchmarkReturn);
      
      data.push({
        date: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        portfolio: portfolioValue,
        benchmark: benchmarkValue,
        alpha: portfolioValue - benchmarkValue
      });
    }
    
    return data;
  };

  const performanceData = generatePerformanceData();

  // Calculate allocation data
  const calculateAllocationData = () => {
    let totalValue = 0;
    holdings.forEach(holding => {
      totalValue += holding.shares * holding.currentPrice;
    });

    const sectorAllocation: { [key: string]: number } = {};
    const typeAllocation: { [key: string]: number } = {};
    const accountAllocation: { [key: string]: number } = {};

    holdings.forEach(holding => {
      const value = holding.shares * holding.currentPrice;
      const percentage = (value / totalValue) * 100;

      // Sector allocation
      if (!sectorAllocation[holding.sector]) {
        sectorAllocation[holding.sector] = 0;
      }
      sectorAllocation[holding.sector] += percentage;

      // Type allocation
      if (!typeAllocation[holding.type]) {
        typeAllocation[holding.type] = 0;
      }
      typeAllocation[holding.type] += percentage;

      // Account allocation
      if (!accountAllocation[holding.accountType]) {
        accountAllocation[holding.accountType] = 0;
      }
      accountAllocation[holding.accountType] += percentage;
    });

    return { sectorAllocation, typeAllocation, accountAllocation };
  };

  const allocationData = calculateAllocationData();

  // Generate risk over time data
  const generateRiskData = () => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        month: new Date(Date.now() - (12 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        volatility: 0.12 + (Math.random() - 0.5) * 0.04,
        sharpe: 1.2 + (Math.random() - 0.5) * 0.6,
        beta: 0.9 + (Math.random() - 0.5) * 0.4,
        maxDrawdown: -0.05 - Math.random() * 0.1
      });
    }
    return data;
  };

  const riskData = generateRiskData();

  const formatPercent = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatRatio = (num: number) => {
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {[
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'allocation', label: 'Allocation', icon: PieChart },
            { id: 'risk', label: 'Risk Metrics', icon: BarChart3 },
            { id: 'correlation', label: 'Correlation', icon: Activity }
          ].map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors backdrop-blur-sm ${
                  selectedChart === chart.id
                    ? 'bg-blue-600/80 text-white border border-blue-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{chart.label}</span>
              </button>
            );
          })}
        </div>

        {selectedChart === 'performance' && (
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="3Y">3 Years</option>
            <option value="5Y">5 Years</option>
          </select>
        )}
      </div>

      {/* Performance Chart */}
      {selectedChart === 'performance' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="bg-blue-600 p-2 rounded-full mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Portfolio Performance vs Benchmark ({timeframe})
          </h3>
          
          <div className="h-80 bg-gradient-to-br from-gray-800/30 to-blue-900/30 backdrop-blur-sm rounded-lg p-4 relative border border-gray-600/30">
            <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line
                  key={`grid-${i}`}
                  x1="60"
                  y1={50 + i * 40}
                  x2="750"
                  y2={50 + i * 40}
                  stroke="#e5e7eb"
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
                  className="text-xs fill-gray-300"
                >
                  {(130 - i * 10)}%
                </text>
              ))}
              
              {/* Portfolio line */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                points={performanceData.map((point, index) => 
                  `${60 + (index * (690 / (performanceData.length - 1)))},${250 - ((point.portfolio - 80) * 4)}`
                ).join(' ')}
              />
              
              {/* Benchmark line */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={performanceData.map((point, index) => 
                  `${60 + (index * (690 / (performanceData.length - 1)))},${250 - ((point.benchmark - 80) * 4)}`
                ).join(' ')}
              />
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-600/50">
              <div className="flex items-center space-x-4 text-sm text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-400"></div>
                  <span>Portfolio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-green-400 border-dashed border-t-2"></div>
                  <span>Benchmark</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-xl">
              <div className="text-sm font-medium text-blue-200">Total Return</div>
              <div className="text-lg font-bold text-white">
                {formatPercent((performanceData[performanceData.length - 1].portfolio - 100) / 100)}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-900/60 to-green-800/60 backdrop-blur-sm rounded-xl border border-green-500/30 shadow-xl">
              <div className="text-sm font-medium text-green-200">Benchmark Return</div>
              <div className="text-lg font-bold text-white">
                {formatPercent((performanceData[performanceData.length - 1].benchmark - 100) / 100)}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-xl">
              <div className="text-sm font-medium text-purple-200">Alpha</div>
              <div className="text-lg font-bold text-white">
                {formatPercent(performanceData[performanceData.length - 1].alpha / 100)}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-900/60 to-orange-800/60 backdrop-blur-sm rounded-xl border border-orange-500/30 shadow-xl">
              <div className="text-sm font-medium text-orange-200">Volatility</div>
              <div className="text-lg font-bold text-white">16.8%</div>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Charts */}
      {selectedChart === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sector Allocation */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
            <h4 className="font-semibold text-white mb-4">By Sector</h4>
            <div className="space-y-3">
              {Object.entries(allocationData.sectorAllocation).map(([sector, percentage], index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                return (
                  <div key={sector} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm text-gray-300">{sector}</span>
                    </div>
                    <span className="font-medium text-white">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Type Allocation */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
            <h4 className="font-semibold text-white mb-4">By Asset Type</h4>
            <div className="space-y-3">
              {Object.entries(allocationData.typeAllocation).map(([type, percentage], index) => {
                const colors = ['bg-indigo-500', 'bg-teal-500', 'bg-pink-500'];
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm text-gray-300 capitalize">{type}</span>
                    </div>
                    <span className="font-medium text-white">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Allocation */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
            <h4 className="font-semibold text-white mb-4">By Account Type</h4>
            <div className="space-y-3">
              {Object.entries(allocationData.accountAllocation).map(([account, percentage], index) => {
                const colors = ['bg-yellow-500', 'bg-cyan-500', 'bg-rose-500', 'bg-lime-500'];
                return (
                  <div key={account} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="text-sm text-gray-300">{account.replace('_', ' ')}</span>
                    </div>
                    <span className="font-medium text-white">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Risk Metrics Over Time */}
      {selectedChart === 'risk' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="bg-red-600 p-2 rounded-full mr-3">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Risk Metrics Over Time
          </h3>
          
          <div className="h-80 bg-gradient-to-br from-gray-800/30 to-red-900/30 backdrop-blur-sm rounded-lg p-4 relative border border-gray-600/30">
            <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line
                  key={`grid-${i}`}
                  x1="60"
                  y1={50 + i * 40}
                  x2="750"
                  y2={50 + i * 40}
                  stroke="#4b5563"
                  strokeWidth="1"
                />
              ))}
              
              {/* Volatility line */}
              <polyline
                fill="none"
                stroke="#EF4444"
                strokeWidth="3"
                points={riskData.map((point, index) => 
                  `${60 + (index * (690 / (riskData.length - 1)))},${250 - (point.volatility * 1000)}`
                ).join(' ')}
              />
              
              {/* Sharpe ratio line */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={riskData.map((point, index) => 
                  `${60 + (index * (690 / (riskData.length - 1)))},${250 - (point.sharpe * 50)}`
                ).join(' ')}
              />
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-600/50">
              <div className="flex items-center space-x-4 text-sm text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-400"></div>
                  <span>Volatility</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-400"></div>
                  <span>Sharpe Ratio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correlation Heatmap */}
      {selectedChart === 'correlation' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="bg-green-600 p-2 rounded-full mr-3">
              <Activity className="h-4 w-4 text-white" />
            </div>
            Holdings Correlation Heatmap
          </h3>
          
          <div className="grid grid-cols-6 gap-1 mb-4">
            {holdings.slice(0, 36).map((holding, index) => {
              const correlation = Math.random(); // Mock correlation
              const intensity = Math.abs(correlation);
              const hue = correlation > 0 ? '220' : '0'; // Blue for positive, red for negative
              
              return (
                <div
                  key={holding.ticker}
                  className="aspect-square flex items-center justify-center text-xs font-medium text-white rounded"
                  style={{
                    backgroundColor: `hsl(${hue}, 70%, ${50 + intensity * 30}%)`,
                    opacity: 0.7 + intensity * 0.3
                  }}
                  title={`${holding.ticker}: ${formatRatio(correlation)}`}
                >
                  {holding.ticker.slice(0, 3)}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Strong Negative (-1.0)</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
            </div>
            <span>Strong Positive (+1.0)</span>
          </div>
        </div>
      )}
    </div>
  );
};