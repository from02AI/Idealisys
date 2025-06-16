
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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAudience, setCustomAudience] = useState('');

  const audienceOptions = {
    1: "🎯 Freelance UX designers, aged 25-40 in global tech hubs, juggle overlapping sprint deadlines.",
    2: "🚀 Remote technical writers, age 30-50, balancing article due-dates across publications.",
    3: "🔧 Startup software engineers, 24-35, managing tight release cycles, need a unified deadline view."
  };

  const progress = (currentStep / totalSteps) * 100;

  const handleChooseAudience = () => {
    onAnswer(audienceOptions[selectedTab as keyof typeof audienceOptions], true);
  };

  const handleCustomNext = () => {
    if (customAudience.length >= 10) {
      onAnswer(customAudience, false);
    }
  };

  const handleWriteMyOwn = () => {
    setShowCustomInput(true);
  };

  return (
    <div className="min-h-screen bg-white font-inter w-[375px] mx-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 max-w-[375px] mx-auto">
        <div className="h-12 flex items-center justify-between px-4">
          <button onClick={onBack} className="p-1 active:scale-95 transition-transform">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentStep} / {totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] h-1 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-4">
        {/* Title */}
        <h2 className="text-[20px] font-semibold text-[#181A1F] text-center mt-6 mb-6">
          Who exactly is this idea for?
        </h2>

        {!showCustomInput ? (
          <div className="transition-all duration-160 ease-in-out">
            {/* Segmented Control */}
            <div className="bg-[#F5F5F5] rounded-[24px] p-2 mb-6 h-[44px] flex items-center">
              <div className="flex w-full relative">
                {/* Active segment background */}
                <div 
                  className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] rounded-[20px] transition-all duration-120 ease-in-out"
                  style={{ transform: `translateX(${(selectedTab - 1) * 100}%)` }}
                />
                
                {[1, 2, 3].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-1 h-8 rounded-[20px] flex items-center justify-center text-[15px] font-medium transition-all duration-120 ease-in-out relative z-10 ${
                      selectedTab === tab
                        ? 'text-white font-bold'
                        : 'text-[#4B5563]'
                    }`}
                  >
                    {tab === 1 ? '①' : tab === 2 ? '②' : '③'}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Container */}
            <div 
              className="bg-white rounded-[16px] p-4 mb-6 h-[116px] flex items-start shadow-[0_2px_6px_rgba(0,0,0,0.08)] overflow-hidden"
              style={{ 
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              <div className="w-full">
                <p 
                  key={selectedTab}
                  className="text-[15px] text-[#21242B] leading-relaxed line-clamp-3 animate-fade-in font-medium"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {audienceOptions[selectedTab as keyof typeof audienceOptions]}
                </p>
              </div>
            </div>

            {/* Primary Button */}
            <Button
              onClick={handleChooseAudience}
              className="w-full h-[48px] bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] hover:from-[#6B4CFF] hover:to-[#5340FF] text-white rounded-[24px] font-medium mb-4 active:scale-[0.98] transition-all duration-120 ease-in-out border-0"
            >
              Choose this
            </Button>

            {/* Custom Input Toggle */}
            <div className="text-center">
              <button
                onClick={handleWriteMyOwn}
                className="text-[13px] text-[#7C5CFF] font-medium active:scale-95 transition-transform"
              >
                Write my own instead
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-slide-in-up">
            {/* Custom Text Area */}
            <div className="space-y-2">
              <Textarea
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                placeholder="Type your target audience… e.g. 'Busy sales reps in EU SaaS startups'"
                className="h-[116px] text-[15px] border-gray-200 rounded-[16px] resize-none font-medium"
                maxLength={100}
              />
              
              {/* Character Counter */}
              <div className="text-right">
                <span className="text-[13px] text-[#6B7280]">
                  {customAudience.length}/100
                </span>
              </div>
            </div>

            {/* Tip */}
            <p className="text-[13px] text-[#6B7280] mb-6 mt-2">
              Tip: include role, age range, and a short need.
            </p>

            {/* Next Button */}
            <Button
              onClick={handleCustomNext}
              disabled={customAudience.length < 10}
              className="w-full h-[48px] bg-gradient-to-r from-[#7C5CFF] to-[#624BFF] hover:from-[#6B4CFF] hover:to-[#5340FF] text-white rounded-[24px] font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-120 ease-in-out border-0"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Question2Screen;
