
import { useState, useEffect } from 'react';
import { ErrorLogger } from '../utils/errorHandling';

const logger = ErrorLogger.getInstance();

// Encryption/obfuscation for sensitive data (basic implementation)
const obfuscate = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const deobfuscate = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
};

interface SecureStorageOptions {
  encrypt?: boolean;
  maxAge?: number; // in milliseconds
}

export function useSecureLocalStorage<T>(
  key: string, 
  initialValue: T, 
  options: SecureStorageOptions = {}
) {
  const { encrypt = false, maxAge } = options;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Validate key
      if (!key || typeof key !== 'string' || key.length > 100) {
        logger.logError(new Error('Invalid localStorage key'), { key });
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      let parsedData;
      if (encrypt) {
        const deobfuscated = deobfuscate(item);
        parsedData = JSON.parse(deobfuscated);
      } else {
        parsedData = JSON.parse(item);
      }
      
      // Check expiration if maxAge is set
      if (maxAge && parsedData.timestamp) {
        const isExpired = Date.now() - parsedData.timestamp > maxAge;
        if (isExpired) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        return parsedData.value;
      }
      
      return parsedData.timestamp ? parsedData.value : parsedData;
    } catch (error) {
      logger.logError(error as Error, { key: key.substring(0, 20) });
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key provided');
      }
      
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Prepare data with timestamp if maxAge is set
      const dataToStore = maxAge 
        ? { value: valueToStore, timestamp: Date.now() }
        : valueToStore;
      
      const serialized = JSON.stringify(dataToStore);
      
      // Check size limit (5MB typical localStorage limit)
      if (serialized.length > 5 * 1024 * 1024) {
        throw new Error('Data too large for localStorage');
      }
      
      const finalData = encrypt ? obfuscate(serialized) : serialized;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, finalData);
    } catch (error) {
      logger.logError(error as Error, { 
        key: key.substring(0, 20),
        function: 'setValue'
      });
    }
  };

  const removeValue = () => {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key provided');
      }
      
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      logger.logError(error as Error, { 
        key: key.substring(0, 20),
        function: 'removeValue'
      });
    }
  };

  const clearExpired = () => {
    try {
      if (!maxAge) return;
      
      const keys = Object.keys(window.localStorage);
      const now = Date.now();
      
      keys.forEach(storageKey => {
        try {
          const item = window.localStorage.getItem(storageKey);
          if (!item) return;
          
          let parsedData;
          if (encrypt && storageKey === key) {
            parsedData = JSON.parse(deobfuscate(item));
          } else {
            parsedData = JSON.parse(item);
          }
          
          if (parsedData.timestamp && now - parsedData.timestamp > maxAge) {
            window.localStorage.removeItem(storageKey);
          }
        } catch {
          // Ignore invalid items
        }
      });
    } catch (error) {
      logger.logError(error as Error, { function: 'clearExpired' });
    }
  };

  // Clean up expired items on mount
  useEffect(() => {
    clearExpired();
  }, []);

  return [storedValue, setValue, removeValue, clearExpired] as const;
}

// Utility function to sanitize data before storing
export const sanitizeForStorage = (data: any): any => {
  if (typeof data === 'string') {
    // Remove potential XSS vectors
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .slice(0, 10000); // Limit length
  }
  
  if (Array.isArray(data)) {
    return data.slice(0, 100).map(sanitizeForStorage); // Limit array size
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    const keys = Object.keys(data).slice(0, 50); // Limit object properties
    
    for (const key of keys) {
      if (key.length > 100) continue; // Skip very long keys
      sanitized[key] = sanitizeForStorage(data[key]);
    }
    
    return sanitized;
  }
  
  return data;
};
