import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { generateQuestionOptions } from '../services/openai';
import { Checkbox } from '@/components/ui/checkbox';

// Define the structure for competitor options
interface CompetitorOption {
  name: string;
  angle: 'direct' | 'adjacent' | 'diy' | 'premium' | 'statusquo';
}

// Define the Angle copy for display
const angleCopy: { [key in CompetitorOption['angle']]: string } = {
  direct: "Direct: addresses the same need with a similar solution.",
  adjacent: "Adjacent: solves a related problem or serves a similar audience.",
  diy: "DIY: users' current workaround or manual process.",
  premium: "Premium: high-end, expensive alternative.",
  statusquo: "Status Quo: the way things are done currently without a specific tool."
};

// Define a simple CheckboxRow component (can be extracted to its own file later)
interface CheckboxRowProps {
  label: string;
  subText: string;
  tag: CompetitorOption['angle'];
  checked: boolean;
  onChange: () => void;
}

const CheckboxRow: React.FC<CheckboxRowProps> = ({ label, subText, tag, checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-full py-3 px-5 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
      checked
        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
        : 'bg-white border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
    }`}
  >
    <div className="flex items-start space-x-3">
      <Checkbox
        checked={checked}
        className={`flex-shrink-0 mt-0.5 ${
          checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
        }`}
        // onCheckedChange handled by parent button click
      />
      <div className="flex flex-col">
        <p className={`text-gray-700 leading-relaxed ${
          checked ? 'text-indigo-800 font-medium' : ''
        }`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-1">{subText}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block
          ${tag === 'direct' ? 'bg-green-100 text-green-800' : ''}
          ${tag === 'adjacent' ? 'bg-blue-100 text-blue-800' : ''}
          ${tag === 'diy' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${tag === 'premium' ? 'bg-purple-100 text-purple-800' : ''}
          ${tag === 'statusquo' ? 'bg-gray-100 text-gray-800' : ''}
        `}>
          {tag.toUpperCase()}
        </span>
      </div>
    </div>
  </button>
);

interface Q5scrProps { // Renamed interface for this specific screen
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string; // Answer to Q1
  allAnswers: Record<number, string>; // New prop to access answers for Q2 (audience) and Q3 (problem)
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const Q5scr: React.FC<Q5scrProps> = ({
  question,
  currentStep,
  totalSteps,
  advisor,
  userIdea,
  allAnswers, // Destructure new prop
  onAnswer,
  onBack
}) => {
  const [aiCompetitors, setAiCompetitors] = useState<CompetitorOption[]>([]); // Renamed from options
  const [loading, setLoading] = useState(true);
  const [kept, setKept] = useState<Set<number>>(new Set()); // Renamed from selectedId, now a Set of indices
  const [showInput, setShowInput] = useState(false); // New state for custom competitor input
  const [draft, setDraft] = useState(''); // New state for custom competitor text

  useEffect(() => {
    const loadCompetitors = async () => {
      setLoading(true);
      try {
        const audience = allAnswers[2] || "general audience"; // Get audience from Q2 answer
        const problem = allAnswers[3] || "unspecified problem"; // Get problem from Q3 answer

        // Mock fetchCompetitors as it's not defined in services/openai yet
        // In a real scenario, you'd replace this with an actual API call:
        // const generatedCompetitors = await fetchCompetitors({ idea: userIdea, audience, problem });
        
        // Placeholder for generated competitors
        const generatedCompetitors: CompetitorOption[] = [
          { name: "Competitor AI (Direct)", angle: "direct" },
          { name: "Manual Task Management (DIY)", angle: "diy" },
          { name: "High-End Consulting (Premium)", angle: "premium" },
          { name: "Existing Market Solution (Direct)", angle: "direct" },
          { name: "General Productivity Tool (Adjacent)", angle: "adjacent" },
        ];

        setAiCompetitors(generatedCompetitors);
      } catch (error) {
        console.error('Error loading competitor options:', error);
        // Fallback options
        setAiCompetitors([
          { name: "Google Docs (DIY)", angle: "diy" },
          { name: "Trello (Direct)", angle: "direct" },
          { name: "Asana (Direct)", angle: "direct" },
          { name: "Internal Email Chains (Status Quo)", angle: "statusquo" },
        ]);
      }
      setLoading(false);
    };

    loadCompetitors();
  }, [userIdea, allAnswers]); // Re-fetch if userIdea or previous answers change

  const toggleKeep = (index: number) => {
    setKept(prevKept => {
      const newKept = new Set(prevKept);
      if (newKept.has(index)) {
        newKept.delete(index);
      } else {
        newKept.add(index);
      }
      return newKept;
    });
  };

  const addDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.trim()) {
      setAiCompetitors(prevCompetitors => {
        const newCompetitors = [...prevCompetitors, { name: draft.trim(), angle: "direct" as const }];
        // Automatically keep the newly added competitor
        setKept(prevKept => {
          const updatedKept = new Set(prevKept);
          updatedKept.add(newCompetitors.length - 1);
          return updatedKept;
        });
        return newCompetitors;
      });
      setDraft("");
      setShowInput(false);
    }
  };

  const handleSubmit = () => {
    const selectedCompetitors = Array.from(kept).map(index => aiCompetitors[index]);
    
    if (selectedCompetitors.length > 0) {
      // The prompt suggests `saveAnswer({ competitors: ... })`.
      // We'll call onAnswer with a string representation for now, or adapt if onAnswer accepts objects.
      // Assuming onAnswer is for a single string, we'll stringify or adjust the parent component.
      // If `onAnswer` expects a string, you might need to decide how to represent multiple selected competitors.
      // For now, let's just pass the string representation of selected competitors.
      onAnswer(JSON.stringify({ competitors: selectedCompetitors }), false); // Consider this is not AI generated if user chose/modified
    }
  };

  // Validation rule
  const isReadyForNext =
    kept.size >= 3 && Array.from(kept).filter(i => aiCompetitors[i].angle === "direct").length >= 2;

  const getTipText = () => {
    // Tip adjustment as per prompt
    return "Direct = same job. Alternative = any substitute.";
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-2 pb-4 px-4">
      <div className="max-w-2xl mx-auto flex flex-col h-full">
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2"
            >
              ← Back
            </Button>
            <div className="text-right">
              <span className="text-sm font-medium text-indigo-600">
                {currentStep}/{totalSteps}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-6 mb-6 text-center">
          Who (or what) do users turn to instead? {/* Updated title */}
        </h2>

        <div className="animate-fade-in flex flex-col flex-grow overflow-y-auto hide-scrollbar">
          {loading ? (
            <LoadingSpinner message="Generating competitor options..." />
          ) : (
            <div className="space-y-3">
              {/* Render competitor rows */}
              <div className="space-y-3">
                {aiCompetitors.map((item, index) => (
                  <CheckboxRow
                    key={index}
                    label={item.name}
                    subText={angleCopy[item.angle]}
                    tag={item.angle}
                    checked={kept.has(index)}
                    onChange={() => toggleKeep(index)}
                  />
                ))}

                {/* Add "＋ Add competitor" button & input */}
                <div className="text-center mt-4">
                  {!showInput ? (
                    <Button
                      onClick={() => setShowInput(true)}
                      variant="outline"
                      className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 px-6 py-2.5 text-sm font-medium transition-all duration-200"
                    >
                      ＋ Add competitor
                    </Button>
                  ) : (
                    <form onSubmit={addDraft} className="w-full">
                      <Input
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Type name, hit Enter"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                      {/* You might want a cancel button here as well */}
                    </form>
                  )}
                </div>
              </div>

              {/* Tip element */}
              <div className="max-w-md mx-auto mt-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed text-left">
                      <strong>Tip:</strong> {getTipText()} {/* Updated tip text */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-auto pt-4 pb-2 text-center flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!isReadyForNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Q5scr; 