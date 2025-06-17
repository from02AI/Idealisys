
/**
 * Secure environment configuration utility
 */

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  features: {
    debugMode: boolean;
    errorReporting: boolean;
  };
}

// Validate environment variables (no sensitive data)
const validateEnvironment = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Log environment status in development only
  if (isDevelopment) {
    console.group('🔧 Environment Configuration');
    console.log('Mode:', isDevelopment ? 'Development' : 'Production');
    console.log('Debug Mode:', isDevelopment);
    console.log('Error Reporting:', isProduction);
    console.groupEnd();
  }

  return {
    isDevelopment,
    isProduction,
    features: {
      debugMode: isDevelopment,
      errorReporting: isProduction
    }
  };
};

// Export validated environment configuration (no API keys)
export const env = validateEnvironment();

// Security headers for API requests
export const getSecureHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
};

// Secure configuration helpers
export const isDebugMode = (): boolean => {
  return env.features.debugMode;
};

export const shouldReportErrors = (): boolean => {
  return env.features.errorReporting;
};

// Helper to validate external URLs
export const isValidExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['https:', 'http:'];
    const allowedDomains = [
      'api.openai.com',
      'api.anthropic.com', 
      'docs.lovable.dev'
    ];
    
    return allowedProtocols.includes(parsed.protocol) &&
           allowedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
};

// Content Security Policy helpers
export const getCSPDirectives = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  return directives.join('; ');
};
