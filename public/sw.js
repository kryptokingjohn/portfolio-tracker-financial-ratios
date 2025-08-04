const CACHE_NAME = 'portfolio-tracker-v1';
const API_CACHE_NAME = 'api-cache-v1';
const API_CACHE_DURATION = 20 * 60 * 1000; // 20 minutes
const STALE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for stale-while-revalidate

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  'financialmodelingprep.com',
  'api.fmp.com',
  'fmpcloud.io'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      caches.open(API_CACHE_NAME) // Initialize API cache
    ])
  );
});

// Enhanced fetch event with API caching
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Check if this is an API request we should cache
  if (shouldCacheAPI(url)) {
    event.respondWith(handleAPIRequest(event.request));
  } else {
    // Regular caching for app resources
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Check if API should be cached
function shouldCacheAPI(url) {
  return CACHEABLE_APIS.some(api => url.includes(api));
}

// Handle API requests with intelligent caching
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cacheKey = getCacheKey(request.url);
  
  try {
    // Check for cached response
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      const now = Date.now();
      const age = now - cachedData.timestamp;
      
      // Return fresh cache
      if (age < API_CACHE_DURATION) {
        console.log(`📦 API Cache HIT (fresh): ${extractTicker(request.url)}`);
        return new Response(JSON.stringify(cachedData.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT-FRESH',
            'X-Cache-Age': age.toString()
          }
        });
      }
      
      // Serve stale while revalidating
      if (age < STALE_CACHE_DURATION) {
        console.log(`📦 API Cache HIT (stale): ${extractTicker(request.url)}`);
        
        // Revalidate in background
        revalidateInBackground(request, cache, cacheKey);
        
        return new Response(JSON.stringify(cachedData.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT-STALE',
            'X-Cache-Age': age.toString()
          }
        });
      }
      
      // Cache expired, delete it
      await cache.delete(cacheKey);
    }
    
    // Fetch from network and cache
    console.log(`🌐 API Cache MISS: ${extractTicker(request.url)}`);
    const response = await fetch(request);
    
    if (response.ok) {
      await cacheAPIResponse(cache, cacheKey, response.clone(), request.url);
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ API request failed:', error);
    
    // Try to serve stale cache as fallback
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      console.log(`📦 Serving stale cache as fallback: ${extractTicker(request.url)}`);
      return new Response(JSON.stringify(cachedData.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'STALE-FALLBACK'
        }
      });
    }
    
    throw error;
  }
}

// Cache API response
async function cacheAPIResponse(cache, cacheKey, response, url) {
  try {
    const data = await response.json();
    const cachedData = {
      data,
      timestamp: Date.now(),
      url
    };
    
    const cacheResponse = new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(cacheKey, cacheResponse);
    console.log(`📦 API Cached: ${extractTicker(url)}`);
  } catch (error) {
    console.error('❌ Failed to cache API response:', error);
  }
}

// Background revalidation
async function revalidateInBackground(request, cache, cacheKey) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheAPIResponse(cache, cacheKey, response.clone(), request.url);
      console.log(`✅ Background revalidation complete: ${extractTicker(request.url)}`);
    }
  } catch (error) {
    console.error('❌ Background revalidation failed:', error);
  }
}

// Generate cache key (remove sensitive parameters)
function getCacheKey(url) {
  const urlObj = new URL(url);
  urlObj.searchParams.delete('apikey');
  urlObj.searchParams.delete('token');
  return urlObj.toString();
}

// Extract ticker for logging
function extractTicker(url) {
  const match = url.match(/\/([A-Z]{1,5})(?:\?|$|\/)/);
  return match ? match[1] : 'unknown';
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Clean expired API cache entries
      return cleanExpiredAPICache();
    })
  );
});

// Clean expired API cache entries
async function cleanExpiredAPICache() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const keys = await cache.keys();
    const now = Date.now();
    let cleared = 0;

    await Promise.all(
      keys.map(async (request) => {
        try {
          const response = await cache.match(request);
          if (response) {
            const cachedData = await response.json();
            if (now - cachedData.timestamp > STALE_CACHE_DURATION) {
              await cache.delete(request);
              cleared++;
            }
          }
        } catch (error) {
          await cache.delete(request);
          cleared++;
        }
      })
    );

    if (cleared > 0) {
      console.log(`🗑️ Cleaned ${cleared} expired API cache entries`);
    }
  } catch (error) {
    console.error('❌ Error cleaning API cache:', error);
  }
}