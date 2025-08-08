// Mobile-optimized caching utilities for better performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class MobileCache {
  private storage: Storage;
  private memoryCache: Map<string, CacheEntry<any>>;
  
  constructor() {
    // Use sessionStorage for mobile to avoid storage limitations
    this.storage = typeof window !== 'undefined' ? window.sessionStorage : null as any;
    this.memoryCache = new Map();
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + entry.expiry;
  }

  private getCacheKey(key: string, userId?: string): string {
    return userId ? `mobile_${userId}_${key}` : `mobile_${key}`;
  }

  // Set data with expiry (in milliseconds)
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000, userId?: string): void {
    const cacheKey = this.getCacheKey(key, userId);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: ttl
    };

    // Store in memory cache for faster access
    this.memoryCache.set(cacheKey, entry);

    // Store in session storage for persistence across tab switches
    if (this.storage) {
      try {
        // Only cache small data on mobile to avoid storage limits
        const serialized = JSON.stringify(entry);
        if (serialized.length < 50000) { // 50KB limit for mobile
          this.storage.setItem(cacheKey, serialized);
        }
      } catch (error) {
        console.warn('Failed to cache to session storage:', error);
        // Clean up old entries if storage is full
        this.cleanup();
      }
    }
  }

  // Get data from cache
  get<T>(key: string, userId?: string): T | null {
    const cacheKey = this.getCacheKey(key, userId);
    
    // Check memory cache first (fastest)
    let entry = this.memoryCache.get(cacheKey);
    
    // If not in memory, check session storage
    if (!entry && this.storage) {
      try {
        const stored = this.storage.getItem(cacheKey);
        if (stored) {
          entry = JSON.parse(stored);
          // Restore to memory cache
          if (entry && !this.isExpired(entry)) {
            this.memoryCache.set(cacheKey, entry);
          }
        }
      } catch (error) {
        console.warn('Failed to parse cache entry:', error);
        this.remove(key, userId);
      }
    }

    if (!entry || this.isExpired(entry)) {
      this.remove(key, userId);
      return null;
    }

    return entry.data;
  }

  // Remove specific cache entry
  remove(key: string, userId?: string): void {
    const cacheKey = this.getCacheKey(key, userId);
    this.memoryCache.delete(cacheKey);
    if (this.storage) {
      this.storage.removeItem(cacheKey);
    }
  }

  // Check if cache has unexpired entry
  has(key: string, userId?: string): boolean {
    return this.get(key, userId) !== null;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean session storage
    if (this.storage) {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith('mobile_')) {
          try {
            const entry = JSON.parse(this.storage.getItem(key) || '{}');
            if (this.isExpired(entry)) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => this.storage.removeItem(key));
    }
  }

  // Clear all mobile cache
  clear(userId?: string): void {
    if (userId) {
      const prefix = `mobile_${userId}_`;
      // Clear memory cache for user
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }
      
      // Clear session storage for user
      if (this.storage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key?.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => this.storage.removeItem(key));
      }
    } else {
      // Clear all mobile cache
      this.memoryCache.clear();
      if (this.storage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key?.startsWith('mobile_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => this.storage.removeItem(key));
      }
    }
  }

  // Get cache statistics
  getStats(): { memoryEntries: number; sessionEntries: number; totalSize: number } {
    let sessionEntries = 0;
    let totalSize = 0;

    if (this.storage) {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith('mobile_')) {
          sessionEntries++;
          const value = this.storage.getItem(key) || '';
          totalSize += key.length + value.length;
        }
      }
    }

    return {
      memoryEntries: this.memoryCache.size,
      sessionEntries,
      totalSize
    };
  }
}

// Export singleton instance
export const mobileCache = new MobileCache();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    mobileCache.cleanup();
  }, 5 * 60 * 1000);
}

// Cache key constants for portfolio data
export const CACHE_KEYS = {
  PORTFOLIO_DATA: 'portfolio_data',
  MARKET_DATA: 'market_data',
  SUMMARY_DATA: 'summary_data',
  TRANSACTIONS: 'transactions',
  USER_PREFERENCES: 'user_preferences'
};

// Default cache TTLs (in milliseconds)
export const CACHE_TTL = {
  PORTFOLIO: 2 * 60 * 1000, // 2 minutes
  MARKET_DATA: 1 * 60 * 1000, // 1 minute
  SUMMARY: 5 * 60 * 1000, // 5 minutes
  TRANSACTIONS: 10 * 60 * 1000, // 10 minutes
  PREFERENCES: 24 * 60 * 60 * 1000 // 24 hours
};