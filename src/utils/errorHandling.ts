
/**
 * Enhanced error handling and logging utilities
 */

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  API = 'API',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  UNKNOWN = 'UNKNOWN'
}

// Custom error class for better error handling
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error logging utility with privacy considerations
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorCount: Map<string, number> = new Map();
  private readonly maxLogFrequency = 5; // Max same errors logged per session

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error | AppError, context?: Record<string, any>): void {
    const errorKey = `${error.name}:${error.message}`;
    const currentCount = this.errorCount.get(errorKey) || 0;

    // Prevent spam logging of the same error
    if (currentCount >= this.maxLogFrequency) {
      return;
    }

    this.errorCount.set(errorKey, currentCount + 1);

    // Prepare sanitized context (remove sensitive data)
    const sanitizedContext = this.sanitizeContext(context);

    if (import.meta.env.DEV) {
      console.group(`🚨 Error [${error instanceof AppError ? error.type : 'UNKNOWN'}]`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      if (error instanceof AppError) {
        console.error('Code:', error.code);
        console.error('Type:', error.type);
        if (error.statusCode) {
          console.error('Status:', error.statusCode);
        }
      }
      
      if (sanitizedContext) {
        console.error('Context:', sanitizedContext);
      }
      
      console.groupEnd();
    } else {
      // In production, log essential info only
      console.error(`[${error instanceof AppError ? error.type : 'ERROR'}] ${error.message}`);
    }
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'apikey', 'secret', 'authorization'];

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = `[TRUNCATED:${value.length}chars]`;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// Error boundary helper for React components
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'An unexpected error occurred'
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    const logger = ErrorLogger.getInstance();
    
    if (error instanceof AppError) {
      logger.logError(error);
    } else if (error instanceof Error) {
      logger.logError(new AppError(
        errorMessage,
        ErrorType.UNKNOWN,
        'ASYNC_ERROR',
        undefined,
        true
      ));
    } else {
      logger.logError(new AppError(
        'Unknown error type encountered',
        ErrorType.UNKNOWN,
        'UNKNOWN_TYPE_ERROR'
      ));
    }
    
    return fallback;
  }
};

// Network error handler
export const createNetworkError = (message: string, statusCode?: number): AppError => {
  return new AppError(
    message,
    ErrorType.NETWORK,
    'NETWORK_ERROR',
    statusCode
  );
};

// API error handler
export const createAPIError = (message: string, code: string, statusCode?: number): AppError => {
  return new AppError(
    message,
    ErrorType.API,
    code,
    statusCode
  );
};

// Rate limit error handler
export const createRateLimitError = (waitTime: number): AppError => {
  return new AppError(
    `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
    ErrorType.RATE_LIMIT,
    'RATE_LIMIT_EXCEEDED'
  );
};

// Validation error handler
export const createValidationError = (field: string, message: string): AppError => {
  return new AppError(
    `Validation failed for ${field}: ${message}`,
    ErrorType.VALIDATION,
    'VALIDATION_ERROR'
  );
};
