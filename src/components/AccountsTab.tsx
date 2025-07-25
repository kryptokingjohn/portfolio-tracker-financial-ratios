import React, { useState } from 'react';
import { PieChart, DollarSign, TrendingUp, Shield, GraduationCap, Heart, Building, Users, Wallet, Calculator, Info, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { Holding } from '../types/portfolio';

interface AccountsTabProps {
  holdings: Holding[];
}

interface AccountSummary {
  accountType: string;
  displayName: string;
  icon: React.ComponentType<any>;
  description: string;
  taxTreatment: string;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  holdings: Holding[];
  contributionLimit?: string;
  withdrawalRules?: string;
  taxBenefits: string[];
  color: string;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ holdings }) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState<{ [key: string]: boolean }>({});

  const accountTypes = {
    'taxable': {
      displayName: 'Taxable Brokerage',
      icon: DollarSign,
      description: 'Standard investment account with no contribution limits',
      taxTreatment: 'Taxed on dividends, interest, and capital gains',
      contributionLimit: 'No limit',
      withdrawalRules: 'No restrictions',
      taxBenefits: ['Tax-loss harvesting opportunities', 'Flexible access to funds'],
      color: '#3B82F6'
    },
    '401k': {
      displayName: '401(k)',
      icon: Building,
      description: 'Employer-sponsored retirement plan with tax advantages',
      taxTreatment: 'Pre-tax contributions, taxed on withdrawal',
      contributionLimit: '$23,000 (2024), $30,500 if 50+',
      withdrawalRules: 'Penalty before 59½, RMDs at 73',
      taxBenefits: ['Tax-deferred growth', 'Employer matching', 'Lower current taxable income'],
      color: '#10B981'
    },
    'traditional_ira': {
      displayName: 'Traditional IRA',
      icon: Shield,
      description: 'Individual retirement account with tax-deferred growth',
      taxTreatment: 'Pre-tax contributions (if eligible), taxed on withdrawal',
      contributionLimit: '$7,000 (2024), $8,000 if 50+',
      withdrawalRules: 'Penalty before 59½, RMDs at 73',
      taxBenefits: ['Tax-deferred growth', 'Potential tax deduction'],
      color: '#F59E0B'
    },
    'roth_ira': {
      displayName: 'Roth IRA',
      icon: TrendingUp,
      description: 'Individual retirement account with tax-free growth',
      taxTreatment: 'After-tax contributions, tax-free withdrawals in retirement',
      contributionLimit: '$7,000 (2024), $8,000 if 50+',
      withdrawalRules: 'Contributions withdrawable anytime, earnings after 59½',
      taxBenefits: ['Tax-free growth', 'Tax-free withdrawals', 'No RMDs'],
      color: '#EF4444'
    },
    'hsa': {
      displayName: 'Health Savings Account',
      icon: Heart,
      description: 'Triple tax-advantaged account for medical expenses',
      taxTreatment: 'Pre-tax contributions, tax-free growth and withdrawals for medical',
      contributionLimit: '$4,300 individual, $8,550 family (2024)',
      withdrawalRules: 'Tax-free for medical expenses, penalty for non-medical before 65',
      taxBenefits: ['Triple tax advantage', 'Investment growth potential', 'Retirement healthcare fund'],
      color: '#8B5CF6'
    },
    'sep_ira': {
      displayName: 'SEP-IRA',
      icon: Users,
      description: 'Simplified Employee Pension for self-employed and small business',
      taxTreatment: 'Pre-tax contributions, taxed on withdrawal',
      contributionLimit: 'Up to 25% of compensation or $69,000 (2024)',
      withdrawalRules: 'Penalty before 59½, RMDs at 73',
      taxBenefits: ['High contribution limits', 'Tax-deferred growth', 'Business tax deduction'],
      color: '#06B6D4'
    },
    'simple_ira': {
      displayName: 'SIMPLE IRA',
      icon: Calculator,
      description: 'Savings Incentive Match Plan for small employers',
      taxTreatment: 'Pre-tax contributions, taxed on withdrawal',
      contributionLimit: '$16,000 (2024), $19,500 if 50+',
      withdrawalRules: 'Higher penalty in first 2 years, RMDs at 73',
      taxBenefits: ['Employer matching', 'Tax-deferred growth', 'Lower administrative costs'],
      color: '#84CC16'
    },
    '529': {
      displayName: '529 Education',
      icon: GraduationCap,
      description: 'Tax-advantaged savings plan for education expenses',
      taxTreatment: 'After-tax contributions, tax-free growth for education',
      contributionLimit: 'Varies by state, typically $300,000+',
      withdrawalRules: 'Tax-free for qualified education expenses',
      taxBenefits: ['Tax-free growth', 'State tax deductions (varies)', 'Education expense flexibility'],
      color: '#F97316'
    },
    'cash_money_market': {
      displayName: 'Cash & Money Market',
      icon: Wallet,
      description: 'Liquid cash reserves and money market funds',
      taxTreatment: 'Taxed on interest income',
      contributionLimit: 'No limit',
      withdrawalRules: 'Immediate access',
      taxBenefits: ['Liquidity', 'Capital preservation', 'Emergency fund'],
      color: '#6B7280'
    },
    'trust': {
      displayName: 'Trust Account',
      icon: Shield,
      description: 'Assets held in trust for beneficiaries',
      taxTreatment: 'Varies by trust type',
      contributionLimit: 'Varies by trust terms',
      withdrawalRules: 'Per trust agreement',
      taxBenefits: ['Estate planning', 'Asset protection', 'Tax efficiency (varies)'],
      color: '#EC4899'
    },
    'custodial': {
      displayName: 'Custodial Account',
      icon: Users,
      description: 'UTMA/UGMA accounts for minors',
      taxTreatment: 'Taxed at child\'s rate (kiddie tax rules apply)',
      contributionLimit: 'Gift tax limits apply',
      withdrawalRules: 'For benefit of minor, control transfers at majority',
      taxBenefits: ['Potential tax savings', 'Educational funding', 'Gift tax benefits'],
      color: '#14B8A6'
    }
  };

  const calculateAccountSummaries = (): AccountSummary[] => {
    const summaries: { [key: string]: AccountSummary } = {};

    // Initialize all account types
    Object.entries(accountTypes).forEach(([key, config]) => {
      summaries[key] = {
        accountType: key,
        displayName: config.displayName,
        icon: config.icon,
        description: config.description,
        taxTreatment: config.taxTreatment,
        totalValue: 0,
        totalCost: 0,
        gainLoss: 0,
        gainLossPercent: 0,
        holdings: [],
        contributionLimit: config.contributionLimit,
        withdrawalRules: config.withdrawalRules,
        taxBenefits: config.taxBenefits,
        color: config.color
      };
    });

    // Calculate values for each account
    holdings.forEach(holding => {
      const accountType = holding.accountType;
      if (summaries[accountType]) {
        const currentValue = holding.shares * holding.currentPrice;
        const cost = holding.shares * holding.costBasis;
        
        summaries[accountType].totalValue += currentValue;
        summaries[accountType].totalCost += cost;
        summaries[accountType].holdings.push(holding);
      }
    });

    // Calculate gain/loss percentages
    Object.values(summaries).forEach(summary => {
      summary.gainLoss = summary.totalValue - summary.totalCost;
      summary.gainLossPercent = summary.totalCost > 0 ? (summary.gainLoss / summary.totalCost) * 100 : 0;
    });

    return Object.values(summaries).filter(summary => summary.holdings.length > 0);
  };

  const accountSummaries = calculateAccountSummaries();
  const totalPortfolioValue = accountSummaries.reduce((sum, account) => sum + account.totalValue, 0);

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const toggleAccountDetails = (accountType: string) => {
    setShowAccountDetails(prev => ({
      ...prev,
      [accountType]: !prev[accountType]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Account Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-700" />
          Account Performance Summary
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Basis
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YTD %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1YR %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  3YR %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  5YR %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  10YR %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Portfolio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountSummaries.map((account, index) => {
                const portfolioPercentage = (account.totalValue / totalPortfolioValue) * 100;
                // Mock YTD change - in real app this would be calculated from historical data
                const ytdChangePercent = account.gainLossPercent * 0.8; // Approximate YTD as 80% of total gain
                const ytdChangeDollar = account.totalValue * (ytdChangePercent / 100);
                
                // Mock multi-year performance data - in real app this would come from historical data
                const oneYearPercent = account.gainLossPercent * 0.9; // Approximate 1-year
                const threeYearPercent = account.gainLossPercent * 0.6; // Approximate 3-year annualized
                const fiveYearPercent = account.gainLossPercent * 0.4; // Approximate 5-year annualized
                const tenYearPercent = account.gainLossPercent * 0.3; // Approximate 10-year annualized
                
                const getTaxStatus = (accountType: string) => {
                  switch (accountType) {
                    case 'taxable': return 'Taxable';
                    case '401k': return 'Tax-Deferred';
                    case 'traditional_ira': return 'Tax-Deferred';
                    case 'roth_ira': return 'Tax-Free';
                    case 'hsa': return 'Tax-Free';
                    case 'sep_ira': return 'Tax-Deferred';
                    case 'simple_ira': return 'Tax-Deferred';
                    case '529': return 'Tax-Free (Education)';
                    case 'cash_money_market': return 'Taxable';
                    case 'trust': return 'Varies';
                    case 'custodial': return 'Taxable (Child)';
                    default: return 'Unknown';
                  }
                };
                
                const getTaxStatusColor = (accountType: string) => {
                  switch (accountType) {
                    case 'taxable':
                    case 'cash_money_market':
                    case 'custodial':
                      return 'bg-red-100 text-red-800';
                    case '401k':
                    case 'traditional_ira':
                    case 'sep_ira':
                    case 'simple_ira':
                      return 'bg-yellow-100 text-yellow-800';
                    case 'roth_ira':
                    case 'hsa':
                    case '529':
                      return 'bg-green-100 text-green-800';
                    case 'trust':
                      return 'bg-gray-100 text-gray-800';
                    default:
                      return 'bg-gray-100 text-gray-800';
                  }
                };
                
                return (
                  <tr key={account.accountType} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${account.color}20`, color: account.color }}
                        >
                          <account.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{account.displayName}</div>
                          <div className="text-xs text-gray-500">{account.holdings.length} holdings</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(account.totalValue)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-600">{formatCurrency(account.totalCost)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${ytdChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(ytdChangePercent)}
                      </div>
                      <div className={`text-xs ${ytdChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ytdChangePercent >= 0 ? '+' : ''}{formatCurrency(ytdChangeDollar)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${oneYearPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(oneYearPercent)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${threeYearPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(threeYearPercent)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${fiveYearPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(fiveYearPercent)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${tenYearPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(tenYearPercent)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">{portfolioPercentage.toFixed(1)}%</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaxStatusColor(account.accountType)}`}>
                        {getTaxStatus(account.accountType)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">Total Portfolio</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  {formatCurrency(totalPortfolioValue)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                  {formatCurrency(accountSummaries.reduce((sum, acc) => sum + acc.totalCost, 0))}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  {/* Portfolio-wide YTD would be calculated here */}
                  <div className="text-green-600">+18.4%</div>
                  <div className="text-xs text-green-600">+${(totalPortfolioValue * 0.184).toLocaleString()}</div>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">+22.1%</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">+11.8%</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">+13.2%</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">+12.7%</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">100.0%</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-blue-700" />
          Account Allocation Overview
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {accountSummaries.reduce((acc, account, index) => {
                  const percentage = (account.totalValue / totalPortfolioValue) * 100;
                  const startAngle = acc.currentAngle;
                  const angle = (percentage / 100) * 360;
                  const endAngle = startAngle + angle;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');

                  acc.elements.push(
                    <path
                      key={account.accountType}
                      d={pathData}
                      fill={account.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      onClick={() => setSelectedAccount(account.accountType)}
                    />
                  );
                  
                  acc.currentAngle = endAngle;
                  return acc;
                }, { elements: [] as JSX.Element[], currentAngle: 0 }).elements}
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {accountSummaries.map((account) => {
              const percentage = (account.totalValue / totalPortfolioValue) * 100;
              return (
                <div 
                  key={account.accountType} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAccount === account.accountType ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedAccount(selectedAccount === account.accountType ? null : account.accountType)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: account.color }}
                    ></div>
                    <div>
                      <span className="font-medium text-gray-900">{account.displayName}</span>
                      <div className="text-sm text-gray-500">{account.holdings.length} holdings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(account.totalValue)}</div>
                    <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accountSummaries.map((account) => {
          const Icon = account.icon;
          const isExpanded = showAccountDetails[account.accountType];
          
          return (
            <div key={account.accountType} className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${account.color}20`, color: account.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{account.displayName}</h4>
                      <p className="text-sm text-gray-500">{account.holdings.length} holdings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAccountDetails(account.accountType)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Account Summary */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Value</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(account.totalValue)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Gain/Loss</div>
                    <div className={`text-xl font-bold ${account.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.gainLoss)}
                    </div>
                    <div className={`text-sm ${account.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(account.gainLossPercent)}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{account.description}</p>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Tax Treatment</h5>
                      <p className="text-sm text-gray-600">{account.taxTreatment}</p>
                    </div>

                    {account.contributionLimit && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Contribution Limit</h5>
                        <p className="text-sm text-gray-600">{account.contributionLimit}</p>
                      </div>
                    )}

                    {account.withdrawalRules && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Withdrawal Rules</h5>
                        <p className="text-sm text-gray-600">{account.withdrawalRules}</p>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Tax Benefits</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {account.taxBenefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Holdings in this account */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Holdings</h5>
                      <div className="space-y-2">
                        {account.holdings.map((holding) => {
                          const currentValue = holding.shares * holding.currentPrice;
                          const cost = holding.shares * holding.costBasis;
                          const gainLoss = currentValue - cost;
                          const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;
                          
                          return (
                            <div key={holding.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium text-sm text-gray-900">{holding.ticker}</div>
                                <div className="text-xs text-gray-500">{holding.shares} shares</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{formatCurrency(currentValue)}</div>
                                <div className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercent(gainLossPercent)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Type Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-700" />
          Account Types Guide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(accountTypes).map(([key, config]) => {
            const Icon = config.icon;
            const hasHoldings = accountSummaries.some(summary => summary.accountType === key);
            
            return (
              <div 
                key={key} 
                className={`border rounded-lg p-4 ${hasHoldings ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`h-5 w-5 ${hasHoldings ? 'text-blue-600' : 'text-gray-500'}`} />
                  <h4 className={`font-medium ${hasHoldings ? 'text-blue-900' : 'text-gray-900'}`}>
                    {config.displayName}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                <div className="text-xs text-gray-500">
                  <strong>Tax:</strong> {config.taxTreatment}
                </div>
                {config.contributionLimit && (
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Limit:</strong> {config.contributionLimit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};