
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
    1: "Freelance UX designers, aged 25-40 in global tech hubs, juggle overlapping sprint deadlines.",
    2: "Remote technical writers in their 30s struggle to track multiple article due-dates across publications.",
    3: "Startup software engineers, 24-35, managing tight release cycles, need a unified deadline view."
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
    <div className="min-h-screen bg-white font-inter">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="h-12 flex items-center justify-between px-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentStep} / {totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-[#6B5CFF] h-1 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-4">
        {/* Title */}
        <h2 className="text-xl font-semibold text-[#181A1F] text-center mt-6 mb-4">
          Who exactly is this idea for?
        </h2>

        {!showCustomInput ? (
          <>
            {/* Segmented Control */}
            <div className="bg-[#ECEEF7] rounded-[20px] p-1 mb-4">
              <div className="flex">
                {[1, 2, 3].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-1 h-10 rounded-[18px] flex items-center justify-center text-sm font-medium transition-all duration-120 ease-in-out ${
                      selectedTab === tab
                        ? 'bg-[#6B5CFF] text-white'
                        : 'text-[#4B5563]'
                    }`}
                  >
                    {tab === 1 ? '①' : tab === 2 ? '②' : '③'}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 h-28 flex items-center">
              <p 
                key={selectedTab}
                className="text-sm text-[#21242B] leading-relaxed line-clamp-3 animate-fade-in"
              >
                {audienceOptions[selectedTab as keyof typeof audienceOptions]}
              </p>
            </div>

            {/* Choose Button */}
            <Button
              onClick={handleChooseAudience}
              className="w-full h-12 bg-[#6B5CFF] hover:bg-[#5B4CFF] text-white rounded-xl font-medium mb-4"
            >
              Choose this
            </Button>

            {/* Custom Input Toggle */}
            <div className="text-center">
              <button
                onClick={handleWriteMyOwn}
                className="text-sm text-[#6B5CFF] font-medium"
              >
                Write my own instead
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Custom Text Area */}
            <div className="space-y-2">
              <Textarea
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                placeholder="Type your target audience… e.g. 'Busy sales reps in EU SaaS startups'"
                className="h-24 text-sm border-gray-200 rounded-xl resize-none"
                maxLength={100}
              />
              
              {/* Character Counter */}
              <div className="text-right">
                <span className="text-xs text-[#6B7280]">
                  {customAudience.length}/100
                </span>
              </div>
            </div>

            {/* Tip */}
            <p className="text-xs text-[#6B7280] mb-4">
              Tip: include role, age range, and a short need.
            </p>

            {/* Next Button */}
            <Button
              onClick={handleCustomNext}
              disabled={customAudience.length < 10}
              className="w-full h-12 bg-[#6B5CFF] hover:bg-[#5B4CFF] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Question2Screen;
