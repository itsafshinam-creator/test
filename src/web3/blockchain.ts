import { BlockchainTransaction } from './types';

class BlockchainService {
  private static instance: BlockchainService;
  private txHistory: BlockchainTransaction[] = [];
  private isOnline = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => (this.isOnline = true));
      window.addEventListener('offline', () => (this.isOnline = false));
    }
  }

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  public isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  public async recordTransaction(
    type: BlockchainTransaction['type'],
    amount: number,
    token: 'AETH' | 'TON' = 'AETH'
  ): Promise<BlockchainTransaction> {
    const randomHex = Math.random().toString(16).substring(2, 10);
    const tx: BlockchainTransaction = {
      hash: `0x${randomHex}e9...7a4f`,
      type,
      amount,
      token,
      timestamp: Date.now(),
      status: this.isOnline ? 'success' : 'failed',
    };

    this.txHistory.unshift(tx);
    return tx;
  }

  public getHistory(): BlockchainTransaction[] {
    return [...this.txHistory];
  }
}

export const blockchainService = BlockchainService.getInstance();
