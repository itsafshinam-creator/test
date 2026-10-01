import React, { useState } from 'react';
import { InventoryItem, Language } from '../types/game';
import { X, ShoppingBag, Coins, Gem, Check, AlertCircle } from 'lucide-react';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

export interface ShopItem {
  id: string;
  name: string;
  nameFa: string;
  description: string;
  descriptionFa: string;
  goldCost: number;
  aethCost?: number;
  category: InventoryItem['category'];
  rarity: InventoryItem['rarity'];
  effect?: InventoryItem['effect'];
}

const SHOP_CATALOG: ShopItem[] = [
  {
    id: 'shop_elixir',
    name: 'Aetherial Health Elixir',
    nameFa: 'معجون سلامتی اثیری',
    description: 'Instantly restores 45 HP with crystalline soothing vapor.',
    descriptionFa: 'بازیابی فوری ۴۵ واحد سلامت.',
    goldCost: 25,
    category: 'consumables',
    rarity: 'common',
    effect: { type: 'heal', amount: 45 },
  },
  {
    id: 'shop_smoke',
    name: 'Smoke Grenade',
    nameFa: 'بمب دودزا',
    description: 'Breaks enemy line-of-sight for 8s, enabling quick escape.',
    descriptionFa: 'قطع میدان دید دشمنان برای ۸ ثانیه جهت فرار سریع.',
    goldCost: 40,
    category: 'consumables',
    rarity: 'rare',
    effect: { type: 'smoke_bomb', amount: 8 },
  },
  {
    id: 'shop_stiletto',
    name: 'Damascus Stiletto',
    nameFa: 'خنجر دمشقی',
    description: 'Masterfully balanced blade. Increases attack damage significantly.',
    descriptionFa: 'تیغه با تعادل عالی که آسیب شمشیر را به شکل چشمگیری بالا می‌برد.',
    goldCost: 110,
    aethCost: 20,
    category: 'weapons',
    rarity: 'epic',
  },
  {
    id: 'shop_cloak',
    name: 'Phantom Shadow Mantle',
    nameFa: 'ردای شبح سایه',
    description: 'Woven with dark aether fibers. Dampens footsteps by 50%.',
    descriptionFa: 'بافته‌شده با الیاف تیره اثیر که صدای گام‌ها را ۵۰٪ کاهش می‌دهد.',
    goldCost: 160,
    aethCost: 35,
    category: 'artifacts',
    rarity: 'legendary',
  },
];

interface ShopModalProps {
  gold: number;
  aeth: number;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (item: ShopItem, currency: 'gold' | 'aeth') => boolean;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  gold,
  aeth,
  language,
  isOpen,
  onClose,
  onBuyItem,
}) => {
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (item: ShopItem, currency: 'gold' | 'aeth') => {
    const success = onBuyItem(item, currency);
    if (success) {
      setPurchaseMsg(`Purchased ${item.name}!`);
      audio.playPickup();
      telegram.triggerNotificationHaptic('success');
      setTimeout(() => setPurchaseMsg(null), 2500);
    } else {
      setPurchaseMsg('Insufficient funds!');
      audio.playAlert();
      telegram.triggerNotificationHaptic('warning');
      setTimeout(() => setPurchaseMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {language === 'fa' ? 'بازار و تاجر شهر باستانی' : 'BAZAAR MERCHANT STALL'}
            </h2>
          </div>

          {/* Currencies */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span className="tabular-nums">{gold} G</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
              <Gem className="w-3.5 h-3.5" />
              <span className="tabular-nums">{aeth} AETH</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {purchaseMsg && (
          <div className="bg-amber-600/20 border-b border-amber-600/40 p-2 text-center text-xs font-semibold text-amber-300">
            {purchaseMsg}
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SHOP_CATALOG.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-amber-500">
                    {item.rarity}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-200 mb-1">
                  {language === 'fa' ? item.nameFa : item.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {language === 'fa' ? item.descriptionFa : item.description}
                </p>
              </div>

              {/* Purchase Options */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  disabled={gold < item.goldCost}
                  onClick={() => handlePurchase(item, 'gold')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs transition-all active:scale-[0.98] ${
                    gold >= item.goldCost
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md cursor-pointer'
                      : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{item.goldCost} Gold</span>
                </button>

                {item.aethCost && (
                  <button
                    disabled={aeth < item.aethCost}
                    onClick={() => handlePurchase(item, 'aeth')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs transition-all active:scale-[0.98] ${
                      aeth >= item.aethCost
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <Gem className="w-3.5 h-3.5" />
                    <span>{item.aethCost} AETH</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          Items purchased are instantly equipped or added to your inventory.
        </div>
      </div>
    </div>
  );
};
