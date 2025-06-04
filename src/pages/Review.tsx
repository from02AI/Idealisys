
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserAnswer } from '../types';
import { questions } from '../data/questions';

interface ReviewProps {
  answers: Record<number, string>;
  onEdit: (questionId: number) => void;
  onGenerateReport: () => void;
  onBack: () => void;
}

const Review: React.FC<ReviewProps> = ({ answers, onEdit, onGenerateReport, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
        </div>

        <div className="animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Review Your Responses
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Take a moment to review your answers before generating your personalized validation report.
          </p>

          <div className="space-y-6 mb-12">
            {questions.map((question) => (
              <Card key={question.id} className="p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-indigo-700 pr-4">
                    {question.text}
                  </h3>
                  <Button
                    onClick={() => onEdit(question.id)}
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {answers[question.id] || 'No answer provided'}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={onGenerateReport}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold"
            >
              Generate My Validation Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
