import React, { useState, useRef, useEffect } from 'react';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  children: React.ReactNode;
  threshold?: number;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  onRefresh,
  isRefreshing,
  children,
  threshold = 80
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      const adjustedDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(adjustedDistance);
      setCanRefresh(adjustedDistance >= threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (canRefresh && !isRefreshing) {
      await onRefresh();
    }
    
    setPullDistance(0);
    setCanRefresh(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, canRefresh, isRefreshing]);

  const getRefreshIndicatorStyle = () => {
    const opacity = Math.min(pullDistance / threshold, 1);
    const scale = Math.min(pullDistance / threshold, 1);
    // Reduce rotation to prevent sideways appearance - only rotate when fully pulled
    const rotation = canRefresh ? 360 : (pullDistance / threshold) * 90;
    
    return {
      opacity,
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transition: isPulling ? 'none' : 'all 0.3s ease'
    };
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 transition-transform duration-300"
        style={{ 
          transform: `translateY(${pullDistance - 60}px)`,
          height: '60px'
        }}
      >
        <div 
          className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            canRefresh ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          } shadow-lg`}
          style={getRefreshIndicatorStyle()}
        >
          <RefreshCw 
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};