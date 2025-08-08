import React, { useState } from 'react';
import { X, Eye, EyeOff, RotateCcw, Settings } from 'lucide-react';
import { ARIA, FocusManager, generateId } from '../utils/accessibility';

// Define all available columns with metadata
export interface ColumnConfig {
  key: string;
  label: string;
  category: 'core' | 'valuation' | 'financial' | 'technical' | 'dividends';
  description: string;
  isPremium?: boolean;
  defaultVisible?: boolean;
  isMandatory?: boolean;
}

export const AVAILABLE_COLUMNS: ColumnConfig[] = [
  // Core columns (always visible)
  { key: 'company', label: 'Company', category: 'core', description: 'Company name and ticker', isMandatory: true, defaultVisible: true },
  { key: 'shares', label: 'Shares', category: 'core', description: 'Number of shares owned', defaultVisible: true },
  { key: 'currentPrice', label: 'Price', category: 'core', description: 'Current market price', defaultVisible: true },
  { key: 'totalValue', label: 'Value', category: 'core', description: 'Total position value', defaultVisible: true },
  { key: 'gainLoss', label: 'Gain/Loss', category: 'core', description: 'Unrealized gain or loss', defaultVisible: true },
  { key: 'gainLossPercent', label: 'Gain/Loss %', category: 'core', description: 'Percentage gain or loss', defaultVisible: true },
  
  // Valuation metrics
  { key: 'peRatio', label: 'P/E Ratio', category: 'valuation', description: 'Price-to-earnings ratio', defaultVisible: false },
  { key: 'pbRatio', label: 'P/B Ratio', category: 'valuation', description: 'Price-to-book ratio', defaultVisible: false },
  { key: 'pegRatio', label: 'PEG Ratio', category: 'valuation', description: 'Price-to-earnings-growth ratio', isPremium: true, defaultVisible: false },
  
  // Financial metrics
  { key: 'roe', label: 'ROE', category: 'financial', description: 'Return on equity', isPremium: true, defaultVisible: false },
  { key: 'roa', label: 'ROA', category: 'financial', description: 'Return on assets', isPremium: true, defaultVisible: false },
  { key: 'debtToEquity', label: 'D/E Ratio', category: 'financial', description: 'Debt-to-equity ratio', isPremium: true, defaultVisible: false },
  { key: 'currentRatio', label: 'Current Ratio', category: 'financial', description: 'Current assets / current liabilities', isPremium: true, defaultVisible: false },
  { key: 'quickRatio', label: 'Quick Ratio', category: 'financial', description: 'Quick assets / current liabilities', isPremium: true, defaultVisible: false },
  
  // Technical metrics
  { key: 'beta', label: 'Beta', category: 'technical', description: 'Stock volatility vs market', isPremium: true, defaultVisible: false },
  { key: 'volume', label: 'Volume', category: 'technical', description: 'Trading volume', defaultVisible: false },
  
  // Dividend metrics
  { key: 'dividendYield', label: 'Div Yield', category: 'dividends', description: 'Dividend yield percentage', defaultVisible: false },
  { key: 'annualDividend', label: 'Annual Div', category: 'dividends', description: 'Annual dividend per share', isPremium: true, defaultVisible: false },
];

// Default column configurations for different user types
export const DEFAULT_COLUMNS = {
  free: ['company', 'shares', 'currentPrice', 'totalValue', 'gainLoss', 'gainLossPercent'],
  premium: ['company', 'shares', 'currentPrice', 'totalValue', 'gainLoss', 'gainLossPercent', 'peRatio', 'dividendYield'],
};

interface ColumnCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  isPremium: boolean;
}

export const ColumnCustomizationModal: React.FC<ColumnCustomizationModalProps> = ({
  isOpen,
  onClose,
  visibleColumns,
  onColumnsChange,
  isPremium,
}) => {
  const [localColumns, setLocalColumns] = useState(visibleColumns);
  const modalId = generateId('column-modal');
  const titleId = generateId('modal-title');

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      const cleanup = FocusManager.trapFocus(document.getElementById(modalId)!);
      return cleanup;
    }
  }, [isOpen, modalId]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = FocusManager.handleEscapeKey(onClose);
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleToggleColumn = (columnKey: string) => {
    const column = AVAILABLE_COLUMNS.find(col => col.key === columnKey);
    if (column?.isMandatory) return; // Can't toggle mandatory columns
    
    setLocalColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleResetToDefaults = () => {
    const defaultColumns = isPremium ? DEFAULT_COLUMNS.premium : DEFAULT_COLUMNS.free;
    setLocalColumns(defaultColumns);
  };

  const handleSave = () => {
    onColumnsChange(localColumns);
    onClose();
  };

  const getCategoryColumns = (category: ColumnConfig['category']) => {
    return AVAILABLE_COLUMNS.filter(col => col.category === category);
  };

  const categories = [
    { key: 'core', label: 'Core Information', icon: '💼' },
    { key: 'valuation', label: 'Valuation Metrics', icon: '💰' },
    { key: 'financial', label: 'Financial Health', icon: '📊' },
    { key: 'technical', label: 'Technical Analysis', icon: '📈' },
    { key: 'dividends', label: 'Dividend Information', icon: '💎' },
  ] as const;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id={modalId}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        {...ARIA.modal('Column Customization', 'Customize which columns are visible in your portfolio table')}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 id={titleId} className="text-xl font-semibold text-neutral-900">
                <Settings className="inline w-5 h-5 mr-2" aria-hidden="true" />
                Customize Table Columns
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Choose which columns to display in your portfolio table. Core columns are always visible.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-100 touch-target"
              {...ARIA.button('Close column customization')}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-700">
              <strong>{localColumns.length}</strong> columns selected out of{' '}
              <strong>{AVAILABLE_COLUMNS.length}</strong> available
              {!isPremium && (
                <span className="block mt-1 text-primary-600">
                  💎 Upgrade to Premium to unlock {AVAILABLE_COLUMNS.filter(col => col.isPremium).length} advanced metrics
                </span>
              )}
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryColumns = getCategoryColumns(category.key);
              
              return (
                <div key={category.key} className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                    <h3 className="font-medium text-neutral-900">
                      <span className="mr-2" aria-hidden="true">{category.icon}</span>
                      {category.label}
                      <span className="ml-2 text-sm text-neutral-500">
                        ({categoryColumns.filter(col => localColumns.includes(col.key)).length}/{categoryColumns.length})
                      </span>
                    </h3>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryColumns.map((column) => {
                      const isVisible = localColumns.includes(column.key);
                      const isDisabled = column.isMandatory || (column.isPremium && !isPremium);
                      
                      return (
                        <div
                          key={column.key}
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                            isVisible
                              ? 'border-primary-200 bg-primary-50'
                              : 'border-neutral-200 bg-white'
                          } ${isDisabled ? 'opacity-50' : 'hover:bg-neutral-50'}`}
                        >
                          <button
                            onClick={() => !isDisabled && handleToggleColumn(column.key)}
                            disabled={isDisabled}
                            className="flex-shrink-0 p-1 rounded touch-target"
                            {...ARIA.button(
                              `${isVisible ? 'Hide' : 'Show'} ${column.label} column`,
                              { disabled: isDisabled }
                            )}
                          >
                            {isVisible ? (
                              <Eye className="w-4 h-4 text-primary-600" aria-hidden="true" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm text-neutral-900">
                                {column.label}
                              </span>
                              {column.isPremium && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-light text-warning-text">
                                  💎 Premium
                                </span>
                              )}
                              {column.isMandatory && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              {column.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleResetToDefaults}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors touch-target"
              {...ARIA.button('Reset to default column selection')}
            >
              <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
              Reset to Defaults
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors touch-target"
                {...ARIA.button('Cancel column customization')}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors touch-target focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                {...ARIA.button('Save column selection')}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};