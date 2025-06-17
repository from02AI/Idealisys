import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnswerButton from '../components/AnswerButton';
import InsightCard from '../components/InsightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { generateQuestionOptions } from '../services/openai';
import { useNavigate } from 'react-router-dom';
import QuestionHeader from '../components/QuestionHeader';

interface QuestionScreenProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const Q1scr: React.FC<QuestionScreenProps> = ({
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
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showAIValidationError, setShowAIValidationError] = useState(false);

  // Helper function for semantic sanity check
  const looksLikeSentence = (txt: string) => {
    // Requires at least 3 letters, at least two words.
    // Removed strict sentence terminator requirement to allow more flexible input,
    // as suggested by user feedback that it worked before this change.
    return /[a-z]{3,}/i.test(txt) && /\w+\s+\w+/.test(txt);
  };

  // 1. Calculate Validation Status
  const trimmedAnswer = customAnswer.trim();
  const wordCount = trimmedAnswer.split(/\s+/).filter(word => word !== '').length;
  const characterLength = trimmedAnswer.length;

  // Initial combined validation state
  let currentIsValidInput = characterLength >= 20 && wordCount >= 3;
  let currentValidationMessage = "We need at least 20 characters and 3 words for AI generation.";

  // Add semantic validation for AI generation trigger
  // Only apply this specific message if primary length/word count are met, but sentence is not, or word count is too low
  if (currentIsValidInput && (!looksLikeSentence(trimmedAnswer) || wordCount < 4)) {
    currentIsValidInput = false;
    currentValidationMessage = "Please provide one clear sentence describing the problem and who has it.";
  }

  // Set the state variables based on the combined validation
  // TODO: REMOVE FOR PRODUCTION - This line is temporarily set to true for development/testing to bypass input validation.
  const isValidInputForAI = true; // Use this derived value in JSX
  const validationMessage = currentValidationMessage; // Use this derived value in JSX

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      console.log("Q1S: loadOptions - Starting API call to OpenAI...");
      try {
        const generatedOptions = await generateQuestionOptions(
          trimmedAnswer // Pass the actual user input from the textbox
        );
        setOptions(generatedOptions);
        console.log("Q1S: loadOptions - API call successful, options set:", generatedOptions);
      } catch (error) {
        console.error('Q1S: loadOptions - Error calling API:', error);
        // Fallback options will be set by the service, or we can set them here if the service returns null/undefined
        setOptions([
            "Error loading options: Try again or rephrase your idea.",
            "AI suggestions could not be generated at this time.",
            "Please ensure your internet connection is stable."
        ]);
      }
      setLoading(false);
      console.log("Q1S: loadOptions - Finished.");
    };

    // Logging the state directly before the conditional check
    console.log(`Q1S: useEffect run. State - trimmedAnswer:"${trimmedAnswer}" (len:${characterLength}, words:${wordCount}), isValidInputForAI:${isValidInputForAI}, showAIOptions:${showAIOptions}, loading:${loading}`);

    // This condition determines if the AI options are fetched
    if (isValidInputForAI && showAIOptions) {
        console.log("Q1S: useEffect - Conditions met: Fetching AI options.");
        loadOptions();
    } else if (!showAIOptions) {
        setLoading(false);
        console.log("Q1S: useEffect - AI options hidden, resetting loading state.");
        setOptions([]); // Clear options if AI section is hidden
    } else if (!isValidInputForAI) {
        console.log("Q1S: useEffect - Input not valid for AI, not fetching options.");
        setOptions([]); // Clear options if input becomes invalid
        setLoading(false); // Ensure loading is false
    }

  }, [trimmedAnswer, isValidInputForAI, showAIOptions]); // Dependencies

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setCustomAnswer('');
    onAnswer(option, true);
  };

  const handleAIDecide = async () => {
    // This button implies options are already loaded, or will be triggered by useEffect
    if (isValidInputForAI && options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      setSelectedOption(randomOption);
      setCustomAnswer('');
      onAnswer(randomOption, true);
    } else if (isValidInputForAI && !loading && options.length === 0) {
        // If valid but no options (e.g., first click or previous error), trigger fetch
        setShowAIOptions(true); // Ensure AI section is visible
        // The useEffect will pick this up and call loadOptions on next render
    } else {
        console.warn("Q1S: handleAIDecide - Attempted to click but input not valid or options not loaded.");
        // If for some reason button is clicked while isValidInputForAI is false, show error
        setShowAIValidationError(true);
    }
  };

  const handleCustomSubmit = () => {
    if (customAnswer.trim()) {
      setSelectedOption(null);
      onAnswer(customAnswer.trim(), false);
    }
  };

  const getTipText = () => {
    return "Keep it simple and clear. Focus on the problem, solution and audience.";
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-2 pb-4 px-4">
      <div className="max-w-2xl mx-auto flex flex-col h-full">
        <QuestionHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
        />

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
                      console.log("Q1S: 'Solivra, I need your help' button clicked.");
                      if (isValidInputForAI) {
                        setShowAIOptions(true);
                        setShowAIValidationError(false);
                      } else {
                        setShowAIValidationError(true);
                      }
                    }}
                    title={!isValidInputForAI ? validationMessage : "Click to get AI suggestions"}
                    className="text-sm font-semibold text-gray-700 px-3 hover:text-indigo-600 hover:underline"
                  >
                    Solivra, I need your help
                  </Button>
                  {!isValidInputForAI && showAIValidationError && (
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
                    {/* Render AI options or fallback */}
                    {options.length > 0 ? (
                        options.slice(0, 3).map((option, index) => (
                            <div key={index} className="relative">
                                <button
                                  onClick={() => handleOptionSelect(option)}
                                  className={`w-full py-2.5 px-5 text-left rounded-full border transition-all duration-200 hover:shadow-sm group ${
                                    selectedOption === option
                                      ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm'
                                      : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                                  }`}
                                >
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
                                </button>
                            </div>
                        ))
                    ) : (
                        // Placeholder if options are empty
                        <p className="text-center text-gray-500 text-sm italic">
                            No AI suggestions available. Try rephrasing your idea.
                        </p>
                    )}
                  </div>
                  
                  <div className="text-center mt-3">
                    <Button
                      onClick={handleAIDecide}
                      variant="outline"
                      disabled={!isValidInputForAI}
                      title={!isValidInputForAI ? validationMessage : "Let AI generate a suggestion"}
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

export default Q1scr;
 