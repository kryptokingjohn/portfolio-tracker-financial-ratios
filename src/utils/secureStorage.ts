/**
 * Secure storage utility for sensitive data
 * Provides encryption and data integrity checks for localStorage
 */

// Simple XOR encryption for basic obfuscation
// Note: This is not cryptographically secure, just basic protection against casual inspection
const ENCRYPTION_KEY = 'portfolio_tracker_2024';

/**
 * Simple XOR encryption/decryption
 * Not cryptographically secure, but provides basic obfuscation
 */
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result); // Base64 encode
};

const xorDecrypt = (encryptedText: string, key: string): string => {
  try {
    const decodedText = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decodedText.length; i++) {
      result += String.fromCharCode(
        decodedText.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch (error) {
    console.warn('🚨 Failed to decrypt storage data - may be corrupted');
    return '';
  }
};

/**
 * Generate a simple checksum for data integrity
 */
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Secure storage wrapper for localStorage
 */
export class SecureStorage {
  private static readonly PREFIX = 'sec_';
  private static readonly CHECKSUM_SUFFIX = '_chk';
  
  /**
   * Store data securely with encryption and integrity check
   */
  static setItem(key: string, value: any, encrypt: boolean = false): boolean {
    try {
      const serialized = JSON.stringify(value);
      
      // Generate checksum for integrity
      const checksum = generateChecksum(serialized);
      
      // Encrypt if requested
      const finalData = encrypt ? xorEncrypt(serialized, ENCRYPTION_KEY) : serialized;
      
      // Store data and checksum
      localStorage.setItem(this.PREFIX + key, finalData);
      localStorage.setItem(this.PREFIX + key + this.CHECKSUM_SUFFIX, checksum);
      
      return true;
    } catch (error) {
      console.warn(`🚨 Failed to store data securely for key: ${key}`, error);
      return false;
    }
  }
  
  /**
   * Retrieve data securely with decryption and integrity check
   */
  static getItem<T>(key: string, defaultValue: T | null = null, encrypted: boolean = false): T | null {
    try {
      const storedData = localStorage.getItem(this.PREFIX + key);
      const storedChecksum = localStorage.getItem(this.PREFIX + key + this.CHECKSUM_SUFFIX);
      
      if (!storedData) {
        return defaultValue;
      }
      
      // Decrypt if needed
      const decryptedData = encrypted ? xorDecrypt(storedData, ENCRYPTION_KEY) : storedData;
      
      if (!decryptedData) {
        console.warn(`🚨 Failed to decrypt data for key: ${key}`);
        return defaultValue;
      }
      
      // Verify integrity if checksum exists
      if (storedChecksum) {
        const calculatedChecksum = generateChecksum(decryptedData);
        if (calculatedChecksum !== storedChecksum) {
          console.warn(`🚨 Data integrity check failed for key: ${key} - data may be corrupted`);
          this.removeItem(key); // Remove corrupted data
          return defaultValue;
        }
      }
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.warn(`🚨 Failed to retrieve secure data for key: ${key}`, error);
      this.removeItem(key); // Clean up corrupted data
      return defaultValue;
    }
  }
  
  /**
   * Remove stored data and its checksum
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this.PREFIX + key);
      localStorage.removeItem(this.PREFIX + key + this.CHECKSUM_SUFFIX);
      return true;
    } catch (error) {
      console.warn(`🚨 Failed to remove secure data for key: ${key}`, error);
      return false;
    }
  }
  
  /**
   * Check if a key exists
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(this.PREFIX + key) !== null;
  }
  
  /**
   * Clear all secure storage items
   */
  static clear(): boolean {
    try {
      const keysToRemove: string[] = [];
      
      // Find all secure storage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all secure storage keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`🔒 Cleared ${keysToRemove.length} secure storage items`);
      return true;
    } catch (error) {
      console.warn('🚨 Failed to clear secure storage', error);
      return false;
    }
  }
  
  /**
   * Get storage size for all secure items
   */
  static getStorageSize(): { count: number; size: number } {
    let count = 0;
    let size = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            count++;
            size += key.length + value.length;
          }
        }
      }
    } catch (error) {
      console.warn('🚨 Failed to calculate storage size', error);
    }
    
    return { count, size };
  }
  
  /**
   * Clean up expired or invalid entries
   */
  static cleanup(): number {
    let cleaned = 0;
    
    try {
      const keysToCheck: string[] = [];
      
      // Find all data keys (not checksums)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX) && !key.endsWith(this.CHECKSUM_SUFFIX)) {
          keysToCheck.push(key.substring(this.PREFIX.length));
        }
      }
      
      // Validate each key and remove corrupted ones
      keysToCheck.forEach(key => {
        const data = this.getItem(key, null, false);
        if (data === null) {
          // Data was corrupted and removed by getItem
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} corrupted storage entries`);
      }
    } catch (error) {
      console.warn('🚨 Failed to cleanup storage', error);
    }
    
    return cleaned;
  }
}

/**
 * Specialized storage for portfolio cache with TTL
 */
export class PortfolioCache {
  private static readonly CACHE_KEY = 'portfolio_cache';
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Store portfolio data with timestamp
   */
  static store(data: {
    holdings: any[];
    transactions: any[];
    dividendAnalysis: any;
    timestamp?: number;
  }): boolean {
    const cacheData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0' // For future compatibility
    };
    
    return SecureStorage.setItem(this.CACHE_KEY, cacheData, false); // Not encrypted for performance
  }
  
  /**
   * Retrieve cached portfolio data if not expired
   */
  static retrieve(): {
    holdings: any[];
    transactions: any[];
    dividendAnalysis: any;
    timestamp: number;
    age: number;
  } | null {
    const cached = SecureStorage.getItem<{
      holdings: any[];
      transactions: any[];
      dividendAnalysis: any;
      timestamp: number;
      version: string;
    }>(this.CACHE_KEY, null);
    
    if (!cached || !cached.timestamp) {
      return null;
    }
    
    const age = Date.now() - cached.timestamp;
    
    return {
      holdings: cached.holdings || [],
      transactions: cached.transactions || [],
      dividendAnalysis: cached.dividendAnalysis || null,
      timestamp: cached.timestamp,
      age
    };
  }
  
  /**
   * Check if cache is valid (not expired)
   */
  static isValid(): boolean {
    const cached = this.retrieve();
    if (!cached) return false;
    
    return cached.age < this.CACHE_TTL;
  }
  
  /**
   * Clear portfolio cache
   */
  static clear(): boolean {
    return SecureStorage.removeItem(this.CACHE_KEY);
  }
  
  /**
   * Get cache age in minutes
   */
  static getAge(): number {
    const cached = this.retrieve();
    return cached ? Math.floor(cached.age / 60000) : -1;
  }
}

/**
 * User preferences storage
 */
export class UserPreferences {
  private static readonly PREFS_KEY = 'user_preferences';
  
  /**
   * Store user preferences securely
   */
  static store(preferences: Record<string, any>): boolean {
    // Sanitize preferences to prevent XSS
    const sanitized = this.sanitizePreferences(preferences);
    return SecureStorage.setItem(this.PREFS_KEY, sanitized, true); // Encrypt preferences
  }
  
  /**
   * Retrieve user preferences
   */
  static retrieve(): Record<string, any> {
    return SecureStorage.getItem(this.PREFS_KEY, {}, true) || {};
  }
  
  /**
   * Update specific preference
   */
  static set(key: string, value: any): boolean {
    const prefs = this.retrieve();
    prefs[key] = value;
    return this.store(prefs);
  }
  
  /**
   * Get specific preference
   */
  static get(key: string, defaultValue: any = null): any {
    const prefs = this.retrieve();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  }
  
  /**
   * Sanitize preferences to prevent malicious data
   */
  private static sanitizePreferences(prefs: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.keys(prefs).forEach(key => {
      const value = prefs[key];
      
      // Only allow safe data types
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        // Only allow arrays of primitives
        const isValidArray = value.every(item => 
          typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
        );
        if (isValidArray) {
          sanitized[key] = value;
        }
      }
    });
    
    return sanitized;
  }
  
  /**
   * Clear all preferences
   */
  static clear(): boolean {
    return SecureStorage.removeItem(this.PREFS_KEY);
  }
}

// Initialize cleanup on load
if (typeof window !== 'undefined') {
  // Run cleanup periodically
  const cleanupInterval = setInterval(() => {
    SecureStorage.cleanup();
  }, 60 * 60 * 1000); // Every hour
  
  // Clear interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
  });
}