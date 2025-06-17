
/**
 * Environment configuration utility with security validations
 */

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiKeys: {
    openai: string | null;
  };
}

// Validate environment variables
const validateEnvironment = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Validate OpenAI API key
  let openaiKey: string | null = null;
  const rawOpenaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (rawOpenaiKey) {
    // Clean and validate the key
    const cleanedKey = rawOpenaiKey.replace(/[\n\r\s]/g, '');
    
    if (cleanedKey.startsWith('sk-') && cleanedKey.length > 20) {
      openaiKey = cleanedKey;
    } else {
      console.error('Invalid OpenAI API key format detected');
    }
  }

  // Log environment status in development
  if (isDevelopment) {
    console.group('🔧 Environment Configuration');
    console.log('Mode:', isDevelopment ? 'Development' : 'Production');
    console.log('OpenAI API Key:', openaiKey ? '✓ Valid' : '✗ Missing/Invalid');
    
    if (!openaiKey) {
      console.warn('⚠️  Set VITE_OPENAI_API_KEY environment variable for full functionality');
    }
    
    console.groupEnd();
  }

  return {
    isDevelopment,
    isProduction,
    apiKeys: {
      openai: openaiKey
    }
  };
};

// Export validated environment configuration
export const env = validateEnvironment();

// Helper functions for secure environment checks
export const hasValidOpenAIKey = (): boolean => {
  return env.apiKeys.openai !== null;
};

export const getOpenAIKey = (): string | null => {
  return env.apiKeys.openai;
};

// Security headers for API requests
export const getSecureHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Add CSP headers for additional security
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
};
