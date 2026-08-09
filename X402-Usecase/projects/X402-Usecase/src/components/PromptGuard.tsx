import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchPromptGuard, PromptGuardResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const RISK_DOT: Record<PromptGuardResult['riskLevel'], string> = {
  low: 'bg-sage-500',
  medium: 'bg-ochre-500',
  high: 'bg-red-500',
};

const PromptGuard: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [inputText, setInputText] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PromptGuardResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && inputText.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleAudit = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchPromptGuard({ address: activeAddress, signTransactions }, inputText);
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
          Prompt-Guard <span className="font-medium italic">Auditor</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          Check a resume or any user-submitted text for prompt-injection attempts, hidden-text tricks, or policy
          violations before it reaches downstream AI tools.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="pp-eyebrow">Input Text</label>
        <textarea
          className="pp-field-soft h-48 font-mono"
          placeholder="Paste resume text or any other user-submitted string here…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isBusy}
        />
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleAudit} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Auditing…' : 'Run Security Audit'}</span>
        <span className="pp-price-badge">$0.005 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h4 className="font-display text-xl font-medium text-ink">Audit Report</h4>
              <p className="mt-1 text-sm text-black/45">{result.sanitizedSummary}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-ink-500">
                <span className={`h-1.5 w-1.5 rounded-full ${RISK_DOT[result.riskLevel]}`} />
                {result.riskLevel} risk
              </span>
              <span className={`text-xs font-medium ${result.safeToProceed ? 'text-sage-600' : 'text-red-600'}`}>
                {result.safeToProceed ? 'Safe to proceed' : 'Not safe to proceed'}
              </span>
            </div>
          </div>

          <div className="border-t border-black/5 pt-6">
            <h5 className="pp-eyebrow mb-2.5">Findings</h5>
            {result.findings.length === 0 ? (
              <span className="text-sm text-sage-600">No injection attempts or hidden-text tricks detected.</span>
            ) : (
              <ul className="flex flex-col gap-2">
                {result.findings.map((f, i) => (
                  <li key={i} className="text-[15px] leading-relaxed text-ink-600">
                    <span className="font-medium text-red-600">{f.type}: </span>
                    {f.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default PromptGuard;
