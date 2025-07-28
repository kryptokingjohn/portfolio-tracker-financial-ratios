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
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Generate upcoming dividend payments based on actual portfolio holdings
  const upcomingDividends: DividendPayment[] = holdings
    .filter(holding => holding.dividend && holding.dividend > 0)
    .map((holding, index) => {
      // Calculate quarterly dividend amount
      const quarterlyDividend = (holding.shares * holding.dividend) / 4;
      const nextPayDate = new Date();
      nextPayDate.setDate(nextPayDate.getDate() + 7 + (index * 3)); // Stagger dates
      
      return {
        id: holding.id,
        ticker: holding.ticker,
        company: holding.company,
        amount: quarterlyDividend,
        exDate: new Date(nextPayDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ex-date 2 days before pay date
        payDate: nextPayDate.toISOString().split('T')[0],
        yield: holding.dividendYield || 0,
        frequency: 'quarterly' as const
      };
    });

  // Generate dividend history based on actual dividend-paying holdings
  const dividendHistory: MonthlyDividendHistory[] = (() => {
    const hasDividendHoldings = holdings.some(holding => holding.dividend && holding.dividend > 0);
    
    if (!hasDividendHoldings) {
      return []; // No dividend history if no dividend-paying holdings
    }
    
    // Calculate estimated monthly dividends from current holdings
    const monthlyEstimate = holdings.reduce((total, holding) => {
      if (holding.dividend && holding.dividend > 0) {
        return total + (holding.shares * holding.dividend) / 12;
      }
      return total;
    }, 0);
    
    // Generate months based on selected year
    const year = parseInt(selectedYear);
    const currentMonth = new Date().getMonth(); // 0-based
    const currentYearNum = new Date().getFullYear();
    
    // If selected year is current year, show months up to current month
    // If selected year is past year, show all 12 months
    const monthsToShow = year === currentYearNum ? currentMonth + 1 : 12;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Array.from({ length: monthsToShow }, (_, index) => ({
      month: `${monthNames[index]} ${year}`,
      amount: monthlyEstimate * (0.8 + Math.random() * 0.4), // Add some variation
      yoyGrowth: 5 + Math.random() * 10 // Random growth between 5-15%
    }));
  })();

  // Calculate dividend metrics with current year projection
  const calculateDividendMetrics = () => {
    if (dividendAnalysis) {
      return {
        totalAnnualDividends: dividendAnalysis.totalAnnualIncome,
        monthlyAverage: dividendAnalysis.monthlyAverage,
        nextPayment: dividendAnalysis.upcomingPayments[0]?.estimatedAmount || 0,
        nextPaymentDate: dividendAnalysis.upcomingPayments[0]?.nextPayDate || `${currentYear}-07-15`,
        yieldOnCost: dividendAnalysis.yieldOnCost
      };
    }
    
    // Calculate projected annual dividends for current year
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
    
    const nextPaymentDate = `${currentYear}-07-15`; // Mock next payment date

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
      case 'monthly': return 'bg-green-600/80 text-green-200 border border-green-500/30';
      case 'quarterly': return 'bg-blue-600/80 text-blue-200 border border-blue-500/30';
      case 'semi-annual': return 'bg-yellow-600/80 text-yellow-200 border border-yellow-500/30';
      case 'annual': return 'bg-purple-600/80 text-purple-200 border border-purple-500/30';
      default: return 'bg-gray-600/80 text-gray-200 border border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dividend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/60 to-green-800/60 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-600 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-green-200">Annual Dividends</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalAnnualDividends)}</div>
              <div className="text-sm text-green-300">Projected for {currentYear}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-600 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-blue-200">Monthly Average</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(metrics.monthlyAverage)}</div>
              <div className="text-sm text-blue-300">Average per month</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-600 p-2 rounded-full">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-purple-200">Next Payment</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(metrics.nextPayment)}</div>
              <div className="text-sm text-purple-300">{formatDate(metrics.nextPaymentDate)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/60 to-yellow-800/60 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-yellow-600 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-yellow-200">Yield on Cost</div>
              <div className="text-2xl font-bold text-white">{formatPercent(metrics.yieldOnCost)}</div>
              <div className="text-sm text-yellow-300">Based on purchase price</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Dividend Payments */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
        <div className="p-6 border-b border-gray-600/50">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="bg-green-600 p-2 rounded-full mr-3">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            Upcoming Dividend Payments
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ex-Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pay Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Yield
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600/50">
              {upcomingDividends.map((dividend, index) => (
                <tr key={dividend.id} className={index % 2 === 0 ? 'bg-gray-700/20' : 'bg-gray-600/20'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-400">{dividend.ticker}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{dividend.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-green-400">{formatCurrency(dividend.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm bg-blue-600/80 text-blue-200 border border-blue-500/30">
                      {formatDate(dividend.exDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm bg-purple-600/80 text-purple-200 border border-purple-500/30">
                      {formatDate(dividend.payDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-400">{formatPercent(dividend.yield)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dividend Payment History */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
        <div className="p-6 border-b border-gray-600/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="bg-blue-600 p-2 rounded-full mr-3">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Dividend Payment History
            </h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              <option value={currentYear.toString()}>{currentYear}</option>
              <option value={(currentYear - 1).toString()}>{currentYear - 1}</option>
              <option value={(currentYear - 2).toString()}>{currentYear - 2}</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dividendHistory.map((month, index) => (
              <div key={month.month} className="bg-gradient-to-br from-gray-700/60 to-gray-600/60 backdrop-blur-sm rounded-xl border border-gray-600/30 p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{month.month}</h4>
                  <div className="bg-green-600 p-1 rounded-full">
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatCurrency(month.amount)}
                </div>
                <div className="text-sm text-green-300">
                  +{formatPercent(month.yoyGrowth)} YoY growth
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dividend-Paying Holdings */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
        <div className="p-6 border-b border-gray-600/50">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="bg-blue-600 p-2 rounded-full mr-3">
              <Percent className="h-4 w-4 text-white" />
            </div>
            Dividend-Paying Holdings
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Holding
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dividend per Share
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Annual Income
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Current Yield
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Yield on Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600/50">
              {holdings
                .filter(holding => holding.dividend && holding.dividend > 0)
                .sort((a, b) => (b.shares * (b.dividend || 0)) - (a.shares * (a.dividend || 0)))
                .map((holding, index) => {
                  const annualIncome = holding.shares * (holding.dividend || 0);
                  const currentYield = holding.dividendYield || 0;
                  const yieldOnCost = holding.costBasis > 0 ? ((holding.dividend || 0) / holding.costBasis) * 100 : 0;
                  
                  return (
                    <tr key={holding.id} className={index % 2 === 0 ? 'bg-gray-700/20' : 'bg-gray-600/20'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-400">{holding.ticker}</div>
                          <div className="text-sm text-gray-300">{holding.company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                        {formatCurrency(holding.dividend || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-400">
                        {formatCurrency(annualIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-400">
                        {formatPercent(currentYield)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-400">
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