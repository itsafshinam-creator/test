import { NFTBadge } from './types';
import { blockchainService } from './blockchain';

const INITIAL_BADGES: NFTBadge[] = [
  {
    id: 'badge_relic_hunter',
    name: 'Ancient Relic Hunter',
    nameFa: 'شکارچی عتیقه باستانی',
    description: 'Recovered the lost mystical Aether Relic from the fortified Citadel of the Forgotten City.',
    rarity: 'legendary',
    imageUrl: '/src/assets/images/ancient_relic_icon_1790880130287.jpg',
    contractAddress: 'EQCtv_9821...aetherNFT',
    tokenId: '#0042',
  },
  {
    id: 'badge_shadow_master',
    name: 'Master of Shadows',
    nameFa: 'استاد سایه‌ها',
    description: 'Performed 5 flawless stealth takedowns without sounding city alarm bells.',
    rarity: 'epic',
    imageUrl: '/src/assets/images/ancient_relic_icon_1790880130287.jpg',
    contractAddress: 'EQCtv_9821...aetherNFT',
    tokenId: '#0108',
  },
  {
    id: 'badge_rooftop_phantom',
    name: 'Rooftop Phantom',
    nameFa: 'شبح پشت‌بام‌ها',
    description: 'Scaled the grand Spire of Aether and mapped the ancient patrol routes.',
    rarity: 'rare',
    imageUrl: '/src/assets/images/ancient_relic_icon_1790880130287.jpg',
    contractAddress: 'EQCtv_9821...aetherNFT',
    tokenId: '#0341',
  },
];

class NFTService {
  private static instance: NFTService;
  private badges: NFTBadge[] = [];

  private constructor() {
    try {
      const saved = localStorage.getItem('soa_unlocked_nfts');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        this.badges = INITIAL_BADGES.map((b) => ({
          ...b,
          unlockedAt: ids.includes(b.id) ? Date.now() : undefined,
        }));
      } else {
        this.badges = INITIAL_BADGES;
      }
    } catch {
      this.badges = INITIAL_BADGES;
    }
  }

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  public getBadges(): NFTBadge[] {
    return [...this.badges];
  }

  public async unlockBadge(badgeId: string): Promise<boolean> {
    const badge = this.badges.find((b) => b.id === badgeId);
    if (!badge || badge.unlockedAt) return false;

    badge.unlockedAt = Date.now();
    try {
      const unlockedIds = this.badges.filter((b) => b.unlockedAt).map((b) => b.id);
      localStorage.setItem('soa_unlocked_nfts', JSON.stringify(unlockedIds));
      await blockchainService.recordTransaction('mint_badge', 0, 'AETH');
    } catch {
      // Ignore
    }
    return true;
  }
}

export const nftService = NFTService.getInstance();
