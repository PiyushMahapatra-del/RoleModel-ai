import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchResumeMatch, ResumeMatchResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const ResumeMatcher: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeMatchResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && resumeText.trim().length > 0 && jobDescription.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleMatch = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchResumeMatch(
        { address: activeAddress, signTransactions },
        resumeText,
        jobDescription
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
          Role <span className="font-medium italic">Matcher</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          An ATS match score, missing keywords, and rewrite suggestions against a target job description.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
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
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Target Job Description</label>
          <textarea
            className="pp-field-soft h-56"
            placeholder="Paste the job description here…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleMatch} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Matching…' : 'Match Resume to Role'}</span>
        <span className="pp-price-badge">$0.02 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h4 className="font-display text-xl font-medium text-ink">Match Results</h4>
              <p className="mt-1 text-sm text-black/45">{result.summary}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-light text-ink">{result.matchPercentage}</span>
              <span className="text-lg text-black/30">%</span>
            </div>
          </div>

          <div className="grid gap-6 border-t border-black/5 pt-6 md:grid-cols-2">
            <div>
              <h5 className="pp-eyebrow mb-2.5">Missing Technical Keywords</h5>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.technical.length === 0 ? (
                  <span className="text-sm text-sage-600">None — great technical coverage.</span>
                ) : (
                  result.missingKeywords.technical.map((kw, i) => (
                    <span key={i} className="pp-chip">
                      {kw}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <h5 className="pp-eyebrow mb-2.5">Missing Soft-Skill Keywords</h5>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.soft.length === 0 ? (
                  <span className="text-sm text-sage-600">None found.</span>
                ) : (
                  result.missingKeywords.soft.map((kw, i) => (
                    <span key={i} className="pp-chip-ochre">
                      {kw}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <h5 className="pp-eyebrow mb-2.5">Actionable Revisions</h5>
            <ul className="flex flex-col gap-2">
              {result.revisions.map((r, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-600">
                  <span className="font-mono text-xs text-black/30">{String(i + 1).padStart(2, '0')}</span>
                  <span>{r}</span>
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

export default ResumeMatcher;
