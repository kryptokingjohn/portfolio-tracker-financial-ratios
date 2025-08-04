import React from 'react';

interface PortfolioTableSkeletonProps {
  rows?: number;
  showETFColumns?: boolean;
  showBondColumns?: boolean;
}

export const PortfolioTableSkeleton: React.FC<PortfolioTableSkeletonProps> = ({
  rows = 8,
  showETFColumns = false,
  showBondColumns = false
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800/50 backdrop-blur-sm rounded-lg">
        <thead>
          <tr className="bg-gray-900/50">
            {/* Base columns */}
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-24"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
            </th>
            
            {/* ETF-specific columns */}
            {showETFColumns && (
              <>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 bg-green-600/30 rounded animate-pulse w-20"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 bg-green-600/30 rounded animate-pulse w-16"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 bg-green-600/30 rounded animate-pulse w-18"></div>
                </th>
              </>
            )}
            
            {/* Bond-specific columns */}
            {showBondColumns && (
              <>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 bg-orange-600/30 rounded animate-pulse w-16"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 bg-orange-600/30 rounded animate-pulse w-14"></div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="h-4 bg-orange-600/30 rounded animate-pulse w-20"></div>
                </th>
              </>
            )}
            
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-b border-gray-700/30">
              {/* Base columns */}
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-700/60 rounded animate-pulse w-20"></div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-16"></div>
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-18"></div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center space-x-1">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                  <div className="h-3 bg-gray-700/60 rounded animate-pulse w-8"></div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
              </td>
              
              {/* ETF-specific columns */}
              {showETFColumns && (
                <>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-green-700/30 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-green-700/30 rounded animate-pulse w-14"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-green-700/30 rounded animate-pulse w-12"></div>
                  </td>
                </>
              )}
              
              {/* Bond-specific columns */}
              {showBondColumns && (
                <>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-orange-700/30 rounded animate-pulse w-14"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-orange-700/30 rounded animate-pulse w-12"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-orange-700/30 rounded animate-pulse w-16"></div>
                  </td>
                </>
              )}
              
              <td className="px-4 py-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 bg-gray-700 rounded animate-pulse w-8"></div>
                  <div className="h-8 bg-gray-700 rounded animate-pulse w-8"></div>
                  {/* Skeleton for Advanced button */}
                  <div className="h-8 bg-purple-700/30 rounded animate-pulse w-20"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};