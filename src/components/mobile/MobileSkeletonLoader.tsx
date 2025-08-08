import React from 'react';

export const MobilePortfolioSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        <div className="flex justify-end mt-3 space-x-2">
          <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

export const MobileSummarySkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse mb-6">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

export const MobileFilterSkeleton: React.FC = () => (
  <div className="mb-6">
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-9 bg-gray-200 rounded-full w-24 animate-pulse flex-shrink-0"></div>
      ))}
    </div>
  </div>
);