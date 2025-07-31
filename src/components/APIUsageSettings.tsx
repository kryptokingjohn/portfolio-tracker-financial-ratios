import React, { useState } from 'react';
import { API_CONFIG } from '../config/database';

interface APIUsageSettingsProps {
  onSettingsChange?: (settings: any) => void;
}

export const APIUsageSettings: React.FC<APIUsageSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    manualRefreshOnly: API_CONFIG.MANUAL_REFRESH_ONLY,
    disableAutoRefresh: API_CONFIG.DISABLE_AUTO_REFRESH,
    extendedCaching: true
  });

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Update the actual API config (for current session)
    if (key === 'manualRefreshOnly') {
      (API_CONFIG as any).MANUAL_REFRESH_ONLY = value;
    } else if (key === 'disableAutoRefresh') {
      (API_CONFIG as any).DISABLE_AUTO_REFRESH = value;
    }
    
    onSettingsChange?.(newSettings);
  };

  const estimateAPICalls = () => {
    const portfolioSize = 10; // Average portfolio size
    let callsPerDay = 0;
    
    if (!settings.manualRefreshOnly && !settings.disableAutoRefresh) {
      // Auto-refresh every 15 minutes = 96 calls per day per symbol
      callsPerDay = portfolioSize * 96;
    } else if (!settings.manualRefreshOnly) {
      // Manual refresh only, assume 4 times per day
      callsPerDay = portfolioSize * 4;
    } else {
      // Minimal usage - initial load + occasional refresh
      callsPerDay = portfolioSize * 2;
    }
    
    return callsPerDay;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage Settings</h3>
      <p className="text-sm text-gray-600 mb-4">
        Optimize API calls to stay within your plan limits and reduce costs.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Manual Refresh Only</label>
            <p className="text-xs text-gray-500">Disable all automatic updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.manualRefreshOnly}
              onChange={(e) => handleSettingChange('manualRefreshOnly', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Disable Auto-Refresh</label>
            <p className="text-xs text-gray-500">Stop background price updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.disableAutoRefresh}
              onChange={(e) => handleSettingChange('disableAutoRefresh', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Extended Caching</label>
            <p className="text-xs text-gray-500">Cache data for 30 minutes instead of 15</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.extendedCaching}
              onChange={(e) => handleSettingChange('extendedCaching', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Estimated Daily API Calls</h4>
        <div className="text-2xl font-bold text-blue-600">{estimateAPICalls()}</div>
        <p className="text-xs text-blue-700 mt-1">
          Based on a 10-stock portfolio with current settings
        </p>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Recommendations for minimal usage:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Enable "Manual Refresh Only" for maximum savings</li>
          <li>Use "Refresh Now" button only when needed</li>
          <li>Keep "Extended Caching" enabled</li>
          <li>Consider using demo mode for UI testing</li>
        </ul>
      </div>
    </div>
  );
};