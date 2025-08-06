import React, { useState } from 'react';
import { Info, TrendingUp, Shield, DollarSign, BarChart3, Calculator, Target, BookOpen, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

export const RatiosGuide: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [expandedRatios, setExpandedRatios] = useState<{ [key: string]: boolean }>({});

  const toggleCategory = (categoryIndex: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex]
    }));
  };

  const toggleRatio = (categoryIndex: number, ratioIndex: number) => {
    const key = `${categoryIndex}-${ratioIndex}`;
    setExpandedRatios(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const ratioCategories = [
    {
      category: 'Valuation Ratios',
      icon: DollarSign,
      color: 'text-blue-400',
      bgGradient: 'from-blue-900/40 to-blue-800/40',
      borderColor: 'border-blue-500/30',
      description: 'Metrics that help determine if a stock is overvalued or undervalued relative to its fundamentals',
      ratios: [
        {
          name: 'Price-to-Earnings (P/E)',
          formula: 'Current Stock Price ÷ Earnings Per Share (EPS)',
          description: 'Measures how much investors are willing to pay for each dollar of earnings. Lower values may indicate undervaluation.',
          interpretation: {
            low: 'P/E < 15: Potentially undervalued or slow growth',
            medium: 'P/E 15-25: Fair valuation for most companies',
            high: 'P/E > 25: High growth expectations or overvaluation'
          },
          importance: 'Helps identify overvalued or undervalued stocks relative to their earnings power. Most widely used valuation metric.',
          limitations: 'Can be misleading for companies with volatile earnings or negative earnings. Doesn\'t account for growth rates.'
        },
        {
          name: 'Price-to-Book (P/B)',
          formula: 'Current Stock Price ÷ Book Value Per Share',
          description: 'Compares market value to book value. Values below 1 may indicate undervaluation.',
          interpretation: {
            low: 'P/B < 1: Trading below book value, potential value play',
            medium: 'P/B 1-3: Reasonable valuation for most industries',
            high: 'P/B > 3: Premium valuation, growth or quality premium'
          },
          importance: 'Useful for identifying companies trading below their asset value, especially valuable in value investing and for asset-heavy industries.',
          limitations: 'Book value may not reflect true market value of assets. Less relevant for service companies with few tangible assets.'
        },
        {
          name: 'PEG Ratio',
          formula: 'P/E Ratio ÷ Earnings Growth Rate',
          description: 'P/E ratio divided by earnings growth rate. Values below 1 may indicate good value.',
          interpretation: {
            low: 'PEG < 1: Potentially undervalued relative to growth',
            medium: 'PEG 1-1.5: Fair valuation considering growth',
            high: 'PEG > 1.5: Expensive relative to growth prospects'
          },
          importance: 'Incorporates growth expectations into valuation, providing a more complete picture than P/E alone. Helps identify growth at a reasonable price.',
          limitations: 'Relies on growth estimates which can be inaccurate. Not useful for companies with negative or erratic growth.'
        },
        {
          name: 'EV/FCF (Enterprise Value to Free Cash Flow)',
          formula: 'Enterprise Value ÷ Free Cash Flow',
          description: 'Compares total company value to cash generation ability. Lower values suggest better value.',
          interpretation: {
            low: 'EV/FCF < 15: Strong cash generation, potential value',
            medium: 'EV/FCF 15-25: Reasonable valuation',
            high: 'EV/FCF > 25: Expensive or low cash generation'
          },
          importance: 'Focuses on actual cash generation rather than accounting earnings. Useful for comparing companies across different capital structures.',
          limitations: 'Free cash flow can be volatile. May not capture cyclical businesses well.'
        },
        {
          name: 'Intrinsic Value',
          formula: 'Discounted Cash Flow (DCF) Analysis',
          description: 'Estimated fair value based on projected future cash flows discounted to present value.',
          interpretation: {
            low: 'Price < Intrinsic Value: Potentially undervalued',
            medium: 'Price ≈ Intrinsic Value: Fairly valued',
            high: 'Price > Intrinsic Value: Potentially overvalued'
          },
          importance: 'Provides fundamental estimate of what a company should be worth based on its cash-generating ability.',
          limitations: 'Highly dependent on assumptions about future growth, margins, and discount rates. Can vary significantly between analysts.'
        }
      ]
    },
    {
      category: 'Financial Health & Leverage',
      icon: Shield,
      color: 'text-green-400',
      bgGradient: 'from-green-900/40 to-green-800/40',
      borderColor: 'border-green-500/30',
      description: 'Ratios that assess a company\'s financial stability and ability to meet its obligations',
      ratios: [
        {
          name: 'Debt-to-Equity',
          formula: 'Total Debt ÷ Total Shareholders\' Equity',
          description: 'Measures financial leverage and risk. Lower values generally indicate stronger financial health.',
          interpretation: {
            low: 'D/E < 0.3: Conservative, low financial risk',
            medium: 'D/E 0.3-0.6: Moderate leverage, industry dependent',
            high: 'D/E > 0.6: High leverage, higher financial risk'
          },
          importance: 'Shows how much debt a company uses to finance operations relative to equity, indicating financial risk and leverage strategy.',
          limitations: 'Optimal levels vary by industry. Some industries naturally require more debt. Off-balance-sheet obligations may not be captured.'
        },
        {
          name: 'Current Ratio',
          formula: 'Current Assets ÷ Current Liabilities',
          description: 'Current assets divided by current liabilities. Values above 1 indicate good short-term liquidity.',
          interpretation: {
            low: 'Current Ratio < 1: Potential liquidity issues',
            medium: 'Current Ratio 1-2: Adequate liquidity',
            high: 'Current Ratio > 2: Strong liquidity, possibly excess cash'
          },
          importance: 'Measures ability to pay short-term obligations, crucial for financial stability and operational continuity.',
          limitations: 'Doesn\'t consider the quality or liquidity of current assets. Inventory may be difficult to convert to cash quickly.'
        },
        {
          name: 'Quick Ratio (Acid Test)',
          formula: '(Current Assets - Inventory) ÷ Current Liabilities',
          description: 'More conservative than current ratio, excludes inventory. Values above 1 are generally good.',
          interpretation: {
            low: 'Quick Ratio < 0.5: Poor immediate liquidity',
            medium: 'Quick Ratio 0.5-1: Adequate immediate liquidity',
            high: 'Quick Ratio > 1: Strong immediate liquidity'
          },
          importance: 'Better measure of immediate liquidity since inventory may be hard to convert to cash quickly. More stringent test of financial health.',
          limitations: 'May be too conservative for companies with fast-moving inventory. Doesn\'t consider timing of cash flows.'
        }
      ]
    },
    {
      category: 'Profitability Ratios',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgGradient: 'from-purple-900/40 to-purple-800/40',
      borderColor: 'border-purple-500/30',
      description: 'Metrics that measure how effectively a company generates profits from its operations',
      ratios: [
        {
          name: 'Return on Equity (ROE)',
          formula: 'Net Income ÷ Average Shareholders\' Equity',
          description: 'Net income divided by shareholder equity. Higher values indicate more efficient use of equity.',
          interpretation: {
            low: 'ROE < 10%: Below average returns to shareholders',
            medium: 'ROE 10-20%: Good returns, competitive performance',
            high: 'ROE > 20%: Excellent returns, superior management'
          },
          importance: 'Shows how effectively management is using shareholders\' money to generate profits. Key metric for equity investors.',
          limitations: 'Can be inflated by high debt levels. May not reflect sustainable returns if driven by one-time events.'
        },
        {
          name: 'Return on Assets (ROA)',
          formula: 'Net Income ÷ Average Total Assets',
          description: 'Net income divided by total assets. Higher values indicate more efficient asset utilization.',
          interpretation: {
            low: 'ROA < 5%: Poor asset utilization',
            medium: 'ROA 5-10%: Reasonable asset efficiency',
            high: 'ROA > 10%: Excellent asset utilization'
          },
          importance: 'Measures how efficiently a company uses its assets to generate earnings, regardless of how those assets are financed.',
          limitations: 'Can vary significantly by industry based on asset intensity. Historical cost accounting may not reflect true asset values.'
        },
        {
          name: 'Gross Margin',
          formula: 'Gross Profit ÷ Revenue × 100',
          description: 'Gross profit divided by revenue. Higher values indicate better pricing power and cost control.',
          interpretation: {
            low: 'Gross Margin < 20%: Low pricing power, competitive pressure',
            medium: 'Gross Margin 20-50%: Reasonable pricing power',
            high: 'Gross Margin > 50%: Strong pricing power, differentiation'
          },
          importance: 'Shows profitability after direct costs, indicating competitive advantage, pricing power, and operational efficiency.',
          limitations: 'Doesn\'t include operating expenses. Can be manipulated through inventory accounting methods.'
        },
        {
          name: 'Net Margin',
          formula: 'Net Income ÷ Revenue × 100',
          description: 'Net income divided by revenue. Shows overall profitability after all expenses.',
          interpretation: {
            low: 'Net Margin < 5%: Low overall profitability',
            medium: 'Net Margin 5-15%: Reasonable profitability',
            high: 'Net Margin > 15%: High profitability, efficient operations'
          },
          importance: 'Ultimate measure of profitability, showing how much of each revenue dollar flows to the bottom line.',
          limitations: 'Can be affected by one-time charges, tax rates, and accounting methods. May not reflect operating performance.'
        },
        {
          name: 'Operating Margin',
          formula: 'Operating Income ÷ Revenue × 100',
          description: 'Operating income divided by revenue. Measures operational efficiency.',
          interpretation: {
            low: 'Operating Margin < 10%: Poor operational efficiency',
            medium: 'Operating Margin 10-20%: Good operational control',
            high: 'Operating Margin > 20%: Excellent operational efficiency'
          },
          importance: 'Shows profitability from core operations, excluding financing and tax effects. Good measure of management effectiveness.',
          limitations: 'Excludes important costs like interest and taxes. May not reflect total company performance.'
        }
      ]
    },
    {
      category: 'Efficiency & Growth',
      icon: BarChart3,
      color: 'text-orange-400',
      bgGradient: 'from-orange-900/40 to-orange-800/40',
      borderColor: 'border-orange-500/30',
      description: 'Ratios that measure how efficiently a company uses its resources and grows its business',
      ratios: [
        {
          name: 'Asset Turnover',
          formula: 'Revenue ÷ Average Total Assets',
          description: 'Measures how efficiently a company uses its assets to generate sales.',
          interpretation: {
            low: 'Asset Turnover < 0.5: Poor asset utilization',
            medium: 'Asset Turnover 0.5-1.5: Reasonable efficiency',
            high: 'Asset Turnover > 1.5: High asset efficiency'
          },
          importance: 'Shows how well management uses company assets to generate revenue. Higher turnover indicates more efficient operations.',
          limitations: 'Varies significantly by industry. Asset-heavy industries naturally have lower turnover ratios.'
        },
        {
          name: 'Revenue Growth',
          formula: '(Current Period Revenue - Prior Period Revenue) ÷ Prior Period Revenue × 100',
          description: 'Year-over-year percentage increase in revenue. Indicates business expansion.',
          interpretation: {
            low: 'Revenue Growth < 5%: Slow growth, mature business',
            medium: 'Revenue Growth 5-15%: Steady growth',
            high: 'Revenue Growth > 15%: High growth, expanding business'
          },
          importance: 'Fundamental measure of business growth and market share expansion. Critical for growth investors.',
          limitations: 'Can be affected by acquisitions, currency changes, or one-time events. Quality of growth matters more than just quantity.'
        }
      ]
    },
    {
      category: 'Cash Flow Analysis',
      icon: Calculator,
      color: 'text-teal-400',
      bgGradient: 'from-teal-900/40 to-teal-800/40',
      borderColor: 'border-teal-500/30',
      description: 'Metrics focused on cash generation and financial sustainability',
      ratios: [
        {
          name: 'Free Cash Flow (1-Year)',
          formula: 'Operating Cash Flow - Capital Expenditures',
          description: 'Cash generated after necessary capital investments. Measures true cash generation ability.',
          interpretation: {
            low: 'Negative FCF: Cash burn, growth investment phase',
            medium: 'Positive FCF: Sustainable cash generation',
            high: 'High FCF: Strong cash generation, financial flexibility'
          },
          importance: 'Shows actual cash available for dividends, buybacks, debt reduction, or growth investments.',
          limitations: 'Can be volatile due to timing of capital expenditures. May not capture necessary maintenance capex accurately.'
        },
        {
          name: 'Free Cash Flow (10-Year)',
          formula: 'Cumulative 10-year Free Cash Flow',
          description: 'Long-term cash generation track record. Shows consistency and sustainability.',
          interpretation: {
            low: 'Inconsistent or low long-term cash generation',
            medium: 'Steady long-term cash generation',
            high: 'Strong, consistent long-term cash generation'
          },
          importance: 'Demonstrates long-term business sustainability and management\'s ability to generate cash through cycles.',
          limitations: 'Historical performance may not predict future results. Business models may have changed significantly.'
        }
      ]
    },
    {
      category: 'Market Performance',
      icon: Target,
      color: 'text-pink-400',
      bgGradient: 'from-pink-900/40 to-pink-800/40',
      borderColor: 'border-pink-500/30',
      description: 'Price-based metrics that reflect market sentiment and trading ranges',
      ratios: [
        {
          name: '52-Week High',
          formula: 'Highest trading price in the past 52 weeks',
          description: 'Shows the peak price level reached in the past year.',
          interpretation: {
            low: 'Current price near 52-week high: Momentum, potential resistance',
            medium: 'Current price in middle of range: Neutral sentiment',
            high: 'Current price near 52-week low: Potential value, support level'
          },
          importance: 'Helps identify potential support and resistance levels, momentum, and relative valuation.',
          limitations: 'Backward-looking metric. High prices may indicate overvaluation or strong fundamentals.'
        },
        {
          name: '52-Week Low',
          formula: 'Lowest trading price in the past 52 weeks',
          description: 'Shows the trough price level reached in the past year.',
          interpretation: {
            low: 'Wide range: High volatility, uncertain outlook',
            medium: 'Moderate range: Normal price fluctuation',
            high: 'Narrow range: Low volatility, stable sentiment'
          },
          importance: 'Provides context for current valuation and helps identify potential buying opportunities or warning signs.',
          limitations: 'Low prices may indicate fundamental problems rather than value opportunities.'
        },
        {
          name: 'Current Price',
          formula: 'Most recent trading price',
          description: 'Real-time market valuation of the company.',
          interpretation: {
            low: 'Relative to intrinsic value and historical ranges',
            medium: 'Consider in context of fundamentals and trends',
            high: 'Market sentiment and expectations reflected'
          },
          importance: 'Starting point for all valuation analysis. Reflects current market consensus on company value.',
          limitations: 'Can be influenced by short-term sentiment, market conditions, and technical factors unrelated to fundamentals.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/80 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-2xl p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-600/20 p-3 rounded-full border border-blue-500/30">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Financial Ratios Guide</h2>
            <p className="text-blue-200">Master the metrics that drive investment decisions</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed">
          Comprehensive guide to understanding the financial ratios and metrics used in portfolio analysis. 
          Each ratio provides unique insights into company performance, financial health, and valuation.
        </p>
      </div>

      {/* Ratio Categories */}
      {ratioCategories.map((category, categoryIndex) => {
        const CategoryIcon = category.icon;
        const isExpanded = expandedCategories[categoryIndex];
        
        return (
          <div key={categoryIndex} className={`bg-gradient-to-br ${category.bgGradient} backdrop-blur-sm rounded-xl border ${category.borderColor} shadow-xl transition-all duration-300 hover:shadow-2xl`}>
            <div 
              className="p-6 border-b border-gray-600/50 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleCategory(categoryIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`bg-${category.color.split('-')[1]}-600/20 p-3 rounded-full border border-${category.color.split('-')[1]}-500/30`}>
                    <CategoryIcon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{category.category}</h3>
                    <p className="text-gray-100 text-sm font-medium">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-200 font-medium">{category.ratios.length} ratios</span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-200" />
                  )}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {category.ratios.map((ratio, ratioIndex) => {
                    const ratioKey = `${categoryIndex}-${ratioIndex}`;
                    const isRatioExpanded = expandedRatios[ratioKey];
                    
                    return (
                      <div key={ratioIndex} className="bg-gray-800/40 backdrop-blur-sm border border-gray-600/30 rounded-xl overflow-hidden hover:border-gray-600/50 transition-all duration-300">
                        <div 
                          className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleRatio(categoryIndex, ratioIndex)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">{ratio.name}</h4>
                            {isRatioExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-200" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-200" />
                            )}
                          </div>
                          
                          <div className="bg-gray-900/60 rounded-lg p-4 mb-4 border border-gray-600/30">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calculator className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-300">Formula</span>
                            </div>
                            <code className="text-blue-200 font-mono text-sm">{ratio.formula}</code>
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed">{ratio.description}</p>
                        </div>

                        {isRatioExpanded && (
                          <div className="px-6 pb-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Interpretation Guidelines */}
                              <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-600/20">
                                <div className="flex items-center space-x-2 mb-4">
                                  <BarChart3 className="h-5 w-5 text-yellow-400" />
                                  <h5 className="font-semibold text-yellow-300">Interpretation Guidelines</h5>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-red-200">{ratio.interpretation.low}</span>
                                  </div>
                                  <div className="flex items-start space-x-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-yellow-200">{ratio.interpretation.medium}</span>
                                  </div>
                                  <div className="flex items-start space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-green-200">{ratio.interpretation.high}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Why It Matters */}
                              <div className="bg-blue-900/30 rounded-xl p-5 border border-blue-500/20">
                                <div className="flex items-center space-x-2 mb-4">
                                  <CheckCircle className="h-5 w-5 text-blue-400" />
                                  <h5 className="font-semibold text-blue-300">Why It Matters</h5>
                                </div>
                                <p className="text-sm text-blue-100 leading-relaxed">{ratio.importance}</p>
                              </div>
                            </div>

                            {/* Limitations */}
                            <div className="bg-orange-900/30 rounded-xl p-5 border border-orange-500/20">
                              <div className="flex items-center space-x-2 mb-4">
                                <AlertCircle className="h-5 w-5 text-orange-400" />
                                <h5 className="font-semibold text-orange-300">Limitations & Considerations</h5>
                              </div>
                              <p className="text-sm text-orange-100 leading-relaxed">{ratio.limitations}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Key Takeaways */}
      <div className="bg-gradient-to-br from-gray-900/80 to-indigo-900/80 backdrop-blur-sm rounded-xl border border-indigo-500/30 shadow-2xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-600/20 p-2 rounded-full border border-indigo-500/30">
            <Info className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white">Key Takeaways</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-green-900/20 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h4 className="font-semibold text-green-300">Best Practices</h4>
            </div>
            <ul className="space-y-3 text-green-100">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Compare ratios within the same industry for meaningful insights</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Analyze trends over multiple periods to identify patterns</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Use multiple ratios for comprehensive analysis</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Consider business cycle and market conditions</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <h4 className="font-semibold text-yellow-300">Important Reminders</h4>
            </div>
            <ul className="space-y-3 text-yellow-100">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">No single ratio tells the complete story</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Context and industry norms are crucial</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Quality of earnings and cash flows matters most</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Combine quantitative analysis with qualitative factors</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};