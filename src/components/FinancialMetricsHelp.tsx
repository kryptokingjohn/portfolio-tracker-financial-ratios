import React, { useState } from 'react';
import { HelpCircle, X, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { ARIA, FocusManager, generateId } from '../utils/accessibility';

// Financial metrics explanations
export interface MetricExplanation {
  name: string;
  definition: string;
  calculation?: string;
  interpretation: {
    good: string;
    bad: string;
    neutral?: string;
  };
  ranges?: {
    excellent: string;
    good: string;
    poor: string;
  };
  examples?: string[];
  category: 'valuation' | 'profitability' | 'liquidity' | 'efficiency' | 'leverage';
}

export const FINANCIAL_METRICS: Record<string, MetricExplanation> = {
  peRatio: {
    name: 'Price-to-Earnings Ratio (P/E)',
    definition: 'Shows how much investors are willing to pay for each dollar of earnings.',
    calculation: 'Stock Price ÷ Earnings Per Share',
    interpretation: {
      good: 'Lower P/E may indicate undervalued stock or growth opportunities',
      bad: 'Very high P/E might suggest overvaluation or excessive optimism',
      neutral: 'Compare with industry average and growth rate'
    },
    ranges: {
      excellent: 'Below 15 (for mature companies)',
      good: '15-25 (reasonable valuation)',
      poor: 'Above 30 (potentially overvalued)'
    },
    examples: [
      'P/E of 20 means investors pay $20 for every $1 of annual earnings',
      'Tech companies often have higher P/E ratios than utilities'
    ],
    category: 'valuation'
  },
  
  pbRatio: {
    name: 'Price-to-Book Ratio (P/B)',
    definition: 'Compares stock price to the book value per share.',
    calculation: 'Market Price ÷ Book Value Per Share',
    interpretation: {
      good: 'P/B below 1 might indicate undervalued stock',
      bad: 'Very high P/B could suggest overvaluation',
      neutral: 'Consider industry norms and company growth'
    },
    ranges: {
      excellent: 'Below 1.0 (trading below book value)',
      good: '1.0-3.0 (reasonable premium)',
      poor: 'Above 5.0 (high premium to assets)'
    },
    category: 'valuation'
  },

  pegRatio: {
    name: 'Price/Earnings-to-Growth Ratio (PEG)',
    definition: 'P/E ratio adjusted for expected earnings growth rate.',
    calculation: 'P/E Ratio ÷ Annual Earnings Growth Rate',
    interpretation: {
      good: 'PEG below 1.0 suggests stock may be undervalued relative to growth',
      bad: 'PEG above 2.0 might indicate overvaluation',
      neutral: 'PEG around 1.0 suggests fair valuation'
    },
    ranges: {
      excellent: 'Below 0.5 (potentially undervalued)',
      good: '0.5-1.5 (reasonably valued)',
      poor: 'Above 2.0 (potentially overvalued)'
    },
    category: 'valuation'
  },

  roe: {
    name: 'Return on Equity (ROE)',
    definition: 'Measures how effectively a company uses shareholders equity to generate profits.',
    calculation: 'Net Income ÷ Shareholders Equity × 100',
    interpretation: {
      good: 'Higher ROE indicates efficient use of shareholder investments',
      bad: 'Low ROE suggests poor management or capital allocation',
      neutral: 'Compare with industry peers and historical performance'
    },
    ranges: {
      excellent: 'Above 20% (very efficient)',
      good: '10-20% (good performance)',
      poor: 'Below 5% (poor returns)'
    },
    category: 'profitability'
  },

  roa: {
    name: 'Return on Assets (ROA)',
    definition: 'Shows how efficiently a company uses its assets to generate profit.',
    calculation: 'Net Income ÷ Total Assets × 100',
    interpretation: {
      good: 'Higher ROA indicates efficient asset utilization',
      bad: 'Low ROA suggests inefficient asset management',
      neutral: 'Asset-heavy industries typically have lower ROA'
    },
    ranges: {
      excellent: 'Above 10% (very efficient)',
      good: '5-10% (good asset use)',
      poor: 'Below 2% (inefficient)'
    },
    category: 'profitability'
  },

  currentRatio: {
    name: 'Current Ratio',
    definition: 'Measures ability to pay short-term debts with current assets.',
    calculation: 'Current Assets ÷ Current Liabilities',
    interpretation: {
      good: 'Ratio above 1.5 indicates good liquidity cushion',
      bad: 'Ratio below 1.0 suggests potential liquidity problems',
      neutral: 'Very high ratios might indicate inefficient cash management'
    },
    ranges: {
      excellent: '1.5-3.0 (strong liquidity)',
      good: '1.0-1.5 (adequate liquidity)',
      poor: 'Below 1.0 (liquidity concerns)'
    },
    category: 'liquidity'
  },

  quickRatio: {
    name: 'Quick Ratio (Acid Test)',
    definition: 'More conservative liquidity measure excluding inventory.',
    calculation: '(Current Assets - Inventory) ÷ Current Liabilities',
    interpretation: {
      good: 'Ratio above 1.0 shows ability to meet obligations without selling inventory',
      bad: 'Ratio below 0.5 indicates potential liquidity stress',
      neutral: 'More conservative than current ratio'
    },
    ranges: {
      excellent: 'Above 1.5 (very liquid)',
      good: '1.0-1.5 (adequate liquidity)',
      poor: 'Below 0.5 (liquidity risk)'
    },
    category: 'liquidity'
  },

  debtToEquity: {
    name: 'Debt-to-Equity Ratio (D/E)',
    definition: 'Shows company financial leverage and risk level.',
    calculation: 'Total Debt ÷ Total Shareholders Equity',
    interpretation: {
      good: 'Lower ratios indicate less financial risk',
      bad: 'High ratios suggest increased financial leverage and risk',
      neutral: 'Acceptable levels vary significantly by industry'
    },
    ranges: {
      excellent: 'Below 0.3 (conservative)',
      good: '0.3-0.6 (moderate leverage)',
      poor: 'Above 1.0 (high leverage)'
    },
    category: 'leverage'
  },

  beta: {
    name: 'Beta Coefficient',
    definition: 'Measures stock volatility relative to the overall market.',
    calculation: 'Covariance(Stock, Market) ÷ Variance(Market)',
    interpretation: {
      good: 'Beta below 1.0 indicates lower volatility than market',
      bad: 'Beta above 1.5 suggests high volatility and risk',
      neutral: 'Beta of 1.0 moves with the market'
    },
    ranges: {
      excellent: '0.5-0.8 (stable, less volatile)',
      good: '0.8-1.2 (market-like volatility)',
      poor: 'Above 1.5 (very volatile)'
    },
    category: 'efficiency'
  },

  dividendYield: {
    name: 'Dividend Yield',
    definition: 'Annual dividend payments as a percentage of stock price.',
    calculation: 'Annual Dividends Per Share ÷ Stock Price × 100',
    interpretation: {
      good: 'Higher yields provide more income, but check sustainability',
      bad: 'Very high yields might indicate dividend at risk',
      neutral: 'Compare with treasury bonds and peer companies'
    },
    ranges: {
      excellent: '3-6% (good income with growth)',
      good: '1-3% (modest income)',
      poor: 'Above 8% (potentially unsustainable)'
    },
    category: 'profitability'
  }
};

interface FinancialMetricTooltipProps {
  metric: keyof typeof FINANCIAL_METRICS;
  value?: number;
  children: React.ReactNode;
}

export const FinancialMetricTooltip: React.FC<FinancialMetricTooltipProps> = ({
  metric,
  value,
  children
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const metricInfo = FINANCIAL_METRICS[metric];
  const tooltipId = generateId('metric-tooltip');

  if (!metricInfo) return <>{children}</>;

  const getValueAssessment = (val: number) => {
    if (!metricInfo.ranges) return null;
    
    // Simple assessment logic - can be enhanced
    if (metric === 'peRatio') {
      if (val < 15) return { type: 'good', icon: CheckCircle, color: 'text-success-dark' };
      if (val > 30) return { type: 'poor', icon: AlertCircle, color: 'text-error-dark' };
      return { type: 'neutral', icon: TrendingUp, color: 'text-info-dark' };
    }
    
    // Add more assessment logic for other metrics
    return null;
  };

  const assessment = value !== undefined ? getValueAssessment(value) : null;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="cursor-help"
        tabIndex={0}
        {...ARIA.button(`Learn about ${metricInfo.name}`)}
        aria-describedby={showTooltip ? tooltipId : undefined}
      >
        {children}
      </div>

      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 w-80 p-4 bg-white border border-neutral-200 rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2"
          style={{ maxWidth: '90vw' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 text-sm">
                {metricInfo.name}
              </h3>
              {value !== undefined && assessment && (
                <div className="flex items-center mt-1">
                  <assessment.icon className={`w-4 h-4 mr-1 ${assessment.color}`} />
                  <span className={`text-xs font-medium ${assessment.color}`}>
                    Current: {typeof value === 'number' ? value.toFixed(2) : value}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Definition */}
          <p className="text-xs text-neutral-700 mb-3">
            {metricInfo.definition}
          </p>

          {/* Calculation */}
          {metricInfo.calculation && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-neutral-800 mb-1">Calculation:</h4>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-700">
                {metricInfo.calculation}
              </code>
            </div>
          )}

          {/* Interpretation */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-neutral-800 mb-2">Interpretation:</h4>
            <div className="space-y-1">
              <div className="flex items-start">
                <CheckCircle className="w-3 h-3 text-success-dark mt-0.5 mr-1 flex-shrink-0" />
                <span className="text-xs text-neutral-700">{metricInfo.interpretation.good}</span>
              </div>
              <div className="flex items-start">
                <AlertCircle className="w-3 h-3 text-error-dark mt-0.5 mr-1 flex-shrink-0" />
                <span className="text-xs text-neutral-700">{metricInfo.interpretation.bad}</span>
              </div>
            </div>
          </div>

          {/* Ranges */}
          {metricInfo.ranges && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-neutral-800 mb-1">Typical Ranges:</h4>
              <div className="text-xs text-neutral-700 space-y-0.5">
                <div className="text-success-dark">• {metricInfo.ranges.excellent}</div>
                <div className="text-info-dark">• {metricInfo.ranges.good}</div>
                <div className="text-error-dark">• {metricInfo.ranges.poor}</div>
              </div>
            </div>
          )}

          {/* Examples */}
          {metricInfo.examples && (
            <div>
              <h4 className="text-xs font-medium text-neutral-800 mb-1">Examples:</h4>
              <ul className="text-xs text-neutral-700 space-y-0.5">
                {metricInfo.examples.map((example, index) => (
                  <li key={index}>• {example}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neutral-200 mt-px"></div>
        </div>
      )}
    </div>
  );
};

// Comprehensive help modal for all metrics
interface FinancialMetricsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialMetricsHelpModal: React.FC<FinancialMetricsHelpModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const modalId = generateId('metrics-help-modal');

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      const cleanup = FocusManager.trapFocus(document.getElementById(modalId)!);
      return cleanup;
    }
  }, [isOpen, modalId]);

  const categories = [
    { key: 'all', label: 'All Metrics', icon: '📊' },
    { key: 'valuation', label: 'Valuation', icon: '💰' },
    { key: 'profitability', label: 'Profitability', icon: '📈' },
    { key: 'liquidity', label: 'Liquidity', icon: '💧' },
    { key: 'leverage', label: 'Leverage', icon: '⚖️' },
    { key: 'efficiency', label: 'Efficiency', icon: '⚡' },
  ];

  const filteredMetrics = Object.entries(FINANCIAL_METRICS).filter(([_, metric]) =>
    selectedCategory === 'all' || metric.category === selectedCategory
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        id={modalId}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        {...ARIA.modal('Financial Metrics Guide')}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              📊 Financial Metrics Guide
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg touch-target"
              {...ARIA.button('Close metrics guide')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Category filter */}
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedCategory === category.key
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }
                `}
                {...ARIA.button(`Filter by ${category.label}`)}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {filteredMetrics.map(([key, metric]) => (
              <div key={key} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900">{metric.name}</h3>
                  <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full capitalize">
                    {metric.category}
                  </span>
                </div>
                
                <p className="text-sm text-neutral-700 mb-3">{metric.definition}</p>
                
                {metric.calculation && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-neutral-800 mb-1">Calculation:</h4>
                    <code className="text-sm bg-neutral-100 px-3 py-2 rounded block">
                      {metric.calculation}
                    </code>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-800 mb-2">What to Look For:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-success-dark mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{metric.interpretation.good}</span>
                      </div>
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-error-dark mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{metric.interpretation.bad}</span>
                      </div>
                    </div>
                  </div>

                  {metric.ranges && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-800 mb-2">Typical Ranges:</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-success-light rounded-full mr-2"></div>
                          <span className="text-sm text-neutral-700">{metric.ranges.excellent}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-info-light rounded-full mr-2"></div>
                          <span className="text-sm text-neutral-700">{metric.ranges.good}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-error-light rounded-full mr-2"></div>
                          <span className="text-sm text-neutral-700">{metric.ranges.poor}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};