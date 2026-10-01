import React from 'react';
import { GameSettings, Language, GraphicsQuality } from '../types/game';
import { X, Settings as SettingsIcon, Volume2, Monitor, Smartphone, Globe, RotateCcw } from 'lucide-react';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

interface SettingsModalProps {
  settings: GameSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onResetSave,
}) => {
  if (!isOpen) return null;

  const handleQualityChange = (q: GraphicsQuality) => {
    onUpdateSettings({ graphicsQuality: q });
    audio.playUI();
    telegram.triggerHaptic('light');
  };

  const handleLanguageChange = (lang: Language) => {
    onUpdateSettings({ language: lang });
    audio.playUI();
    telegram.triggerHaptic('light');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {settings.language === 'fa' ? 'تنظیمات بازی' : 'GAME SETTINGS'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* Graphics Quality */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
              <Monitor className="w-4 h-4 text-sky-400" />
              <span>{settings.language === 'fa' ? 'کیفیت گرافیک' : 'Graphics Quality'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                    settings.graphicsQuality === q
                      ? 'bg-amber-600 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500">
              Low: Optimized for low-end mobile. High: Shadow mapping & HDR bloom.
            </span>
          </div>

          {/* Audio Controls */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>{settings.language === 'fa' ? 'صدا و موسیقی' : 'Sound & Audio'}</span>
            </div>

            {/* SFX Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>SFX Volume</span>
                <span className="tabular-nums font-semibold">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ sfxVolume: val });
                  audio.setVolumes(val, settings.musicVolume);
                }}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Music / Ambient</span>
                <span className="tabular-nums font-semibold">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ musicVolume: val });
                  audio.setVolumes(settings.sfxVolume, val);
                }}
                className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Haptics & Vibration */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>{settings.language === 'fa' ? 'لرزش و بازخورد لمسی' : 'Haptics & Vibration'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-300">Telegram Haptic Feedback</span>
              <button
                onClick={() => {
                  const next = !settings.haptics;
                  onUpdateSettings({ haptics: next });
                  if (next) telegram.triggerHaptic('medium');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  settings.haptics ? 'bg-amber-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.haptics ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{settings.language === 'fa' ? 'زبان بازی' : 'Language'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  settings.language === 'en'
                    ? 'bg-amber-600 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('fa')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  settings.language === 'fa'
                    ? 'bg-amber-600 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                فارسی (Persian)
              </button>
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-rose-400">Reset Local Save Progress</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all progress and restart chapter?')) {
                  onResetSave();
                }
              }}
              className="py-1.5 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
