
/**
 * Centralized security configuration and utilities
 */

import { ErrorLogger } from './errorHandling';

const logger = ErrorLogger.getInstance();

// Security configuration constants
export const SECURITY_CONFIG = {
  // Input validation limits
  MAX_INPUT_LENGTH: 2000,
  MIN_INPUT_LENGTH: 3,
  MAX_MESSAGE_LENGTH: 5000,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 20,
  RATE_LIMIT_WINDOW_MS: 60000,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    defaultSrc: "'self'",
    scriptSrc: "'self' 'unsafe-inline'",
    styleSrc: "'self' 'unsafe-inline'",
    imgSrc: "'self' data: https:",
    connectSrc: "'self' https://api.openai.com",
    fontSrc: "'self'",
    objectSrc: "'none'",
    baseUri: "'self'",
    formAction: "'self'"
  },
  
  // Allowed domains for external requests
  ALLOWED_DOMAINS: [
    'api.openai.com',
    'api.anthropic.com',
    'docs.lovable.dev'
  ],
  
  // File upload restrictions
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'text/plain']
};

// Content sanitization utilities
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:(?!image\/[a-z]+;base64,)[^;]*;base64,/gi, '')
    .trim();
};

export const sanitizeInput = (input: string): string => {
  const sanitized = sanitizeHTML(input);
  return sanitized.slice(0, SECURITY_CONFIG.MAX_INPUT_LENGTH);
};

// Input validation functions
export const validateInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a non-empty string' };
  }
  
  if (input.length < SECURITY_CONFIG.MIN_INPUT_LENGTH) {
    return { isValid: false, error: `Minimum ${SECURITY_CONFIG.MIN_INPUT_LENGTH} characters required` };
  }
  
  if (input.length > SECURITY_CONFIG.MAX_INPUT_LENGTH) {
    return { isValid: false, error: `Maximum ${SECURITY_CONFIG.MAX_INPUT_LENGTH} characters allowed` };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /eval\s*\(/i,
    /function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:.*base64/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i
  ];
  
  const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(input));
  if (hasSuspiciousContent) {
    return { isValid: false, error: 'Input contains potentially unsafe content' };
  }
  
  return { isValid: true };
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['https:', 'http:'];
    
    return allowedProtocols.includes(parsed.protocol) &&
           SECURITY_CONFIG.ALLOWED_DOMAINS.some(domain => 
             parsed.hostname.endsWith(domain)
           );
  } catch {
    return false;
  }
};

// Rate limiting utility
class SecurityRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;
    
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;
    
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE - recentRequests.length);
  }
}

export const rateLimiter = new SecurityRateLimiter();

// Security headers utility
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
      .map(([directive, value]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${value}`)
      .join('; ')
  };
};

// File validation utility
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds maximum allowed limit' };
  }
  
  if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  return { isValid: true };
};

// Security audit logging
export const logSecurityEvent = (event: string, details: Record<string, any> = {}) => {
  logger.logError(new Error(`Security Event: ${event}`), {
    ...details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};
