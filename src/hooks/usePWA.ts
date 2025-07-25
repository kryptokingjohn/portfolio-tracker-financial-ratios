import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAUpdateEvent extends Event {
  waiting?: ServiceWorker;
}
export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for service worker updates
    const handleSWUpdate = (event: PWAUpdateEvent) => {
      if (event.waiting) {
        setUpdateAvailable(true);
        setWaitingWorker(event.waiting);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('swUpdate', handleSWUpdate as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('swUpdate', handleSWUpdate as EventListener);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    }
  };

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      setWaitingWorker(null);
      window.location.reload();
    }
  };
  return {
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp,
    updateApp
  };
};