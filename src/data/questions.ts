import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Describe your idea",
    inputType: "text",
  },
  {
    id: 2,
    text: "Who exactly is this idea for?",
    inputType: "picker",
  },
  {
    id: 3,
    text: "What problem does it solve?",
    inputType: "slider",
  },
  {
    id: 4,
    text: "How does your idea solve it?",
    inputType: "text",
  },
  {
    id: 5,
    text: "What alternatives exist?",
    inputType: "checklist",
  },
  {
    id: 6,
    text: "What makes it better?",
    inputType: "text",
  },
  {
    id: 7,
    text: "Talked to users? (Y/N + note)",
    inputType: "toggle",
  },
  {
    id: 8,
    text: "What doubts remain?",
    inputType: "text",
  },
];

export const getQuestionById = (id: number): Question | undefined => {
  return QUESTIONS.find(q => q.id === id);
};
