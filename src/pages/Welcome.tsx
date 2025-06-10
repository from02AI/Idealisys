import React, { useState } from 'react';
import { advisors } from '../data/advisors';
import { AdvisorPersona } from '../types';
import Modal from '../components/Modal.tsx';
import { Button } from '@/components/ui/button';

interface WelcomeProps {
  onAdvisorSelect: (advisor: AdvisorPersona) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onAdvisorSelect }) => {
  const [showInfo, setShowInfo] = useState(false);

  // Helper for card background color - NOW ALWAYS WHITE WITH PURPLE BORDER
  const getCardBackgroundColor = (advisorId: string) => {
    // #E6E2FF is a very light purple, approximated by Tailwind's purple-200
    // Changed border-purple-200 to custom border-[#C9B8FF]
    return 'bg-white border border-[#C9B8FF]';
  };

  return (
    <>
    {/* Main container: Changed from grid to flex flex-col for vertical zones */}
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col p-3 overflow-hidden">
      {/* Top Zone (Intro Copy): Constrained height, scrollable, with padding */}
      {/* Changed max-w-md to max-w-xs for ~320px mobile width */}
      <header className="flex-shrink-0 max-w-xs mx-auto w-full max-h-[35vh] overflow-y-auto p-4">
        {/* Changed to text-center. Individual items will be centered or padded. */}
        <div className="text-center">
          {/* H1: Solivra - largest element, solid purple, 32px. Centered with mx-auto w-fit. */}
          <h1 className="text-[36px] font-bold tracking-tight text-purple-800 leading-normal mx-auto w-fit">Solivra</h1>

          {/* H2/Subtitle: The world is built on ideas - 18px, dark gray. Centered with mx-auto w-fit. */}
          <h2 className="text-[18px] text-[#333333] font-normal leading-relaxed mt-6 mx-auto w-fit">
            The world is built on ideas
          </h2>

          {/* New bold text for introduction to bullet points - 16px, dark gray, regular weight. Left-aligned, inset by px-4. */}
          <p className="text-[16px] font-normal text-[#333333] mt-6 px-4">Solivra mentor your ideas to clarity: <br />
          Proven frameworks, AI-personalized suggestions, and a focused report.</p>
        </div>
      </header>

      {/* Bottom Zone (Mentor Cards): Fixed height, no scrolling, 8px top padding */}
      <div className="h-[65vh] overflow-hidden pt-2">
        {/* Inner content wrapper: flex-col to distribute space, h-full to fill Bottom Zone */}
        <div className="max-w-md mx-auto w-full h-full flex flex-col">

          {/* Section header: Takes natural height, with 16px bottom margin */}
          <div className="text-center space-y-1 mb-4">
            {/* H2: Choose Your AI Advisor - current size text-lg (18px), font-semibold. Changed color to text-purple-800. */}
            <h2 className="text-lg font-semibold text-purple-800">Choose your mentor style:</h2>
            {/* Body text: Each mentor offers a unique perspective for your journey - 16px, dark gray */}
            <p className="text-[16px] text-[#333333] italic leading-relaxed max-w-xs mx-auto mb-2">
              Each mentor offers a unique perspective
            </p>
               {/* Link: Want help choosing? - 16px, medium, brand-purple, underline only on hover, with 16px margin above, centered with mx-auto block. */}
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="text-[16px] text-purple-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-4 mx-auto block"
          >
            Want help choosing?
          </button>
          </div>

          {/* Advisor cards list: flex-1 to take remaining height, flex-col for vertical stacking, space-y-3 for 12px gutters */}
          {/* Removed pt-6 as cards will distribute evenly */}
          <div className="flex-1 flex flex-col space-y-3 overflow-y-hidden">
            {advisors.map((advisor, index) => (
              <div
                key={advisor.id}
                onClick={() => onAdvisorSelect(advisor)}
                role="button"
                tabIndex={0}
                // Card background now white with purple border
                // Micro-interactions (scale, shadow) remain
                // Added focus ring for keyboard navigation
                // Changed rounded-2xl to rounded-xl, removed group-hover shadow
                // Added subtle brand-purple hover ring
                className={`group ${getCardBackgroundColor(advisor.id)} rounded-xl shadow-sm hover:shadow-md transition-all duration-150 hover:scale-[1.02] hover:-translate-y-0.5 py-4 px-5 cursor-pointer flex items-center justify-between
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 hover:ring-1 hover:ring-purple-500 hover:ring-offset-0`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center gap-3 flex-grow">
                  <div className="relative">
                    {/* Icon badge now gradient, rounded-full, with shadow-sm. Removed getIconBackgroundColor. */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500`}>
                      {/* Emoji now colored white */}
                      <span className="text-lg filter group-hover:scale-110 transition-transform duration-300 text-white">
                        {/* Emojis from previous iteration */}
                        {advisor.id === 'supporter' ? '🫂' :
                         advisor.id === 'strategist' ? '📊' :
                         advisor.id === 'challenger' ? '⚡️' : '❓'}
                      </span>
                    </div>
                    {/* Hover dot is present here from the previous version */}
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Advisor Name: 16px, dark gray, font-normal */}
                    <h3 className="text-[16px] font-normal text-[#333333] mb-1 group-hover:text-purple-700 transition-colors duration-300 truncate">
                      {advisor.name}
                    </h3>
                    {/* Advisor Tagline: 16px, dark gray */}
                    <p className="text-[16px] text-[#333333] leading-tight">
                      {advisor.tagline}
                    </p>
                  </div>
                </div>
                
                {/* Chevron arrow icon removed */}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer is empty to save space */}
      <div className="flex-shrink-0 px-0 pb-0"></div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {showInfo && (
        <Modal onClose={() => setShowInfo(false)}>
          <div className="space-y-4">
            <div className="text-center">
              {/* Modal heading: Advisor Personas & Guidelines - 18px, regular, brand-purple */}
              <h3 className="text-[18px] font-normal text-purple-800 mb-2">Advisor Personas & Guidelines</h3>
              {/* Modal intro paragraph: 16px, dark gray */}
              <p className="text-[16px] text-[#333333] leading-relaxed">
                Choosing the right advisor helps tailor your idea validation journey. Each persona offers a unique perspective to guide you.
              </p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2">
              {[
                { name: 'The Pragmatist', desc: 'Focuses on market viability, competition, and practical implementation.', quote: 'Is there a real need for this?', color: 'bg-green-50 border-green-200' },
                { name: 'The Innovator', desc: 'Explores novel approaches, disruptive potential, and unique selling propositions.', quote: 'How can we do this differently?', color: 'bg-purple-50 border-purple-200' },
                { name: 'The User Advocate', desc: 'Prioritizes user experience, pain points, and customer satisfaction.', quote: 'What problem are we truly solving for the user?', color: 'bg-blue-50 border-blue-200' },
                { name: 'The Strategist', desc: 'Considers long-term vision, scalability, and business model.', quote: 'Where does this idea fit into the bigger picture?', color: 'bg-indigo-50 border-indigo-200' },
                { name: 'The Critic', desc: 'Challenges assumptions, identifies weaknesses, and points out potential pitfalls.', quote: 'What could go wrong here?', color: 'bg-red-50 border-red-200' },
                { name: 'The Visionary', desc: 'Inspires with big-picture thinking, future trends, and impactful possibilities.', quote: 'Imagine the impact this could have!', color: 'bg-yellow-50 border-yellow-200' }
              ].map((persona, index) => (
                <div key={index} className={`${persona.color} border rounded-lg p-3 transition-all duration-200 hover:shadow-sm`}>
                  {/* Persona name: 18px, regular, brand-purple */}
                  <h4 className="font-normal text-[18px] mb-1 text-purple-800">{persona.name}</h4>
                  {/* Persona description: 16px, dark gray */}
                  <p className="text-[16px] text-[#333333] mb-2 leading-relaxed">{persona.desc}</p>
                  {/* Persona quote: 16px, dark gray */}
                  <p className="text-[16px] italic text-[#333333] font-normal">"{persona.quote}"</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200">
              {/* Disclaimer text: 16px, dark gray */}
              <p className="text-[16px] text-[#333333] leading-relaxed text-center font-normal">
                By continuing, you acknowledge this guidance is illustrative and you are responsible for your own decisions.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </>
  );
};

export default Welcome;
