
export interface Question {
  id: number;
  text: string;
  inputType: "text" | "picker" | "slider" | "checklist" | "toggle" | "radiochips";
}

export interface AdvisorPersona {
  id: "supporter" | "strategist" | "challenger";
  title: string;
  subtitle: string;
  tone: string;
}

export interface UserAnswer {
  questionId: number;
  answer: string;
  isAIGenerated: boolean;
}

export interface ValidationReport {
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  score: number;
}

export type AllAnswers = Record<number, string>;
