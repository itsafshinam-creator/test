export type Language = 'en' | 'fa';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  sfxVolume: number;
  musicVolume: number;
  haptics: boolean;
  cameraSensitivity: number;
  language: Language;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  damage: number;
  movementSpeed: number;
  stealthBonus: number;
  unspentAttributePoints: number;
}

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemCategory = 'weapons' | 'artifacts' | 'quest' | 'consumables';

export interface InventoryItem {
  id: string;
  name: string;
  nameFa: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  descriptionFa: string;
  value: number; // gold value
  aethValue?: number; // token value
  equipped?: boolean;
  quantity: number;
  icon?: string;
  effect?: {
    type: 'heal' | 'stamina' | 'smoke_bomb' | 'damage_buff';
    amount: number;
  };
}

export interface Objective {
  id: string;
  text: string;
  textFa: string;
  current: number;
  required: number;
  completed: boolean;
}

export type MissionStatus = 'locked' | 'available' | 'active' | 'completed';

export interface Mission {
  id: string;
  chapter: number;
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  status: MissionStatus;
  objectives: Objective[];
  reward: {
    xp: number;
    gold: number;
    aeth: number;
    itemId?: string;
  };
}

export type EnemyState =
  | 'idle'
  | 'patrol'
  | 'suspicious'
  | 'alert'
  | 'chase'
  | 'attack'
  | 'search'
  | 'return'
  | 'dead';

export interface EnemyData {
  id: string;
  name: string;
  type: 'guard' | 'archer' | 'sentinel' | 'warden';
  x: number;
  y: number;
  z: number;
  patrolPoints: [number, number, number][];
  currentPatrolIndex: number;
  state: EnemyState;
  hp: number;
  maxHp: number;
  detectionLevel: number; // 0 to 100
  alertTime: number;
  lastKnownPlayerPos?: [number, number, number];
}

export interface NPCData {
  id: string;
  name: string;
  nameFa: string;
  role: 'merchant' | 'mentor' | 'informant' | 'citizen';
  x: number;
  y: number;
  z: number;
  portrait?: string;
  dialogueId: string;
}

export interface DialogueOption {
  text: string;
  textFa: string;
  nextDialogueId?: string;
  action?: 'open_shop' | 'accept_quest' | 'claim_reward' | 'close';
  questId?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerFa: string;
  text: string;
  textFa: string;
  portrait?: string;
  options: DialogueOption[];
}

export interface CollectibleData {
  id: string;
  name: string;
  nameFa: string;
  type: 'relic' | 'scarab' | 'tome' | 'chest';
  x: number;
  y: number;
  z: number;
  collected: boolean;
  valueGold: number;
  valueAeth: number;
}

export interface SaveData {
  saveVersion: number;
  lastSaved: number;
  playerStats: PlayerStats;
  currencies: {
    gold: number;
    aeth: number;
  };
  inventory: InventoryItem[];
  missions: Mission[];
  collectibles: Record<string, boolean>;
  unlockedAreas: string[];
  settings: GameSettings;
  tutorialCompleted: boolean;
  playerPos: [number, number, number];
}

export interface TelegramUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}
