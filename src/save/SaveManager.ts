import { SaveData, GameSettings, PlayerStats, InventoryItem, Mission } from '../types/game';

const SAVE_KEY = 'soa_game_save_v1';
export const CURRENT_SAVE_VERSION = 1;

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'high',
  sfxVolume: 0.8,
  musicVolume: 0.6,
  haptics: true,
  cameraSensitivity: 1.0,
  language: 'en',
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  hp: 100,
  maxHp: 100,
  stamina: 100,
  maxStamina: 100,
  damage: 22,
  movementSpeed: 5.5,
  stealthBonus: 1.0,
  unspentAttributePoints: 1,
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_shadow_dagger',
    name: 'Shadow Dagger',
    nameFa: 'خنجر سایه',
    category: 'weapons',
    rarity: 'rare',
    description: 'Forged from dark Damascus steel. Silent, lightweight, and balanced for swift takedowns.',
    descriptionFa: 'ساخته‌شده از فولاد دمشقی تیره. بی‌صدا و مناسب برای ضربات مخفیانه.',
    value: 60,
    aethValue: 10,
    equipped: true,
    quantity: 1,
  },
  {
    id: 'item_health_elixir',
    name: 'Aetherial Health Elixir',
    nameFa: 'معجون سلامتی اثیری',
    category: 'consumables',
    rarity: 'common',
    description: 'Restores 45 HP instantly with a burst of crystalline soothing vapor.',
    descriptionFa: '۴۵ واحد سلامت را بلافاصله بازیابی می‌کند.',
    value: 20,
    quantity: 3,
    effect: { type: 'heal', amount: 45 },
  },
  {
    id: 'item_smoke_bomb',
    name: 'Smoke Grenade',
    nameFa: 'بمب دودزا',
    category: 'consumables',
    rarity: 'rare',
    description: 'Detonates a dense cloud of obscure smoke, instantly breaking enemy line-of-sight for 8s.',
    descriptionFa: 'ایجاد ابری متراکم برای قطع دید دشمنان به مدت ۸ ثانیه.',
    value: 35,
    quantity: 2,
    effect: { type: 'smoke_bomb', amount: 8 },
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission_missing_relic',
    chapter: 1,
    title: 'The Missing Relic',
    titleFa: 'عتیقه گمشده',
    description: 'Infiltrate the heavily guarded Ancient Citadel, locate the sanctuary vault, and recover the lost Aether Relic for Merchant Darius.',
    descriptionFa: 'به قلعه باستانی تحت نگهبانی نفوذ کن، خزانه را پیدا کن و عتیقه اثیر را برای بازرگان داریوش برگردان.',
    status: 'active',
    objectives: [
      { id: 'obj_talk_merchant', text: 'Speak with Merchant Darius at the Grand Bazaar', textFa: 'با بازرگان داریوش در بازار صحبت کن', current: 0, required: 1, completed: false },
      { id: 'obj_infiltrate_citadel', text: 'Infiltrate the restricted Citadel courtyard', textFa: 'به حیاط محافظت‌شده قلعه نفوذ کن', current: 0, required: 1, completed: false },
      { id: 'obj_retrieve_relic', text: 'Retrieve the Ancient Aether Relic from the chest', textFa: 'عتیقه اثیر را از صندوق بازیابی کن', current: 0, required: 1, completed: false },
      { id: 'obj_return_darius', text: 'Return safely to Darius with the Relic', textFa: 'با عتیقه نزد داریوش بازگرد', current: 0, required: 1, completed: false },
    ],
    reward: {
      xp: 150,
      gold: 120,
      aeth: 50,
      itemId: 'item_shadow_cloak',
    },
  },
  {
    id: 'mission_rooftop_shadows',
    chapter: 2,
    title: 'Shadows on the Rooftops',
    titleFa: 'سایه‌ها بر فراز پشت‌بام‌ها',
    description: 'Use your parkour agility to scale the Great Spire, scout the elite guard watchtowers, and retrieve the intercepted courier scroll.',
    descriptionFa: 'از چابکی پارکور برای صعود به مناره بزرگ استفاده کن و طومار پیام‌رسان را بدون جلب توجه بدست آور.',
    status: 'available',
    objectives: [
      { id: 'obj_climb_spire', text: 'Climb to the high Spire Vantage Point', textFa: 'به بالای مناره بزرگ صعود کن', current: 0, required: 1, completed: false },
      { id: 'obj_retrieve_scroll', text: 'Steal the encrypted courier dispatch', textFa: 'طومار رمزگذاری‌شده را بردار', current: 0, required: 1, completed: false },
      { id: 'obj_escape_undetected', text: 'Escape the district without raising the alarm', textFa: 'بدون فعال کردن آژیر از منطقه خارج شو', current: 0, required: 1, completed: false },
    ],
    reward: {
      xp: 200,
      gold: 180,
      aeth: 75,
    },
  },
];

export class SaveManager {
  private static instance: SaveManager;
  private currentData: SaveData;
  private autoSaveTimer: number | null = null;

  private constructor() {
    this.currentData = this.loadInitial();
    this.startAutoSave();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  private loadInitial(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.saveVersion === CURRENT_SAVE_VERSION) {
          return parsed;
        }
        // Migration logic for future save versions:
        return {
          ...this.getDefaultSave(),
          ...parsed,
          saveVersion: CURRENT_SAVE_VERSION,
        };
      }
    } catch {
      // In case of parsing error, return pristine default state
    }
    return this.getDefaultSave();
  }

  public getDefaultSave(): SaveData {
    return {
      saveVersion: CURRENT_SAVE_VERSION,
      lastSaved: Date.now(),
      playerStats: { ...DEFAULT_PLAYER_STATS },
      currencies: {
        gold: 150,
        aeth: 50,
      },
      inventory: [...INITIAL_INVENTORY],
      missions: [...INITIAL_MISSIONS],
      collectibles: {},
      unlockedAreas: ['bazaar', 'main_street'],
      settings: { ...DEFAULT_SETTINGS },
      tutorialCompleted: false,
      playerPos: [0, 0.5, 12],
    };
  }

  public getData(): SaveData {
    return this.currentData;
  }

  public save(data?: Partial<SaveData>) {
    if (data) {
      this.currentData = { ...this.currentData, ...data, lastSaved: Date.now() };
    } else {
      this.currentData.lastSaved = Date.now();
    }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.currentData));
    } catch {
      // Fallback
    }
  }

  public resetProgress() {
    this.currentData = this.getDefaultSave();
    this.save();
  }

  private startAutoSave() {
    if (typeof window !== 'undefined') {
      this.autoSaveTimer = window.setInterval(() => {
        this.save();
      }, 30000);
    }
  }
}

export const saveManager = SaveManager.getInstance();
