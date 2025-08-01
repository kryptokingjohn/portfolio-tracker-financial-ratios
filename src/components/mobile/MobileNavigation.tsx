import React from 'react';
import PieChart from 'lucide-react/dist/esm/icons/pie-chart';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Building from 'lucide-react/dist/esm/icons/building';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import History from 'lucide-react/dist/esm/icons/history';
import Calculator from 'lucide-react/dist/esm/icons/calculator';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'accounts', label: 'Accounts', icon: Building },
    { id: 'dividends', label: 'Dividends', icon: DollarSign },
    { id: 'tax', label: 'Tax', icon: Calculator },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all active:scale-95 ${
                isActive 
                  ? 'text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};