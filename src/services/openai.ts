
// Secure OpenAI service with enhanced security measures
import { createAPIError, createNetworkError, ErrorLogger } from '../utils/errorHandling';
import { sanitizeInput, validateInput, SECURITY_CONFIG } from '../utils/security';
import { secureApiCall } from '../utils/secureApiClient';

const logger = ErrorLogger.getInstance();

// Enhanced message validation
const validateMessages = (messages: any[]): { isValid: boolean; error?: string } => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { isValid: false, error: 'Messages must be a non-empty array' };
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return { isValid: false, error: 'Each message must have role and content' };
    }

    if (typeof msg.content === 'string') {
      const validation = validateInput(msg.content);
      if (!validation.isValid) {
        return validation;
      }
    }
  }

  return { isValid: true };
};

// Sanitize messages array
const sanitizeMessages = (messages: any[]): any[] => {
  return messages.map(msg => ({
    ...msg,
    content: typeof msg.content === 'string' ? sanitizeInput(msg.content) : msg.content
  }));
};

async function callOpenAIApi(messages: any[], options: Record<string, any> = {}): Promise<any> {
  // Validate messages
  const messageValidation = validateMessages(messages);
  if (!messageValidation.isValid) {
    throw createAPIError(
      messageValidation.error || 'Invalid messages provided',
      'INVALID_MESSAGES',
      400
    );
  }

  // Sanitize messages
  const sanitizedMessages = sanitizeMessages(messages);

  // Prepare safe request options
  const safeOptions = {
    messages: sanitizedMessages,
    model: options.model || 'gpt-4o-mini',
    temperature: Math.max(0, Math.min(options.temperature || 0.7, 1)),
    max_tokens: Math.max(1, Math.min(options.max_tokens || 1000, 2000)),
    ...(options.response_format && { response_format: options.response_format })
  };

  console.log(`[Secure API] Making request with ${sanitizedMessages.length} messages`);

  try {
    return await secureApiCall('/api/openai', {
      method: 'POST',
      body: safeOptions,
      timeout: 30000
    });
  } catch (error) {
    logger.logError(error as Error, { 
      endpoint: 'openai', 
      messagesCount: messages.length,
      model: safeOptions.model
    });
    throw error;
  }
}

export async function generateQuestionOptions(userIdea: string): Promise<string[]> {
  console.log(`[Secure] Generating question options for sanitized input`);

  // Validate and sanitize input
  const validation = validateInput(userIdea);
  if (!validation.isValid) {
    console.warn('Invalid user idea provided, using fallback options');
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
    
    // Sanitize and limit response options
    return parsed.options
      .map((option: string) => sanitizeInput(option))
      .slice(0, 5);
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
  console.log(`[Secure] Generating founder doubts for sanitized inputs`);

  // Validate all inputs
  const inputs = { idea, audience, problem, solution };
  for (const [key, value] of Object.entries(inputs)) {
    const validation = validateInput(value);
    if (!validation.isValid) {
      console.warn(`Invalid ${key} provided, using fallback doubts`);
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
    
    // Sanitize and limit response options
    return parsed.options
      .map((doubt: string) => sanitizeInput(doubt))
      .slice(0, 5);
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
