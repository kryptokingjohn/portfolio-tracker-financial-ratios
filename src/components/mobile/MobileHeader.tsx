import React, { useState } from 'react';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Menu from 'lucide-react/dist/esm/icons/menu';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import User from 'lucide-react/dist/esm/icons/user';
import { useAuth } from '../../hooks/useAuthSimple';

interface MobileHeaderProps {
  title: string;
  onAddTransaction?: () => void;
  showAddButton?: boolean;
  loading?: boolean;
  isRefreshing?: boolean;
  onMenuClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  onAddTransaction, 
  showAddButton = false,
  loading = false,
  isRefreshing = false,
  onMenuClick
}) => {
  const { signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 safe-area-top relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-600 hover:text-gray-800 -ml-2"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      onMenuClick();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100"
                  >
                    <User className="h-4 w-4" />
                    <span>My Account</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-3 rounded-b-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
              
              {/* Backdrop to close dropdown */}
              {showDropdown && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)}
                ></div>
              )}
            </div>
          )}
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
          
          {(loading || isRefreshing) && (
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