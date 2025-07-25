import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react';
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

  const transactionTypeColors = {
    buy: 'bg-green-100 text-green-800',
    sell: 'bg-red-100 text-red-800',
    dividend: 'bg-blue-100 text-blue-800',
    split: 'bg-purple-100 text-purple-800',
    spinoff: 'bg-orange-100 text-orange-800',
    merger: 'bg-indigo-100 text-indigo-800',
    rights: 'bg-teal-100 text-teal-800',
    return_of_capital: 'bg-gray-100 text-gray-800',
    fee: 'bg-red-100 text-red-800',
    interest: 'bg-green-100 text-green-800'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-700" />
            Transaction History
          </h3>
          <div className="text-sm text-gray-500">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Date
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ticker')}
              >
                Ticker
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {transaction.ticker}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transactionTypeColors[transaction.type]}`}>
                    {transactionTypeLabels[transaction.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.shares && (
                    <div>{transaction.shares} shares @ {formatCurrency(transaction.price || 0)}</div>
                  )}
                  {transaction.splitRatio && (
                    <div>Split: {transaction.splitRatio}</div>
                  )}
                  {transaction.newTicker && (
                    <div>New ticker: {transaction.newTicker}</div>
                  )}
                  {transaction.fees && transaction.fees > 0 && (
                    <div className="text-xs text-gray-500">Fees: {formatCurrency(transaction.fees)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`${
                    ['buy', 'fee'].includes(transaction.type) ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {['buy', 'fee'].includes(transaction.type) ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={transaction.notes}>
                    {transaction.notes || '-'}
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