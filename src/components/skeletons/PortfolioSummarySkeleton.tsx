import React from 'react';

export const PortfolioSummarySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Value Card */}
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-blue-400/30 rounded animate-pulse w-24"></div>
          <div className="h-8 w-8 bg-blue-400/30 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-blue-300/40 rounded animate-pulse w-32"></div>
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-green-400/30 rounded animate-pulse w-16"></div>
            <div className="h-4 bg-green-400/30 rounded animate-pulse w-12"></div>
          </div>
        </div>
      </div>

      {/* Today's Change Card */}
      <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-green-400/30 rounded animate-pulse w-28"></div>
          <div className="h-8 w-8 bg-green-400/30 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-green-300/40 rounded animate-pulse w-28"></div>
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-green-400/30 rounded animate-pulse w-14"></div>
            <div className="h-4 bg-green-400/30 rounded animate-pulse w-10"></div>
          </div>
        </div>
      </div>

      {/* Total Holdings Card */}
      <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-purple-400/30 rounded animate-pulse w-32"></div>
          <div className="h-8 w-8 bg-purple-400/30 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-purple-300/40 rounded animate-pulse w-16"></div>
          <div className="space-y-1">
            <div className="h-3 bg-purple-400/30 rounded animate-pulse w-20"></div>
            <div className="h-3 bg-purple-400/30 rounded animate-pulse w-16"></div>
          </div>
        </div>
      </div>

      {/* Best Performer Card */}
      <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-yellow-400/30 rounded animate-pulse w-32"></div>
          <div className="h-8 w-8 bg-yellow-400/30 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-yellow-300/40 rounded animate-pulse w-20"></div>
          <div className="h-4 bg-yellow-400/30 rounded animate-pulse w-24"></div>
          <div className="h-4 bg-green-400/30 rounded animate-pulse w-16"></div>
        </div>
      </div>
    </div>
  );
};