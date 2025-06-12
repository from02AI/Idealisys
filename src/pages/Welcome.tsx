import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal.tsx';

// Import Lucide icons
import { Handshake, Compass, Target } from "lucide-react";
import { ADVISOR_PERSONAS } from '../data/advisors'; // Import ADVISOR_PERSONAS

// Define Mentor type (kept for consistency with ADVISOR_PERSONAS in data/advisors.ts)
// Removed the MENTORS array directly from here as it's now imported.

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const handleMentorSelect = (id: Mentor["id"]) => {
    setSelectedMentorId(id);
    console.log("picked", id);
    navigate(`/question/1?mentor=${id}`);
  };

  return (
    <>
      <section
        className="relative bg-gradient-to-b from-[#9a5fd4] via-[#7e56c0] to-[#f7f7ff]
                   pt-10 pb-6 px-4 text-center h-screen flex flex-col justify-between overflow-hidden"
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-600/10 animate-gradient-shift pointer-events-none"></div>
        
        <div className="flex-1 flex flex-col">
          {/* Header area with improved logo */}
          <div className="mb-6">
            {/* Brand wordmark with optional icon */}
            <div className="inline-flex items-center justify-center">
              <span className="inline-block mr-2 text-white bg-white/20 p-2 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <h1 className="text-4xl font-bold text-white">Solivra</h1>
            </div>

            {/* Updated promise/tagline */}
            <p className="mt-2 text-lg font-medium text-white/95">Mentors your Ideas to Clarity</p>
          </div>

        

          {/* Improved bulleted list with better styling */}
          <div className="mb-6 max-w-xs mx-auto">
            <ul className="flex flex-col gap-2 text-white/95 text-md">
              <li className="flex items-center justify-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <span>Proven frameworks</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <span>AI-tailored suggestions</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <span>Focused reports</span>
              </li>
            </ul>
          </div>

          {/* Sub-headline with improved styling */}
          <p className="mb-4 text-base font-bold text-white flex items-center justify-center gap-2">
            <span className="w-12 h-px bg-white/40"></span>
            Select a mentor to get started
            <span className="w-12 h-px bg-white/40"></span>
          </p>

          {/* Mentor Cards with improved spacing and interaction */}
          <div className="space-y-3 max-w-xs mx-auto px-3">
            {ADVISOR_PERSONAS.map((m, index) => (
              <button
                key={m.id}
                onClick={() => handleMentorSelect(m.id)}
                className={`mentor-card flex items-center w-full max-w-md mx-auto p-4
                           bg-white rounded-xl ring-1 ring-inset ring-[#9a5fd4]/30 shadow-md cursor-pointer
                           hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-in-out text-left
                           focus:ring-2 focus:ring-offset-2 focus:ring-[#9a5fd4] active:scale-95 animate-fadeInUp
                           ${selectedMentorId === m.id ? 'selected' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-shrink-0 p-2 bg-white/70 rounded-full mr-5">
                  {m.id === "supporter" && <Handshake className="w-7 h-7 stroke-[#3a62a6]" />}
                  {m.id === "strategist" && <Compass className="w-7 h-7 stroke-[#3a62a6]" />}
                  {m.id === "challenger" && <Target className="w-7 h-7 stroke-[#3a62a6]" />}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{m.title}</p>
                  <p className="text-sm text-gray-600">{m.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer area with help button and attribution */}
        <div className="mt-auto flex flex-col items-center">
          <button 
            onClick={() => setShowInfoModal(true)}
            className="text-sm text-white/80 hover:text-white mb-3 underline underline-offset-2"
          >
            Need help choosing?
          </button>
          <p className="text-[10px] text-white/60">Powered by GPT-4</p>
        </div>
      </section>

      {showInfoModal && (
        <Modal onClose={() => setShowInfoModal(false)}>
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

      {/* Styles for animations */}
      <style>{`
        @keyframes fadeUp { /* Renamed keyframes and adjusted transform */
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInUp {
          animation: fadeUp .25s ease-out both; /* Updated animation properties */
        }

        @keyframes heroShift { from { background-position:0 0 } to { background-position:0 100% } }
        section.bg-gradient-to-b { /* Target the hero section */
          background-size:100% 200%;
          animation:heroShift 8s linear infinite;
        }

        /* Mentor card selected state */
        .mentor-card:active,
        .mentor-card.selected {
          border: 2px solid transparent;
          border-image: linear-gradient(90deg,#9a5fd4,#3a62a6) 1;
          /* Removed complex box-shadow, relying on distinct gradient border */
        }
      `}</style>
    </>
  );
};

export default Welcome;
