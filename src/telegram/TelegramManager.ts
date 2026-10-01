import { TelegramUser } from '../types/game';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: TelegramUser;
          query_id?: string;
          auth_date?: string;
          hash?: string;
        };
        colorScheme?: 'light' | 'dark';
        themeParams?: Record<string, string>;
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        headerColor?: string;
        backgroundColor?: string;
        BackButton?: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

export class TelegramManager {
  private static instance: TelegramManager;
  public isInsideTelegram = false;
  public user: TelegramUser;

  private constructor() {
    this.user = {
      id: 'tg_dev_1001',
      first_name: 'Aether Rogue',
      username: 'shadow_scout',
      is_premium: true,
    };
    this.init();
  }

  public static getInstance(): TelegramManager {
    if (!TelegramManager.instance) {
      TelegramManager.instance = new TelegramManager();
    }
    return TelegramManager.instance;
  }

  private init() {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        this.isInsideTelegram = true;
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe?.user) {
          this.user = {
            id: tg.initDataUnsafe.user.id,
            first_name: tg.initDataUnsafe.user.first_name || 'Adventurer',
            last_name: tg.initDataUnsafe.user.last_name,
            username: tg.initDataUnsafe.user.username || 'shadow_operative',
            language_code: tg.initDataUnsafe.user.language_code,
            is_premium: tg.initDataUnsafe.user.is_premium,
          };
        }
      }
    } catch {
      // Safe fallback if execution occurs outside Telegram
      this.isInsideTelegram = false;
    }
  }

  public triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = style === 'light' || style === 'soft' ? 15 : style === 'medium' ? 35 : 60;
        navigator.vibrate(duration);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }

  public triggerNotificationHaptic(type: 'success' | 'warning' | 'error' = 'success') {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 40, 30]);
      }
    } catch {
      // Ignore
    }
  }
}

export const telegram = TelegramManager.getInstance();
