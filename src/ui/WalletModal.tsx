import React, { useState, useEffect } from 'react';
import { walletService } from '../web3/wallet';
import { tokenService } from '../web3/token';
import { nftService } from '../web3/nft';
import { blockchainService } from '../web3/blockchain';
import { WalletState, NFTBadge, BlockchainTransaction } from '../web3/types';
import { Language } from '../types/game';
import { X, Wallet, Gem, ShieldCheck, ArrowUpRight, Copy, Check, RefreshCw, Award } from 'lucide-react';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

interface WalletModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ language, isOpen, onClose }) => {
  const [wallet, setWallet] = useState<WalletState>(walletService.getState());
  const [aethBalance, setAethBalance] = useState<number>(tokenService.getBalance());
  const [badges, setBadges] = useState<NFTBadge[]>(nftService.getBadges());
  const [txHistory, setTxHistory] = useState<BlockchainTransaction[]>(blockchainService.getHistory());
  const [copied, setCopied] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubWallet = walletService.subscribe(setWallet);
    const unsubToken = tokenService.subscribe(setAethBalance);
    return () => {
      unsubWallet();
      unsubToken();
    };
  }, []);

  if (!isOpen) return null;

  const handleConnect = async (provider: 'ton' | 'telegram_wallet') => {
    audio.playUI();
    const ok = await walletService.connect(provider);
    if (ok) {
      telegram.triggerNotificationHaptic('success');
      setTxHistory(blockchainService.getHistory());
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    audio.playUI();
  };

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      telegram.triggerHaptic('light');
    }
  };

  const handleFaucet = async () => {
    setFaucetLoading(true);
    audio.playUI();
    const res = await tokenService.requestFaucet();
    setFaucetLoading(false);
    setStatusMsg(res.message);
    if (res.success) {
      audio.playPickup();
      telegram.triggerNotificationHaptic('success');
      setTxHistory(blockchainService.getHistory());
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full bg-[#0d1117] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-cinzel font-bold text-amber-400">
              {language === 'fa' ? 'اکوسیستم وب۳ و توکن اثیر' : 'WEB3 & AETHER ECOSYSTEM'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="bg-sky-950/60 border-b border-sky-600/40 p-2 text-center text-xs font-semibold text-sky-300">
            {statusMsg}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* Card: Wallet State & Token Balance */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                {language === 'fa' ? 'موجودی توکن اصلی' : 'Primary Ecosystem Token'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-cinzel text-sky-400 tabular-nums">
                  {aethBalance}
                </span>
                <span className="text-sm font-bold text-sky-300">AETH</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Network: <strong className="text-emerald-400 uppercase">{wallet.network}</strong>
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {wallet.isConnected ? (
                <>
                  <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                    <span className="font-mono text-slate-300">{wallet.address}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={faucetLoading}
                      onClick={handleFaucet}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${faucetLoading ? 'animate-spin' : ''}`} />
                      <span>Faucet +100</span>
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
                    >
                      Disconnect
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleConnect('ton')}
                    className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Connect TON Wallet</span>
                  </button>
                  <button
                    onClick={() => handleConnect('telegram_wallet')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
                  >
                    <span>Telegram Wallet</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: NFT Achievement Badges */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-cinzel font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{language === 'fa' ? 'نشان‌های دیجیتال (NFT Badges)' : 'On-Chain NFT Badges'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {badges.filter((b) => b.unlockedAt).length} / {badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2.5 transition-all ${
                    badge.unlockedAt
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-md">
                    <img
                      src={badge.imageUrl}
                      alt={badge.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {language === 'fa' ? badge.nameFa : badge.name}
                    </h4>
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">
                      {badge.rarity} · {badge.tokenId}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {badge.description}
                  </p>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      badge.unlockedAt
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {badge.unlockedAt ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Transaction Ledger */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {language === 'fa' ? 'تاریخچه تراکنش‌های آزمایشی' : 'Recent Testnet Ledger'}
            </h3>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden text-xs divide-y divide-slate-800">
              {txHistory.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No recorded transactions yet</div>
              ) : (
                txHistory.slice(0, 4).map((tx, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-sky-400">{tx.hash}</span>
                      <span className="text-slate-400 capitalize">({tx.type.replace('_', ' ')})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-400">
                        {tx.amount > 0 ? `+${tx.amount} ${tx.token}` : 'NFT Mint'}
                      </span>
                      <span className="text-[10px] text-emerald-400 uppercase">Confirmed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Offline Friendly Guarantee */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Offline-Friendly: Shadows of Aether remains 100% playable even if blockchain services are unavailable.
          </span>
        </div>
      </div>
    </div>
  );
};
