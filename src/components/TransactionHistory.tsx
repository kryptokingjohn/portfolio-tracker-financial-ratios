import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Filter, Search, Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '../types/portfolio';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  onEdit, 
  onDelete 
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTicker, setSearchTicker] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const transactionTypeLabels = {
    buy: 'Buy',
    sell: 'Sell',
    dividend: 'Dividend',
    split: 'Stock Split',
    spinoff: 'Spinoff',
    merger: 'Merger',
    rights: 'Rights',
    return_of_capital: 'Return of Capital',
    fee: 'Fee',
    interest: 'Interest'
  };

  const accountTypeLabels = {
    taxable: 'Taxable',
    '401k': '401(k)',
    traditional_ira: 'Traditional IRA',
    roth_ira: 'Roth IRA',
    hsa: 'HSA',
    sep_ira: 'SEP-IRA',
    simple_ira: 'SIMPLE IRA',
    '529': '529 Education',
    cash_money_market: 'Cash & Money Market',
    trust: 'Trust',
    custodial: 'Custodial'
  };

  const transactionTypeColors = {
    buy: 'bg-green-600/30 text-green-300 border border-green-500/30',
    sell: 'bg-red-600/30 text-red-300 border border-red-500/30',
    dividend: 'bg-blue-600/30 text-blue-300 border border-blue-500/30',
    split: 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
    spinoff: 'bg-orange-600/30 text-orange-300 border border-orange-500/30',
    merger: 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30',
    rights: 'bg-teal-600/30 text-teal-300 border border-teal-500/30',
    return_of_capital: 'bg-gray-600/30 text-gray-300 border border-gray-500/30',
    fee: 'bg-red-600/30 text-red-300 border border-red-500/30',
    interest: 'bg-green-600/30 text-green-300 border border-green-500/30'
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesTicker = searchTicker === '' || 
        transaction.ticker.toLowerCase().includes(searchTicker.toLowerCase());
      return matchesType && matchesTicker;
    })
    .sort((a, b) => {
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

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const uniqueTypes = Array.from(new Set(transactions.map(t => t.type)));

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="bg-blue-600 p-2 rounded-full mr-3">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Transaction History
          </h3>
          <div className="text-sm text-gray-400">
            {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticker..."
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {transactionTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 backdrop-blur-sm">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                onClick={() => handleSort('date')}
              >
                Date
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                onClick={() => handleSort('ticker')}
              >
                Ticker
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                onClick={() => handleSort('type')}
              >
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                onClick={() => handleSort('accountType')}
              >
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Details
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                onClick={() => handleSort('amount')}
              >
                Amount
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30"
                onClick={() => handleSort('fees')}
              >
                Fees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700/50">
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction.id} className={`backdrop-blur-sm hover:bg-gray-700/30 transition-colors ${
                index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-700/20'
              }`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                  {transaction.ticker}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm ${transactionTypeColors[transaction.type]}`}>
                    {transactionTypeLabels[transaction.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-600/20 text-blue-300 border border-blue-500/30">
                    {accountTypeLabels[transaction.accountType as keyof typeof accountTypeLabels] || transaction.accountType || 'Taxable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {transaction.shares && (
                    <div>{transaction.shares} shares @ {formatCurrency(transaction.price || 0)}</div>
                  )}
                  {transaction.splitRatio && (
                    <div>Split: {transaction.splitRatio}</div>
                  )}
                  {transaction.newTicker && (
                    <div>New ticker: {transaction.newTicker}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`${
                    ['buy', 'fee'].includes(transaction.type) ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {['buy', 'fee'].includes(transaction.type) ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {transaction.fees && transaction.fees > 0 ? (
                    <div className="text-red-400">
                      {formatCurrency(transaction.fees)}
                    </div>
                  ) : (
                    <div className="text-gray-500">-</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 max-w-xs">
                  <div className="truncate" title={transaction.notes}>
                    {transaction.notes || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-blue-600/20 rounded"
                        title="Edit transaction"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-600/20 rounded"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {transactions.length === 0 
              ? "Start by adding your first transaction."
              : "Try adjusting your search or filter criteria."
            }
          </p>
        </div>
      )}
    </div>
  );
};