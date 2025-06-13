import OpenAI from "openai";
// Import ChatCompletionMessageParam for explicit typing
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Log the API key to the console during development
console.log("OpenAI API Key:", import.meta.env.VITE_OPENAI_API_KEY ? "Loaded" : "Not Loaded");

// Fix API key if it contains newlines (common issue with .env files)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.replace(/\n/g, '');

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // This is for client-side usage, remember to secure for production!
});

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    index?: number; // index is optional for clarity
  }>;
}

// NOTE: The global SYSTEM_PROMPT below is now OBSOLETE based on our new strategy.
// It is kept here commented out for reference, but it will no longer be directly used in generateQuestionOptions.
/*
const SYSTEM_PROMPT = `You are Solivra, a concise startup mentor. Always output exactly three re-phrasings of the user's idea, each as a single sentence of 25 words or fewer. Every sentence must begin with a capital letter, mention the core problem and who faces it, and end with a period. Do NOT add bullet points, numbers, emojis, or extra commentary. Respond as valid JSON: { "options": ["…", "…", "…"] }.`;
*/

// The new system prompt with updated constraints and output schema.
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

// --- helper functions -------------------------------------------------------------

// Helper to detect missing components - this remains as it is still needed for the AI's input.
function detectMissing(userIdea: string): 'none' | 'audience' | 'problem' | 'solution' {
  const hasWho = /pet owners|travelers|individuals|people|customers|clients|users|for|to|with|helps|helping|target|group/i.test(userIdea);
  const hasProblem = /need|problem|issue|challenge|difficulty|frustration|struggling|away|when away|no care|unreliable|trustworthy|stress|worry|concern|burden|hindrance|solve|addresses/i.test(userIdea);
  const hasSolution = /platform|app|service|tool|software|solution|system|way|method|product|offering|connects|matches|provides|allows|sitters|care|arrangement|resource|feature|offer/i.test(userIdea);

  let missingPart: 'none' | 'audience' | 'problem' | 'solution' = 'none';
  if (!hasWho) missingPart = 'audience';
  else if (!hasProblem) missingPart = 'problem';
  else if (!hasSolution) missingPart = 'solution';
  
  return missingPart;
}

// --- main generation function ---------------------------------------------------------------
export async function generateQuestionOptions(userIdea: string): Promise<string[]> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    return [
      "Mock rephrasing for testing purposes (Option 1).",
      "Another concise rephrasing example (Option 2).",
      "A third short rephrased idea (Option 3)."
    ];
  }

  try {
    const missing = detectMissing(userIdea);
    
    // Construct the user message as a JSON string, as per the new prompt's input schema.
    const userMessageContent = JSON.stringify({
        idea: userIdea,
        missing: missing
    });

    // Explicitly type the messages array to satisfy TypeScript
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: baseRules },
      { role: "user", content: userMessageContent } // Send the JSON input as the user's message
    ];

    // Debugging: Log the messages before API call
    console.log(`→ API Request Messages:\n`, JSON.stringify(messages, null, 2));

    // Use the OpenAI client directly for the API call to get all 3 options in one response.
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages, // Pass the messages array
      temperature: 0.9,     // Higher temperature for more lexical variety
      max_tokens: 220,       // Sufficient tokens for the JSON output containing 3 options
      n: 1                 // Request 1 completion which should contain the JSON with 3 options
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI completion.');
    }

    // Parse the JSON response expecting { "options": [...] }
    const result = JSON.parse(content);
    
    // Validate the parsed structure for exactly an array of 3 strings
    if (!result || !Array.isArray(result.options) || result.options.length !== 3 || result.options.some((opt: any) => typeof opt !== 'string')) {
      console.warn("Invalid response format from OpenAI, returning fallback options. Raw content:", content);
      return [
        "Please provide more context for your idea.",
        "Consider elaborating on the core problem you're solving.",
        "Who is the primary user for this solution?"
      ];
    }

    // Trim each option and return the array
    return result.options.map((opt: string) => opt.trim());

  } catch (error: any) {
    console.error('Error generating question options:', error.message || error);
    // Fallback options for 3
    return [
      "Could you rephrase your idea to be more specific.",
      "Think about the direct value your idea provides.",
      "Focus on the main challenge this idea addresses."
    ];
  }
}

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
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    // Return mock report if no API key
    return {
      ideaSummary: "Your idea shows promise and addresses a real market need with innovative approach.",
      strengths: [
        "Clear value proposition",
        "Identified target market",
        "Unique differentiator"
      ],
      concerns: [
        "Market validation needed",
        "Technical complexity",
        "Competition analysis required"
      ],
      insights: "Based on your responses, this idea has solid foundations and your passion comes through clearly.",
      nextSteps: "Start with customer interviews to validate your assumptions and build a simple prototype."
    };
  }

  try {
    const answersText = Object.entries(answers)
      .map(([qId, answer]) => `Question ${qId}: ${answer}`)
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are ${persona}. Create a comprehensive idea validation report based on the user's responses. 
            
            Return a JSON object with exactly these fields:
            - ideaSummary: 2-3 sentences summarizing the idea
            - strengths: array of 3-4 bullet points highlighting positive aspects
            - concerns: array of 3-4 bullet points noting potential challenges
            - insights: 2-3 sentences of persona-specific insights
            - nextSteps: 1-2 sentences with actionable next steps
            
            Original idea: "${userIdea}"
            
            User's answers:
            ${answersText}
            
            Maintain your persona's tone throughout and provide honest, constructive feedback.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating validation report:', error);
    // Return fallback report
    return {
      ideaSummary: "Your idea shows promise and addresses a real market need.",
      strengths: [
        "Clear problem identification",
        "Thoughtful consideration of challenges",
        "Strong motivation to build"
      ],
      concerns: [
        "Market validation needed",
        "Competitive landscape analysis",
        "Resource requirements"
      ],
      insights: "Your responses show careful thinking about your idea's potential and challenges.",
      nextSteps: "Focus on validating your assumptions with potential customers and building a minimum viable prototype."
    };
  }
}
