import React from 'react';
import { Language } from '../types/game';
import { X, MapPin, Navigation, User, Crosshair, Sparkles, Compass } from 'lucide-react';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

interface FullMapModalProps {
  language: Language;
  playerPos: [number, number, number];
  isOpen: boolean;
  onClose: () => void;
  onFastTravel: (pos: [number, number, number]) => void;
}

const MAP_LOCATIONS = [
  { id: 'loc_bazaar', name: 'Grand Bazaar', nameFa: 'بازار بزرگ', x: -6, z: 4, type: 'town', desc: 'Merchant Darius stall & trade plaza' },
  { id: 'loc_spire', name: 'The Great Spire', nameFa: 'مناره بزرگ اثیر', x: 10, z: -8, type: 'vantage', desc: 'Assassin lookout & high vantage peak' },
  { id: 'loc_citadel', name: 'Fortified Citadel', nameFa: 'دژ نظامی باستانی', x: 0, z: -28, type: 'restricted', desc: 'Guarded sanctuary vault holding the Aether Relic' },
  { id: 'loc_catacomb', name: 'Catacombs Grate', nameFa: 'ورودی دخمه‌های زیرزمینی', x: -16, z: -16, type: 'secret', desc: 'Shadow drainage tunnel into the courtyard' },
];

export const FullMapModal: React.FC<FullMapModalProps> = ({
  language,
  playerPos,
  isOpen,
  onClose,
  onFastTravel,
}) => {
  if (!isOpen) return null;

  // Convert 3D world coordinates (approx -35 to 35) to percentage (0% to 100%)
  const worldToMap = (x: number, z: number) => {
    const left = ((x + 35) / 70) * 100;
    const top = ((z + 38) / 75) * 100;
    return { left: `${Math.max(5, Math.min(95, left))}%`, top: `${Math.max(5, Math.min(95, top))}%` };
  };

  const playerMapPos = worldToMap(playerPos[0], playerPos[2]);

  const handleTravel = (pos: [number, number, number]) => {
    onFastTravel(pos);
    audio.playSlash(false);
    telegram.triggerNotificationHaptic('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-3xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {language === 'fa' ? 'نقشه شهر باستانی و سفرهای سریع' : 'THE FORGOTTEN CITY MAP'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas Visualizer */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col md:flex-row gap-5">
          {/* Ancient Parchment Map Representation */}
          <div className="relative w-full md:w-2/3 h-72 sm:h-96 rounded-xl border-2 border-amber-800/60 bg-[#16120c] overflow-hidden shadow-inner p-4 flex items-center justify-center">
            {/* Parchment background texture effect */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* City Districts outlines */}
            <div className="absolute top-[8%] left-[20%] right-[20%] h-[30%] border border-dashed border-red-500/40 rounded-lg flex items-center justify-center text-[10px] text-red-400/60 uppercase tracking-widest font-cinzel">
              Restricted Citadel Perimeter
            </div>

            <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] border border-dashed border-amber-500/40 rounded-lg flex items-center justify-center text-[10px] text-amber-400/60 uppercase tracking-widest font-cinzel">
              Grand Bazaar
            </div>

            {/* Landmark Icons on Map */}
            {MAP_LOCATIONS.map((loc) => {
              const pos = worldToMap(loc.x, loc.z);
              return (
                <div
                  key={loc.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                      loc.type === 'restricted'
                        ? 'bg-rose-950 border-rose-500 text-rose-300'
                        : loc.type === 'vantage'
                        ? 'bg-sky-950 border-sky-400 text-sky-300'
                        : 'bg-amber-950 border-amber-400 text-amber-300'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 bg-black/75 px-1.5 py-0.5 rounded mt-1 border border-slate-700 whitespace-nowrap shadow-md">
                    {language === 'fa' ? loc.nameFa : loc.name}
                  </span>
                </div>
              );
            })}

            {/* Player Marker (Pulsing Arrow) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
              style={{ left: playerMapPos.left, top: playerMapPos.top }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-black animate-pulse">
                <Navigation className="w-3 h-3 fill-current rotate-45" />
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-black/80 px-1 rounded mt-0.5 border border-emerald-500/40">
                YOU
              </span>
            </div>
          </div>

          {/* Location Details & Fast Travel buttons */}
          <div className="w-full md:w-1/3 flex flex-col gap-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {language === 'fa' ? 'نقاط سفر سریع' : 'Fast Travel Waypoints'}
            </h3>

            <div className="flex flex-col gap-2">
              {MAP_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">
                      {language === 'fa' ? loc.nameFa : loc.name}
                    </h4>
                    <span className="text-[10px] uppercase font-semibold text-amber-500">
                      {loc.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">{loc.desc}</p>

                  <button
                    onClick={() => handleTravel([loc.x, 0.5, loc.z])}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Travel Here</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
