import React from 'react';
import { Skull, RotateCcw } from 'lucide-react';
import { Language } from '../types/game';

interface DeathModalProps {
  language: Language;
  isOpen: boolean;
  onRespawn: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ language, isOpen, onRespawn }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-[#110e11] border-2 border-rose-900/60 rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-rose-500 mb-4 animate-pulse">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-cinzel font-black tracking-widest text-rose-500 mb-2">
          {language === 'fa' ? 'تسلیم در سایه‌ها' : 'FALLEN IN THE SHADOWS'}
        </h2>

        <p className="text-sm text-slate-400 mb-6 font-sans">
          {language === 'fa'
            ? 'نگهبانان قلعه بر شما چیره شدند. اما پیوند شما با اثیر هنوز ناگسستنی است.'
            : 'The guards overpowered your defenses. Yet your bond with the ancient Aether persists.'}
        </p>

        <button
          onClick={onRespawn}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 font-bold text-white shadow-xl transition-all active:scale-[0.99]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'fa' ? 'تجدید قوا در بازار' : 'RESPAWN AT BAZAAR'}</span>
        </button>
      </div>
    </div>
  );
};
