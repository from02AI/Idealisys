import React from "react";
import clsx from "clsx";

type Mentor = {
  id: "supporter" | "strategist" | "challenger";
  title: string;
  subtitle: string;
  icon: string;   // path to 40×40 svg
};

const MENTORS: Mentor[] = [
  {
    id: "supporter",
    title: "The Supporter",
    subtitle: "Warm, encouraging voice",
    icon: "/icons/supporter.svg",
  },
  {
    id: "strategist",
    title: "The Strategist",
    subtitle: "Balanced, logical guide",
    icon: "/icons/strategist.svg",
  },
  {
    id: "challenger",
    title: "The Challenger",
    subtitle: "Direct, analytical thinker",
    icon: "/icons/challenger.svg",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (id: Mentor["id"]) => void;
}

const MentorModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Choose your mentor</h2>

        <div className="space-y-4">
          {MENTORS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m.id);
                onClose();
              }}
              className={clsx(
                "flex items-center w-full p-4 rounded-lg border-2 border-transparent hover:border-[#9a5fd4] transition"
              )}
            >
              <img src={m.icon} alt="" className="w-10 h-10 mr-4" />
              <div className="text-left">
                <p className="font-medium">{m.title}</p>
                <p className="text-sm text-gray-600">{m.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Need help choosing?
        </p>
      </div>
    </div>
  );
};

export default MentorModal;