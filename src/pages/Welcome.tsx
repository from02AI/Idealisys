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
    {/* 1. Full-height flex wrapper: h-screen flex flex-col, background should now be white */}
    <div className="welcome-screen flex flex-col bg-white">
      {/* NEW HERO BLOCK */}
      <section
        className="relative bg-gradient-to-b from-[#9a5fd4] via-[#7e56c0] to-[#3a62a6] flex flex-col justify-center items-center pt-16 pb-12"
      >
        {/* a. Title: 34-36px (using 36px), font-extrabold, tracking-wide, brand-purple, drop-shadow-sm */}
        <h1 className="text-4xl font-bold text-white drop-shadow-sm">
          Solivra
        </h1>

        {/* b. Tagline: 18px, font-semibold, brand-purple, mt-2 mb-4 */}
        <p className="text-lg text-white/80 mt-2">
          The world is built on ideas
        </p>
        {/* SVG will be placed here */}
        <svg
          className="absolute inset-x-0 bottom-0 h-12" /* Updated positioning and height classes */
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path fill="#FFFFFF" fillOpacity="1" d="M0,224L60,218.7C120,213,240,203,360,186.7C480,171,600,149,720,160C840,171,960,213,1080,224C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </section>

      {/* Glassmorphic card - positioned here outside header/main for overlap */}
      <div className="mx-auto w-full max-w-md py-3 px-5 rounded-2xl mb-6 animate-fadeInUp
                  bg-white bg-opacity-80 backdrop-blur-sm shadow-lg -mt-3 relative z-10">
        <p className="text-base font-semibold text-gray-900 mb-1">
          Solivra mentors your ideas to clarity.
        </p>
        <p className="text-sm font-normal text-gray-600">
          Proven frameworks, AI-personalized suggestions, and a focused report.
        </p>
      </div>

      {/* Main content wrapper - rest of the page */}
      <main className="bg-white px-4 max-w-md mx-auto w-full flex flex-col flex-grow overflow-y-auto">
        {/* Header zone (Top Zone): flex flex-col items-center, shrink-0, px-4. Hard-capped height. */}
        <header className="flex flex-col items-center shrink-0" id="intro" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
          <div className="text-center w-full"> {/* Use w-full for inner div for consistent centering/padding */}
            {/* c. Two-line intro: MOVED FROM HERE */}

            {/* Info link: 15px, font-medium, brand-purple, underline only on hover. mt-2 margin. */}
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="text-sm text-indigo-600 underline cursor-pointer mt-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mx-auto block"
            >
              Want help choosing?
            </button>
          </div>
        </header>

        {/* 5. Visual separation: 1px purple divider */}
        <div className="w-full mx-auto mb-6 flex justify-center">
          <div className="h-0.5 w-2/5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
        </div>

        {/* Mentor list zone (Bottom Zone): flex flex-col, justify-between, shrink-0. Fixed height. */}
        <section className="flex flex-col justify-between shrink-0 pb-6 gap-4 flex-grow" id="mentor-list">
          <div className="h-full flex flex-col">

            {/* e. Mentor section header */}
            <h3 className="text-2xl font-semibold mb-1 text-center">
              Choose your mentor style
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Each mentor offers a unique perspective
            </p>

            {/* f. Mentor cards container */}
            <div className="flex flex-col gap-4 flex-grow">
              {advisors.map((advisor, index) => (
                // g. Individual mentor card
                <div
                  key={advisor.id}
                  onClick={() => onAdvisorSelect(advisor)}
                  role="button"
                  tabIndex={0}
                  // Applied min-h for touch target compliance.
                  className={`flex items-center p-4 rounded-lg bg-white border border-transparent bg-clip-padding
                  hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500
                  focus:ring-offset-2 hover:ring-1 hover:ring-purple-500 hover:ring-offset-0 min-h-[80px]`}
                  style={{
                    borderImage: 'linear-gradient(to right, #9a5fd4, #3a62a6) 1',
                    animationDelay: `${(index + 2) * 100}ms`, // Staggered delays: 200ms, 300ms, 400ms...
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <img src={`/icons/${advisor.id}.svg`} alt="" className="w-8 h-8 mr-3" />

                  <div>
                    <p className="font-medium">{advisor.name}</p>
                    <p className="text-sm text-gray-600">
                      {advisor.tagline}
                    </p>
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
              transform: translateY(8px);
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
          .animate-fadeInUp {
            animation: fadeInUp 300ms ease-out both;
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
      </main>
    </div>
    </>
  );
};

export default Welcome;
