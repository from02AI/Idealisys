import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { generateQuestionOptions, fetchFounderDoubts } from '../services/openai'; // Updated import
import { Checkbox } from '@/components/ui/checkbox';

// Simple Heading component (could be a shared UI component)
const Heading: React.FC<{ level: 1 | 2 | 3 | 4 | 5 | 6; children: React.ReactNode }> = ({ level, children }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={`text-${level === 2 ? 'xl md:text-2xl' : 'lg'} font-bold text-gray-800 mb-4 text-center`}>{children}</Tag>;
};

// Simple SegmentTabs component (could be a shared UI component)
interface SegmentTabsProps {
  options: string[];
  value: "yes" | "no" | null;
  onChange: (value: "yes" | "no") => void;
}
const SegmentTabs: React.FC<SegmentTabsProps> = ({ options, value, onChange }) => (
  <div
    className="bg-gray-100 rounded-lg p-1 flex mb-6 shadow-sm"
    style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,.04)' }}
  >
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onChange(option === options[0] ? "no" : "yes")}
        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200
          ${value === (option === options[0] ? "no" : "yes")
            ? 'bg-indigo-600 text-white shadow'
            : 'text-gray-700 hover:bg-gray-200'
          }`}
      >
        {option}
      </button>
    ))}
  </div>
);

// Simple TipCard component (could be a shared UI component)
interface TipCardProps {
  text: string;
}
const TipCard: React.FC<TipCardProps> = ({ text }) => (
  <div className="max-w-md mx-auto mt-4 mb-6">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-blue-700 leading-relaxed text-left">
          <strong>Tip:</strong> {text}
        </p>
      </div>
    </div>
  </div>
);

// Simple Divider component (could be a shared UI component)
interface DividerProps {
  label: string;
}
const Divider: React.FC<DividerProps> = ({ label }) => (
  <div className="relative my-5">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-200"></div>
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-gray-500 text-[12px]">{label}</span>
    </div>
  </div>
);

// Simple CheckboxRow for Q6 (plain text label only, no subText or tag)
interface SimpleCheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const SimpleCheckboxRow: React.FC<SimpleCheckboxRowProps> = ({ label, checked, onChange }) => (
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
      />
      <p className={`text-gray-700 leading-relaxed ${
        checked ? 'text-indigo-800 font-medium' : ''
      }`}>
        {label}
      </p>
    </div>
  </button>
);


interface Q6scrProps { // Interface for this specific screen
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  allAnswers: Record<number, string>; // To get previous answers if needed for AI generation
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const Q6scr: React.FC<Q6scrProps> = ({
  question,
  currentStep,
  totalSteps,
  advisor,
  userIdea,
  allAnswers,
  onAnswer,
  onBack
}) => {
  // --- New state hooks ---
  const [spoken, setSpoken] = useState<"yes" | "no" | null>(null);
  const [takeaway, setTakeaway] = useState("");
  // -----------------------

  const [aiDoubts, setAiDoubts] = useState<string[]>([]); // Renamed from aiCompetitors, now holds strings
  const [loading, setLoading] = useState(true);
  const [kept, setKept] = useState<Set<number>>(new Set()); // Renamed from kept, still a Set of indices
  const [showInput, setShowInput] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const loadDoubts = async () => {
      setLoading(true);
      try {
        const audience = allAnswers[2] || "general audience"; // Get audience from Q2 answer
        const problem = allAnswers[3] || "unspecified problem"; // Get problem from Q3 answer
        const solution = allAnswers[4] || "unspecified solution"; // New: Get solution from Q4 answer

        // Use the new fetchFounderDoubts function
        const generatedDoubts = await fetchFounderDoubts({
          idea: userIdea,
          audience,
          problem,
          solution
        });
        setAiDoubts(generatedDoubts); // Assume fetchFounderDoubts returns string[]
      } catch (error) {
        console.error('Error loading doubt options:', error);
        // Fallback options
        setAiDoubts([
          "Is the market big enough?",
          "Can we build this with our current resources?",
          "Will users adopt a new habit?",
          "What if a large competitor enters the space?",
          "Are our assumptions about the problem correct?",
        ]);
      }
      setLoading(false);
    };

    loadDoubts();
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
      setAiDoubts(prevDoubts => {
        const newDoubts = [...prevDoubts, draft.trim()];
        setKept(prevKept => {
          const updatedKept = new Set(prevKept);
          updatedKept.add(newDoubts.length - 1); // Keep the newly added doubt
          return updatedKept;
        });
        return newDoubts;
      });
      setDraft("");
      setShowInput(false);
    }
  };

  const handleSubmit = () => {
    const selectedDoubts = Array.from(kept).map(index => aiDoubts[index]);
    
    // Submission payload as per prompt
    const payload = {
      talked_to_users: spoken === "yes",
      interview_takeaway: spoken === "yes" ? takeaway.trim() : "",
      open_doubts: selectedDoubts,
    };

    // Assuming onAnswer can now take an object or needs to be stringified
    onAnswer(JSON.stringify(payload), false); // Sending as non-AI generated since user input is involved
  };

  // Validation rule
  const isReadyForNext = spoken !== null && kept.size >= 1;

  const getTipText = () => {
    // Tip adjustment as per prompt
    return "Direct = same job. Alternative = any substitute."; // Keep this, or change if a new tip is desired for Q6
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
          Validation & doubts {/* Updated title */}
        </h2>

        <div className="animate-fade-in flex flex-col flex-grow overflow-y-auto hide-scrollbar">
          {/* NEW SECTION: Have you talked to users? */}
          <Heading level={2}>Have you talked to users about this?</Heading>

          <SegmentTabs
            options={["No, not yet", "Yes, I have"]}
            value={spoken}
            onChange={setSpoken}
          />

          {spoken === "yes" && (
            <Textarea
              value={takeaway}
              onChange={e => setTakeaway(e.target.value)}
              maxLength={150}
              placeholder="Key takeaway (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors mb-6"
            />
          )}

          {spoken === "no" && (
            <TipCard text="Even one short user chat can reveal blind spots." />
          )}
          {/* END NEW SECTION */}

          {loading ? (
            <LoadingSpinner message="Generating doubt options..." />
          ) : (
            <>
              <Divider label="What doubts still worry you?" />
              <div className="space-y-3">
                {aiDoubts.map((doubt, index) => (
                  <SimpleCheckboxRow
                    key={index}
                    label={doubt}
                    checked={kept.has(index)}
                    onChange={() => toggleKeep(index)}
                  />
                ))}
                <div className="text-center mt-4">
                  {!showInput ? (
                    <Button
                      onClick={() => setShowInput(true)}
                      variant="outline"
                      className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 px-6 py-2.5 text-sm font-medium transition-all duration-200"
                    >
                      ＋ Add your own doubt
                    </Button>
                  ) : (
                    <form onSubmit={addDraft} className="w-full">
                      <Input
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Type your doubt, hit Enter"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </form>
                  )}
                </div>
              </div>
              <div className="max-w-md mx-auto mt-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed text-left">
                      <strong>Tip:</strong> {getTipText()}
                    </p>
                  </div>
                </div>
              </div>
            </>
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

export default Q6scr; 