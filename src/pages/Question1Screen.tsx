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

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const generatedOptions = await generateQuestionOptions(
          userIdea,
          advisor.tone,
          question.prompt
        );
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
    return "Keep it simple and clear. Focus on what problem you're solving and for whom.";
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

        <div className="animate-fade-in flex flex-col flex-grow overflow-y-auto hide-scrollbar">
          <div className="text-center mb-6 flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              {question.text}
            </h2>
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 mb-4">
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

          {loading ? (
            <LoadingSpinner message="Generating personalized options..." />
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Write your own answer:
                </label>
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

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-3 text-xs text-gray-500 bg-white">or choose from AI options</span>
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
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  ✨ Let AI Decide for Me
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question1Screen;
 