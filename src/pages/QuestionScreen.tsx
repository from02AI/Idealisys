import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnswerButton from '../components/AnswerButton';
import InsightCard from '../components/InsightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Question, AdvisorPersona } from '../types';
import { generateQuestionOptions } from '../services/openai';

interface QuestionScreenProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
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

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const generatedOptions = await generateQuestionOptions(userIdea);
        setOptions(generatedOptions);
      } catch (error) {
        console.error('Error loading options:', error);
        // Fallback options will be set by the service
      }
      setLoading(false);
    };

    loadOptions();
  }, [question, advisor, userIdea]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setCustomAnswer('');
    onAnswer(option, true);
  };

  const handleAIDecide = async () => {
    if (options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      setSelectedOption(randomOption);
      setCustomAnswer('');
      onAnswer(randomOption, true);
    }
  };

  const handleCustomSubmit = () => {
    if (customAnswer.trim()) {
      setSelectedOption(null);
      onAnswer(customAnswer.trim(), false);
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
              {/* AI options first - more prominent */}
              <div className="space-y-3 mb-5">
                {options.slice(0, 3).map((option, index) => (
                  <div key={index} className="relative">
                    <button
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full py-3 px-5 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
                        selectedOption === option
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
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
                
                <div className="text-center mt-3">
                  <Button
                    onClick={handleAIDecide}
                    variant="outline"
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 px-6 py-2.5 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 w-full md:w-auto"
                  >
                    ✨ Let AI Decide for Me
                  </Button>
                </div>
              </div>

              <div className="flex items-center my-5">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-3 text-xs text-gray-500 bg-white">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Custom answer section - secondary option */}
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                <div className="space-y-2">
                  <textarea
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Type your custom response here... (1-2 sentences recommended)"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {customAnswer.length} characters
                      {customAnswer.length > 0 && customAnswer.length < 20 && " (needs more detail)"}
                      {customAnswer.length > 150 && " (keep concise)"}
                    </span>
                    {customAnswer.trim() && (
                      <Button
                        onClick={handleCustomSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Continue with My Answer →
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Moved Tip element to below the custom answer box */}
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
      </div>
    </div>
  );
};

export default QuestionScreen;
