import React from 'react';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading your portfolio..." 
}) => {
  // Auto-reload after 5 seconds if still loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('Loading timeout after 5 seconds');
      if (message.includes('Authenticating')) {
        console.log('Authentication timeout - showing login screen');
        console.log('Check browser console for Supabase connection errors');
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center z-50">
      <div className="text-center px-4 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="bg-blue-600 p-4 rounded-full animate-pulse">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Portfolio Tracker with Financial Ratios</h2>
        <p className="text-blue-200 mb-8">{message}</p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
        
        <div className="mt-8 text-sm text-blue-300">
          <p>{message.includes('Authenticating') ? 'Connecting to Supabase database...' : 'Loading portfolio data...'}</p>
          <p className="mt-2 text-xs">Check browser console if this takes too long</p>
        </div>
      </div>
    </div>
  );
};