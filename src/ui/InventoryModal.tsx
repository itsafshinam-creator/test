import React, { useState } from 'react';
import { InventoryItem, ItemCategory, Language } from '../types/game';
import { X, Sword, Sparkles, Scroll, FlaskConical, Check } from 'lucide-react';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

interface InventoryModalProps {
  inventory: InventoryItem[];
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onUseItem: (item: InventoryItem) => void;
  onEquipItem: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  language,
  isOpen,
  onClose,
  onUseItem,
  onEquipItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('weapons');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const filteredItems = inventory.filter((item) => item.category === selectedCategory);
  const activeItem = selectedItem || filteredItems[0] || null;

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 border-amber-500/50 bg-amber-950/30';
      case 'epic':
        return 'text-purple-400 border-purple-500/50 bg-purple-950/30';
      case 'rare':
        return 'text-sky-400 border-sky-500/50 bg-sky-950/30';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-900/40';
    }
  };

  const handleUse = (item: InventoryItem) => {
    onUseItem(item);
    audio.playPickup();
    telegram.triggerNotificationHaptic('success');
  };

  const handleEquip = (item: InventoryItem) => {
    onEquipItem(item);
    audio.playUI();
    telegram.triggerHaptic('medium');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-3xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {language === 'fa' ? 'کوله‌پشتی و تجهیزات' : 'INVENTORY & ARTIFACTS'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto">
          {(
            [
              { id: 'weapons', label: 'Weapons', labelFa: 'سلاح‌ها', icon: Sword },
              { id: 'consumables', label: 'Consumables', labelFa: 'معجون‌ها', icon: FlaskConical },
              { id: 'artifacts', label: 'Artifacts', labelFa: 'عتیقه‌ها', icon: Sparkles },
              { id: 'quest', label: 'Quest Items', labelFa: 'آیتم‌های مأموریت', icon: Scroll },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setSelectedItem(null);
                  audio.playUI();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-600/90 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? tab.labelFa : tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Grid of items (left) + Inspection Details (right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left: Items Grid */}
          <div className="p-4 overflow-y-auto max-h-[45vh] md:max-h-[60vh] flex flex-col gap-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {language === 'fa' ? 'هیچ آیتمی در این بخش وجود ندارد' : 'No items found in this category'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    audio.playUI();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    activeItem?.id === item.id
                      ? 'bg-amber-950/20 border-amber-500/80 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                      {item.category === 'weapons' && <Sword className="w-5 h-5" />}
                      {item.category === 'consumables' && <FlaskConical className="w-5 h-5 text-emerald-400" />}
                      {item.category === 'artifacts' && <Sparkles className="w-5 h-5 text-sky-400" />}
                      {item.category === 'quest' && <Scroll className="w-5 h-5 text-amber-300" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-200">
                          {language === 'fa' ? item.nameFa : item.name}
                        </h4>
                        {item.equipped && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded font-bold">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {item.rarity} · Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-amber-400 font-semibold tabular-nums">
                    {item.value} Gold
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Right: Item Details */}
          <div className="p-4 sm:p-6 bg-slate-950/40 flex flex-col justify-between overflow-y-auto">
            {activeItem ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border mb-1.5 ${getRarityBadge(
                        activeItem.rarity
                      )}`}
                    >
                      {activeItem.rarity}
                    </span>
                    <h3 className="text-lg font-cinzel font-bold text-amber-400">
                      {language === 'fa' ? activeItem.nameFa : activeItem.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-amber-400 font-bold text-sm tabular-nums">
                      {activeItem.value} GOLD
                    </div>
                    {activeItem.aethValue && (
                      <div className="text-sky-400 text-xs font-semibold tabular-nums">
                        {activeItem.aethValue} AETH
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {language === 'fa' ? activeItem.descriptionFa : activeItem.description}
                </div>

                {activeItem.effect && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-700/40 flex items-center justify-between text-xs text-emerald-300">
                    <span>Active Effect:</span>
                    <span className="font-semibold uppercase">
                      +{activeItem.effect.amount}{' '}
                      {activeItem.effect.type === 'heal' ? 'HP Restoration' : 'Sec Obscurity'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an item to view details
              </div>
            )}

            {activeItem && (
              <div className="pt-4 border-t border-slate-800 mt-4 flex gap-2">
                {activeItem.category === 'consumables' && (
                  <button
                    onClick={() => handleUse(activeItem)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                  >
                    {language === 'fa' ? 'مصرف معجون' : 'USE CONSUMABLE'}
                  </button>
                )}

                {activeItem.category === 'weapons' && (
                  <button
                    onClick={() => handleEquip(activeItem)}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                      activeItem.equipped
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                    }`}
                  >
                    {activeItem.equipped ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'fa' ? 'تجهیز شده' : 'EQUIPPED'}</span>
                      </>
                    ) : (
                      <span>{language === 'fa' ? 'تجهیز سلاح' : 'EQUIP WEAPON'}</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
