
import React from 'react';
import { Card } from '@/components/ui/card';

interface InsightCardProps {
  children: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ children }) => {
  return (
    <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="text-sm text-gray-700 italic leading-relaxed">
          <strong className="text-yellow-700">Tip:</strong> {children}
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;
