import React from 'react';
import type { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';

interface SettlementReceiptProps {
  receipt: SettlementReceiptType;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M6.5 10.2l2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettlementReceipt: React.FC<SettlementReceiptProps> = ({ receipt }) => {
  return (
    <div className="pp-receipt">
      <div className="flex items-center justify-between">
        <span className="pp-eyebrow">On-Chain Settlement</span>
        {receipt.success ? (
          <span className="pp-verified-badge text-sage-600">
            <CheckIcon className="h-3.5 w-3.5" />
            Verified · Algorand TestNet
          </span>
        ) : (
          <span className="pp-verified-badge text-red-500">Settlement failed</span>
        )}
      </div>

      <div className="pp-receipt-row">
        <span>Amount paid</span>
        <span className="text-ink">{receipt.costUsdc} USDC</span>
      </div>

      {receipt.payer && (
        <div className="pp-receipt-row">
          <span>Payer</span>
          <span>
            {receipt.payer.slice(0, 8)}...{receipt.payer.slice(-6)}
          </span>
        </div>
      )}

      <div className="pp-receipt-row">
        <span>Transaction</span>
        <a
          href={receipt.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ochre-600 underline decoration-dotted underline-offset-2 hover:text-ochre-500"
        >
          {receipt.transaction.slice(0, 10)}...{receipt.transaction.slice(-6)} ↗
        </a>
      </div>
    </div>
  );
};

export default SettlementReceipt;
