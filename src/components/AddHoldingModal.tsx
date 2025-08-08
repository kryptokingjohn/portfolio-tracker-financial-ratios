import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown, DollarSign, Percent, Split, Users, FileText, CreditCard } from 'lucide-react';
import { Transaction } from '../types/portfolio';
import { validateTransaction, sanitizeText } from '../utils/security';
import { ARIA, FocusManager, FormAccessibility, generateId } from '../utils/accessibility';

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  existingTickers: string[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAdd, existingTickers }) => {
  const [formData, setFormData] = useState({
    ticker: '',
    type: 'buy' as Transaction['type'],
    accountType: 'taxable' as string,
    date: new Date().toISOString().split('T')[0],
    shares: 0,
    price: 0,
    amount: 0,
    fees: 0,
    notes: '',
    splitRatio: '',
    newTicker: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Generate unique IDs for form accessibility
  const modalId = generateId('add-transaction-modal');
  const titleId = generateId('modal-title');
  const tickerInputId = generateId('ticker-input');
  const typeGroupId = generateId('transaction-type-group');
  const accountInputId = generateId('account-input');
  const dateInputId = generateId('date-input');
  const sharesInputId = generateId('shares-input');
  const priceInputId = generateId('price-input');
  const amountInputId = generateId('amount-input');
  const feesInputId = generateId('fees-input');
  const notesInputId = generateId('notes-input');

  // Focus management
  useEffect(() => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const cleanup = FocusManager.trapFocus(modalElement);
      return cleanup;
    }
  }, [modalId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = FocusManager.handleEscapeKey(onClose);
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const transactionTypes = [
    { value: 'buy', label: 'Buy', icon: Plus, color: 'text-green-600', description: 'Purchase shares' },
    { value: 'sell', label: 'Sell', icon: TrendingDown, color: 'text-red-600', description: 'Sell shares' },
    { value: 'dividend', label: 'Dividend', icon: DollarSign, color: 'text-blue-600', description: 'Dividend payment received' },
    { value: 'split', label: 'Stock Split', icon: Split, color: 'text-purple-600', description: 'Stock split adjustment' },
    { value: 'spinoff', label: 'Spinoff', icon: Users, color: 'text-orange-600', description: 'Company spinoff' },
    { value: 'merger', label: 'Merger', icon: Users, color: 'text-indigo-600', description: 'Company merger' },
    { value: 'rights', label: 'Rights Offering', icon: FileText, color: 'text-teal-600', description: 'Rights offering participation' },
    { value: 'return_of_capital', label: 'Return of Capital', icon: Percent, color: 'text-gray-600', description: 'Return of capital distribution' },
    { value: 'fee', label: 'Fee', icon: CreditCard, color: 'text-red-500', description: 'Account or transaction fee' },
    { value: 'interest', label: 'Interest', icon: TrendingUp, color: 'text-green-500', description: 'Interest payment received' }
  ];

  const selectedType = transactionTypes.find(t => t.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Prepare transaction data with sanitized inputs
    const transaction: Omit<Transaction, 'id'> = {
      ticker: formData.ticker.trim().toUpperCase(),
      type: formData.type,
      accountType: formData.accountType,
      date: formData.date,
      amount: formData.amount,
      fees: formData.fees || 0,
      notes: formData.notes ? sanitizeText(formData.notes, 500) : undefined
    };

    // Add conditional fields based on transaction type
    if (['buy', 'sell', 'rights'].includes(formData.type)) {
      transaction.shares = formData.shares;
      transaction.price = formData.price;
    }

    if (formData.type === 'split') {
      transaction.splitRatio = sanitizeText(formData.splitRatio, 20);
    }

    if (['spinoff', 'merger'].includes(formData.type)) {
      transaction.newTicker = formData.newTicker.trim().toUpperCase();
    }

    // Validate transaction data
    const validationResult = validateTransaction(transaction);
    if (!validationResult.valid) {
      setValidationErrors(validationResult.errors);
      return; // Don't submit if validation fails
    }

    // 🚨 Security: Log transaction creation for audit trail
    console.log(`🔒 Creating transaction: ${transaction.type} ${transaction.ticker} for $${transaction.amount}`);

    onAdd(transaction);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['shares', 'price', 'amount', 'fees'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const calculateAmount = () => {
    if (['buy', 'sell'].includes(formData.type) && formData.shares && formData.price) {
      const baseAmount = formData.shares * formData.price;
      const totalAmount = formData.type === 'buy' ? baseAmount + (formData.fees || 0) : baseAmount - (formData.fees || 0);
      setFormData(prev => ({ ...prev, amount: totalAmount }));
    }
  };

  React.useEffect(() => {
    calculateAmount();
  }, [formData.shares, formData.price, formData.fees, formData.type]);

  const requiresShares = ['buy', 'sell', 'rights'].includes(formData.type);
  const requiresPrice = ['buy', 'sell', 'rights'].includes(formData.type);
  const requiresSplitRatio = formData.type === 'split';
  const requiresNewTicker = ['spinoff', 'merger'].includes(formData.type);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        id={modalId}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        {...ARIA.modal('Add Transaction', 'Add a new transaction to your portfolio')}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 id={titleId} className="text-xl font-semibold text-neutral-900">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors touch-target"
            {...ARIA.button('Close transaction form')}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {transactionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as Transaction['type'] }))}
                    className={`p-3 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`h-4 w-4 ${type.color}`} />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor={tickerInputId}
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Ticker Symbol
                <span className="text-error ml-1" aria-label="required">*</span>
              </label>
              <input
                id={tickerInputId}
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                required
                placeholder="e.g., AAPL"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase touch-target transition-colors hover:border-neutral-400"
                list="existing-tickers"
                {...ARIA.input('Enter the stock ticker symbol', {
                  required: true,
                  describedBy: `${tickerInputId}-help`,
                  placeholder: 'Enter ticker symbol like AAPL or MSFT'
                })}
              />
              <div id={`${tickerInputId}-help`} className="text-xs text-neutral-600 mt-1">
                Enter the stock ticker symbol (e.g., AAPL for Apple Inc.)
              </div>
              <datalist id="existing-tickers">
                {existingTickers.map(ticker => (
                  <option key={ticker} value={ticker} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <select
                name="accountType"
                value={formData.accountType || 'taxable'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="taxable">Taxable Brokerage</option>
                <option value="401k">401(k)</option>
                <option value="traditional_ira">Traditional IRA</option>
                <option value="roth_ira">Roth IRA</option>
                <option value="hsa">Health Savings Account</option>
                <option value="sep_ira">SEP-IRA</option>
                <option value="simple_ira">SIMPLE IRA</option>
                <option value="529">529 Education</option>
                <option value="cash_money_market">Cash & Money Market</option>
                <option value="trust">Trust Account</option>
                <option value="custodial">Custodial Account</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conditional Fields Based on Transaction Type */}
          {requiresShares && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shares *
                </label>
                <input
                  type="number"
                  name="shares"
                  value={formData.shares}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {requiresPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Share *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {requiresSplitRatio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Split Ratio *
              </label>
              <input
                type="text"
                name="splitRatio"
                value={formData.splitRatio}
                onChange={handleChange}
                required
                placeholder="e.g., 2:1, 3:2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Format: new:old (e.g., 2:1 means 2 new shares for every 1 old share)</p>
            </div>
          )}

          {requiresNewTicker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Ticker Symbol *
              </label>
              <input
                type="text"
                name="newTicker"
                value={formData.newTicker}
                onChange={handleChange}
                required
                placeholder="e.g., NEWCO"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
          )}

          {/* Amount and Fees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === 'buy' && 'Total cost including fees'}
                {formData.type === 'sell' && 'Net proceeds after fees'}
                {formData.type === 'dividend' && 'Dividend amount received'}
                {formData.type === 'fee' && 'Fee amount charged'}
                {formData.type === 'interest' && 'Interest amount received'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fees
              </label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes about this transaction..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-md hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              {selectedType && <selectedType.icon className="h-4 w-4" />}
              <span>Add Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};