import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Settings, Search, Filter, TrendingUp, TrendingDown, ExternalLink, BarChart3, Eye } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { useSubscription } from '../hooks/useSubscription';
import { AccessibleTable, AccessibleTableHeader, AccessibleTableRow, AccessibleTableCell } from './AccessibleTableHeader';
import { ColumnCustomizationModal, AVAILABLE_COLUMNS, DEFAULT_COLUMNS } from './ColumnCustomizationModal';
import { FinancialMetricTooltip, FinancialMetricsHelpModal } from './FinancialMetricsHelp';
import { ARIA, announceToScreenReader, generateId } from '../utils/accessibility';
import { useAuth } from '../hooks/useAuthSimple';

interface AccessiblePortfolioTableProps {
  holdings: Holding[];
  filter?: 'stocks' | 'etfs' | 'bonds' | 'all';
  onQuickView?: (holding: Holding) => void;
  onAdvancedView?: (holding: Holding) => void;
}

// Column configuration with accessibility metadata
interface ColumnDefinition {
  key: string;
  label: string;
  accessor: (holding: Holding) => any;
  render: (value: any, holding: Holding) => React.ReactNode;
  sortable: boolean;
  isNumeric: boolean;
  tooltip?: string;
  isPremium?: boolean;
  category: string;
  width?: string;
}

export const AccessiblePortfolioTable: React.FC<AccessiblePortfolioTableProps> = ({
  holdings,
  filter = 'all',
  onQuickView,
  onAdvancedView,
}) => {
  const { user } = useAuth();
  const { hasQuickViewAccess, hasAdvancedAccess, isPremium, currentPlan } = useSubscription();
  const isPremiumUser = isPremium();

  // State management
  const [sortField, setSortField] = useState<string>('totalValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    isPremiumUser ? DEFAULT_COLUMNS.premium : DEFAULT_COLUMNS.free
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Generate unique IDs for accessibility
  const tableId = generateId('portfolio-table');
  const searchId = generateId('search-input');
  const filterId = generateId('sector-filter');

  // Update visible columns when premium status changes
  useEffect(() => {
    if (isPremiumUser && visibleColumns === DEFAULT_COLUMNS.free) {
      setVisibleColumns(DEFAULT_COLUMNS.premium);
    }
  }, [isPremiumUser, visibleColumns]);

  // Column definitions with complete accessibility
  const columnDefinitions: ColumnDefinition[] = useMemo(() => [
    {
      key: 'company',
      label: 'Company',
      accessor: (h) => h.company,
      render: (value, holding) => (
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-neutral-900 truncate">
              {holding.company}
            </div>
            <div className="text-sm text-neutral-500">
              {holding.ticker}
            </div>
          </div>
          {hasQuickViewAccess() && onQuickView && (
            <button
              onClick={() => onQuickView(holding)}
              className="p-1 text-neutral-400 hover:text-primary-600 transition-colors rounded touch-target"
              {...ARIA.button(`Quick view of ${holding.company}`)}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
      sortable: true,
      isNumeric: false,
      category: 'core',
      width: 'min-w-48',
    },
    {
      key: 'shares',
      label: 'Shares',
      accessor: (h) => h.shares,
      render: (value) => (
        <span className="font-financial">
          {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      isNumeric: true,
      category: 'core',
    },
    {
      key: 'currentPrice',
      label: 'Price',
      accessor: (h) => h.currentPrice,
      render: (value) => (
        <span className="font-financial text-neutral-900">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      isNumeric: true,
      category: 'core',
    },
    {
      key: 'totalValue',
      label: 'Value',
      accessor: (h) => h.shares * h.currentPrice,
      render: (value) => (
        <span className="font-financial font-semibold text-neutral-900">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      isNumeric: true,
      category: 'core',
    },
    {
      key: 'gainLoss',
      label: 'Gain/Loss',
      accessor: (h) => {
        const currentValue = h.shares * h.currentPrice;
        const totalCost = h.shares * h.costBasis;
        return currentValue - totalCost;
      },
      render: (value, holding) => {
        const isPositive = value >= 0;
        return (
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-financial-positive-icon" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-4 h-4 text-financial-negative-icon" aria-hidden="true" />
            )}
            <span
              className={`font-financial font-medium ${
                isPositive ? 'text-financial-positive' : 'text-financial-negative'
              }`}
            >
              {isPositive ? '+' : ''}${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="sr-only">
              {isPositive ? 'gain' : 'loss'} of ${Math.abs(value).toFixed(2)}
            </span>
          </div>
        );
      },
      sortable: true,
      isNumeric: true,
      category: 'core',
    },
    {
      key: 'gainLossPercent',
      label: 'Gain/Loss %',
      accessor: (h) => {
        const currentValue = h.shares * h.currentPrice;
        const totalCost = h.shares * h.costBasis;
        const gainLoss = currentValue - totalCost;
        return (gainLoss / totalCost) * 100;
      },
      render: (value) => {
        const isPositive = value >= 0;
        return (
          <span
            className={`font-financial font-medium ${
              isPositive ? 'text-financial-positive' : 'text-financial-negative'
            }`}
          >
            {isPositive ? '+' : ''}{value.toFixed(2)}%
            <span className="sr-only">
              {isPositive ? 'gain' : 'loss'} of {Math.abs(value).toFixed(2)} percent
            </span>
          </span>
        );
      },
      sortable: true,
      isNumeric: true,
      category: 'core',
    },
    {
      key: 'peRatio',
      label: 'P/E Ratio',
      accessor: (h) => h.peRatio,
      render: (value) => (
        <FinancialMetricTooltip metric="peRatio" value={value}>
          <span className="font-financial cursor-help">
            {value ? value.toFixed(2) : 'N/A'}
          </span>
        </FinancialMetricTooltip>
      ),
      sortable: true,
      isNumeric: true,
      tooltip: 'Price-to-Earnings ratio - measures valuation relative to earnings',
      category: 'valuation',
    },
    {
      key: 'pbRatio',
      label: 'P/B Ratio',
      accessor: (h) => h.pbRatio,
      render: (value) => (
        <FinancialMetricTooltip metric="pbRatio" value={value}>
          <span className="font-financial cursor-help">
            {value ? value.toFixed(2) : 'N/A'}
          </span>
        </FinancialMetricTooltip>
      ),
      sortable: true,
      isNumeric: true,
      tooltip: 'Price-to-Book ratio - compares market price to book value',
      category: 'valuation',
    },
    {
      key: 'dividendYield',
      label: 'Div Yield',
      accessor: (h) => h.dividendYield,
      render: (value) => (
        <FinancialMetricTooltip metric="dividendYield" value={value}>
          <span className="font-financial cursor-help">
            {value ? `${value.toFixed(2)}%` : 'N/A'}
          </span>
        </FinancialMetricTooltip>
      ),
      sortable: true,
      isNumeric: true,
      tooltip: 'Annual dividend yield as percentage of stock price',
      category: 'dividends',
    },
    {
      key: 'roe',
      label: 'ROE',
      accessor: (h) => h.roe,
      render: (value) => (
        <FinancialMetricTooltip metric="roe" value={value}>
          <span className="font-financial cursor-help">
            {value ? `${value.toFixed(1)}%` : 'N/A'}
          </span>
        </FinancialMetricTooltip>
      ),
      sortable: true,
      isNumeric: true,
      isPremium: true,
      tooltip: 'Return on Equity - measures efficiency of equity use',
      category: 'profitability',
    },
    {
      key: 'beta',
      label: 'Beta',
      accessor: (h) => h.beta,
      render: (value) => (
        <FinancialMetricTooltip metric="beta" value={value}>
          <span className="font-financial cursor-help">
            {value ? value.toFixed(2) : 'N/A'}
          </span>
        </FinancialMetricTooltip>
      ),
      sortable: true,
      isNumeric: true,
      isPremium: true,
      tooltip: 'Stock volatility relative to market (1.0 = market volatility)',
      category: 'risk',
    },
  ], [hasQuickViewAccess, onQuickView, isPremiumUser]);

  // Filtered and sorted holdings
  const processedHoldings = useMemo(() => {
    let filtered = holdings.filter(holding => {
      const matchesSearch = !searchTerm || 
        holding.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'stocks' && !holding.ticker.includes('.')) ||
        (filter === 'etfs' && holding.ticker.includes('ETF')) ||
        (filter === 'bonds' && holding.ticker.includes('BOND'));
      
      const matchesSector = sectorFilter === 'all' || holding.sector === sectorFilter;
      
      return matchesSearch && matchesFilter && matchesSector;
    });

    // Sort holdings
    const sortColumn = columnDefinitions.find(col => col.key === sortField);
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = sortColumn.accessor(a);
        const bValue = sortColumn.accessor(b);
        
        if (typeof aValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return filtered;
  }, [holdings, searchTerm, filter, sectorFilter, sortField, sortDirection, columnDefinitions]);

  // Get visible column definitions
  const visibleColumnDefinitions = useMemo(() => {
    return columnDefinitions.filter(col => visibleColumns.includes(col.key));
  }, [columnDefinitions, visibleColumns]);

  // Handle sorting
  const handleSort = useCallback((key: string) => {
    if (sortField === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }

    // Announce sort change to screen readers
    const column = columnDefinitions.find(col => col.key === key);
    if (column) {
      const newDirection = sortField === key && sortDirection === 'asc' ? 'descending' : 'ascending';
      announceToScreenReader(`Table sorted by ${column.label} in ${newDirection} order`);
    }
  }, [sortField, sortDirection, columnDefinitions]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    announceToScreenReader(`${processedHoldings.length} holdings found`);
  }, [processedHoldings.length]);

  // Get unique sectors for filter
  const uniqueSectors = useMemo(() => {
    return Array.from(new Set(holdings.map(h => h.sector).filter(Boolean))).sort();
  }, [holdings]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <label htmlFor={searchId} className="sr-only">
              Search holdings by company name or ticker
            </label>
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" 
              aria-hidden="true" 
            />
            <input
              id={searchId}
              type="text"
              placeholder="Search holdings..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`
                pl-10 pr-4 py-2 border rounded-lg w-64 transition-colors
                ${isSearchFocused 
                  ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20' 
                  : 'border-neutral-300 hover:border-neutral-400'
                }
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20
              `}
              {...ARIA.input('Search holdings', { placeholder: 'Search by company name or ticker symbol' })}
            />
          </div>

          {/* Sector Filter */}
          {uniqueSectors.length > 0 && (
            <div className="relative">
              <label htmlFor={filterId} className="sr-only">
                Filter by sector
              </label>
              <Filter 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" 
                aria-hidden="true" 
              />
              <select
                id={filterId}
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 appearance-none bg-white"
              >
                <option value="all">All Sectors</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Table Controls */}
        <div className="flex items-center space-x-2">
          {/* Results count */}
          <span 
            className="text-sm text-neutral-600"
            {...ARIA.liveRegion()}
            aria-label={`${processedHoldings.length} holdings displayed`}
          >
            {processedHoldings.length} of {holdings.length} holdings
          </span>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors touch-target"
            {...ARIA.button('Open financial metrics help guide')}
          >
            <span className="sr-only">Help</span>
            <span className="text-sm">?</span>
          </button>

          {/* Column Customization */}
          <button
            onClick={() => setShowColumnModal(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors touch-target"
            {...ARIA.button('Customize table columns')}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span>Columns</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <AccessibleTable 
        caption={`Portfolio holdings table with ${processedHoldings.length} rows and ${visibleColumnDefinitions.length} columns. Use arrow keys to navigate, Enter to sort columns.`}
        className="bg-white"
      >
        {/* Header */}
        <thead className="bg-neutral-50 sticky top-0 z-10">
          <tr>
            {visibleColumnDefinitions.map((column) => (
              <AccessibleTableHeader
                key={column.key}
                label={column.label}
                sortKey={column.key}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                tooltip={column.tooltip}
                isNumeric={column.isNumeric}
                className={`${column.width || ''} ${column.isPremium && !isPremiumUser ? 'opacity-60' : ''}`}
              />
            ))}
            <th scope="col" className="relative w-12">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-neutral-200">
          {processedHoldings.map((holding, index) => (
            <AccessibleTableRow
              key={`${holding.ticker}-${index}`}
              className="hover:bg-neutral-50 focus-within:bg-neutral-50"
            >
              {visibleColumnDefinitions.map((column) => (
                <AccessibleTableCell
                  key={column.key}
                  isNumeric={column.isNumeric}
                  className={`${column.isPremium && !isPremiumUser ? 'opacity-60' : ''}`}
                >
                  {column.render(column.accessor(holding), holding)}
                </AccessibleTableCell>
              ))}
              
              {/* Actions */}
              <AccessibleTableCell className="w-12">
                <div className="flex items-center space-x-1">
                  {hasAdvancedAccess() && onAdvancedView && (
                    <button
                      onClick={() => onAdvancedView(holding)}
                      className="p-1 text-neutral-400 hover:text-primary-600 transition-colors rounded touch-target"
                      {...ARIA.button(`Advanced analysis for ${holding.company}`)}
                    >
                      <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </AccessibleTableCell>
            </AccessibleTableRow>
          ))}
        </tbody>
      </AccessibleTable>

      {/* Empty state */}
      {processedHoldings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-neutral-500 mb-2">No holdings found</div>
          <div className="text-sm text-neutral-400">
            {searchTerm || sectorFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first holding to get started'
            }
          </div>
        </div>
      )}

      {/* Modals */}
      <ColumnCustomizationModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        isPremium={isPremiumUser}
      />

      <FinancialMetricsHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};