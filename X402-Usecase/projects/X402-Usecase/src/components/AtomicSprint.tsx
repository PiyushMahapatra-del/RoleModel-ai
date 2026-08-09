import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchAtomicAppSprint, AtomicAppSprintResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const AtomicSprint: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [jobPosting, setJobPosting] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtomicAppSprintResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && jobPosting.trim().length > 0 && resumeText.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleRun = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchAtomicAppSprint(
        { address: activeAddress, signTransactions },
        jobPosting,
        resumeText
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
          Atomic <span className="font-medium italic">Application Sprint</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          One payment, three results: job extraction, resume match, and a tailored cold outreach email — executed
          atomically behind a single x402 payment.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Target Job Posting</label>
          <textarea
            className="pp-field-soft h-56"
            placeholder="Paste the raw job posting text here…"
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            disabled={isBusy}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Your Resume</label>
          <textarea
            className="pp-field-soft h-56 font-mono"
            placeholder="Paste your resume text here…"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleRun} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Running sprint…' : 'Run Atomic Sprint'}</span>
        <span className="pp-price-badge">$0.04 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-10">
          <div>
            <div className="pp-eyebrow mb-3">01 · Job Extraction</div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-[15px] font-medium text-ink">{result.jobExtract.roleTitle}</p>
                <p className="mt-1 text-sm text-black/45">{result.jobExtract.stipendOrCTC}</p>
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {result.jobExtract.coreTechStack.map((t, i) => (
                    <span key={i} className="pp-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 pt-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="pp-eyebrow">02 · Resume Match</div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-light text-ink">{result.resumeMatch.matchPercentage}</span>
                <span className="text-sm text-black/30">%</span>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-600">{result.resumeMatch.summary}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {result.resumeMatch.revisions.map((r, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-600">
                  <span className="font-mono text-xs text-black/30">{String(i + 1).padStart(2, '0')}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-black/5 pt-8">
            <div className="pp-eyebrow mb-3">03 · Cold Outreach</div>
            <div className="text-[15px] font-medium text-ink">{result.coldEmail.emailSubject}</div>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-600">{result.coldEmail.emailBody}</p>
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default AtomicSprint;
