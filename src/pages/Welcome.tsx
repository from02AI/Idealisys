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

  // Helper for card background color - NOW ONLY RETURNS bg-white, border handled directly in JSX
  const getCardBackgroundColor = (advisorId: string) => {
    return 'bg-white'; // Only return background, border is now in JSX
  };

  return (
    <>
    {/* 1. Full-height flex wrapper: h-screen flex flex-col, background gradient */}
    <div className="welcome-screen h-screen flex flex-col bg-gradient-to-b from-[#F4F1FF] via-white to-white overflow-hidden">

      {/* Header zone (Top Zone): flex flex-col items-center, shrink-0, px-4. Hard-capped height. */}
      <header className="flex flex-col items-center shrink-0 px-4 pt-8" id="intro" style={{ maxHeight: '220px', animation: 'fadeIn 0.4s ease-out forwards' }}>
        <div className="text-center w-full"> {/* Use w-full for inner div for consistent centering/padding */}

          {/* a. Title: 34-36px (using 36px), font-extrabold, tracking-wide, brand-purple, drop-shadow-sm */}
          <h1 className="text-[36px] font-extrabold tracking-wide text-purple-800 leading-none mb-2 drop-shadow-sm">
            Solivra
          </h1>

          {/* b. Tagline: 18px, font-semibold, brand-purple, mt-2 mb-4 */}
          <h2 className="text-[18px] font-semibold text-purple-800 leading-tight mt-2 mb-4">
            The world is built on ideas
          </h2>

          {/* c. Two-line intro: Inside a tinted block. 15px / 14px, font-medium, brand-purple. */}
          <div className="bg-purple-50 p-3 rounded-lg mx-auto w-full max-w-xs text-center"> {/* Tinted block with padding and rounded corners */}
            <p className="text-[15px] font-medium text-purple-800 leading-tight">
              Solivra mentors your ideas to clarity.
            </p>
            <p className="text-[14px] text-purple-800 leading-tight"> {/* Removed mb-4 as it's part of the block now */}
              Proven frameworks, AI-personalized suggestions, and a focused report.
            </p>
          </div>


          {/* Info link: 15px, font-medium, brand-purple, underline only on hover. mt-2 margin. */}
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="text-[15px] text-purple-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-2 mx-auto block"
          >
            Want help choosing?
          </button>
        </div>
      </header>

      {/* 5. Visual separation: 1px purple divider */}
      <hr className="w-full h-[1px] bg-purple-200 mt-6 mb-4 max-w-md mx-auto" />

      {/* Mentor list zone (Bottom Zone): flex flex-col, justify-between, shrink-0. Fixed height. */}
      <section className="flex flex-col justify-between shrink-0 px-4 pb-6 gap-4" id="mentor-list" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Inner content wrapper: max-w-md for consistent width, mx-auto for centering. */}
        <div className="max-w-md mx-auto w-full h-full flex flex-col">

          {/* e. Mentor section header */}
          <h3 className="text-[18px] font-semibold text-purple-800 leading-tight mb-1 text-center">
            Choose your mentor style
          </h3>
          <p className="text-[14px] italic text-gray-600 leading-tight mb-3 text-center">
            Each mentor offers a unique perspective
          </p>

          {/* f. Mentor cards container */}
          <div className="flex flex-col gap-4 flex-grow"> {/* flex-grow needed here if cards don't fill exactly */}
            {advisors.map((advisor, index) => (
              // g. Individual mentor card
              <div
                key={advisor.id}
                onClick={() => onAdvisorSelect(advisor)}
                role="button"
                tabIndex={0}
                // Applied min-h for touch target compliance.
                className={`mentor-card flex items-center gap-3 px-4 py-3 border border-[#C9B8FF] rounded-xl hover:shadow-md transition cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 hover:ring-1 hover:ring-purple-500 hover:ring-offset-0 min-h-[100px]`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <img src={`/icons/${advisor.id}.svg`} alt="" className="w-10 h-10 shrink-0" />

                <div className="flex flex-col">
                  <span className="font-medium text-[15px] text-gray-900">{advisor.name}</span>
                  <span className="text-[13px] text-gray-600 leading-tight">
                    {advisor.tagline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (empty) removed as it would conflict with flex layout for full screen */}
      {/* <div className="flex-shrink-0 px-0 pb-0"></div> */}

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
        /* New fadeIn animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {showInfo && (
        <Modal onClose={() => setShowInfo(false)}>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-[18px] font-normal text-purple-800 mb-2">Advisor Personas & Guidelines</h3>
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
                  <h4 className="font-normal text-[18px] mb-1 text-purple-800">{persona.name}</h4>
                  <p className="text-[16px] text-[#333333] mb-2 leading-relaxed">{persona.desc}</p>
                  <p className="text-[16px] italic text-[#333333] font-normal">"{persona.quote}"</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200">
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
