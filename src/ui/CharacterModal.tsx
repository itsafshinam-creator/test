import React from 'react';
import { PlayerStats, Language } from '../types/game';
import { X, User, Heart, Zap, Sword, Wind, Plus, ShieldCheck } from 'lucide-react';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

interface CharacterModalProps {
  stats: PlayerStats;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onUpgradeStat: (statKey: 'maxHp' | 'maxStamina' | 'damage' | 'movementSpeed' | 'stealthBonus') => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  stats,
  language,
  isOpen,
  onClose,
  onUpgradeStat,
}) => {
  if (!isOpen) return null;

  const xpPercent = Math.min(100, (stats.xp / stats.xpToNextLevel) * 100);

  const handleUpgrade = (statKey: 'maxHp' | 'maxStamina' | 'damage' | 'movementSpeed' | 'stealthBonus') => {
    if (stats.unspentAttributePoints > 0) {
      onUpgradeStat(statKey);
      audio.playQuestComplete();
      telegram.triggerNotificationHaptic('success');
    }
  };

  const statList = [
    {
      key: 'maxHp' as const,
      label: 'Max Health',
      labelFa: 'حداکثر سلامت',
      value: stats.maxHp,
      increment: '+15 HP',
      icon: Heart,
      color: 'text-rose-400',
    },
    {
      key: 'maxStamina' as const,
      label: 'Max Stamina',
      labelFa: 'حداکثر استقامت',
      value: stats.maxStamina,
      increment: '+15 Stamina',
      icon: Zap,
      color: 'text-sky-400',
    },
    {
      key: 'damage' as const,
      label: 'Attack Damage',
      labelFa: 'قدرت ضربه شمشیر',
      value: stats.damage,
      increment: '+4 Damage',
      icon: Sword,
      color: 'text-amber-400',
    },
    {
      key: 'movementSpeed' as const,
      label: 'Movement Agility',
      labelFa: 'سرعت و چابکی',
      value: stats.movementSpeed.toFixed(1),
      increment: '+0.4 Speed',
      icon: Wind,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {language === 'fa' ? 'پیشرفت و صفات شخصیت' : 'CHARACTER PROGRESSION'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level & XP Overview */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-900/60 to-slate-950/40 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Rogue Rank
              </span>
              <h3 className="text-2xl font-cinzel font-black text-amber-400">
                LEVEL {stats.level}
              </h3>
            </div>

            {stats.unspentAttributePoints > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>
                  {stats.unspentAttributePoints}{' '}
                  {language === 'fa' ? 'امتیاز ارتقاء موجود' : 'Upgrade Points Available'}
                </span>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          <div className="flex flex-col gap-1 mt-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Experience Points</span>
              <span className="tabular-nums font-semibold text-slate-200">
                {stats.xp} / {stats.xpToNextLevel} XP
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Attributes List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {language === 'fa' ? 'صفات قابل ارتقاء' : 'Core Attributes'}
          </h4>

          {statList.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200">
                      {language === 'fa' ? stat.labelFa : stat.label}
                    </h5>
                    <span className="text-xs text-slate-400">
                      Current: <strong className="text-white tabular-nums">{stat.value}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-semibold">{stat.increment}</span>
                  <button
                    disabled={stats.unspentAttributePoints <= 0}
                    onClick={() => handleUpgrade(stat.key)}
                    className={`p-2 rounded-lg font-bold transition-all flex items-center justify-center ${
                      stats.unspentAttributePoints > 0
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md active:scale-90 cursor-pointer'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                    title="Upgrade Attribute"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          Complete missions and perform stealth takedowns to gain XP and earn upgrade points.
        </div>
      </div>
    </div>
  );
};
