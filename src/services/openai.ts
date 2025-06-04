
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateQuestionOptions(
  userIdea: string,
  persona: string,
  questionPrompt: string
): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    // Return mock data if no API key
    return [
      "Option 1: Mock suggestion for testing",
      "Option 2: Another mock suggestion",
      "Option 3: Third mock suggestion",
      "Option 4: Fourth mock suggestion"
    ];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are ${persona}. ${questionPrompt} 
            
            Return exactly 4 options as a JSON array of strings. Each option should be concise (1-2 sentences max) and reflect your persona's tone. 
            
            User's idea: "${userIdea}"
            
            Format your response as a valid JSON array: ["option 1", "option 2", "option 3", "option 4"]`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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

    // Parse the JSON response
    const options = JSON.parse(content);
    
    if (!Array.isArray(options) || options.length !== 4) {
      throw new Error('Invalid response format from OpenAI');
    }

    return options;
  } catch (error) {
    console.error('Error generating question options:', error);
    // Return fallback options
    return [
      "Let's explore this aspect of your idea",
      "Consider this important factor",
      "This could be a key element",
      "Think about this perspective"
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
  if (!OPENAI_API_KEY) {
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
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
