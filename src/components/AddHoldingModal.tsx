import React, { useState } from 'react';
import { X, Plus, TrendingUp, TrendingDown, DollarSign, Percent, Split, Users, FileText, CreditCard } from 'lucide-react';
import { Transaction } from '../types/portfolio';

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
    
    const transaction: Omit<Transaction, 'id'> = {
      ticker: formData.ticker.toUpperCase(),
      type: formData.type,
      date: formData.date,
      amount: formData.amount,
      fees: formData.fees || 0,
      notes: formData.notes || undefined
    };

    // Add conditional fields based on transaction type
    if (['buy', 'sell', 'rights'].includes(formData.type)) {
      transaction.shares = formData.shares;
      transaction.price = formData.price;
    }

    if (formData.type === 'split') {
      transaction.splitRatio = formData.splitRatio;
    }

    if (['spinoff', 'merger'].includes(formData.type)) {
      transaction.newTicker = formData.newTicker;
    }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Transaction</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticker Symbol *
              </label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                required
                placeholder="e.g., AAPL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                list="existing-tickers"
              />
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