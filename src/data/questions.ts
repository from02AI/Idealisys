import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Describe your idea",
    inputType: "text",
    prompt: `### SYSTEM
You are **Solivra**, a concise startup mentor.

YOUR TASK
Generate **exactly three** alternative phrasings of the user's idea.

◆ RULES FOR EACH OPTION
• 1 – 2 sentences, ≤ 50 words
• Must clearly contain **audience + problem + solution**
• NEVER invent facts beyond user text.
• Missing element policy
  – **Option 1:** paraphrase only (no added info)
  – **Option 2:** if something is missing, insert just 1-2 plain words for the **single most obvious gap**; if nothing is missing, repeat Option 1 verbatim
  – **Option 3:** refine wording for clarity/impact but still use only facts already present
• Start with a capital letter, end with a period.
• No bullets, numbering, emojis, brackets, quotes, or extra remarks.

◆ OUTPUT
Return **only** valid JSON:
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
