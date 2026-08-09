import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchResumeRate, ResumeRateResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const color = score >= 75 ? 'bg-sage-500' : score >= 50 ? 'bg-ochre-500' : 'bg-red-400';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-ink-600">{label}</span>
        <span className="font-mono text-ink">{score}/100</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

const ResumeRater: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [resumeText, setResumeText] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeRateResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && resumeText.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleRate = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchResumeRate({ address: activeAddress, signTransactions }, resumeText);
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
          Resume Rater <span className="font-medium italic">& Impact Enhancer</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          A multi-agent review of your resume: ATS optimization, action-verb strength, quantified impact, and
          formatting.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="pp-eyebrow">Resume Text</label>
        <textarea
          className="pp-field-soft h-64 font-mono"
          placeholder="Paste your resume or a specific project/experience section here…"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          disabled={isBusy}
        />
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleRate} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Rating…' : 'Rate My Resume'}</span>
        <span className="pp-price-badge">$0.02 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="flex flex-col gap-6">
          <div className="pp-bento flex flex-col gap-8">
            <div className="grid gap-5 md:grid-cols-3">
              <ScoreBar label="ATS Optimization" score={result.atsScore} />
              <ScoreBar label="Action Verb Strength" score={result.actionVerbScore} />
              <ScoreBar label="Quantified Impact" score={result.quantifiedImpactScore} />
            </div>

            <div className="border-t border-black/5 pt-6">
              <h5 className="pp-eyebrow mb-2">Overall Feedback</h5>
              <p className="text-[15px] leading-relaxed text-ink-600">{result.overallFeedback}</p>
            </div>

            <div>
              <h5 className="pp-eyebrow mb-2">Formatting Feedback</h5>
              <ul className="flex flex-col gap-1.5 text-[15px] text-ink-600">
                {result.formattingFeedback.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-black/25">—</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="pp-eyebrow mb-2">Revised Bullets</h5>
              <ul className="flex flex-col gap-2">
                {result.revisedBullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-600">
                    <span className="font-mono text-xs text-black/30">{String(i + 1).padStart(2, '0')}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {receipt && <SettlementReceipt receipt={receipt} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeRater;
