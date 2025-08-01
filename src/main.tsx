import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Dynamic import for the main App component to enable code splitting
const App = lazy(() => import('./App'));

// Register service worker for PWA (non-blocking)
if ('serviceWorker' in navigator && 'requestIdleCallback' in window) {
  // Use requestIdleCallback to register SW when browser is idle
  requestIdleCallback(() => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }, 1000);
}

// Optimized loading spinner component
const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1f2937 0%, #1e3a8a 50%, #1f2937 100%)'
  }}>
    <div className="loading-spinner"></div>
  </div>
);

const rootElement = document.getElementById('root')!;

// Clear the initial loading state
rootElement.innerHTML = '';

createRoot(rootElement).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);
