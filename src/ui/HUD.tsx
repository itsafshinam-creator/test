import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Coins,
  Gem,
  Menu,
  Backpack,
  User,
  MapPin,
  Wallet,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Crosshair,
} from 'lucide-react';
import { InteractionTarget } from '../game/GameEngine';
import { Mission, Language } from '../types/game';

interface HUDProps {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  stealthVisibility: number;
  isHiddenInShadow: boolean;
  gold: number;
  aeth: number;
  activeMission: Mission | null;
  interactionTarget: InteractionTarget | null;
  language: Language;
  onOpenMenu: () => void;
  onOpenInventory: () => void;
  onOpenCharacter: () => void;
  onOpenMap: () => void;
  onOpenWallet: () => void;
  onOpenTutorial: () => void;
  onTriggerInteract: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hp,
  maxHp,
  stamina,
  maxStamina,
  stealthVisibility,
  isHiddenInShadow,
  gold,
  aeth,
  activeMission,
  interactionTarget,
  language,
  onOpenMenu,
  onOpenInventory,
  onOpenCharacter,
  onOpenMap,
  onOpenWallet,
  onOpenTutorial,
  onTriggerInteract,
}) => {
  const [isQuestCollapsed, setIsQuestCollapsed] = useState(false);

  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (stamina / maxStamina) * 100));

  // Stealth Status Color
  const getStealthStatus = () => {
    if (isHiddenInShadow) return { color: 'text-emerald-400', label: 'Hidden in Shadows', labelFa: 'مخفی در سایه' };
    if (stealthVisibility < 0.4) return { color: 'text-sky-400', label: 'Concealed', labelFa: 'استتار شده' };
    if (stealthVisibility < 0.7) return { color: 'text-amber-400', label: 'Visible', labelFa: 'قابل رویت' };
    return { color: 'text-rose-500', label: 'Exposed', labelFa: 'کاملاً آشکار' };
  };

  const stealthInfo = getStealthStatus();

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* TOP BAR: Health, Stamina, Currencies & Main Nav */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Player Vital Bars */}
        <div className="pointer-events-auto flex flex-col gap-1.5 bg-[#0d1117]/80 backdrop-blur-md border border-slate-800/80 p-2.5 rounded-lg shadow-lg max-w-[210px] sm:max-w-[260px] w-full">
          {/* Health Bar */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span className="text-red-400 tracking-wider">HP</span>
              <span className="tabular-nums">
                {Math.round(hp)} / {maxHp}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-red-950">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-200"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span className="text-sky-400 tracking-wider">STAMINA</span>
              <span className="tabular-nums">{Math.round(stamina)}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-sky-950">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-teal-400 rounded-full transition-all duration-150"
                style={{ width: `${staminaPercent}%` }}
              />
            </div>
          </div>

          {/* Stealth Eye Indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5">
              {isHiddenInShadow ? (
                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Eye className={`w-3.5 h-3.5 ${stealthInfo.color}`} />
              )}
              <span className={`font-medium ${stealthInfo.color}`}>
                {language === 'fa' ? stealthInfo.labelFa : stealthInfo.label}
              </span>
            </div>
            <span className="text-slate-400 text-[10px] tabular-nums">
              {Math.round(stealthVisibility * 100)}%
            </span>
          </div>
        </div>

        {/* Center: Currencies */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3 bg-[#0d1117]/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg shadow-lg">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
            <Coins className="w-3.5 h-3.5" />
            <span className="tabular-nums">{gold}</span>
            <span className="text-slate-400 text-[10px] font-normal">GOLD</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
            <Gem className="w-3.5 h-3.5" />
            <span className="tabular-nums">{aeth}</span>
            <span className="text-slate-400 text-[10px] font-normal">AETH</span>
          </div>
        </div>

        {/* Right: Quick Action Modals */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenInventory}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-[#0d1117]/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shadow-md flex items-center gap-1 text-xs"
            title="Inventory"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Items</span>
          </button>

          <button
            onClick={onOpenCharacter}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-[#0d1117]/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shadow-md flex items-center gap-1 text-xs"
            title="Character Progression"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          <button
            onClick={onOpenMap}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-[#0d1117]/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shadow-md flex items-center gap-1 text-xs"
            title="Map"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Map</span>
          </button>

          <button
            onClick={onOpenWallet}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-[#0d1117]/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shadow-md flex items-center gap-1 text-xs"
            title="Web3 Wallet"
          >
            <Wallet className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Web3</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-[#0d1117]/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shadow-md flex items-center gap-1 text-xs"
            title="Tutorial Guide"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </button>

          <button
            onClick={onOpenMenu}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 font-bold text-slate-950 transition-colors shadow-lg shadow-amber-900/40 flex items-center gap-1 text-xs"
            title="Menu"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">MENU</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE PROMPT OVERLAY (Middle screen bottom) */}
      {interactionTarget && (
        <div className="pointer-events-auto mx-auto mb-2 sm:mb-4 animate-bounce">
          <button
            onClick={onTriggerInteract}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-2xl transition-transform active:scale-95 border ${
              interactionTarget.type === 'enemy_takedown'
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-950/60'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-950/60'
            }`}
          >
            <span className="px-1.5 py-0.5 bg-black/30 rounded text-xs border border-white/20">
              E / TAP
            </span>
            <span>
              {language === 'fa' ? interactionTarget.nameFa : interactionTarget.name}
            </span>
          </button>
        </div>
      )}

      {/* BOTTOM LEFT: Active Quest Tracker */}
      <div className="flex items-end justify-between">
        {activeMission && (
          <div className="pointer-events-auto bg-[#0d1117]/85 backdrop-blur-md border border-slate-800/80 rounded-lg p-3 shadow-xl max-w-[280px] sm:max-w-[320px] transition-all">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsQuestCollapsed(!isQuestCollapsed)}
            >
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase font-cinzel">
                  {language === 'fa' ? activeMission.titleFa : activeMission.title}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-200">
                {isQuestCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {!isQuestCollapsed && (
              <div className="mt-2 flex flex-col gap-1.5 text-xs">
                {activeMission.objectives.map((obj) => (
                  <div key={obj.id} className="flex items-start gap-2">
                    <span
                      className={`w-3.5 h-3.5 mt-0.5 rounded-full flex items-center justify-center text-[9px] border ${
                        obj.completed
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {obj.completed ? '✓' : '•'}
                    </span>
                    <span className={obj.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                      {language === 'fa' ? obj.textFa : obj.text}
                    </span>
                  </div>
                ))}

                <div className="mt-1 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reward:</span>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-amber-400">+{activeMission.reward.gold} Gold</span>
                    <span className="text-sky-400">+{activeMission.reward.aeth} AETH</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Currency badge on small screens */}
        <div className="pointer-events-auto sm:hidden flex items-center gap-2 bg-[#0d1117]/85 backdrop-blur-md border border-slate-800/80 px-2 py-1 rounded-lg text-xs">
          <span className="text-amber-400 font-semibold">{gold} G</span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-semibold">{aeth} AETH</span>
        </div>
      </div>
    </div>
  );
};
