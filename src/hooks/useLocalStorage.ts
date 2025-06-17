
// This file has been replaced with useSecureLocalStorage.ts for security reasons
// Redirect all imports to the secure version

export { useSecureLocalStorage as useLocalStorage } from './useSecureLocalStorage';
export { sanitizeForStorage } from './useSecureLocalStorage';

// Legacy hook for backwards compatibility - now uses secure implementation
import { useSecureLocalStorage } from './useSecureLocalStorage';

export function useLegacyLocalStorage<T>(key: string, initialValue: T) {
  console.warn('Using legacy localStorage hook. Consider migrating to useSecureLocalStorage for enhanced security.');
  return useSecureLocalStorage(key, initialValue, { encrypt: false });
}
