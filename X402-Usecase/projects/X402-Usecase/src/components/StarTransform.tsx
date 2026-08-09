import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchStarTransform, StarTransformResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const STAR_FIELDS: { key: keyof Pick<StarTransformResult, 'situation' | 'task' | 'action' | 'result'>; label: string }[] = [
  { key: 'situation', label: 'Situation' },
  { key: 'task', label: 'Task' },
  { key: 'action', label: 'Action' },
  { key: 'result', label: 'Result' },
];

const StarTransform: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [rawNotes, setRawNotes] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StarTransformResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && rawNotes.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleTransform = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchStarTransform({ address: activeAddress, signTransactions }, rawNotes);
      setResult(data);
      setReceipt(settlement);
      setStage('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('error');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-4xl font-light leading-tight text-ink">
          STAR Story <span className="font-medium italic">Transformer</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          A raw project or experience description becomes a structured Situation-Task-Action-Result script for
          behavioral rounds.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="pp-eyebrow">Raw Project / Experience Notes</label>
        <textarea
          className="pp-field-soft h-48"
          placeholder="e.g. Our team's CI pipeline was taking 40 minutes and blocking releases. I profiled the build steps, parallelized the test suite, and added caching…"
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          disabled={isBusy}
        />
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleTransform} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Building script…' : 'Transform into STAR Script'}</span>
        <span className="pp-price-badge">$0.01 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div className="grid gap-4 md:grid-cols-2">
            {STAR_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div className="pp-eyebrow mb-1.5 text-ochre-600">{label}</div>
                <p className="text-[15px] leading-relaxed text-ink-600">{result[key]}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-black/5 pt-6">
            <h5 className="pp-eyebrow mb-2.5">Ready-to-Rehearse Script</h5>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-600">{result.interviewScript}</p>
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default StarTransform;
