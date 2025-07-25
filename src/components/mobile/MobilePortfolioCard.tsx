import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Holding } from '../../types/portfolio';
import { hapticFeedback } from '../../utils/deviceUtils';

interface MobilePortfolioCardProps {
  holding: Holding;
  onQuickView: (ticker: string, company: string, type: string) => void;
}

export const MobilePortfolioCard: React.FC<MobilePortfolioCardProps> = ({ holding, onQuickView }) => {
  const currentValue = holding.shares * holding.currentPrice;
  const totalCost = holding.shares * holding.costBasis;
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = (gainLoss / totalCost) * 100;
  const upsidePercent = ((holding.intrinsicValue - holding.currentPrice) / holding.currentPrice) * 100;

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const handleQuickView = () => {
    hapticFeedback('light');
    onQuickView(holding.ticker, holding.company, holding.type);
  };
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 mb-3 active:scale-98 transition-transform">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-blue-700">{holding.ticker}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              holding.type === 'stocks' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
              holding.type === 'etfs' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' :
              'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800'
            }`}>
              {holding.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{holding.company}</p>
          <p className="text-xs text-gray-500">{holding.sector}</p>
        </div>
        
        <button
          onClick={handleQuickView}
          className="p-2 text-gray-400 hover:text-blue-700 active:scale-90 transition-transform"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Current Value</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(currentValue)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Gain/Loss</p>
          <div className={`flex items-center ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {gainLoss >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span className="font-bold">{formatCurrency(gainLoss)}</span>
          </div>
          <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(gainLossPercent)}
          </p>
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Shares</p>
          <p className="font-medium">{holding.shares}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Avg Cost</p>
          <p className="font-medium">{formatCurrency(holding.costBasis)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Current Price</p>
          <p className="font-medium">{formatCurrency(holding.currentPrice)}</p>
        </div>
      </div>

      {/* Financial Ratios Preview (for stocks) */}
      {holding.type === 'stocks' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <p className="text-gray-500">P/E</p>
              <p className="font-medium">{holding.pe.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">ROE</p>
              <p className="font-medium">{holding.roe.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">D/E</p>
              <p className="font-medium">{holding.debtToEquity.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Upside</p>
              <p className={`font-medium ${upsidePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(upsidePercent)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};