
import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 1,
    text: "What is your idea in one or two sentences?",
    prompt: "Based on the user's idea description, provide 4 different ways to articulate or refine their core concept. Each option should be clear, concise, and capture the essence of their idea from a slightly different angle."
  },
  {
    id: 2,
    text: "Who is the ideal target audience for this idea?",
    prompt: "Based on the user's idea, suggest 4 potential target audiences. Consider demographics, psychographics, industry sectors, or user behaviors that would most benefit from this solution."
  },
  {
    id: 3,
    text: "What core problem does this idea solve?",
    prompt: "Identify 4 different core problems this idea could address. Think about pain points, inefficiencies, unmet needs, or market gaps that this solution tackles."
  },
  {
    id: 4,
    text: "What makes this idea unique or different?",
    prompt: "Suggest 4 potential unique value propositions or differentiators for this idea. Consider innovative approaches, unique features, market positioning, or competitive advantages."
  },
  {
    id: 5,
    text: "What excites you most about building this?",
    prompt: "Provide 4 motivational aspects that could drive someone to build this idea. Think about personal fulfillment, impact potential, learning opportunities, or market opportunities."
  },
  {
    id: 6,
    text: "What potential challenges or obstacles do you foresee?",
    prompt: "Identify 4 realistic challenges or obstacles this idea might face. Consider technical hurdles, market barriers, resource constraints, or competitive threats."
  },
  {
    id: 7,
    text: "What are you most unsure about right now?",
    prompt: "Suggest 4 common areas of uncertainty for this type of idea. Think about market validation, technical feasibility, business model, or execution concerns."
  }
];
