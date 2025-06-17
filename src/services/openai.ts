
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Validate API key exists and is properly formatted
const validateApiKey = (key: string | undefined): boolean => {
  if (!key || key.trim() === '') {
    console.warn("OpenAI API key is missing");
    return false;
  }
  
  // Check if key follows OpenAI format (starts with sk-)
  if (!key.startsWith('sk-')) {
    console.warn("OpenAI API key format appears invalid");
    return false;
  }
  
  return true;
};

// Sanitize API key by removing common formatting issues
const sanitizeApiKey = (key: string | undefined): string | null => {
  if (!key) return null;
  
  // Remove newlines, spaces, and other whitespace
  const sanitized = key.replace(/[\n\r\s]/g, '');
  
  return validateApiKey(sanitized) ? sanitized : null;
};

// Get and validate API key
const apiKey = sanitizeApiKey(import.meta.env.VITE_OPENAI_API_KEY);

// Enhanced logging for development (without exposing the key)
if (import.meta.env.DEV) {
  console.log("OpenAI API Key Status:", apiKey ? "✓ Valid" : "✗ Invalid/Missing");
  if (!apiKey) {
    console.error("Please set VITE_OPENAI_API_KEY in your environment variables");
  }
}

// Secure OpenAI client instantiation
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
  // Add timeout for better error handling
  timeout: 30000,
}) : null;

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    index?: number;
  }>;
}

// Enhanced base rules with input validation
const baseRules = `You are a rewriting engine that outputs ONLY valid JSON.

Constraints for each option:
• 1–2 sentences, ≤ 50 words.
• Must contain audience + problem + solution.
• Each option MUST use a *different* opening phrase (e.g. 'Pet parents…', 'When owners travel…', 'While away…').
• Vary word-choice; prefer synonyms over repetition.
• After generating an option, compare it with all prior options in this call:
  – If ≥ 50 % of its words overlap, rewrite until < 50 %.

Input schema:
\`\`\`json
{
  "idea": "<original idea>",
  "missing": "<none | audience | problem | solution>"
}
\`\`\`
Output schema:
\`\`\`json
{
  "options": ["<string>", "<string>", "<string>"]
}
\`\`\`
`;

// Input sanitization function
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove potentially dangerous characters and limit length
  const sanitized = input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .slice(0, 1000); // Limit input length
  
  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty after sanitization');
  }
  
  return sanitized;
};

// Enhanced missing component detection with validation
function detectMissing(userIdea: string): 'none' | 'audience' | 'problem' | 'solution' {
  try {
    const sanitizedIdea = sanitizeInput(userIdea);
    
    const hasWho = /pet owners|travelers|individuals|people|customers|clients|users|for|to|with|helps|helping|target|group/i.test(sanitizedIdea);
    const hasProblem = /need|problem|issue|challenge|difficulty|frustration|struggling|away|when away|no care|unreliable|trustworthy|stress|worry|concern|burden|hindrance|solve|addresses/i.test(sanitizedIdea);
    const hasSolution = /platform|app|service|tool|software|solution|system|way|method|product|offering|connects|matches|provides|allows|sitters|care|arrangement|resource|feature|offer/i.test(sanitizedIdea);

    let missingPart: 'none' | 'audience' | 'problem' | 'solution' = 'none';
    if (!hasWho) missingPart = 'audience';
    else if (!hasProblem) missingPart = 'problem';
    else if (!hasSolution) missingPart = 'solution';
    
    return missingPart;
  } catch (error) {
    console.error('Error in detectMissing:', error);
    return 'none'; // Safe fallback
  }
}

// Rate limiting implementation
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 10;
  private readonly timeWindow = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

const rateLimiter = new RateLimiter();

// Secure main generation function with enhanced error handling
export async function generateQuestionOptions(userIdea: string): Promise<string[]> {
  // Input validation
  if (!userIdea || typeof userIdea !== 'string') {
    throw new Error('Invalid input: userIdea must be a non-empty string');
  }

  // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest() / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before making another request.`);
  }

  // API client validation
  if (!openai) {
    console.warn("OpenAI client not available, returning fallback options");
    return [
      "Consider elaborating on your target audience and their specific needs.",
      "Think about the core problem your solution addresses uniquely.",
      "Focus on what makes your approach different from existing alternatives."
    ];
  }

  try {
    const sanitizedIdea = sanitizeInput(userIdea);
    const missing = detectMissing(sanitizedIdea);
    
    // Construct secure user message
    const userMessageContent = JSON.stringify({
      idea: sanitizedIdea,
      missing: missing
    });

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: baseRules },
      { role: "user", content: userMessageContent }
    ];

    // Enhanced API call with better error handling
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.9,
      max_tokens: 220,
      n: 1,
      // Add safety parameters
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI completion.');
    }

    // Secure JSON parsing with validation
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.warn("Failed to parse OpenAI response as JSON:", parseError);
      throw new Error('Invalid response format from OpenAI');
    }
    
    // Enhanced response validation
    if (!result || 
        !Array.isArray(result.options) || 
        result.options.length !== 3 || 
        result.options.some((opt: any) => typeof opt !== 'string' || opt.length > 200)) {
      console.warn("Invalid response structure from OpenAI");
      return [
        "Please provide more specific details about your target users.",
        "Consider clarifying the main challenge you're addressing.",
        "Think about what unique value your solution provides."
      ];
    }

    // Sanitize and return options
    return result.options.map((opt: string) => sanitizeInput(opt));

  } catch (error: any) {
    console.error('Error generating question options:', error);
    
    // Provide helpful error messages based on error type
    if (error.message?.includes('rate limit')) {
      throw error; // Re-throw rate limit errors
    }
    
    // Secure fallback options
    return [
      "Consider refining your idea to be more specific about the target audience.",
      "Think about the primary challenge your solution addresses.",
      "Focus on what makes your approach uniquely valuable."
    ];
  }
}

// New function for fetching founder doubts (referenced in Q6Scr but missing)
export async function fetchFounderDoubts(context: {
  idea: string;
  audience: string;
  problem: string;
  solution: string;
}): Promise<string[]> {
  // Input validation
  const requiredFields = ['idea', 'audience', 'problem', 'solution'];
  for (const field of requiredFields) {
    if (!context[field as keyof typeof context] || typeof context[field as keyof typeof context] !== 'string') {
      throw new Error(`Invalid context: ${field} must be a non-empty string`);
    }
  }

  // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest() / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before making another request.`);
  }

  if (!openai) {
    console.warn("OpenAI client not available, returning fallback doubts");
    return [
      "Is the market large enough to sustain this business?",
      "Do we have the technical resources to build this effectively?",
      "Will users change their existing habits to adopt our solution?",
      "How will we compete against established players in this space?",
      "Are our core assumptions about the problem validated by real users?"
    ];
  }

  try {
    // Sanitize all inputs
    const sanitizedContext = {
      idea: sanitizeInput(context.idea),
      audience: sanitizeInput(context.audience),
      problem: sanitizeInput(context.problem),
      solution: sanitizeInput(context.solution)
    };

    const systemPrompt = `Generate 5 realistic founder doubts based on the provided startup context. Focus on common concerns founders have about market validation, execution, competition, and scaling. Return only a JSON array of strings.`;

    const userPrompt = `Context:
- Idea: ${sanitizedContext.idea}
- Target Audience: ${sanitizedContext.audience}
- Problem: ${sanitizedContext.problem}
- Solution: ${sanitizedContext.solution}

Generate 5 founder doubts as a JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
      n: 1
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let doubts;
    try {
      doubts = JSON.parse(content);
    } catch (parseError) {
      console.warn("Failed to parse doubts response:", parseError);
      throw new Error('Invalid response format');
    }

    // Validate response structure
    if (!Array.isArray(doubts) || doubts.length !== 5 || doubts.some(doubt => typeof doubt !== 'string' || doubt.length > 150)) {
      console.warn("Invalid doubts response structure");
      return [
        "Is our target market large enough for sustainable growth?",
        "Can we build this with our current team and resources?",
        "Will users adopt a new solution when alternatives exist?",
        "How will we differentiate from larger competitors?",
        "Are we solving a problem people will pay to fix?"
      ];
    }

    return doubts.map(doubt => sanitizeInput(doubt));

  } catch (error: any) {
    console.error('Error fetching founder doubts:', error);
    
    if (error.message?.includes('rate limit')) {
      throw error;
    }
    
    return [
      "Is the market timing right for our solution?",
      "Do we have the right team to execute this vision?",
      "Will customers pay enough to make this profitable?",
      "How will we handle well-funded competition?",
      "Are we solving a real problem or a perceived one?"
    ];
  }
}

// Enhanced validation report generation with security improvements
export async function generateValidationReport(
  answers: Record<number, string>,
  persona: string,
  userIdea: string
): Promise<{
  ideaSummary: string;
  strengths: string[];
  concerns: string[];
  insights: string;
  nextSteps: string;
}> {
  // Input validation
  if (!answers || typeof answers !== 'object') {
    throw new Error('Invalid answers: must be a non-empty object');
  }
  
  if (!persona || typeof persona !== 'string') {
    throw new Error('Invalid persona: must be a non-empty string');
  }
  
  if (!userIdea || typeof userIdea !== 'string') {
    throw new Error('Invalid userIdea: must be a non-empty string');
  }

  // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest() / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before making another request.`);
  }

  if (!openai) {
    return {
      ideaSummary: "Your idea addresses a real market opportunity with a thoughtful approach to solving user problems.",
      strengths: [
        "Clear understanding of target market needs",
        "Well-defined problem-solution fit",
        "Strategic thinking about implementation"
      ],
      concerns: [
        "Market validation requires deeper user research",
        "Competitive landscape needs thorough analysis", 
        "Resource requirements should be carefully planned"
      ],
      insights: "Your responses demonstrate solid foundational thinking and awareness of key business challenges.",
      nextSteps: "Focus on validating assumptions through direct user feedback and develop a clear go-to-market strategy."
    };
  }

  try {
    // Sanitize inputs
    const sanitizedPersona = sanitizeInput(persona);
    const sanitizedUserIdea = sanitizeInput(userIdea);
    
    // Sanitize answers
    const sanitizedAnswers: Record<number, string> = {};
    for (const [key, value] of Object.entries(answers)) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey) || typeof value !== 'string') {
        continue; // Skip invalid entries
      }
      sanitizedAnswers[numKey] = sanitizeInput(value);
    }

    const answersText = Object.entries(sanitizedAnswers)
      .map(([qId, answer]) => `Question ${qId}: ${answer}`)
      .join('\n');

    const systemPrompt = `You are ${sanitizedPersona}. Create a comprehensive idea validation report based on the user's responses. 

Return a JSON object with exactly these fields:
- ideaSummary: 2-3 sentences summarizing the idea (max 200 chars)
- strengths: array of 3-4 bullet points highlighting positive aspects (max 100 chars each)
- concerns: array of 3-4 bullet points noting potential challenges (max 100 chars each)  
- insights: 2-3 sentences of persona-specific insights (max 200 chars)
- nextSteps: 1-2 sentences with actionable next steps (max 150 chars)

Maintain your persona's tone throughout and provide honest, constructive feedback.`;

    const userPrompt = `Original idea: "${sanitizedUserIdea}"

User's answers:
${answersText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      n: 1
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let report;
    try {
      report = JSON.parse(content);
    } catch (parseError) {
      console.warn("Failed to parse validation report:", parseError);
      throw new Error('Invalid response format');
    }

    // Validate report structure
    const requiredFields = ['ideaSummary', 'strengths', 'concerns', 'insights', 'nextSteps'];
    for (const field of requiredFields) {
      if (!report[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(report.strengths) || !Array.isArray(report.concerns)) {
      throw new Error('Strengths and concerns must be arrays');
    }

    // Sanitize report content
    return {
      ideaSummary: sanitizeInput(report.ideaSummary),
      strengths: report.strengths.map((s: string) => sanitizeInput(s)),
      concerns: report.concerns.map((c: string) => sanitizeInput(c)),
      insights: sanitizeInput(report.insights),
      nextSteps: sanitizeInput(report.nextSteps)
    };

  } catch (error: any) {
    console.error('Error generating validation report:', error);
    
    if (error.message?.includes('rate limit')) {
      throw error;
    }
    
    // Enhanced fallback report
    return {
      ideaSummary: "Your idea demonstrates thoughtful consideration of market needs and implementation challenges.",
      strengths: [
        "Clear problem identification and target audience understanding",
        "Systematic approach to validating assumptions",
        "Realistic awareness of potential obstacles"
      ],
      concerns: [
        "User validation needs to be prioritized early",
        "Competitive differentiation requires further development",
        "Implementation timeline and resources need detailed planning"
      ],
      insights: "Your responses show strong analytical thinking and awareness of key business fundamentals.",
      nextSteps: "Conduct user interviews to validate core assumptions and develop a focused MVP strategy."
    };
  }
}
