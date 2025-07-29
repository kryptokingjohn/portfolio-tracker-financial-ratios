import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Edit3, ExternalLink, BarChart3, Search, Filter } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { QuickViewChart } from './QuickViewChart';
import { AdvancedModal } from './AdvancedModal';
import { QuickViewModal } from './QuickViewModal';

interface PortfolioTableProps {
  holdings: Holding[];
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ holdings }) => {
  const [sortField, setSortField] = useState<keyof Holding>('currentPrice');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedQuickView, setExpandedQuickView] = useState<string | null>(null);
  const [quickViewModalHolding, setQuickViewModalHolding] = useState<Holding | null>(null);
  const [advancedModalHolding, setAdvancedModalHolding] = useState<Holding | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const handleSort = (field: keyof Holding) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleQuickView = (holdingId: string) => {
    setExpandedQuickView(expandedQuickView === holdingId ? null : holdingId);
  };

  const openQuickView = (holding: Holding) => {
    setQuickViewModalHolding(holding);
  };

  const closeQuickView = () => {
    setQuickViewModalHolding(null);
  };

  const openAdvanced = (holding: Holding) => {
    setAdvancedModalHolding(holding);
  };

  const closeAdvanced = () => {
    setAdvancedModalHolding(null);
  };

  // First sort by total value (shares * currentPrice) in descending order by default
  const filteredAndSortedHoldings = [...holdings]
    .filter(holding => {
      const matchesSearch = searchTerm === '' || 
        holding.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'all' || holding.sector === sectorFilter;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
    // If no specific sort is applied, sort by total value
    if (sortField === 'currentPrice' && sortDirection === 'asc') {
      const aValue = a.shares * a.currentPrice;
      const bValue = b.shares * b.currentPrice;
      return bValue - aValue; // Descending order for total value
    }
    
    // Otherwise use the selected sort field
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const uniqueSectors = Array.from(new Set(holdings.map(h => h.sector))).sort();

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (num: number) => {
    return `$${formatNumber(num)}`;
  };

  const formatPercent = (num: number) => {
    return `${formatNumber(num)}%`;
  };

  const getGainLoss = (holding: Holding) => {
    const currentValue = holding.shares * holding.currentPrice;
    const totalCost = holding.shares * holding.costBasis;
    const gainLoss = currentValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;
    
    return { gainLoss, gainLossPercent, currentValue, totalCost };
  };

  const getUpsidePercent = (holding: Holding) => {
    return ((holding.intrinsicValue - holding.currentPrice) / holding.currentPrice) * 100;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-900/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticker or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              <option value="all">All Sectors</option>
              {uniqueSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            {filteredAndSortedHoldings.length} of {holdings.length} holdings
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                  onClick={() => handleSort('company')}>
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                  onClick={() => handleSort('ticker')}>
                Ticker
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                  onClick={() => handleSort('costBasis')}>
                Cost Basis
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                  onClick={() => handleSort('currentPrice')}>
                Current Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('yearHigh')}>
                52W High
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('yearLow')}>
                52W Low
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('fcf10yr')}>
                10-yr FCF ($B)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('evFcf')}>
                EV/FCF
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('intrinsicValue')}>
                Intrinsic Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Upside %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('pe')}>
                P/E
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('pb')}>
                P/B
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('peg')}>
                PEG
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('debtToEquity')}>
                Debt/Equity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('currentRatio')}>
                Current Ratio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('quickRatio')}>
                Quick Ratio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('roe')}>
                ROE %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('roa')}>
                ROA %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('grossMargin')}>
                Gross Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('netMargin')}>
                Net Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('operatingMargin')}>
                Operating Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('assetTurnover')}>
                Asset Turnover
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                  onClick={() => handleSort('revenueGrowth')}>
                Revenue Growth %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Narrative
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700/50">
            {filteredAndSortedHoldings.map((holding, index) => {
              const { gainLoss, gainLossPercent, currentValue, totalCost } = getGainLoss(holding);
              const upsidePercent = getUpsidePercent(holding);
              
              return (
                <React.Fragment key={holding.id}>
                  <tr className={`backdrop-blur-sm hover:bg-gray-700/30 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-700/20'
                  }`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{holding.company}</div>
                    <div className="text-sm text-gray-400">{holding.sector}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                    {holding.ticker}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{holding.shares} shares</div>
                    <div className="text-sm text-gray-400">Avg Cost: {formatCurrency(holding.costBasis)}</div>
                    <div className="text-sm text-gray-400">Value: {formatCurrency(currentValue)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{formatCurrency(holding.costBasis)}</div>
                    <div className="text-sm text-gray-400">per share</div>
                    <div className="text-sm text-gray-400">Total: {formatCurrency(totalCost)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {gainLoss >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                      {formatCurrency(gainLoss)}
                    </div>
                    <div className={`text-sm ${gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(gainLossPercent)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(holding.yearHigh)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(holding.yearLow)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.fcf10yr, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.evFcf, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(holding.intrinsicValue)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${upsidePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(upsidePercent)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.pe, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.pb, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.peg, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.debtToEquity, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.currentRatio, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.quickRatio, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPercent(holding.roe)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPercent(holding.roa)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPercent(holding.grossMargin)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPercent(holding.netMargin)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPercent(holding.operatingMargin)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(holding.assetTurnover, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPercent(holding.revenueGrowth)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400 max-w-xs">
                    <div className="truncate" title={holding.narrative}>
                      {holding.narrative}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-300 mr-3 p-2 rounded-lg hover:bg-blue-600/20 transition-all shadow-sm hover:shadow-md backdrop-blur-sm">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-2 rounded-lg hover:bg-gray-600/20 transition-all shadow-sm hover:shadow-md backdrop-blur-sm">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openQuickView(holding)}
                      className="ml-2 inline-flex items-center space-x-1 px-3 py-2 text-xs bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>QuickView</span>
                    </button>
                    <button
                      onClick={() => openAdvanced(holding)}
                      className="ml-2 inline-flex items-center space-x-1 px-3 py-2 text-xs bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>Advanced</span>
                    </button>
                  </td>
                </tr>
                  {expandedQuickView === holding.id && (
                    <tr key={`${holding.id}-quickview`}>
                      <td colSpan={26} className="px-4 py-4 bg-gray-900/30 backdrop-blur-sm">
                        <QuickViewChart 
                          holding={holding} 
                          isExpanded={true} 
                          onToggle={() => setExpandedQuickView(null)} 
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* QuickView Modal */}
      {quickViewModalHolding && (
        <QuickViewModal
          holding={quickViewModalHolding}
          isOpen={!!quickViewModalHolding}
          onClose={closeQuickView}
        />
      )}

      {/* Advanced Modal */}
      {advancedModalHolding && (
        <AdvancedModal
          holding={advancedModalHolding}
          isOpen={!!advancedModalHolding}
          onClose={closeAdvanced}
        />
      )}
    </div>
  );
};