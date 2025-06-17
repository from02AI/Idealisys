
/**
 * Secure API client with built-in security measures
 */

import { getSecurityHeaders, rateLimiter, logSecurityEvent } from './security';
import { createNetworkError, createAPIError, ErrorLogger } from './errorHandling';

const logger = ErrorLogger.getInstance();

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

class SecureApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000;
  private defaultRetries: number = 3;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries
    } = options;

    // Rate limiting check
    const identifier = 'api_client';
    if (!rateLimiter.isAllowed(identifier)) {
      logSecurityEvent('Rate limit exceeded', { endpoint, method });
      throw createAPIError(
        'Too many requests. Please wait before trying again.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }

    // Prepare secure headers
    const secureHeaders = {
      ...getSecurityHeaders(),
      ...headers
    };

    // Validate endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      throw createAPIError('Invalid endpoint provided', 'INVALID_ENDPOINT', 400);
    }

    const url = this.baseURL + endpoint;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: secureHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          credentials: 'same-origin',
          mode: 'cors',
          cache: 'no-cache'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: `Request failed with status ${response.status}` 
          }));

          if (response.status === 429) {
            logSecurityEvent('API rate limit hit', { endpoint, attempt });
            throw createAPIError(
              'Rate limit exceeded by server',
              'SERVER_RATE_LIMIT',
              429
            );
          }

          if (response.status >= 500) {
            throw createNetworkError(
              `Server error: ${errorData.error || response.statusText}`,
              response.status
            );
          }

          throw createAPIError(
            errorData.error || `Request failed: ${response.statusText}`,
            'API_ERROR',
            response.status
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw createNetworkError('Request timeout', 408);
        }

        if (attempt === retries) {
          break;
        }

        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    logger.logError(lastError!, { endpoint, method, retries });
    throw lastError!;
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string, 
    data: any, 
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'POST', 
      body: data, 
      headers 
    });
  }

  async put<T>(
    endpoint: string, 
    data: any, 
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'PUT', 
      body: data, 
      headers 
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Export singleton instance
export const secureApiClient = new SecureApiClient();

// Utility function for API calls with automatic security measures
export const secureApiCall = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return secureApiClient.request<T>(endpoint, options);
};
