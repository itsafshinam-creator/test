import React from 'react';
import { DialogueNode, DialogueOption, Language } from '../types/game';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface DialogueModalProps {
  dialogue: DialogueNode;
  language: Language;
  onSelectOption: (option: DialogueOption) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  dialogue,
  language,
  onSelectOption,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-2xl w-full bg-[#111622] border-2 border-amber-600/40 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-5">
        {/* Left: NPC Portrait */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border-2 border-amber-500/50 shadow-inner bg-slate-900 mx-auto md:mx-0">
          {dialogue.portrait ? (
            <img
              src={dialogue.portrait}
              alt={dialogue.speaker}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-amber-400">
              <MessageSquare className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Right: Speaker & Dialogue prose */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-cinzel font-bold text-lg text-amber-400">
                {language === 'fa' ? dialogue.speakerFa : dialogue.speaker}
              </h3>
              <span className="text-xs text-slate-500">Ancient Citizen</span>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-5 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
              "{language === 'fa' ? dialogue.textFa : dialogue.text}"
            </p>
          </div>

          {/* Dialogue Options */}
          <div className="flex flex-col gap-2">
            {dialogue.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectOption(opt)}
                className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500 text-sm font-medium text-slate-200 hover:text-amber-300 transition-all duration-150 active:scale-[0.99] group"
              >
                <span>{language === 'fa' ? opt.textFa : opt.text}</span>
                <ArrowRight className="w-4 h-4 text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
