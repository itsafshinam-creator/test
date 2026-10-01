export type WalletProvider = 'ton' | 'evm' | 'telegram_wallet';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: WalletProvider | null;
  network: 'testnet' | 'mainnet' | 'offline';
  isConnecting: boolean;
  error: string | null;
}

export interface NFTBadge {
  id: string;
  name: string;
  nameFa: string;
  description: string;
  rarity: 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  contractAddress: string;
  tokenId: string;
  unlockedAt?: number;
}

export interface BlockchainTransaction {
  hash: string;
  type: 'claim_reward' | 'buy_item' | 'mint_badge' | 'faucet';
  amount: number;
  token: 'AETH' | 'TON';
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}
