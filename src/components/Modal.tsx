import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button
          className="mt-4 text-sm text-gray-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}