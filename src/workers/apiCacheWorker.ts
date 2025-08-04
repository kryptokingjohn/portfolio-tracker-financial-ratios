/**
 * API Response Caching Service Worker
 * 
 * Intelligent caching for FMP API responses to reduce load times and API costs
 * - Caches stock/ETF data for 15-30 minutes
 * - Implements stale-while-revalidate strategy
 * - Handles cache invalidation intelligently
 * - Works without localStorage (uses Cache API)
 */

const CACHE_NAME = 'api-cache-v1';
const API_CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds
const STALE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for stale-while-revalidate

// API endpoints to cache
const CACHEABLE_APIS = [
  'financialmodelingprep.com',
  'api.fmp.com',
  'fmpcloud.io'
];

// Cache strategies for different endpoints
const CACHE_STRATEGIES = {
  quote: { ttl: API_CACHE_DURATION, staleTime: STALE_CACHE_DURATION },
  profile: { ttl: API_CACHE_DURATION * 2, staleTime: STALE_CACHE_DURATION * 2 }, // Company profiles change less
  ratios: { ttl: API_CACHE_DURATION * 3, staleTime: STALE_CACHE_DURATION * 3 }, // Financial ratios change less
  batch: { ttl: API_CACHE_DURATION, staleTime: STALE_CACHE_DURATION }
};

interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
  staleTime: number;
  url: string;
}

class APICache {
  private static instance: APICache;
  private cache: Cache | null = null;

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  async init(): Promise<void> {
    try {
      this.cache = await caches.open(CACHE_NAME);
      console.log('📦 API Cache initialized');
    } catch (error) {
      console.error('❌ Failed to initialize API cache:', error);
    }
  }

  /**
   * Determine cache strategy based on URL
   */
  private getCacheStrategy(url: string): { ttl: number; staleTime: number } {
    if (url.includes('/quote/')) return CACHE_STRATEGIES.quote;
    if (url.includes('/profile/')) return CACHE_STRATEGIES.profile;
    if (url.includes('/ratios/')) return CACHE_STRATEGIES.ratios;
    if (url.includes('/batch/')) return CACHE_STRATEGIES.batch;
    
    return CACHE_STRATEGIES.quote; // Default strategy
  }

  /**
   * Check if API should be cached
   */
  private shouldCache(url: string): boolean {
    return CACHEABLE_APIS.some(api => url.includes(api));
  }

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    // Remove API key and other sensitive parameters
    const urlObj = new URL(url);
    urlObj.searchParams.delete('apikey');
    urlObj.searchParams.delete('token');
    return urlObj.toString();
  }

  /**
   * Get cached response if valid
   */
  async getCachedResponse(url: string): Promise<Response | null> {
    if (!this.cache || !this.shouldCache(url)) return null;

    try {
      const cacheKey = this.getCacheKey(url);
      const cachedResponse = await this.cache.match(cacheKey);
      
      if (!cachedResponse) return null;

      // Parse cached data
      const cachedText = await cachedResponse.text();
      const cached: CachedResponse = JSON.parse(cachedText);
      const now = Date.now();
      const age = now - cached.timestamp;

      // Check if cache is still fresh
      if (age < cached.ttl) {
        console.log(`📦 Cache HIT (fresh): ${this.extractTicker(url)} - ${Math.round(age / 1000)}s old`);
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT-FRESH',
            'X-Cache-Age': age.toString()
          }
        });
      }

      // Check if we can serve stale while revalidating
      if (age < cached.staleTime) {
        console.log(`📦 Cache HIT (stale): ${this.extractTicker(url)} - serving stale, will revalidate`);
        
        // Serve stale response immediately
        const staleResponse = new Response(JSON.stringify(cached.data), {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT-STALE',
            'X-Cache-Age': age.toString()
          }
        });

        // Trigger background revalidation (don't await)
        this.revalidateInBackground(url).catch(console.error);

        return staleResponse;
      }

      // Cache is too old, delete it
      await this.cache.delete(cacheKey);
      console.log(`📦 Cache EXPIRED: ${this.extractTicker(url)} - ${Math.round(age / 1000)}s old`);
      return null;

    } catch (error) {
      console.error('❌ Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Cache API response
   */
  async cacheResponse(url: string, response: Response): Promise<void> {
    if (!this.cache || !this.shouldCache(url) || !response.ok) return;

    try {
      const strategy = this.getCacheStrategy(url);
      const data = await response.clone().json();
      
      const cachedData: CachedResponse = {
        data,
        timestamp: Date.now(),
        ttl: strategy.ttl,
        staleTime: strategy.staleTime,
        url
      };

      const cacheKey = this.getCacheKey(url);
      const cacheResponse = new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      await this.cache.put(cacheKey, cacheResponse);
      console.log(`📦 Cache STORED: ${this.extractTicker(url)} - TTL: ${Math.round(strategy.ttl / 1000)}s`);

    } catch (error) {
      console.error('❌ Error caching response:', error);
    }
  }

  /**
   * Background revalidation for stale cache entries
   */
  private async revalidateInBackground(url: string): Promise<void> {
    try {
      console.log(`🔄 Revalidating in background: ${this.extractTicker(url)}`);
      const response = await fetch(url);
      
      if (response.ok) {
        await this.cacheResponse(url, response);
        console.log(`✅ Background revalidation complete: ${this.extractTicker(url)}`);
      }
    } catch (error) {
      console.error('❌ Background revalidation failed:', error);
    }
  }

  /**
   * Extract ticker from URL for logging
   */
  private extractTicker(url: string): string {
    const match = url.match(/\/([A-Z]{1,5})(?:\?|$|\/)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredEntries(): Promise<void> {
    if (!this.cache) return;

    try {
      const keys = await this.cache.keys();
      const now = Date.now();
      let cleared = 0;

      await Promise.all(
        keys.map(async (request) => {
          try {
            const response = await this.cache!.match(request);
            if (response) {
              const cachedText = await response.text();
              const cached: CachedResponse = JSON.parse(cachedText);
              
              // Delete if expired beyond stale time
              if (now - cached.timestamp > cached.staleTime) {
                await this.cache!.delete(request);
                cleared++;
              }
            }
          } catch (error) {
            // If we can't parse it, delete it
            await this.cache!.delete(request);
            cleared++;
          }
        })
      );

      if (cleared > 0) {
        console.log(`🗑️ Cleared ${cleared} expired cache entries`);
      }
    } catch (error) {
      console.error('❌ Error clearing expired cache entries:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    freshEntries: number;
    staleEntries: number;
    expiredEntries: number;
  }> {
    if (!this.cache) {
      return { totalEntries: 0, freshEntries: 0, staleEntries: 0, expiredEntries: 0 };
    }

    try {
      const keys = await this.cache.keys();
      const now = Date.now();
      let fresh = 0, stale = 0, expired = 0;

      await Promise.all(
        keys.map(async (request) => {
          try {
            const response = await this.cache!.match(request);
            if (response) {
              const cachedText = await response.text();
              const cached: CachedResponse = JSON.parse(cachedText);
              const age = now - cached.timestamp;

              if (age < cached.ttl) fresh++;
              else if (age < cached.staleTime) stale++;
              else expired++;
            }
          } catch (error) {
            expired++; // Count parsing errors as expired
          }
        })
      );

      return {
        totalEntries: keys.length,
        freshEntries: fresh,
        staleEntries: stale,
        expiredEntries: expired
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return { totalEntries: 0, freshEntries: 0, staleEntries: 0, expiredEntries: 0 };
    }
  }
}

// Export for use in service worker and main thread
export { APICache, CACHE_NAME, API_CACHE_DURATION };

// Initialize cache when module loads
const apiCache = APICache.getInstance();
apiCache.init();

// Clean up expired entries periodically
setInterval(() => {
  apiCache.clearExpiredEntries();
}, 10 * 60 * 1000); // Every 10 minutes