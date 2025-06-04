
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProgressBar from '../components/ProgressBar';
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
    switch (question.id) {
      case 1:
        return "Keep it simple and clear. Focus on what problem you're solving and for whom.";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {question.text}
          </h2>

          {loading ? (
            <LoadingSpinner message="Generating personalized options..." />
          ) : (
            <div className="space-y-4">
              {options.map((option, index) => (
                <AnswerButton
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  isSelected={selectedOption === option}
                >
                  {option}
                </AnswerButton>
              ))}

              <div className="pt-4">
                <Button
                  onClick={handleAIDecide}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700"
                >
                  Let AI Decide for Me
                </Button>
              </div>

              <div className="pt-6 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Or write your own answer:
                </label>
                <Input
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Type your custom response here..."
                  className="bg-gray-50 border-gray-200"
                />
                {customAnswer.trim() && (
                  <Button
                    onClick={handleCustomSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Continue with My Answer
                  </Button>
                )}
              </div>

              <div className="pt-6">
                <InsightCard>
                  {getTipText()}
                </InsightCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
