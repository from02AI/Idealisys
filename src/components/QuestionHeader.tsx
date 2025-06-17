import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuestionHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
}) => {
  const navigate = useNavigate();
  const progress = (currentStep / totalSteps) * 100;

  return (
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
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default QuestionHeader; 