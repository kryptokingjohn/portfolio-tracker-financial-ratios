import React, { useState, useEffect } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { Holding } from '../types/portfolio';
import { AdvancedRatiosPanel } from './AdvancedRatiosPanel';
import { MarketDataService } from '../services/marketDataService';

interface AdvancedModalProps {
  holding: Holding;
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedModal: React.FC<AdvancedModalProps> = ({ holding, isOpen, onClose }) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !marketData) {
      setLoading(true);
      MarketDataService.getQuote(holding.ticker)
        .then(data => setMarketData(data))
        .catch(err => console.warn('Market data failed:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, holding.ticker, marketData]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-[9999] backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] my-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-600/30 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 mr-3">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            Advanced Analysis - {holding.ticker}
          </h3>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl border border-red-500/30 text-sm font-medium backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-300">Loading market data...</span>
            </div>
          ) : (
            <AdvancedRatiosPanel holding={holding} marketData={marketData} />
          )}
        </div>
      </div>
    </div>
  );
};