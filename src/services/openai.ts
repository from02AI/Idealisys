
// Secure OpenAI service with input validation and sanitization
import { createAPIError, createNetworkError, ErrorLogger } from '../utils/errorHandling';

const logger = ErrorLogger.getInstance();

// Input sanitization utilities
const sanitizeInput = (input: string): string => {
  // Remove potential XSS vectors and normalize whitespace
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 2000); // Limit input length
};

const validateInput = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  if (input.length < 3 || input.length > 2000) return false;
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /eval\s*\(/i,
    /function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  return !suspiciousPatterns.some(pattern => pattern.test(input));
};

// Secure API helper with rate limiting tracking
class APIRateLimiter {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests = 10;
  private readonly windowMs = 60000; // 1 minute

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const key = `openai_${endpoint}`;
    const current = this.requestCounts.get(key);

    if (!current || now > current.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (current.count >= this.maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }
}

const rateLimiter = new APIRateLimiter();

async function callOpenAIApi(messages: any[], options: Record<string, any> = {}): Promise<any> {
  // Rate limiting check
  if (!rateLimiter.canMakeRequest('chat')) {
    throw createAPIError(
      'Rate limit exceeded. Please wait before making another request.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  // Validate and sanitize messages
  const sanitizedMessages = messages.map(msg => ({
    ...msg,
    content: typeof msg.content === 'string' ? sanitizeInput(msg.content) : msg.content
  }));

  // Validate all message content
  for (const msg of sanitizedMessages) {
    if (typeof msg.content === 'string' && !validateInput(msg.content)) {
      throw createAPIError(
        'Invalid input detected. Please check your message and try again.',
        'INVALID_INPUT',
        400
      );
    }
  }

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Content-Type-Options': 'nosniff',
      },
      body: JSON.stringify({ 
        messages: sanitizedMessages, 
        ...options,
        // Ensure safe defaults
        max_tokens: Math.min(options.max_tokens || 1000, 2000),
        temperature: Math.max(0, Math.min(options.temperature || 0.7, 1))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
      
      if (response.status === 429) {
        throw createAPIError(
          'Rate limit exceeded. Please wait before trying again.',
          'RATE_LIMIT_EXCEEDED',
          429
        );
      }
      
      throw createNetworkError(
        errorData.error || `API request failed with status ${response.status}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    logger.logError(error as Error, { endpoint: 'openai', messagesCount: messages.length });
    
    if (error instanceof Error && error.name.includes('TypeError')) {
      throw createNetworkError('Network connection failed. Please check your internet connection.', 0);
    }
    
    throw error;
  }
}

export async function generateQuestionOptions(userIdea: string): Promise<string[]> {
  console.log(`[Secure] Requesting question options for sanitized idea`);

  // Validate and sanitize input
  if (!validateInput(userIdea)) {
    console.warn('Invalid user idea provided, using fallback');
    return [
      "Streamline daily tasks.",
      "Enhance personal productivity.", 
      "Simplify complex workflows."
    ];
  }

  const sanitizedIdea = sanitizeInput(userIdea);

  const messages = [
    {
      role: "system",
      content: "You are a creative assistant that generates concise, distinct 1-2 sentence options for a user's idea based on a single guiding question. Respond ONLY with a JSON array of strings, where each string is an option. Ensure options are distinct in phrasing and content. Example: [\"Option 1.\", \"Option 2.\", \"Option 3.\"]"
    },
    {
      role: "user", 
      content: `User idea: "${sanitizedIdea}". Generate options for: "What problem does it solve?"`
    }
  ];

  try {
    const response = await callOpenAIApi(messages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Validate response structure
    if (!parsed.options || !Array.isArray(parsed.options)) {
      throw new Error('Invalid response format from API');
    }
    
    return parsed.options.slice(0, 5); // Limit to 5 options max
  } catch (error) {
    logger.logError(error as Error, { function: 'generateQuestionOptions' });
    // Return secure fallback options
    return [
      "Streamline daily tasks.",
      "Enhance personal productivity.",
      "Simplify complex workflows.",
    ];
  }
}

interface FetchFounderDoubtsParams {
  idea: string;
  audience: string;
  problem: string;
  solution: string;
}

export async function fetchFounderDoubts({ idea, audience, problem, solution }: FetchFounderDoubtsParams): Promise<string[]> {
  console.log(`[Secure] Requesting founder doubts for sanitized inputs`);

  // Validate all inputs
  const inputs = { idea, audience, problem, solution };
  for (const [key, value] of Object.entries(inputs)) {
    if (!validateInput(value)) {
      console.warn(`Invalid ${key} provided, using fallback`);
      return [
        "Is the market large enough?",
        "Can we acquire users affordably?", 
        "Will this really solve their core problem?",
        "What if a big player enters?",
        "Do we have the right team?",
      ];
    }
  }

  // Sanitize all inputs
  const sanitizedInputs = {
    idea: sanitizeInput(idea),
    audience: sanitizeInput(audience),
    problem: sanitizeInput(problem),
    solution: sanitizeInput(solution)
  };

  const messages = [
    {
      role: "system",
      content: "You are an expert advisor. Based on the provided idea, audience, problem, and solution, identify potential doubts or challenges a founder might face. Respond ONLY with a JSON array of strings, where each string is a concise doubt. Example: [\"Doubt 1?\", \"Doubt 2?\", \"Doubt 3?\"]"
    },
    {
      role: "user",
      content: `Idea: "${sanitizedInputs.idea}"\nAudience: "${sanitizedInputs.audience}"\nProblem: "${sanitizedInputs.problem}"\nSolution: "${sanitizedInputs.solution}".\nWhat are the top 3-5 doubts a founder should have about this business?`
    }
  ];

  try {
    const response = await callOpenAIApi(messages, {
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Validate response structure
    if (!parsed.options || !Array.isArray(parsed.options)) {
      throw new Error('Invalid response format from API');
    }
    
    return parsed.options.slice(0, 5); // Limit to 5 doubts max
  } catch (error) {
    logger.logError(error as Error, { function: 'fetchFounderDoubts' });
    // Return secure fallback options
    return [
      "Is the market large enough?",
      "Can we acquire users affordably?",
      "Will this really solve their core problem?", 
      "What if a big player enters?",
      "Do we have the right team?",
    ];
  }
}
