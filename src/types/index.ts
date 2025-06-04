
export interface AdvisorPersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tone: string;
}

export interface Question {
  id: number;
  text: string;
  prompt: string;
}

export interface UserAnswer {
  questionId: number;
  answer: string;
  isAIGenerated: boolean;
}

export interface ValidationReport {
  ideaSummary: string;
  strengths: string[];
  concerns: string[];
  insights: string;
  nextSteps: string;
}
