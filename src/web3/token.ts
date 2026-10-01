import { blockchainService } from './blockchain';
import { walletService } from './wallet';

export class TokenService {
  private static instance: TokenService;
  private tokenBalance = 50; // Starting testnet AETH tokens
  private listeners: ((balance: number) => void)[] = [];

  private constructor() {
    try {
      const saved = localStorage.getItem('soa_aeth_balance');
      if (saved) {
        this.tokenBalance = Number(saved) || 50;
      }
    } catch {
      // Ignore
    }
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  public getBalance(): number {
    return this.tokenBalance;
  }

  public subscribe(listener: (balance: number) => void): () => void {
    this.listeners.push(listener);
    listener(this.tokenBalance);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.tokenBalance));
    try {
      localStorage.setItem('soa_aeth_balance', this.tokenBalance.toString());
    } catch {
      // Ignore
    }
  }

  public async claimReward(amount: number): Promise<boolean> {
    this.tokenBalance += amount;
    this.notify();
    await blockchainService.recordTransaction('claim_reward', amount, 'AETH');
    return true;
  }

  public async spendTokens(amount: number): Promise<boolean> {
    if (this.tokenBalance < amount) return false;
    this.tokenBalance -= amount;
    this.notify();
    await blockchainService.recordTransaction('buy_item', amount, 'AETH');
    return true;
  }

  public async requestFaucet(): Promise<{ success: boolean; amount: number; message: string }> {
    const wallet = walletService.getState();
    if (!wallet.isConnected) {
      return { success: false, amount: 0, message: 'Connect wallet to request testnet tokens' };
    }

    const faucetAmount = 100;
    this.tokenBalance += faucetAmount;
    this.notify();
    await blockchainService.recordTransaction('faucet', faucetAmount, 'AETH');
    return {
      success: true,
      amount: faucetAmount,
      message: `Received +${faucetAmount} AETH testnet tokens!`,
    };
  }
}

export const tokenService = TokenService.getInstance();
