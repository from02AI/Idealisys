import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdvisorPersona, Question } from '../types';
import QuestionHeader from '../components/QuestionHeader';
import { generateQuestionOptions } from '../services/openai';
import LoadingSpinner from '../components/LoadingSpinner';

interface Q4scrProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

interface CardDeckProps {
  cards: string[];
  onAccept: (index: number) => void;
  onTweak: (index: number) => void;
}

const CardDeck: React.FC<CardDeckProps> = ({ cards, onAccept, onTweak }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full relative bg-white rounded-[14px] p-3 pl-4 mb-3 h-[96px] flex items-start transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <p className="text-[15px] text-[#21242B] leading-relaxed line-clamp-3 animate-fade-in font-medium flex-grow">
          {cards[currentIndex]}
        </p>
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrev}>←</Button>
        {cards.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 w-2 rounded-full ${currentIndex === idx ? 'bg-[#7C5CFF]' : 'bg-gray-300'}`}
          />
        ))}
        <Button variant="outline" size="sm" onClick={handleNext}>→</Button>
      </div>

      <div className="flex justify-center space-x-3 w-full">
        <Button
          onClick={() => onAccept(currentIndex)}
          variant="outline"
          className="flex-1 border-[#7C5CFF] text-[#7C5CFF] hover:bg-[#7C5CFF] hover:text-white rounded-[16px] px-4 text-sm"
        >
          Accept
        </Button>
        <Button
          onClick={() => onTweak(currentIndex)}
          variant="outline"
          className="flex-1 border-[#7C5CFF] text-[#7C5CFF] hover:bg-[#7C5CFF] hover:text-white rounded-[16px] px-4 text-sm"
        >
          Tweak
        </Button>
      </div>
    </div>
  );
};

const Q4scr: React.FC<Q4scrProps> = ({
  question,
  currentStep,
  totalSteps,
  advisor,
  userIdea,
  onAnswer,
  onBack,
}) => {
  const [aiFeatureBenefitOptions, setAiFeatureBenefitOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [manualText, setManualText] = useState('');

  const manualTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const generatedOptions = await generateQuestionOptions(userIdea);
        setAiFeatureBenefitOptions(generatedOptions);
      } catch (error) {
        console.error('Error loading AI feature/benefit options:', error);
        setAiFeatureBenefitOptions([
          "This is a placeholder feature/benefit statement 1.",
          "This is a placeholder feature/benefit statement 2.",
          "This is a placeholder feature/benefit statement 3.",
        ]);
      }
      setLoading(false);
    };

    loadOptions();
  }, [userIdea]);

  const handleAccept = (index: number) => {
    setSelectedCard(index);
    setManualText("");
  };

  const handleTweak = (index: number) => {
    setSelectedCard(null);
    setManualText(aiFeatureBenefitOptions[index]);
    if (manualTextareaRef.current) {
      manualTextareaRef.current.focus();
      manualTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleManualTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualText(e.target.value);
    if (selectedCard !== null) {
      setSelectedCard(null);
    }
  };

  const handleNext = () => {
    let featureBenefit: string;
    let isAIGenerated: boolean;

    if (selectedCard !== null) {
      featureBenefit = aiFeatureBenefitOptions[selectedCard];
      isAIGenerated = true;
    } else {
      featureBenefit = manualText.trim();
      isAIGenerated = false;
    }

    if (featureBenefit) {
      onAnswer(featureBenefit, isAIGenerated);
    }
  };

  const isReadyForNext =
    (selectedCard !== null) ||
    (manualText.trim().length >= 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-2 pb-4 px-4 overflow-hidden">
      <div className="max-w-2xl mx-auto flex flex-col h-full">
        <QuestionHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
        />
        
        <div className="mt-2 flex-grow overflow-y-auto hide-scrollbar">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-6 mb-6 text-center">
            {question.text}
          </h2>

          {loading ? (
            <LoadingSpinner message="Generating personalized options..." />
          ) : (
            <>
              <CardDeck
                cards={aiFeatureBenefitOptions}
                onAccept={handleAccept}
                onTweak={handleTweak}
              />

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 text-[12px]">or</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                <div className="space-y-2">
                  <textarea
                    ref={manualTextareaRef}
                    value={manualText}
                    onChange={handleManualTextChange}
                    placeholder="Type your custom response here... (e.g., a specific feature and its benefit)"
                    rows={2}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {manualText.length}/200 characters
                      {manualText.length > 0 && manualText.length < 20 && " (needs more detail)"}
                      {manualText.length > 150 && manualText.length <= 200 && " (keep concise)"}
                    </span>
                  </div>
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
                      <strong>Tip:</strong> Think about what sets your idea apart and the value it provides.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-auto pt-4 pb-2 text-center flex-shrink-0">
          <Button
            onClick={handleNext}
            disabled={!isReadyForNext}
            className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-[22px] font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-120 ease-in-out border-0 mt-3.5"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Q4scr; 