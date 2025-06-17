import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { fetchFounderDoubts } from '../services/openai';
import { Checkbox } from '@/components/ui/checkbox';
import { sanitizeInput } from '../utils/validation';
import { handleAsyncError, ErrorLogger, createValidationError } from '../utils/errorHandling';

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

  const [aiDoubts, setAiDoubts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [kept, setKept] = useState<Set<number>>(new Set());
  const [showInput, setShowInput] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const errorLogger = ErrorLogger.getInstance();

  useEffect(() => {
    const loadDoubts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const audience = allAnswers[2] || "general audience";
        const problem = allAnswers[3] || "unspecified problem";
        const solution = allAnswers[4] || "unspecified solution";

        const sanitizedContext = {
          idea: sanitizeInput(userIdea, 500),
          audience: sanitizeInput(audience, 200),
          problem: sanitizeInput(problem, 300),
          solution: sanitizeInput(solution, 300)
        };

        const generatedDoubts = await handleAsyncError(
          () => fetchFounderDoubts(sanitizedContext),
          [
            "Is the market large enough to sustain this business?",
            "Do we have the technical resources to build this effectively?", 
            "Will users change their existing habits to adopt our solution?",
            "How will we compete against established players in this space?",
            "Are our core assumptions about the problem validated by real users?"
          ],
          'Failed to generate founder doubts'
        );
        
        setAiDoubts(generatedDoubts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        errorLogger.logError(
          err instanceof Error ? err : new Error('Unknown error in loadDoubts'),
          { userIdea, allAnswers }
        );
      }
      
      setLoading(false);
    };

    loadDoubts();
  }, [userIdea, allAnswers]);

  const toggleKeep = (index: number) => {
    if (index < 0 || index >= aiDoubts.length) {
      errorLogger.logError(createValidationError('index', 'Invalid doubt index'));
      return;
    }

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
    
    try {
      const sanitizedDraft = sanitizeInput(draft, 150);
      
      if (sanitizedDraft.length < 5) {
        setError('Doubt must be at least 5 characters long');
        return;
      }

      setAiDoubts(prevDoubts => {
        const newDoubts = [...prevDoubts, sanitizedDraft];
        setKept(prevKept => {
          const updatedKept = new Set(prevKept);
          updatedKept.add(newDoubts.length - 1);
          return updatedKept;
        });
        return newDoubts;
      });
      
      setDraft("");
      setShowInput(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid input';
      setError(errorMessage);
      errorLogger.logError(
        err instanceof Error ? err : new Error('Validation error in addDraft'),
        { draft }
      );
    }
  };

  const handleSubmit = () => {
    try {
      if (spoken === null) {
        setError('Please indicate whether you have talked to users');
        return;
      }

      if (kept.size < 1) {
        setError('Please select at least one doubt');
        return;
      }

      const selectedDoubts = Array.from(kept)
        .filter(index => index >= 0 && index < aiDoubts.length)
        .map(index => aiDoubts[index]);

      const sanitizedTakeaway = takeaway.trim() ? sanitizeInput(takeaway, 150) : "";

      const payload = {
        talked_to_users: spoken === "yes",
        interview_takeaway: spoken === "yes" ? sanitizedTakeaway : "",
        open_doubts: selectedDoubts,
      };

      onAnswer(JSON.stringify(payload), false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submission error';
      setError(errorMessage);
      errorLogger.logError(
        err instanceof Error ? err : new Error('Error in handleSubmit'),
        { spoken, takeaway: takeaway.slice(0, 50), selectedDoubts: kept.size }
      );
    }
  };

  // Validation rule
  const isReadyForNext = spoken !== null && kept.size >= 1;

  const handleTakeawayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setTakeaway(value);
      setError(null);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setDraft(value);
      setError(null);
    }
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
          Validation & doubts
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

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
              onChange={handleTakeawayChange}
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
                        onChange={handleDraftChange}
                        maxLength={150}
                        placeholder="Type your doubt, hit Enter"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </form>
                  )}
                </div>
              </div>
              <TipCard text="Direct = same job. Alternative = any substitute." />
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
