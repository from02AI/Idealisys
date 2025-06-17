
import OpenAI from "openai";

// Security headers middleware
const addSecurityHeaders = (res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
};

// Input validation
const validateRequest = (req) => {
  const { messages, model, temperature, max_tokens } = req.body;
  
  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }
  
  // Validate each message
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      throw new Error('Each message must have role and content');
    }
    if (typeof msg.content === 'string' && msg.content.length > 5000) {
      throw new Error('Message content too long');
    }
  }
  
  // Validate model
  const allowedModels = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o'];
  if (model && !allowedModels.includes(model)) {
    throw new Error('Invalid model specified');
  }
  
  // Validate temperature
  if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
    throw new Error('Temperature must be between 0 and 1');
  }
  
  // Validate max_tokens
  if (max_tokens !== undefined && (max_tokens < 1 || max_tokens > 4000)) {
    throw new Error('max_tokens must be between 1 and 4000');
  }
};

// Rate limiting (simple in-memory store for demo)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 20;

const checkRateLimit = (identifier) => {
  const now = Date.now();
  const userLimits = rateLimits.get(identifier) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimits.resetTime) {
    userLimits.count = 1;
    userLimits.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    userLimits.count += 1;
  }
  
  rateLimits.set(identifier, userLimits);
  
  return userLimits.count <= MAX_REQUESTS;
};

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res);
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Validate API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'Service configuration error' });
    }
    
    // Rate limiting (using IP as identifier)
    const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(identifier)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait before making another request.' 
      });
    }
    
    // Validate request
    validateRequest(req);
    
    const { messages, ...options } = req.body;
    
    // Initialize OpenAI with validated API key
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY.trim()
    });
    
    // Call OpenAI with safe defaults
    const response = await openai.chat.completions.create({
      messages,
      model: options.model || 'gpt-4o-mini',
      temperature: Math.max(0, Math.min(options.temperature || 0.7, 1)),
      max_tokens: Math.max(1, Math.min(options.max_tokens || 1000, 2000)),
      ...options
    });
    
    res.status(200).json(response);
  } catch (err) {
    console.error('OpenAI API Error:', err.message);
    
    // Don't expose internal error details
    if (err.message.includes('API key')) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    if (err.message.includes('rate limit') || err.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    if (err.message.includes('validation') || err.message.includes('Invalid')) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
    
    // Generic error response
    res.status(500).json({ error: 'Request processing failed' });
  }
}
