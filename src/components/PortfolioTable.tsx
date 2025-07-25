import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Edit3, ExternalLink, BarChart3, Search, Filter } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { QuickViewChart } from './QuickViewChart';

interface PortfolioTableProps {
  holdings: Holding[];
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ holdings }) => {
  const [sortField, setSortField] = useState<keyof Holding>('currentPrice');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedQuickView, setExpandedQuickView] = useState<string | null>(null);
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

  const openQuickView = (ticker: string, company: string, type: string) => {
    // Create a URL with the holding information
    const params = new URLSearchParams({
      ticker,
      company,
      type
    });
    const url = `${window.location.origin}/?${params.toString()}`;
    window.open(url, '_blank');
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticker or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              {uniqueSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredAndSortedHoldings.length} of {holdings.length} holdings
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSort('company')}>
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSort('ticker')}>
                Ticker
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSort('costBasis')}>
                Cost Basis
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSort('currentPrice')}>
                Current Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('yearHigh')}>
                52W High
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('yearLow')}>
                52W Low
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fcf10yr')}>
                10-yr FCF ($B)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('evFcf')}>
                EV/FCF
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('intrinsicValue')}>
                Intrinsic Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upside %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pe')}>
                P/E
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pb')}>
                P/B
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('peg')}>
                PEG
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('debtToEquity')}>
                Debt/Equity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('currentRatio')}>
                Current Ratio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quickRatio')}>
                Quick Ratio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('roe')}>
                ROE %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('roa')}>
                ROA %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('grossMargin')}>
                Gross Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('netMargin')}>
                Net Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('operatingMargin')}>
                Operating Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('assetTurnover')}>
                Asset Turnover
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('revenueGrowth')}>
                Revenue Growth %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Narrative
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedHoldings.map((holding, index) => {
              const { gainLoss, gainLossPercent, currentValue, totalCost } = getGainLoss(holding);
              const upsidePercent = getUpsidePercent(holding);
              
              return (
                <React.Fragment key={holding.id}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{holding.company}</div>
                    <div className="text-sm text-gray-500">{holding.sector}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {holding.ticker}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{holding.shares} shares</div>
                    <div className="text-sm text-gray-500">Avg Cost: {formatCurrency(holding.costBasis)}</div>
                    <div className="text-sm text-gray-500">Value: {formatCurrency(currentValue)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(holding.costBasis)}</div>
                    <div className="text-sm text-gray-500">per share</div>
                    <div className="text-sm text-gray-500">Total: {formatCurrency(totalCost)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                      {formatCurrency(gainLoss)}
                    </div>
                    <div className={`text-sm ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(gainLossPercent)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.yearHigh)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.yearLow)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.fcf10yr, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.evFcf, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.intrinsicValue)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${upsidePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(upsidePercent)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.pe, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.pb, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.peg, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.debtToEquity, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.currentRatio, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.quickRatio, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercent(holding.roe)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercent(holding.roa)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercent(holding.grossMargin)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercent(holding.netMargin)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercent(holding.operatingMargin)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(holding.assetTurnover, 1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercent(holding.revenueGrowth)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                    <div className="truncate" title={holding.narrative}>
                      {holding.narrative}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 mr-3 p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all shadow-sm hover:shadow-md">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all shadow-sm hover:shadow-md">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openQuickView(holding.ticker, holding.company, holding.type)}
                      className="ml-2 inline-flex items-center space-x-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>QuickView</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => toggleQuickView(holding.id)}
                      className="ml-2 inline-flex items-center space-x-1 px-3 py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>Advanced</span>
                    </button>
                  </td>
                </tr>
                  {expandedQuickView === holding.id && (
                    <tr key={`${holding.id}-quickview`}>
                      <td colSpan={26} className="px-4 py-4 bg-gray-50">
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
    </div>
  );
};