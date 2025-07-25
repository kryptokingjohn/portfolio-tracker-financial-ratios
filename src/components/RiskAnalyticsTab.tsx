import React, { useState } from 'react';
import { Shield, TrendingDown, BarChart3, Target, AlertTriangle, Activity, Zap, Eye } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { RiskAnalytics, RiskMetrics, FactorExposure, RiskDecomposition } from '../utils/riskAnalytics';

interface RiskAnalyticsTabProps {
  holdings: Holding[];
}

export const RiskAnalyticsTab: React.FC<RiskAnalyticsTabProps> = ({ holdings }) => {
  const [selectedRiskView, setSelectedRiskView] = useState<'overview' | 'factors' | 'correlations' | 'drawdown'>('overview');

  // Generate mock return data for risk calculations
  const generateMockReturns = (length: number = 252) => {
    const returns = [];
    for (let i = 0; i < length; i++) {
      returns.push((Math.random() - 0.5) * 0.04); // ±2% daily returns
    }
    return returns;
  };

  const portfolioReturns = generateMockReturns();
  const benchmarkReturns = generateMockReturns();
  
  const riskMetrics = RiskAnalytics.calculateRiskMetrics(holdings, portfolioReturns, benchmarkReturns);
  const factorExposures = RiskAnalytics.calculateFactorExposures(holdings);
  const riskDecomposition = RiskAnalytics.decomposeRisk(holdings, factorExposures);
  const correlationMatrix = RiskAnalytics.calculateCorrelationMatrix(holdings);
  const drawdownAnalysis = RiskAnalytics.analyzeDrawdowns(portfolioReturns);

  const formatPercent = (num: number, decimals: number = 2) => {
    return `${(num * 100).toFixed(decimals)}%`;
  };

  const formatRatio = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const getRiskColor = (value: number, thresholds: { good: number; bad: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value >= thresholds.bad) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getFactorColor = (exposure: number) => {
    if (Math.abs(exposure) < 0.1) return 'text-gray-600';
    if (exposure > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Risk Analytics Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Risk Overview', icon: Shield },
            { id: 'factors', label: 'Factor Analysis', icon: Target },
            { id: 'correlations', label: 'Correlations', icon: Activity },
            { id: 'drawdown', label: 'Drawdown Analysis', icon: TrendingDown }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRiskView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  selectedRiskView === tab.id
                    ? 'border-red-500 text-red-600'
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

      {/* Risk Overview */}
      {selectedRiskView === 'overview' && (
        <>
          {/* Risk Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-red-700">Portfolio Beta</div>
                  <div className="text-2xl font-bold text-red-900">{formatRatio(riskMetrics.portfolioBeta)}</div>
                  <div className="text-xs text-red-600">vs Market</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-orange-700">Volatility</div>
                  <div className="text-2xl font-bold text-orange-900">{formatPercent(riskMetrics.volatility)}</div>
                  <div className="text-xs text-orange-600">Annual</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-purple-700">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-purple-900">{formatRatio(riskMetrics.sharpeRatio)}</div>
                  <div className="text-xs text-purple-600">Risk-Adjusted</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-red-700">Max Drawdown</div>
                  <div className="text-2xl font-bold text-red-900">{formatPercent(riskMetrics.maxDrawdown)}</div>
                  <div className="text-xs text-red-600">Worst Decline</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Decomposition */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Risk Decomposition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Risk Components */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Risk Components</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Systematic Risk</span>
                    <span className="font-semibold text-red-600">{formatPercent(riskDecomposition.systematicRisk)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Idiosyncratic Risk</span>
                    <span className="font-semibold text-orange-600">{formatPercent(riskDecomposition.idiosyncraticRisk)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Risk</span>
                    <span className="font-semibold text-gray-900">{formatPercent(riskDecomposition.totalRisk)}</span>
                  </div>
                </div>
              </div>

              {/* Risk Ratios */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Risk-Adjusted Returns</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sharpe Ratio</span>
                    <span className="font-semibold text-blue-600">{formatRatio(riskMetrics.sharpeRatio)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sortino Ratio</span>
                    <span className="font-semibold text-green-600">{formatRatio(riskMetrics.sortinoRatio)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Information Ratio</span>
                    <span className="font-semibold text-purple-600">{formatRatio(riskMetrics.informationRatio)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Treynor Ratio</span>
                    <span className="font-semibold text-indigo-600">{formatRatio(riskMetrics.treynorRatio)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Value at Risk */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Value at Risk Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm font-medium text-red-700 mb-1">5% VaR (Daily)</div>
                <div className="text-2xl font-bold text-red-900">{formatPercent(riskMetrics.valueAtRisk)}</div>
                <div className="text-xs text-red-600">95% confidence</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-red-700 mb-1">Expected Shortfall</div>
                <div className="text-2xl font-bold text-red-900">{formatPercent(riskMetrics.expectedShortfall)}</div>
                <div className="text-xs text-red-600">Conditional VaR</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-red-700 mb-1">Tracking Error</div>
                <div className="text-2xl font-bold text-red-900">{formatPercent(riskMetrics.trackingError)}</div>
                <div className="text-xs text-red-600">vs Benchmark</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Factor Analysis */}
      {selectedRiskView === 'factors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Factor Exposure Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(factorExposures).map(([factor, exposure]) => (
                <div key={factor} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 capitalize">{factor}</span>
                    <span className={`font-bold ${getFactorColor(exposure)}`}>
                      {exposure >= 0 ? '+' : ''}{formatRatio(exposure)}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${exposure >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ 
                          width: `${Math.min(Math.abs(exposure) * 100, 100)}%`,
                          marginLeft: exposure < 0 ? `${100 - Math.min(Math.abs(exposure) * 100, 100)}%` : '0'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getFactorDescription(factor)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factor Attribution */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Factor Attribution to Returns</h3>
            <p className="text-sm text-blue-800 mb-4">
              Estimated contribution of each factor to portfolio performance based on factor loadings and historical factor returns.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(factorExposures).map(([factor, exposure]) => {
                const mockFactorReturn = (Math.random() - 0.5) * 0.1; // Mock factor return
                const contribution = exposure * mockFactorReturn;
                
                return (
                  <div key={factor} className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm font-medium text-gray-700 capitalize">{factor}</div>
                    <div className={`text-lg font-bold ${contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {contribution >= 0 ? '+' : ''}{formatPercent(contribution)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Correlation Matrix */}
      {selectedRiskView === 'correlations' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Correlation Matrix
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  {holdings.slice(0, 10).map(holding => (
                    <th key={holding.ticker} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      {holding.ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 10).map(holding1 => (
                  <tr key={holding1.ticker}>
                    <td className="px-3 py-2 font-medium text-gray-900">{holding1.ticker}</td>
                    {holdings.slice(0, 10).map(holding2 => {
                      const correlation = correlationMatrix[holding1.ticker]?.[holding2.ticker] || 0;
                      const intensity = Math.abs(correlation);
                      const color = correlation > 0 ? 'bg-blue-500' : 'bg-red-500';
                      
                      return (
                        <td key={holding2.ticker} className="px-3 py-2 text-center">
                          <div 
                            className={`inline-block w-8 h-8 rounded text-white text-xs flex items-center justify-center ${color}`}
                            style={{ opacity: intensity }}
                          >
                            {formatRatio(correlation, 1)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Correlation Scale:</strong> -1.0 (perfect negative) to +1.0 (perfect positive)</p>
            <p>Blue indicates positive correlation, Red indicates negative correlation. Intensity shows strength.</p>
          </div>
        </div>
      )}

      {/* Drawdown Analysis */}
      {selectedRiskView === 'drawdown' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              Drawdown Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-700 mb-1">Current Drawdown</div>
                <div className="text-2xl font-bold text-red-900">{formatPercent(drawdownAnalysis.currentDrawdown)}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-700 mb-1">Maximum Drawdown</div>
                <div className="text-2xl font-bold text-red-900">{formatPercent(drawdownAnalysis.maxDrawdown)}</div>
                <div className="text-xs text-red-600">{drawdownAnalysis.maxDrawdownDate}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-700 mb-1">Recovery Time</div>
                <div className="text-2xl font-bold text-blue-900">{drawdownAnalysis.recoveryTime} days</div>
              </div>
            </div>

            {/* Underwater Periods */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Historical Underwater Periods</h4>
              <div className="space-y-3">
                {drawdownAnalysis.underwaterPeriods.slice(0, 5).map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{period.start} - {period.end}</span>
                      <span className="text-sm text-gray-500 ml-2">({period.duration} days)</span>
                    </div>
                    <span className="font-bold text-red-600">{formatPercent(period.maxDrawdown)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper method for factor descriptions
  const getFactorDescription = (factor: string): string => {
    const descriptions = {
      market: 'Overall market exposure and beta',
      size: 'Small cap vs large cap bias',
      value: 'Value vs growth stock preference',
      profitability: 'Profitable vs unprofitable companies',
      investment: 'Conservative vs aggressive investment',
      momentum: 'Recent price momentum exposure',
      quality: 'High quality vs low quality companies',
      lowVolatility: 'Low volatility vs high volatility stocks'
    };
    return descriptions[factor as keyof typeof descriptions] || 'Factor exposure';
  };
};