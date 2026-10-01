import React, { useState } from 'react';
import { Mission, Language } from '../types/game';
import { X, Crosshair, CheckCircle2, Lock, Gift, Coins, Gem, Sparkles } from 'lucide-react';
import { audio } from '../audio/AudioManager';

interface MissionsModalProps {
  missions: Mission[];
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onTrackMission: (missionId: string) => void;
}

const CHAPTERS = [
  { chapter: 1, title: 'The Forgotten City', titleFa: 'شهر فراموش‌شده', status: 'unlocked' },
  { chapter: 2, title: 'Whispers in the Market', titleFa: 'زمزمه‌ها در بازار', status: 'unlocked' },
  { chapter: 3, title: 'The Hidden Order', titleFa: 'فرقه پنهان', status: 'locked' },
  { chapter: 4, title: 'The Lost Relic', titleFa: 'عتیقه گمشده', status: 'locked' },
  { chapter: 5, title: 'The Fall of the Fortress', titleFa: 'سقوط دژ باستانی', status: 'locked' },
];

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  language,
  isOpen,
  onClose,
  onTrackMission,
}) => {
  const [selectedChapter, setSelectedChapter] = useState(1);

  if (!isOpen) return null;

  const currentMissions = missions.filter((m) => m.chapter === selectedChapter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-3xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {language === 'fa' ? 'دفترچه مأموریت‌ها و فصل‌ها' : 'QUEST LOG & CHAPTERS'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapters Navigation Bar */}
        <div className="flex items-center gap-1.5 p-2.5 bg-slate-900/60 border-b border-slate-800 overflow-x-auto">
          {CHAPTERS.map((ch) => {
            const isSelected = selectedChapter === ch.chapter;
            const isLocked = ch.status === 'locked';
            return (
              <button
                key={ch.chapter}
                disabled={isLocked}
                onClick={() => {
                  setSelectedChapter(ch.chapter);
                  audio.playUI();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-slate-950 shadow-md'
                    : isLocked
                    ? 'opacity-40 text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <span>Ch.{ch.chapter}</span>}
                <span>{language === 'fa' ? ch.titleFa : ch.title}</span>
              </button>
            );
          })}
        </div>

        {/* Missions List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 flex-1">
          {currentMissions.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              No missions found in this chapter. Check back as the story unfolds.
            </div>
          ) : (
            currentMissions.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/40 text-amber-300">
                        {m.status.toUpperCase()}
                      </span>
                      <h3 className="text-base font-cinzel font-bold text-slate-100">
                        {language === 'fa' ? m.titleFa : m.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {language === 'fa' ? m.descriptionFa : m.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onTrackMission(m.id);
                      audio.playUI();
                    }}
                    className="shrink-0 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
                  >
                    Track Objective
                  </button>
                </div>

                {/* Objectives */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Objectives:
                  </span>
                  {m.objectives.map((obj) => (
                    <div key={obj.id} className="flex items-center gap-2.5 text-xs">
                      {obj.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                          •
                        </div>
                      )}
                      <span className={obj.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {language === 'fa' ? obj.textFa : obj.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    <span>Completion Rewards:</span>
                  </div>

                  <div className="flex items-center gap-3 font-semibold">
                    <span className="text-amber-400">+{m.reward.xp} XP</span>
                    <span className="text-amber-300">+{m.reward.gold} Gold</span>
                    <span className="text-sky-400">+{m.reward.aeth} AETH</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
