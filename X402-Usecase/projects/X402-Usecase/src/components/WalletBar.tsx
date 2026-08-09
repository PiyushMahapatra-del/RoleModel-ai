import { useWallet } from '@txnlab/use-wallet-react';
import React from 'react';

interface WalletBarProps {
  onOpenWalletModal: () => void;
}

const WalletBar: React.FC<WalletBarProps> = ({ onOpenWalletModal }) => {
  const { activeAddress } = useWallet();

  return (
    <button
      onClick={onOpenWalletModal}
      data-test-id="connect-wallet"
      className="flex w-full items-center gap-2.5 rounded-2xl border border-black/10 px-4 py-3 text-left transition-colors hover:border-black/20"
    >
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${activeAddress ? 'bg-sage-500' : 'bg-black/20'}`} />
      <span className="flex flex-col">
        <span className="font-mono text-[11px] uppercase tracking-widest text-black/35">
          {activeAddress ? 'Connected' : 'Wallet'}
        </span>
        <span className="text-[13px] font-medium text-ink">
          {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connect Wallet'}
        </span>
      </span>
    </button>
  );
};

export default WalletBar;
