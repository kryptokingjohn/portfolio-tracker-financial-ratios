import React from 'react';
import Download from 'lucide-react/dist/esm/icons/download';
import X from 'lucide-react/dist/esm/icons/x';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp, updateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const [updateDismissed, setUpdateDismissed] = React.useState(false);

  // Show update prompt if available
  if (updateAvailable && !updateDismissed) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5" />
            <div>
              <p className="font-medium">Update Available</p>
              <p className="text-sm text-green-100">New features and improvements</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={updateApp}
              className="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium"
            >
              Update
            </button>
            <button
              onClick={() => setUpdateDismissed(true)}
              className="text-green-100 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show install prompt if installable
  if (!isInstallable || dismissed) return null;
  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Download className="h-5 w-5" />
          <div>
            <p className="font-medium">Install Portfolio Pro</p>
            <p className="text-sm text-blue-100">Get the full app experience</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-blue-100 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};