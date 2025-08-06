import React from 'react';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Menu from 'lucide-react/dist/esm/icons/menu';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import { useAuth } from '../../hooks/useAuthSimple';

interface MobileHeaderProps {
  title: string;
  onAddTransaction?: () => void;
  showAddButton?: boolean;
  loading?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  onAddTransaction, 
  showAddButton = false,
  loading = false
}) => {
  const { signOut } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 safe-area-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showAddButton && onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-xl active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
          
          {loading && (
            <div className="p-2">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
          )}
          
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};