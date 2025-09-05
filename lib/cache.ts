// Simple in-memory cache implementation
type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  // Set a value in the cache with an expiration time in seconds
  set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }
  
  // Get a value from the cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // If entry doesn't exist or has expired, return null
    if (!entry || entry.expiry < Date.now()) {
      if (entry) this.cache.delete(key); // Clean up expired entry
      return null;
    }
    
    return entry.data as T;
  }
  
  // Check if a key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry || entry.expiry < Date.now()) {
      if (entry) this.cache.delete(key); // Clean up expired entry
      return false;
    }
    return true;
  }
  
  // Delete a key from the cache
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  // Clear all entries from the cache
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const cache = new Cache();
