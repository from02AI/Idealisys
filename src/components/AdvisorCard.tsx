
import React from 'react';
import { AdvisorPersona } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AdvisorCardProps {
  advisor: AdvisorPersona;
  onSelect: (advisor: AdvisorPersona) => void;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, onSelect }) => {
  const getAvatarIcon = (advisorId: string) => {
    switch (advisorId) {
      case 'supporter':
        return (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case 'strategist':
        return (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        );
      case 'challenger':
        return (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      {getAvatarIcon(advisor.id)}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{advisor.name}</h3>
      <p className="text-gray-600 mb-4 text-sm">{advisor.tagline}</p>
      <p className="text-gray-500 text-xs mb-6 leading-relaxed">{advisor.description}</p>
      <Button 
        onClick={() => onSelect(advisor)}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200"
      >
        Select
      </Button>
    </Card>
  );
};

export default AdvisorCard;
