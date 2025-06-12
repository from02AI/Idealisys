export interface Question {
  id: number;
  text: string;
  inputType: "text" | "picker" | "slider" | "checklist" | "toggle" | "radiochips";
  // Add other properties if your QuestionScreen will eventually use them
  // e.g., aiSuggestionsPrompt?: string; // If you centralize AI prompts
  // tipText?: string; // If you centralize tip texts
}

export interface AdvisorPersona {
  id: "supporter" | "strategist" | "challenger";
  title: string;
  subtitle: string;
  tone: string; // Used by openai service, e.g., "encouraging", "logical", "direct"
  // Add other properties as needed from your Welcome.tsx
}

// You might also have a type for the collected answers if you want strong typing
export type AllAnswers = Record<number, string>; // Maps question ID to its answer string 