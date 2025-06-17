
/**
 * Input validation and sanitization utilities
 */

// XSS prevention patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
];

// SQL injection prevention patterns  
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|\/\*|\*\/|;)/g,
  /(\b(OR|AND)\b.*=)/gi
];

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  let sanitized = input
    .trim()
    .slice(0, maxLength); // Limit length

  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove SQL injection patterns  
  SQL_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove HTML tags but preserve entities
  sanitized = sanitized
    .replace(/<[^>]*>/g, '')
    .replace(/&(?!#?\w+;)/g, '&amp;');

  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty after sanitization');
  }

  return sanitized;
};

/**
 * Validate and sanitize email addresses
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email, 254); // RFC 5321 limit
  return emailRegex.test(sanitized);
};

/**
 * Validate JSON input safely
 */
export const validateJSON = (jsonString: string, maxSize: number = 10000): any => {
  if (typeof jsonString !== 'string' || jsonString.length > maxSize) {
    throw new Error('Invalid JSON input size');
  }

  try {
    const parsed = JSON.parse(jsonString);
    
    // Prevent prototype pollution
    if (parsed && typeof parsed === 'object') {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        throw new Error('Potentially malicious JSON structure detected');
      }
    }
    
    return parsed;
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private timeWindow: number = 60000 // 1 minute
  ) {}

  canMakeRequest(identifier: string = 'default'): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < this.timeWindow);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getTimeUntilNextRequest(identifier: string = 'default'): number {
    const userRequests = this.requests.get(identifier) || [];
    
    if (userRequests.length < this.maxRequests) {
      return 0;
    }
    
    const oldestRequest = Math.min(...userRequests);
    return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
  }
}

/**
 * Content Security Policy generator
 */
export const generateCSPHeader = (): string => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.gpteng.co",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  return policies.join('; ');
};
