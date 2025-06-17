// No longer directly importing OpenAI or using environment variables for the API key in the frontend.
// All API key handling is now delegated to the backend endpoint.

// Helper function to send requests to your new serverless API
async function callOpenAIApi(messages: any[], options: Record<string, any> = {}): Promise<any> {
  const response = await fetch('/api/openai', { // Call your new serverless endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, ...options }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
    console.error('API call failed:', response.status, errorData);
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export async function generateQuestionOptions(userIdea: string): Promise<string[]> {
  console.log(`[Frontend] Requesting question options for idea: "${userIdea}"`);

  const messages = [
    {
      role: "system",
      content: "You are a creative assistant that generates concise, distinct 1-2 sentence options for a user's idea based on a single guiding question. Respond ONLY with a JSON array of strings, where each string is an option. Ensure options are distinct in phrasing and content. Example: [\"Option 1.\", \"Option 2.\", \"Option 3.\"]"
    },
    {
      role: "user",
      content: `User idea: "${userIdea}". Generate options for: "What problem does it solve?"`
    }
  ];

  try {
    const response = await callOpenAIApi(messages, {
      model: "gpt-3.5-turbo", // You can specify the model
      temperature: 0.7,
      response_format: { type: "json_object" }, // Request JSON object
    });

    // Assuming the backend sends back OpenAI's full response, and we need to parse its content
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.options || []; // Assuming the JSON structure is { "options": ["...", "...", "..."] }
  } catch (error) {
    console.error('Error generating question options:', error);
    // Fallback options if API fails
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
  console.log(`[Frontend] Requesting founder doubts for idea: "${idea}", audience: "${audience}", problem: "${problem}", solution: "${solution}"`);

  const messages = [
    {
      role: "system",
      content: "You are an expert advisor. Based on the provided idea, audience, problem, and solution, identify potential doubts or challenges a founder might face. Respond ONLY with a JSON array of strings, where each string is a concise doubt. Example: [\"Doubt 1?\", \"Doubt 2?\", \"Doubt 3?\"]"
    },
    {
      role: "user",
      content: `Idea: "${idea}"\nAudience: "${audience}"\nProblem: "${problem}"\nSolution: "${solution}".\nWhat are the top 3-5 doubts a founder should have about this business?`
    }
  ];

  try {
    const response = await callOpenAIApi(messages, {
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.options || []; // Assuming the JSON structure is { "options": ["...", "...", "..."] }
  } catch (error) {
    console.error('Error fetching founder doubts:', error);
    // Fallback options if API fails
    return [
      "Is the market large enough?",
      "Can we acquire users affordably?",
      "Will this really solve their core problem?",
      "What if a big player enters?",
      "Do we have the right team?",
    ];
  }
}
