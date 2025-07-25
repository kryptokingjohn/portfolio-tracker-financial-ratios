import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Holding, AttributionAnalysis, SectorAttribution } from '../types/portfolio';
import { AttributionCalculator } from '../utils/attributionCalculator';

interface AttributionAnalysisProps {
  holdings: Holding[];
}

export const AttributionAnalysisComponent: React.FC<AttributionAnalysisProps> = ({ holdings }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('1Y');
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  
  const attribution = AttributionCalculator.calculateAttribution(holdings);
  
  const formatPercent = (num: number, decimals: number = 2) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${(num * 100).toFixed(decimals)}%`;
  };
  
  const formatBasisPoints = (num: number) => {
    const bps = num * 10000;
    const sign = bps >= 0 ? '+' : '';
    return `${sign}${bps.toFixed(0)} bps`;
  };
  
  const getEffectColor = (effect: number) => {
    if (effect > 0.001) return 'text-green-600';
    if (effect < -0.001) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const getEffectIcon = (effect: number) => {
    if (effect > 0.001) return <TrendingUp className="h-4 w-4" />;
    if (effect < -0.001) return <TrendingDown className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Attribution Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-600" />
            Performance Attribution Analysis
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-1">Portfolio Return</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatPercent(attribution.totalReturn)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-800 mb-1">Benchmark Return</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercent(attribution.benchmarkReturn)}
            </div>
            <div className="text-xs text-gray-600">S&P 500</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800 mb-1">Active Return</div>
            <div className={`text-2xl font-bold ${attribution.activeReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(attribution.activeReturn)}
            </div>
            <div className="text-xs text-green-600">vs Benchmark</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-800 mb-1">Information Ratio</div>
            <div className="text-2xl font-bold text-purple-900">
              {(attribution.activeReturn / 0.02).toFixed(2)}
            </div>
            <div className="text-xs text-purple-600">Risk-Adjusted</div>
          </div>
        </div>

        {/* Attribution Breakdown */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 p-6">
          <h4 className="text-lg font-semibold text-indigo-900 mb-4">Attribution Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-blue-700 mr-2" />
                <span className="font-medium text-indigo-900">Asset Allocation</span>
              </div>
              <div className={`text-xl font-bold ${getEffectColor(attribution.assetAllocationEffect)}`}>
                {formatBasisPoints(attribution.assetAllocationEffect)}
              </div>
              <p className="text-sm text-indigo-700 mt-1">
                Effect of sector weights vs benchmark
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-green-700 mr-2" />
                <span className="font-medium text-indigo-900">Security Selection</span>
              </div>
              <div className={`text-xl font-bold ${getEffectColor(attribution.securitySelectionEffect)}`}>
                {formatBasisPoints(attribution.securitySelectionEffect)}
              </div>
              <p className="text-sm text-indigo-700 mt-1">
                Effect of individual stock picks
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-purple-700 mr-2" />
                <span className="font-medium text-indigo-900">Interaction</span>
              </div>
              <div className={`text-xl font-bold ${getEffectColor(attribution.interactionEffect)}`}>
                {formatBasisPoints(attribution.interactionEffect)}
              </div>
              <p className="text-sm text-indigo-700 mt-1">
                Combined allocation & selection effects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Attribution Detail */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Sector Attribution Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Breakdown of performance attribution by sector
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio Weight
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benchmark Weight
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio Return
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benchmark Return
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocation Effect
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selection Effect
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Effect
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attribution.sectors.map((sector, index) => (
                <tr key={sector.sector} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{sector.sector}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {formatPercent(sector.portfolioWeight, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {formatPercent(sector.benchmarkWeight, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className={getEffectColor(sector.portfolioReturn)}>
                      {formatPercent(sector.portfolioReturn, 1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {formatPercent(sector.benchmarkReturn, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <div className={`flex items-center justify-center ${getEffectColor(sector.allocationEffect)}`}>
                      {getEffectIcon(sector.allocationEffect)}
                      <span className="ml-1">{formatBasisPoints(sector.allocationEffect)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <div className={`flex items-center justify-center ${getEffectColor(sector.selectionEffect)}`}>
                      {getEffectIcon(sector.selectionEffect)}
                      <span className="ml-1">{formatBasisPoints(sector.selectionEffect)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <div className={`flex items-center justify-center font-semibold ${getEffectColor(sector.totalEffect)}`}>
                      {getEffectIcon(sector.totalEffect)}
                      <span className="ml-1">{formatBasisPoints(sector.totalEffect)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attribution Explanation */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-700 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Understanding Performance Attribution</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Asset Allocation Effect:</strong> Measures the impact of over/underweighting sectors relative to the benchmark.
              </p>
              <p>
                <strong>Security Selection Effect:</strong> Measures the impact of choosing specific securities within each sector.
              </p>
              <p>
                <strong>Interaction Effect:</strong> Captures the combined impact when both allocation and selection decisions work together.
              </p>
              <p className="mt-3 text-xs">
                <strong>Note:</strong> Attribution analysis uses the Brinson-Hood-Beebower model with S&P 500 as benchmark. 
                Basis points (bps) measure performance: 100 bps = 1%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};