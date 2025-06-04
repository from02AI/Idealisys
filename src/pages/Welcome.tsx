
import React from 'react';
import AdvisorCard from '../components/AdvisorCard';
import { advisors } from '../data/advisors';
import { AdvisorPersona } from '../types';

interface WelcomeProps {
  onAdvisorSelect: (advisor: AdvisorPersona) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onAdvisorSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Choose Your AI Advisor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'll guide you step by step through validating your idea with personalized insights and expert guidance.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {advisors.map((advisor, index) => (
            <div 
              key={advisor.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AdvisorCard
                advisor={advisor}
                onSelect={onAdvisorSelect}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Each advisor will provide guidance tailored to their unique perspective and expertise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
