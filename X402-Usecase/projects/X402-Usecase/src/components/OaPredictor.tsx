import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchOaPredictor, OaPredictorResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const OaPredictor: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OaPredictorResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && companyName.trim().length > 0 && targetRole.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handlePredict = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchOaPredictor(
        { address: activeAddress, signTransactions },
        companyName,
        targetRole
      );
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
          OA Pattern <span className="font-medium italic">Predictor</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          A company and target role, translated into likely DSA patterns, edge-case alerts, and sample topics to
          practice.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Company Name</label>
          <input
            className="pp-field"
            placeholder="e.g. Flipkart"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isBusy}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Target Role</label>
          <input
            className="pp-field"
            placeholder="e.g. SDE Intern"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <button className="pp-btn-pay w-fit" onClick={handlePredict} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Predicting…' : 'Predict OA Patterns'}</span>
        <span className="pp-price-badge">$0.01 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <p className="text-[15px] leading-relaxed text-ink-600">{result.summary}</p>

          <div className="grid gap-6 border-t border-black/5 pt-6 md:grid-cols-2">
            <div>
              <h5 className="pp-eyebrow mb-2.5">Likely DSA Patterns</h5>
              <div className="flex flex-wrap gap-1.5">
                {result.likelyPatterns.map((p, i) => (
                  <span key={i} className="pp-chip">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="pp-eyebrow mb-2.5">Edge-Case Alerts</h5>
              <div className="flex flex-wrap gap-1.5">
                {result.edgeCaseAlerts.map((e, i) => (
                  <span key={i} className="pp-chip-ochre">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h5 className="pp-eyebrow mb-2.5">Sample Topics to Practice</h5>
            <ul className="flex flex-col gap-2">
              {result.sampleTopics.map((t, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-600">
                  <span className="font-mono text-xs text-black/30">{String(i + 1).padStart(2, '0')}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default OaPredictor;
