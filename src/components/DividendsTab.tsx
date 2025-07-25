import React, { useState } from 'react';
import { DollarSign, Calendar, TrendingUp, Percent, Clock, Building2 } from 'lucide-react';
import { Holding } from '../types/portfolio';

interface DividendsTabProps {
  holdings: Holding[];
  dividendAnalysis?: any;
}

interface DividendPayment {
  id: string;
  ticker: string;
  company: string;
  amount: number;
  exDate: string;
  payDate: string;
  yield: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
}

interface MonthlyDividendHistory {
  month: string;
  amount: number;
  yoyGrowth: number;
}

export const DividendsTab: React.FC<DividendsTabProps> = ({ holdings, dividendAnalysis }) => {
  const [selectedYear, setSelectedYear] = useState('2024');

  // Mock upcoming dividend payments - in a real app, this would come from an API
  const upcomingDividends: DividendPayment[] = [
    {
      id: '1',
      ticker: 'JNJ',
      company: 'Johnson & Johnson',
      amount: 247.20,
      exDate: '2024-07-10',
      payDate: '2024-07-15',
      yield: 2.98,
      frequency: 'quarterly'
    },
    {
      id: '2',
      ticker: 'KO',
      company: 'Coca-Cola',
      amount: 187.50,
      exDate: '2024-07-12',
      payDate: '2024-07-18',
      yield: 3.12,
      frequency: 'quarterly'
    },
    {
      id: '3',
      ticker: 'PG',
      company: 'Procter & Gamble',
      amount: 156.80,
      exDate: '2024-07-15',
      payDate: '2024-07-22',
      yield: 2.45,
      frequency: 'quarterly'
    },
    {
      id: '4',
      ticker: 'SCHD',
      company: 'Schwab Dividend ETF',
      amount: 312.45,
      exDate: '2024-07-18',
      payDate: '2024-07-25',
      yield: 3.45,
      frequency: 'quarterly'
    },
    {
      id: '5',
      ticker: 'REITS',
      company: 'REIT Portfolio',
      amount: 343.88,
      exDate: '2024-07-20',
      payDate: '2024-07-28',
      yield: 4.12,
      frequency: 'monthly'
    }
  ];

  // Mock dividend history - in a real app, this would be calculated from transaction history
  const dividendHistory: MonthlyDividendHistory[] = [
    { month: 'Jan 2024', amount: 1234.56, yoyGrowth: 8.2 },
    { month: 'Feb 2024', amount: 1187.92, yoyGrowth: 12.4 },
    { month: 'Mar 2024', amount: 1456.78, yoyGrowth: 15.1 },
    { month: 'Apr 2024', amount: 1298.43, yoyGrowth: 9.7 },
    { month: 'May 2024', amount: 1367.89, yoyGrowth: 11.3 },
    { month: 'Jun 2024', amount: 1423.12, yoyGrowth: 14.6 }
  ];

  // Calculate dividend metrics
  const calculateDividendMetrics = () => {
    if (dividendAnalysis) {
      return {
        totalAnnualDividends: dividendAnalysis.totalAnnualIncome,
        monthlyAverage: dividendAnalysis.monthlyAverage,
        nextPayment: dividendAnalysis.upcomingPayments[0]?.estimatedAmount || 0,
        nextPaymentDate: dividendAnalysis.upcomingPayments[0]?.nextPayDate || '2024-07-15',
        yieldOnCost: dividendAnalysis.yieldOnCost
      };
    }
    
    // Fallback calculation
    let totalAnnualDividends = 0;
    let totalPortfolioValue = 0;

    holdings.forEach(holding => {
      if (holding.dividend && holding.dividend > 0) {
        const annualDividend = holding.shares * holding.dividend;
        totalAnnualDividends += annualDividend;
      }
      const currentValue = holding.shares * holding.currentPrice;
      totalPortfolioValue += currentValue;
    });

    const monthlyAverage = totalAnnualDividends / 12;
    
    // Calculate yield on cost based on actual cost basis of dividend-paying holdings
    let totalCostBasisDividendHoldings = 0;
    holdings.forEach(holding => {
      if (holding.dividend && holding.dividend > 0) {
        totalCostBasisDividendHoldings += holding.shares * holding.costBasis;
      }
    });
    
    const yieldOnCost = totalCostBasisDividendHoldings > 0 ? (totalAnnualDividends / totalCostBasisDividendHoldings) * 100 : 0;

    // Calculate next payment based on actual holdings
    let nextPayment = 0;
    holdings.forEach(holding => {
      if (holding.dividend && holding.dividend > 0) {
        // Assume quarterly payments for simplicity
        const quarterlyDividend = (holding.shares * holding.dividend) / 4;
        nextPayment += quarterlyDividend;
      }
    });
    
    const nextPaymentDate = '2024-07-15'; // Mock next payment date

    return {
      totalAnnualDividends,
      monthlyAverage,
      nextPayment,
      nextPaymentDate,
      yieldOnCost
    };
  };

  const metrics = calculateDividendMetrics();

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'bg-green-100 text-green-800';
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'semi-annual': return 'bg-yellow-100 text-yellow-800';
      case 'annual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dividend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-green-700">Annual Dividends</div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(metrics.totalAnnualDividends)}</div>
              <div className="text-sm text-green-600">Projected for 2024</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-blue-700">Monthly Average</div>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(metrics.monthlyAverage)}</div>
              <div className="text-sm text-blue-600">Average per month</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-purple-700">Next Payment</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(metrics.nextPayment)}</div>
              <div className="text-sm text-purple-600">{formatDate(metrics.nextPaymentDate)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-yellow-700">Yield on Cost</div>
              <div className="text-2xl font-bold text-yellow-900">{formatPercent(metrics.yieldOnCost)}</div>
              <div className="text-sm text-yellow-600">Based on purchase price</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Dividend Payments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-green-600 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Upcoming Dividend Payments
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ex-Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingDividends.map((dividend, index) => (
                <tr key={dividend.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600">{dividend.ticker}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dividend.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(dividend.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {formatDate(dividend.exDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {formatDate(dividend.payDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-600">{formatPercent(dividend.yield)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dividend Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-600 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Dividend Payment History
            </h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dividendHistory.map((month, index) => (
              <div key={month.month} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{month.month}</h4>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(month.amount)}
                </div>
                <div className="text-sm text-green-600">
                  +{formatPercent(month.yoyGrowth)} YoY growth
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dividend-Paying Holdings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Percent className="h-5 w-5 mr-2 text-blue-600" />
            Dividend-Paying Holdings
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holding
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dividend per Share
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Income
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Yield
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield on Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings
                .filter(holding => holding.dividend && holding.dividend > 0)
                .sort((a, b) => (b.shares * (b.dividend || 0)) - (a.shares * (a.dividend || 0)))
                .map((holding, index) => {
                  const annualIncome = holding.shares * (holding.dividend || 0);
                  const currentYield = holding.dividendYield || 0;
                  const yieldOnCost = holding.costBasis > 0 ? ((holding.dividend || 0) / holding.costBasis) * 100 : 0;
                  
                  return (
                    <tr key={holding.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-600">{holding.ticker}</div>
                          <div className="text-sm text-gray-500">{holding.company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(holding.dividend || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                        {formatCurrency(annualIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600">
                        {formatPercent(currentYield)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                        {formatPercent(yieldOnCost)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};