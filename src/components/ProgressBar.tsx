import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  // Define step labels for better context
  const stepLabels = [
    "Describe Idea",
    "Target Audience", 
    "Problem Definition",
    "Solution Approach",
    "Alternatives",
    "Unique Value",
    "User Validation",
    "Next Steps"
  ];

  return (
    <div className="w-full">
      {/* Header with step info */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-sm font-semibold text-gray-800">
            Step {currentStep} of {totalSteps}
          </span>
          <p className="text-xs text-gray-600 mt-0.5">
            {stepLabels[currentStep - 1] || "Question"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-indigo-600">
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
        <div 
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-indigo-500 shadow-sm'
                  : isCurrent
                  ? 'bg-indigo-400 ring-2 ring-indigo-200 ring-offset-1'
                  : 'bg-gray-300'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
