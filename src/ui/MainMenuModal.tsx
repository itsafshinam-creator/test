import React from 'react';
import {
  Play,
  Crosshair,
  Backpack,
  User,
  ShoppingBag,
  Wallet,
  Settings as SettingsIcon,
  HelpCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Language, TelegramUser } from '../types/game';

interface MainMenuModalProps {
  language: Language;
  user: TelegramUser;
  isOpen: boolean;
  onClose: () => void;
  onOpenMissions: () => void;
  onOpenInventory: () => void;
  onOpenCharacter: () => void;
  onOpenShop: () => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
}

export const MainMenuModal: React.FC<MainMenuModalProps> = ({
  language,
  user,
  isOpen,
  onClose,
  onOpenMissions,
  onOpenInventory,
  onOpenCharacter,
  onOpenShop,
  onOpenWallet,
  onOpenSettings,
  onOpenTutorial,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cover Art Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0 border-b border-amber-600/30">
          <img
            src="/src/assets/images/game_cover_art_1790880119635.jpg"
            alt="Shadows of Aether"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-black/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Brand */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-500">
                Telegram Mini App Edition
              </span>
              <h1 className="text-2xl sm:text-3xl font-cinzel font-black tracking-wider text-amber-400 drop-shadow-md">
                SHADOWS OF AETHER
              </h1>
            </div>

            <div className="hidden sm:flex flex-col items-end text-xs text-slate-400">
              <span className="font-semibold text-slate-200">@{user.username || user.first_name}</span>
              <span className="text-[10px] text-amber-500/80">Operative #{user.id}</span>
            </div>
          </div>
        </div>

        {/* Menu Buttons List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-2.5">
          {/* Primary PLAY button */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold font-cinzel tracking-wider text-base shadow-xl shadow-amber-950/40 active:scale-[0.99] transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{language === 'fa' ? 'ادامه ماجراجویی' : 'RESUME ADVENTURE'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <button
              onClick={onOpenMissions}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-sm font-medium transition-all"
            >
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span>{language === 'fa' ? 'مأموریت‌ها' : 'Missions'}</span>
            </button>

            <button
              onClick={onOpenInventory}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-sm font-medium transition-all"
            >
              <Backpack className="w-4 h-4 text-emerald-400" />
              <span>{language === 'fa' ? 'کوله‌پشتی' : 'Inventory'}</span>
            </button>

            <button
              onClick={onOpenCharacter}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-sm font-medium transition-all"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>{language === 'fa' ? 'ارتقای شخصیت' : 'Character'}</span>
            </button>

            <button
              onClick={onOpenShop}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-sm font-medium transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>{language === 'fa' ? 'بازار و فروشگاه' : 'Bazaar Shop'}</span>
            </button>

            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-sm font-medium transition-all"
            >
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span>{language === 'fa' ? 'کیف پول وب۳' : 'Web3 Wallet'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-sm font-medium transition-all"
            >
              <SettingsIcon className="w-4 h-4 text-slate-400" />
              <span>{language === 'fa' ? 'تنظیمات' : 'Settings'}</span>
            </button>
          </div>

          <button
            onClick={onOpenTutorial}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{language === 'fa' ? 'راهنمای کنترل و پارکور' : 'How to Play & Controls'}</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>v1.0.0 · WebGL / PWA Cache Ready</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Game Engine Active
          </span>
        </div>
      </div>
    </div>
  );
};
