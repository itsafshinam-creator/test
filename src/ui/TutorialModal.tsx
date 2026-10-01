import React, { useState } from 'react';
import { Language } from '../types/game';
import { X, Navigation, Wind, Footprints, Sword, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import { audio } from '../audio/AudioManager';

interface TutorialModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_SLIDES = [
  {
    icon: Navigation,
    title: 'Movement & Camera',
    titleFa: 'حرکت و کنترل دوربین',
    desc: 'On Desktop: Use [WASD] to move, hold [Shift] to sprint. On Mobile: Use the Virtual Analog Joystick on the left. Drag anywhere across the screen to orbit the third-person camera.',
    descFa: 'در کامپیوتر: با کلیدهای WASD حرکت کنید و شیفت را برای دویدن نگه دارید. در موبایل: از جوی‌استیک لمسی سمت چپ استفاده کنید و با کشیدن انگشت روی صفحه دوربین را بچرخانید.',
  },
  {
    icon: Wind,
    title: 'Parkour & Ledge Climbing',
    titleFa: 'پارکور و صعود از لبه‌ها',
    desc: 'Run towards low crates or walls and press [Space] or the [Jump] button to smoothly vault over them. When facing tall walls and balconies, jump to grab ledges and hoist yourself up.',
    descFa: 'به سمت جعبه‌ها یا موانع حرکت کرده و کلید پرش را بزنید تا از روی آن‌ها بپرید. برای دیوارهای بلند، پرش به لبه باعث گرفتن آن و بالا کشیدن می‌شود.',
  },
  {
    icon: Footprints,
    title: 'Stealth & Hiding Spots',
    titleFa: 'مخفی‌کاری و نقاط پنهان‌شدن',
    desc: 'Press [C] or the [Stealth] button to crouch. Crouching dampens your footsteps and halves enemy vision range. Step inside Straw Hay Wagons or dark archways to become completely invisible!',
    descFa: 'با کلید C یا دکمه لمسی مخفی‌کاری بنشینید. نشستن صدای پا را قطع و دید نگهبان را نصف می‌کند. رفتن درون ارابه‌های کاه یا طاق‌های تاریک شما را کاملاً نامرئی می‌کند!',
  },
  {
    icon: Sword,
    title: 'Combat & Stealth Takedowns',
    titleFa: 'مبارزه و ضربات غافلگیرانه',
    desc: 'Sneak behind unalerted guards to trigger an instant [Stealth Takedown]! In direct melee combat, chain Light Attacks [L-Click], perform Heavy Strikes [R-Click], or Block to absorb enemy blows.',
    descFa: 'از پشت به نگهبانان بی‌خبر نزدیک شوید تا حمله مخفیانه فعال شود! در مبارزه مستقیم از ترکیب ضربات سبک، ضربه سنگین و دفاع برای دفع ضربات استفاده کنید.',
  },
  {
    icon: Award,
    title: 'Missions & Web3 Rewards',
    titleFa: 'مأموریت‌ها و پاداش‌های بلاکچین',
    desc: 'Speak with Merchant Darius and Master Elion to accept epic quests. Complete objectives to earn XP, Gold, and AETH testnet tokens. Connect your TON / Telegram Wallet to claim NFT badges!',
    descFa: 'با بازرگان داریوش و استاد الیون برای دریافت مأموریت‌ها صحبت کنید. انجام مأموریت‌ها سکه، تجربه و توکن AETH به همراه دارد و می‌توانید نشان‌های NFT را در کیف پول فعال کنید.',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ language, isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = TUTORIAL_SLIDES[currentSlide];
  const Icon = slide.icon;

  const nextSlide = () => {
    if (currentSlide < TUTORIAL_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
      audio.playUI();
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      audio.playUI();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-lg w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-amber-500 tracking-wider font-cinzel">
            {language === 'fa' ? 'راهنمای کامل بازی' : 'SHADOWS OF AETHER GUIDE'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl">
            <Icon className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-cinzel font-bold text-amber-300">
            {language === 'fa' ? slide.titleFa : slide.title}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-md">
            {language === 'fa' ? slide.descFa : slide.desc}
          </p>

          {/* Slide dots */}
          <div className="flex items-center gap-1.5 mt-2">
            {TUTORIAL_SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'w-6 bg-amber-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            disabled={currentSlide === 0}
            onClick={prevSlide}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              currentSlide === 0 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextSlide}
            className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-slate-950 shadow-md flex items-center gap-1 transition-all"
          >
            <span>{currentSlide === TUTORIAL_SLIDES.length - 1 ? 'Start Adventure' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
