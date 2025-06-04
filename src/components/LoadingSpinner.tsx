
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 border-solid rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 text-center">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
