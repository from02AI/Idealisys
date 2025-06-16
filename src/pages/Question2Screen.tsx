
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdvisorPersona } from '../types';

interface Question2ScreenProps {
  currentStep: number;
  totalSteps: number;
  advisor: AdvisorPersona;
  userIdea: string;
  onAnswer: (answer: string, isAIGenerated: boolean) => void;
  onBack: () => void;
}

const Question2Screen: React.FC<Question2ScreenProps> = ({
  currentStep,
  totalSteps,
  advisor,
  userIdea,
  onAnswer,
  onBack,
}) => {
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [customAudience, setCustomAudience] = useState('');

  const audienceOptions = {
    1: {
      text: "Freelance UX designers, aged 25-40 in global tech hubs, juggle overlapping sprint deadlines."
    },
    2: {
      text: "Remote technical writers, 30-50, balancing article due-dates across publications."
    },
    3: {
      text: "Startup software engineers, 24-35, managing tight release cycles, need a unified deadline view."
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  const handleChooseThis = () => {
    setSelectedCard(selectedTab);
    setCustomAudience(''); // Clear textarea when card is selected
  };

  const handleClear = () => {
    setSelectedCard(null);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomAudience(e.target.value);
    if (e.target.value.length > 0) {
      setSelectedCard(null); // Auto-unselect card when typing
    }
  };

  const handleNext = () => {
    if (selectedCard) {
      const selectedOption = audienceOptions[selectedCard as keyof typeof audienceOptions];
      onAnswer(selectedOption.text, true);
    } else if (customAudience.length >= 10) {
      onAnswer(customAudience, false);
    }
  };

  const isNextEnabled = selectedCard !== null || customAudience.length >= 10;

  return (
    <div className="min-h-screen bg-white font-inter w-[375px] mx-auto overflow-hidden">
      {/* Fixed Header - 48px height */}
      <div className="h-12 flex items-center justify-between px-5">
        <button onClick={onBack} className="p-1 active:scale-95 transition-transform">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {currentStep} / {totalSteps}
        </span>
      </div>
      
      {/* Progress Bar - 4px below header */}
      <div className="w-full bg-gray-200 h-1">
        <div 
          className="bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] h-1 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content with side padding */}
      <div className="px-5">
        {/* Title - 16px top margin */}
        <h2 className="text-[20px] font-semibold text-[#181A1F] text-center mt-4 mb-4">
          Who exactly is this idea for?
        </h2>

        {/* Segmented Control - 32px height */}
        <div className="bg-[#EFF0F6] rounded-[16px] p-1 mb-4 h-[32px] flex items-center">
          <div className="flex w-full relative">
            {/* Active segment background */}
            <div 
              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] rounded-[16px] transition-all duration-[140ms] ease-out"
              style={{ transform: `translateX(${(selectedTab - 1) * 100}%)` }}
            />
            
            {[1, 2, 3].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 h-full rounded-[16px] flex items-center justify-center text-[15px] font-medium transition-all duration-[140ms] ease-out relative z-10 ${
                  selectedTab === tab
                    ? 'text-white font-bold'
                    : 'text-[#6B7280]'
                }`}
              >
                {tab === 1 ? '①' : tab === 2 ? '②' : '③'}
              </button>
            ))}
          </div>
        </div>

        {/* Card Container - Fixed 96px height, no icon, 16px left padding */}
        <div 
          className={`bg-white rounded-[14px] p-3 pl-4 mb-3 h-[96px] flex items-start transition-all duration-200 ${
            selectedCard === selectedTab ? 'ring-2 ring-[#7C5CFF]' : ''
          }`}
          style={{ 
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}
        >
          <div className="flex items-start w-full">
            <p 
              key={`text-${selectedTab}`}
              className="text-[15px] text-[#21242B] leading-relaxed line-clamp-3 animate-fade-in font-medium"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {audienceOptions[selectedTab as keyof typeof audienceOptions].text}
            </p>
          </div>
        </div>

        {/* Centered CTA Row with fixed width button */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-full flex justify-center">
            <Button
              onClick={handleChooseThis}
              variant="outline"
              className="w-[160px] h-[42px] border-[#7C5CFF] text-[#7C5CFF] hover:bg-[#7C5CFF] hover:text-white rounded-[16px] px-4 text-sm"
            >
              Choose this
            </Button>
          </div>
          
          {selectedCard && (
            <button
              onClick={handleClear}
              className="text-[12px] text-[#6B7280] hover:text-[#7C5CFF] transition-colors absolute right-5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Divider "or" line */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#6B7280] text-[12px]">or</span>
          </div>
        </div>

        {/* Textarea - Fixed 80px height */}
        <div className="space-y-1">
          <Textarea
            value={customAudience}
            onChange={handleTextareaChange}
            placeholder="e.g. Busy sales reps in EU SaaS startups"
            className="h-[80px] text-[15px] border-gray-200 rounded-[14px] resize-none font-medium"
            maxLength={100}
          />
          
          {/* Tip Box - below textarea, above character counter */}
          <div className="text-center mt-1.5">
            <p className="text-[12px] text-[#6B7280]">
              💡 Tip: Include role, age range, and the key need.
            </p>
          </div>
          
          {/* Character Counter */}
          <div className="text-right">
            <span className="text-[12px] text-[#6B7280]">
              {customAudience.length}/100
            </span>
          </div>
        </div>

        {/* Primary Button */}
        <Button
          onClick={handleNext}
          disabled={!isNextEnabled}
          className="w-full h-[42px] bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] hover:from-[#6B4CFF] hover:to-[#5340FF] text-white rounded-[22px] font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-120 ease-in-out border-0 mt-3.5"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Question2Screen;
