import OpenAI from "openai";

// Log the API key to the console during development
console.log("OpenAI API Key:", import.meta.env.VITE_OPENAI_API_KEY ? "Loaded" : "Not Loaded");

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // This is for client-side usage, remember to secure for production!
});

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// NOTE: The global SYSTEM_PROMPT below is now OBSOLETE based on our new strategy.
// It is kept here commented out for reference, but it will no longer be directly used in generateQuestionOptions.
/*
const SYSTEM_PROMPT = `You are Solivra, a concise startup mentor. Always output exactly three re-phrasings of the user's idea, each as a single sentence of 25 words or fewer. Every sentence must begin with a capital letter, mention the core problem and who faces it, and end with a period. Do NOT add bullet points, numbers, emojis, or extra commentary. Respond as valid JSON: { "options": ["…", "…", "…"] }.`;
*/

export async function generateQuestionOptions(
  userIdea: string,
  // Removed 'screenSpecificUserPrompt' parameter, now receiving the full 'promptTemplate'
  promptTemplate: string // This will be the question.prompt from data/questions.ts
): Promise<string[]> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    // Updated mock data for 3 options
    return [
      "Mock rephrasing for testing purposes.",
      "Another concise rephrasing example.",
      "A third short rephrased idea."
    ];
  }

  try {
    // 1. Split the template into SYSTEM and USER blocks
    const [systemBlock, userBlockRaw] = promptTemplate.split("### USER");

    if (!systemBlock || !userBlockRaw) {
      throw new Error("Invalid prompt template format: Missing '### USER' separator.");
    }

    // 2. Replace the placeholder in the user block
    const userContent = userBlockRaw.replace('{USER_IDEA}', userIdea).trim();
    const systemContent = systemBlock.replace('### SYSTEM', '').trim(); // Remove '### SYSTEM' tag

    // 3. (Debug) Log the actual messages being sent
    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent }
    ];

    console.log("→ API Request Messages:\n", JSON.stringify(messages, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Changed to gpt-3.5-turbo for faster/cheaper testing
        messages: messages, // Use the dynamically constructed messages
        temperature: 0.7,
        max_tokens: 120
      }),
    });

    if (!response.ok) {
      // Attempt to read error message from API response
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${errorData.message || 'No specific error message from API'}`);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // 5. Parse the JSON response expecting { "options": [...] }
    const result = JSON.parse(content);
    
    // Validate the parsed structure for exactly 3 options
    if (!result || !Array.isArray(result.options) || result.options.length !== 3) {
      console.warn("Invalid response format from OpenAI, returning fallback options. Raw content:", content);
      return [
        "Please provide more context for your idea.",
        "Consider elaborating on the core problem you're solving.",
        "Who is the primary user for this solution?"
      ];
    }

    return result.options; // Return the options array
  } catch (error: any) { // Type 'any' for error caught
    console.error('Error generating question options:', error.message || error);
    // Updated fallback options for 3
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
