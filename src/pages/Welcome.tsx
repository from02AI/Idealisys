import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdvisorPersona } from '../types';
import Modal from '../components/Modal.tsx';
import MentorModal from '../components/MentorModal';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <div className="welcome-screen flex flex-col bg-white">
        <section
          className="relative text-center px-4 pt-20 pb-16 bg-gradient-to-b from-[#9a5fd4] via-[#7e56c0] to-white h-screen flex flex-col justify-center items-center"
        >
          <img src="/assets/brainWave.svg" alt="Brainwave icon" className="w-48 h-48 mx-auto mb-6 animate-fadeInUp" />

          <h1 className="text-4xl font-bold text-white">Solivra</h1>

          <p className="mt-2 text-lg text-white/80">Clarity for every idea.</p>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-8 h-12 px-8 rounded-full bg-white text-[#3a62a6] font-semibold shadow-lg active:scale-95 transition-transform"
          >
            Pick my mentor
          </button>
        </section>

        <MentorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={(id) => navigate(`/question/1?mentor=${id}`)}
        />

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

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeInUp {
            animation: fadeInUp 300ms ease-out both;
          }

          @keyframes heroShift { from { background-position:0 0 } to { background-position:0 100% } }
          section.bg-gradient-to-b { /* Target the hero section */
            background-size:100% 200%;
            animation:heroShift 8s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default Welcome;
