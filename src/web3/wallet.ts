import { WalletState, WalletProvider } from './types';

class WalletService {
  private static instance: WalletService;
  private state: WalletState = {
    isConnected: false,
    address: null,
    provider: null,
    network: 'testnet',
    isConnecting: false,
    error: null,
  };
  private listeners: ((state: WalletState) => void)[] = [];

  private constructor() {
    // Check saved wallet state from localStorage
    try {
      const saved = localStorage.getItem('soa_wallet_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address) {
          this.state = {
            ...this.state,
            isConnected: true,
            address: parsed.address,
            provider: parsed.provider || 'ton',
          };
        }
      }
    } catch {
      // Ignore
    }
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public getState(): WalletState {
    return { ...this.state };
  }

  public subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getState()));
    try {
      if (this.state.isConnected && this.state.address) {
        localStorage.setItem(
          'soa_wallet_state',
          JSON.stringify({
            address: this.state.address,
            provider: this.state.provider,
          })
        );
      } else {
        localStorage.removeItem('soa_wallet_state');
      }
    } catch {
      // Ignore
    }
  }

  public async connect(provider: WalletProvider = 'ton'): Promise<boolean> {
    this.state.isConnecting = true;
    this.state.error = null;
    this.notify();

    // Simulate realistic async wallet connection handshake
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const mockAddresses: Record<WalletProvider, string> = {
        ton: 'EQD3oP7...4nK9aether',
        telegram_wallet: 'UQBc1_9...mX8tgAeth',
        evm: '0x71C...a89Fe42',
      };

      const address = mockAddresses[provider] || 'EQB01_AetherRogue_9xZ2';

      this.state = {
        isConnected: true,
        address,
        provider,
        network: 'testnet',
        isConnecting: false,
        error: null,
      };
      this.notify();
      return true;
    } catch {
      this.state.isConnecting = false;
      this.state.error = 'Failed to connect wallet';
      this.notify();
      return false;
    }
  }

  public disconnect() {
    this.state = {
      isConnected: false,
      address: null,
      provider: null,
      network: 'offline',
      isConnecting: false,
      error: null,
    };
    this.notify();
  }
}

export const walletService = WalletService.getInstance();
