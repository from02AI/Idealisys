import { AdvisorPersona } from '../types';

export const ADVISOR_PERSONAS: AdvisorPersona[] = [
  {
    id: 'supporter',
    title: 'The Supporter',
    subtitle: 'Warm, encouraging voice',
    tone: 'encouraging',
  },
  {
    id: 'strategist',
    title: 'The Strategist',
    subtitle: 'Balanced, logical guide',
    tone: 'logical',
  },
  {
    id: 'challenger',
    title: 'The Challenger',
    subtitle: 'Direct, analytical thinker',
    tone: 'direct',
  },
];

export const getAdvisorById = (id: AdvisorPersona['id']): AdvisorPersona | undefined => {
  return ADVISOR_PERSONAS.find(a => a.id === id);
};
