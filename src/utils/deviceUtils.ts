// Device detection utilities
export const isMobile = (): boolean => {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Haptic feedback for mobile devices
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
  // Try modern Vibration API first
  if ('vibrate' in navigator && navigator.vibrate) {
    const patterns = {
      light: [5],
      medium: [10],
      heavy: [15]
    };
    navigator.vibrate(patterns[type]);
    return;
  }
  
  // Fallback for iOS devices with Capacitor
  if ((window as any).Capacitor && (window as any).Capacitor.Plugins?.Haptics) {
    const { Haptics } = (window as any).Capacitor.Plugins;
    const impactStyle = {
      light: 'LIGHT',
      medium: 'MEDIUM', 
      heavy: 'HEAVY'
    };
    
    Haptics.impact({ style: impactStyle[type] }).catch(() => {
      // Silently fail if haptics not available
    });
  }
};

// Safe area utilities
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};