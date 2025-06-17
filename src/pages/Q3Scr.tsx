import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { generateQuestionOptions } from '../services/openai';
import { Checkbox } from '@/components/ui/checkbox';

interface QuestionScreenProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const Q3scr: React.FC<QuestionScreenProps> = ({
  question,
  currentStep,
  totalSteps,
  advisor,
  userIdea,
  onAnswer,
  onBack
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const generatedOptions = await generateQuestionOptions(userIdea);
        setOptions(generatedOptions);
      } catch (error) {
        console.error('Error loading options:', error);
        // Fallback options will be set by the service if generateQuestionOptions handles it
      }
      setLoading(false);
    };

    loadOptions();
  }, [question, advisor, userIdea]);

  const handleSelectOption = (id: number) => {
    setSelectedId(id);
    // If an AI option is selected, clear custom text
    if (id !== 4) {
      setCustomText('');
    }
  };

  const handleSubmit = () => {
    let answerText: string;
    let isAIGenerated: boolean;

    if (selectedId === null) {
      return; // No option selected
    }

    if (selectedId !== 4) {
      // AI option selected
      answerText = options[selectedId - 1];
      isAIGenerated = true;
    } else {
      // Custom option selected (ID 4)
      answerText = customText.trim();
      isAIGenerated = false;
    }

    if (answerText) { // Ensure there's text to submit
      onAnswer(answerText, isAIGenerated);
    }
  };

  const getTipText = () => {
    switch (question.id) {
      case 1:
        return "1-2 sentences. Keep it simple and clear.";
      case 2:
        return "Think about who would benefit most from your solution. Be specific about demographics and needs.";
      case 3:
        return "Identify the core pain point. What frustration or inefficiency does your idea address?";
      case 4:
        return "Consider what sets you apart. What makes your approach different from existing solutions?";
      case 5:
        return "Think about your personal motivation. What drives your passion for this idea?";
      case 6:
        return "Be realistic about potential obstacles. Identifying challenges early helps you prepare.";
      case 7:
        return "It's normal to have uncertainties. Acknowledging them is the first step to addressing them.";
      default:
        return "Take your time to think through your response carefully.";
    }
  };

  // Logic for enabling the "Continue" button
  const isReadyForNext =
    (selectedId !== null && selectedId !== 4) || // An AI option is selected
    (selectedId === 4 && customText.trim().length > 0); // Custom option selected AND text is entered

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
          {question.text}
        </h2>

        <div className="animate-fade-in flex flex-col flex-grow overflow-y-auto hide-scrollbar">
          {loading ? (
            <LoadingSpinner message="Generating personalized options..." />
          ) : (
            <div className="space-y-3">
              {/* AI options (first 3) */}
              <div className="space-y-3">
                {options.slice(0, 3).map((option, index) => {
                  const id = index + 1; // Option ID: 1, 2, or 3
                  return (
                    <div key={id} className="relative">
                      <button
                        onClick={() => handleSelectOption(id)}
                        className={`w-full py-3 px-5 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
                          selectedId === id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedId === id}
                            className={`flex-shrink-0 mt-0.5 ${
                              selectedId === id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                            }`}
                          />
                          <p className={`text-gray-700 leading-relaxed ${
                            selectedId === id ? 'text-indigo-800 font-medium' : ''
                          }`}>
                            {option}
                          </p>
                        </div>
                      </button>
                    </div>
                  );
                })}

                {/* Fourth row for custom response */}
                <div key={4} className="relative">
                  <button
                    onClick={() => handleSelectOption(4)}
                    className={`w-full py-3 px-5 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
                      selectedId === 4
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedId === 4}
                        className={`flex-shrink-0 mt-0.5 ${
                          selectedId === 4 ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}
                      />
                      <p className={`text-gray-700 leading-relaxed ${
                        selectedId === 4 ? 'text-indigo-800 font-medium' : ''
                      }`}>
                        Write your own response here...
                      </p>
                    </div>
                  </button>
                  {selectedId === 4 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm mt-3">
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type your custom response here... (1-2 sentences recommended)"
                        rows={2}
                        maxLength={200}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {customText.length} characters / 200
                          {customText.length > 0 && customText.length < 20 && " (needs more detail)"}
                          {customText.length > 150 && customText.length <= 200 && " (keep concise)"}
                        </span>
                      </div>
                    </div>
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
                      <strong>Tip:</strong> {getTipText()}
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

export default Q3scr; 