import React, { useState } from 'react';
import { Calculator, AlertTriangle, TrendingDown, Target, DollarSign, Info, CheckCircle, XCircle } from 'lucide-react';
import { Holding, Transaction } from '../types/portfolio';
import { TaxOptimizer, TaxOptimizationSuggestion, AssetLocationAnalysis } from '../utils/taxOptimizer';

interface TaxOptimizationTabProps {
  holdings: Holding[];
  transactions: Transaction[];
}

export const TaxOptimizationTab: React.FC<TaxOptimizationTabProps> = ({ holdings, transactions }) => {
  const [taxRate, setTaxRate] = useState(0.24);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const suggestions = TaxOptimizer.analyzeTaxOptimization(holdings, transactions, taxRate);
  const assetLocationAnalysis = TaxOptimizer.calculateAssetLocationEfficiency(holdings);

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-900/40';
      case 'medium': return 'text-yellow-300 bg-yellow-900/40';
      case 'low': return 'text-green-300 bg-green-900/40';
      default: return 'text-gray-300 bg-gray-800/40';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tax_loss_harvest': return TrendingDown;
      case 'asset_location': return Target;
      case 'rebalance_timing': return Calculator;
      case 'wash_sale_warning': return AlertTriangle;
      default: return Info;
    }
  };

  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + Math.max(0, s.potentialSavings), 0);

  return (
    <div className="space-y-6">
      {/* Tax Optimization Summary */}
      <div className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-sm rounded-xl border border-green-500/30 shadow-xl p-6">
        <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center">
          <Calculator className="h-6 w-6 mr-2 text-green-400" />
          Tax Optimization Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm font-medium text-green-300 mb-1">Potential Annual Savings</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalPotentialSavings)}</div>
            <div className="text-sm text-green-400">From {suggestions.length} opportunities</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-green-300 mb-1">Current Tax Rate</div>
            <div className="text-3xl font-bold text-white">{formatPercent(taxRate * 100)}</div>
            <div className="text-sm text-green-400">
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="mt-1 px-2 py-1 border border-green-500/50 rounded text-xs bg-gray-800 text-gray-100"
              >
                <option value={0.10}>10% - Low income</option>
                <option value={0.12}>12% - Low-medium income</option>
                <option value={0.22}>22% - Medium income</option>
                <option value={0.24}>24% - Medium-high income</option>
                <option value={0.32}>32% - High income</option>
                <option value={0.35}>35% - Very high income</option>
                <option value={0.37}>37% - Top bracket</option>
              </select>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-green-300 mb-1">High Priority Items</div>
            <div className="text-3xl font-bold text-red-400">
              {suggestions.filter(s => s.priority === 'high').length}
            </div>
            <div className="text-sm text-green-400">Require immediate attention</div>
          </div>
        </div>
      </div>

      {/* Asset Location Analysis */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-400" />
          Asset Location Efficiency
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taxable Account */}
          <div className="border border-gray-600/50 bg-gray-800/30 rounded-lg p-4">
            <h4 className="font-medium text-gray-100 mb-3">Taxable Accounts</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Efficiency Score</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    assetLocationAnalysis.taxable.efficiency >= 80 ? 'bg-green-500' :
                    assetLocationAnalysis.taxable.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-semibold text-gray-100">{formatPercent(assetLocationAnalysis.taxable.efficiency)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Current Holdings ({assetLocationAnalysis.taxable.current.length})</div>
                <div className="text-xs text-gray-300">
                  {assetLocationAnalysis.taxable.current.slice(0, 3).join(', ')}
                  {assetLocationAnalysis.taxable.current.length > 3 && ` +${assetLocationAnalysis.taxable.current.length - 3} more`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Recommended Holdings ({assetLocationAnalysis.taxable.recommended.length})</div>
                <div className="text-xs text-blue-400">
                  {assetLocationAnalysis.taxable.recommended.slice(0, 3).join(', ')}
                  {assetLocationAnalysis.taxable.recommended.length > 3 && ` +${assetLocationAnalysis.taxable.recommended.length - 3} more`}
                </div>
              </div>
            </div>
          </div>

          {/* Tax-Deferred Account */}
          <div className="border border-gray-600/50 bg-gray-800/30 rounded-lg p-4">
            <h4 className="font-medium text-gray-100 mb-3">Tax-Deferred (401k, IRA)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Efficiency Score</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    assetLocationAnalysis.taxDeferred.efficiency >= 80 ? 'bg-green-500' :
                    assetLocationAnalysis.taxDeferred.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-semibold text-gray-100">{formatPercent(assetLocationAnalysis.taxDeferred.efficiency)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Current Holdings ({assetLocationAnalysis.taxDeferred.current.length})</div>
                <div className="text-xs text-gray-300">
                  {assetLocationAnalysis.taxDeferred.current.slice(0, 3).join(', ')}
                  {assetLocationAnalysis.taxDeferred.current.length > 3 && ` +${assetLocationAnalysis.taxDeferred.current.length - 3} more`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Recommended Holdings ({assetLocationAnalysis.taxDeferred.recommended.length})</div>
                <div className="text-xs text-blue-400">
                  {assetLocationAnalysis.taxDeferred.recommended.slice(0, 3).join(', ')}
                  {assetLocationAnalysis.taxDeferred.recommended.length > 3 && ` +${assetLocationAnalysis.taxDeferred.recommended.length - 3} more`}
                </div>
              </div>
            </div>
          </div>

          {/* Tax-Free Account */}
          <div className="border border-gray-600/50 bg-gray-800/30 rounded-lg p-4">
            <h4 className="font-medium text-gray-100 mb-3">Tax-Free (Roth, HSA)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Efficiency Score</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    assetLocationAnalysis.taxFree.efficiency >= 80 ? 'bg-green-500' :
                    assetLocationAnalysis.taxFree.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-semibold text-gray-100">{formatPercent(assetLocationAnalysis.taxFree.efficiency)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Current Holdings ({assetLocationAnalysis.taxFree.current.length})</div>
                <div className="text-xs text-gray-300">
                  {assetLocationAnalysis.taxFree.current.slice(0, 3).join(', ')}
                  {assetLocationAnalysis.taxFree.current.length > 3 && ` +${assetLocationAnalysis.taxFree.current.length - 3} more`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Recommended Holdings ({assetLocationAnalysis.taxFree.recommended.length})</div>
                <div className="text-xs text-blue-400">
                  {assetLocationAnalysis.taxFree.recommended.slice(0, 3).join(', ')}
                  {assetLocationAnalysis.taxFree.recommended.length > 3 && ` +${assetLocationAnalysis.taxFree.recommended.length - 3} more`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Optimization Suggestions */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400" />
            Tax Optimization Opportunities
          </h3>
        </div>
        
        <div className="divide-y divide-gray-700/50">
          {suggestions.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Great Job!</h3>
              <p className="text-gray-300">No immediate tax optimization opportunities found. Your portfolio appears to be well-optimized from a tax perspective.</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const Icon = getTypeIcon(suggestion.type);
              const isExpanded = selectedSuggestion === suggestion.title;
              
              return (
                <div key={index} className="p-6">
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setSelectedSuggestion(isExpanded ? null : suggestion.title)}
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        suggestion.type === 'wash_sale_warning' ? 'bg-red-900/40' :
                        suggestion.type === 'tax_loss_harvest' ? 'bg-green-900/40' :
                        'bg-blue-900/40'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          suggestion.type === 'wash_sale_warning' ? 'text-red-400' :
                          suggestion.type === 'tax_loss_harvest' ? 'text-green-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-100">{suggestion.title}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{suggestion.description}</p>
                        
                        {suggestion.potentialSavings !== 0 && (
                          <div className={`text-sm font-medium ${
                            suggestion.potentialSavings > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {suggestion.potentialSavings > 0 ? 'Potential Savings: ' : 'Potential Cost: '}
                            {formatCurrency(suggestion.potentialSavings)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-200">
                      {isExpanded ? <XCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 pl-10">
                      <div className="bg-gray-800/40 rounded-lg p-4">
                        <h5 className="font-medium text-gray-100 mb-2">Recommended Action:</h5>
                        <p className="text-sm text-gray-300 mb-3">{suggestion.action}</p>
                        
                        {suggestion.holdings && suggestion.holdings.length > 0 && (
                          <div>
                            <h6 className="font-medium text-gray-100 mb-1">Affected Holdings:</h6>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.holdings.map(ticker => (
                                <span key={ticker} className="px-2 py-1 bg-blue-900/40 text-blue-300 text-xs rounded border border-blue-500/30">
                                  {ticker}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tax Planning Tips */}
      <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-400" />
          Tax Planning Best Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Tax-Loss Harvesting</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Realize losses to offset gains</li>
              <li>• Avoid wash sale rules (30-day period)</li>
              <li>• Consider substantially identical securities</li>
              <li>• Harvest losses throughout the year</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Asset Location</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Hold bonds in tax-deferred accounts</li>
              <li>• Keep growth stocks in tax-free accounts</li>
              <li>• Place dividend stocks in tax-advantaged accounts</li>
              <li>• Review allocation annually</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Timing Strategies</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Hold investments {'>'} 1 year for long-term rates</li>
              <li>• Time rebalancing with tax-loss harvesting</li>
              <li>• Consider year-end tax planning</li>
              <li>• Use new contributions for rebalancing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Account Optimization</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Maximize tax-advantaged account contributions</li>
              <li>• Consider Roth conversions in low-income years</li>
              <li>• Use HSA as retirement account after 65</li>
              <li>• Plan withdrawal sequences in retirement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};