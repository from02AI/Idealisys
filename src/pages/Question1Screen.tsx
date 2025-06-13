import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnswerButton from '../components/AnswerButton';
import InsightCard from '../components/InsightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { generateQuestionOptions } from '../services/openai';
import { useNavigate } from 'react-router-dom';

interface QuestionScreenProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const Question1Screen: React.FC<QuestionScreenProps> = ({
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
  const [customAnswer, setCustomAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showAIValidationError, setShowAIValidationError] = useState(false);

  // 1. Calculate Validation Status
  const trimmedAnswer = customAnswer.trim();
  const wordCount = trimmedAnswer.split(/\s+/).filter(word => word !== '').length;
  const characterLength = trimmedAnswer.length;

  const isValidInput = characterLength >= 20 && wordCount >= 3;
  const validationMessage = "We need at least 20 characters and 3 words for AI generation.";

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        // Construct the screen-specific user prompt for Question 1
        const question1UserPrompt = `Raw idea text:\n"${userIdea}"`;

        const generatedOptions = await generateQuestionOptions(
          userIdea,
          question1UserPrompt // Pass the new screen-specific user prompt
        );
        setOptions(generatedOptions);
      } catch (error) {
        console.error('Error loading options:', error);
        // Fallback options will be set by the service
      }
      setLoading(false);
    };

    // Only load options if input is valid AND AI options are requested
    // This optimization prevents unnecessary AI calls if input is not ready
    if (isValidInput && showAIOptions) {
        loadOptions();
    } else if (!showAIOptions) {
        // Reset loading state if AI options are hidden
        setLoading(false);
    }

  }, [question, advisor, userIdea, isValidInput, showAIOptions]); // Added isValidInput and showAIOptions to dependencies

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setCustomAnswer('');
    onAnswer(option, true);
  };

  const handleAIDecide = async () => {
    if (isValidInput && options.length > 0) { // Ensure valid input before AI decide
      const randomOption = options[Math.floor(Math.random() * options.length)];
      setSelectedOption(randomOption);
      setCustomAnswer('');
      onAnswer(randomOption, true);
    }
  };

  const handleCustomSubmit = () => {
    // Submit button is independent of AI validation
    if (customAnswer.trim()) {
      setSelectedOption(null);
      onAnswer(customAnswer.trim(), false);
    }
  };

  const getTipText = () => {
    return "Keep it simple and clear. Focus on the problem you're solving and for whom.";
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-2 pb-4 px-4">
      <div className="max-w-2xl mx-auto flex flex-col h-full">
        <div className="mb-3 flex-shrink-0 relative">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/info')}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </Button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="animate-fade-in flex flex-col flex-grow overflow-y-auto hide-scrollbar">
          <div className="text-center mb-0 flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              {question.text}
            </h2>
          </div>

          {loading ? ( // Display loading spinner for initial options generation
            <LoadingSpinner message="Generating personalized options..." />
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 mb-0">
                <div className="space-y-2">
                  <textarea
                    maxLength={150}
                    value={customAnswer}
                    onChange={(e) => {
                      setCustomAnswer(e.target.value);
                      setShowAIValidationError(false);
                    }}
                    placeholder="Write your idea here. Use key words or 1-2 sentences"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                  />
                  {/* Character count always visible */}
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {customAnswer.length}/150
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 mt-0">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed text-left">
                      <strong>Tip:</strong> {getTipText()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center items-center mt-3">
                  {/* Submit button is always enabled */}
                  <Button
                    onClick={handleCustomSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Submit
                  </Button>
                </div>
              </div>

              {/* Conditional rendering for trigger or AI options */}
              {!showAIOptions ? (
                <div className="flex flex-col justify-center items-center my-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (isValidInput) {
                        setShowAIOptions(true);
                        setShowAIValidationError(false);
                      } else {
                        setShowAIValidationError(true);
                      }
                    }}
                    title={!isValidInput ? validationMessage : "Click to get AI suggestions"}
                    className="text-sm font-semibold text-gray-700 px-3 hover:text-indigo-600 hover:underline"
                  >
                    Solivra, I need your help
                  </Button>
                  {!isValidInput && showAIValidationError && (
                      <p className="text-center text-xs text-red-500 mt-2">
                          {validationMessage}
                      </p>
                  )}
                </div>
              ) : (
                <> {/* Fragment to group multiple elements */}
                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="px-3 text-sm font-semibold text-gray-700 bg-white">or choose from AI options</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="space-y-2">
                    {options.slice(0, 3).map((option, index) => (
                      <div key={index} className="relative">
                        <button
                          onClick={() => handleOptionSelect(option)}
                          className={`w-full py-2.5 px-5 text-left rounded-full border transition-all duration-200 hover:shadow-sm group ${
                            selectedOption === option
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm'
                              : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                              selectedOption === option
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-600 group-hover:bg-indigo-200 group-hover:text-indigo-700'
                            }`}>
                              {index + 1}
                            </div>
                            <p className={`text-gray-700 leading-relaxed ${
                              selectedOption === option ? 'text-indigo-800 font-medium' : ''
                            }`}>
                              {option}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center mt-3">
                    <Button
                      onClick={handleAIDecide}
                      variant="outline"
                      disabled={!isValidInput}
                      title={!isValidInput ? validationMessage : "Let AI generate a suggestion"}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      ✨ Solivra, please decide for Me
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question1Screen;
 