/**
 * Enhanced Cache utility functions for ViralPeek
 * Supports both memory cache (for immediate access) and localStorage (for persistence)
 */

// Cache keys and durations
export const CACHE_KEYS = {
  SITE_SETTINGS: 'viralpeek_site_settings',
  SITE_SETTINGS_EXPIRY: 'viralpeek_site_settings_expiry',
  PUBLIC_SETTINGS: 'viralpeek_public_settings',
  PUBLIC_SETTINGS_EXPIRY: 'viralpeek_public_settings_expiry',
} as const;

export const CACHE_DURATIONS = {
  SETTINGS: 5 * 60 * 1000, // 5 minutes
  PUBLIC_SETTINGS: 5 * 60 * 1000, // 5 minutes
  MEMORY_CACHE: 2 * 60 * 1000, // 2 minutes for memory cache
} as const;

// In-memory cache for immediate access
const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Check if cached data is still valid
 */
export function isCacheValid(expiryKey: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const expiry = localStorage.getItem(expiryKey);
  return expiry ? Date.now() < parseInt(expiry) : false;
}

/**
 * Check if memory cache is valid
 */
export function isMemoryCacheValid(cacheKey: string): boolean {
  const cached = memoryCache.get(cacheKey);
  return cached ? Date.now() < cached.expiry : false;
}

/**
 * Get data from memory cache
 */
export function getMemoryCachedData<T>(cacheKey: string): T | null {
  if (!isMemoryCacheValid(cacheKey)) {
    memoryCache.delete(cacheKey);
    return null;
  }
  
  const cached = memoryCache.get(cacheKey);
  return cached ? cached.data : null;
}

/**
 * Set data in memory cache
 */
export function setMemoryCachedData(cacheKey: string, data: any, duration: number = CACHE_DURATIONS.MEMORY_CACHE): void {
  memoryCache.set(cacheKey, {
    data,
    expiry: Date.now() + duration
  });
}

/**
 * Get cached data if valid (checks memory first, then localStorage)
 */
export function getCachedData<T>(cacheKey: string, expiryKey: string): T | null {
  // First check memory cache for immediate access
  const memoryData = getMemoryCachedData<T>(cacheKey);
  if (memoryData) {
    return memoryData;
  }
  
  // Then check localStorage
  if (typeof window === 'undefined') return null;
  
  if (!isCacheValid(expiryKey)) {
    return null;
  }
  
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return null;
  
  try {
    const data = JSON.parse(cached);
    // Store in memory cache for next access
    setMemoryCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Failed to parse cached data for ${cacheKey}:`, error);
    // Clear invalid cache
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(expiryKey);
    return null;
  }
}

/**
 * Set cache data with expiry (stores in both memory and localStorage)
 */
export function setCacheData(
  cacheKey: string, 
  expiryKey: string, 
  data: any, 
  duration: number
): void {
  // Store in memory cache immediately
  setMemoryCachedData(cacheKey, data, duration);
  
  // Store in localStorage for persistence
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(expiryKey, (Date.now() + duration).toString());
  } catch (error) {
    console.warn(`Failed to cache data for ${cacheKey}:`, error);
  }
}

/**
 * Clear specific cache (both memory and localStorage)
 */
export function clearCache(cacheKey: string, expiryKey: string): void {
  // Clear memory cache
  memoryCache.delete(cacheKey);
  
  // Clear localStorage
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(cacheKey);
  localStorage.removeItem(expiryKey);
}

/**
 * Clear all ViralPeek caches (both memory and localStorage)
 */
export function clearAllCaches(): void {
  // Clear memory cache
  memoryCache.clear();
  
  // Clear localStorage
  if (typeof window === 'undefined') return;
  
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Get cache size in bytes (approximate)
 */
export function getCacheSize(): number {
  if (typeof window === 'undefined') return 0;
  
  let size = 0;
  Object.values(CACHE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      size += new Blob([item]).size;
    }
  });
  
  return size;
}