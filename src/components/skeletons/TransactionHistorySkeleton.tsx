import React from 'react';

interface TransactionHistorySkeletonProps {
  rows?: number;
}

export const TransactionHistorySkeleton: React.FC<TransactionHistorySkeletonProps> = ({
  rows = 6
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Transaction type indicator */}
              <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
              
              <div className="space-y-2">
                {/* Transaction title */}
                <div className="h-5 bg-gray-700 rounded animate-pulse w-40"></div>
                {/* Date and details */}
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-700/60 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-700/60 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              {/* Transaction amount */}
              <div className="h-5 bg-gray-700 rounded animate-pulse w-20"></div>
              {/* Shares */}
              <div className="h-4 bg-gray-700/60 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};