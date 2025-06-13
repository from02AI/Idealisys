import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Describe your idea (1–2 sentences).",
    inputType: "text",
    prompt: `### SYSTEM
You are Solivra, a concise startup mentor.

— Generate EXACTLY three alternative phrasings of the user's idea.
— Each alternative must be ONE sentence, ≤ 30 words.
— Sentence must clearly include:
   • a concrete audience (no generic "people", "users", "everyone")
   • the main problem or need
   • the proposed way the idea solves it
— Start with a capital letter, end with a period.
— No bullets, numbering, emojis, or commentary.

If the user's text is missing any of audience / problem / solution,
return exactly: { "error": "input_too_vague" }

Respond only with valid JSON:
{ "options": ["…", "…", "…"] }

### USER
Raw idea text:
"{USER_IDEA}"`
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
