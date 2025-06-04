
import React from 'react';
import { Button } from '@/components/ui/button';

interface AnswerButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isSelected?: boolean;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({ children, onClick, isSelected = false }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={`w-full p-4 h-auto text-left whitespace-normal transition-all duration-200 ${
        isSelected 
          ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
          : 'bg-white border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
      }`}
    >
      {children}
    </Button>
  );
};

export default AnswerButton;
