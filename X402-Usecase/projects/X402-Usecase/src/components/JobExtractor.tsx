import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchJobExtract, JobExtractResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const JobExtractor: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [rawText, setRawText] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobExtractResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && rawText.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleExtract = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchJobExtract({ address: activeAddress, signTransactions }, rawText);
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
          Job Extractor <span className="font-medium italic">& OA Card</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          Paste a raw posting from LinkedIn, Unstop, or an email — get a clean, structured role summary.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="pp-eyebrow">Raw Job Posting</label>
        <textarea
          className="pp-field-soft h-64"
          placeholder="Paste the unformatted job posting text here…"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          disabled={isBusy}
        />
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleExtract} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Extracting…' : 'Extract Job Details'}</span>
        <span className="pp-price-badge">$0.005 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div>
            <div className="pp-eyebrow">Role</div>
            <h4 className="mt-1 font-display text-3xl font-medium text-ink">{result.roleTitle}</h4>
            <p className="mt-2 text-[15px] text-black/45">{result.summary}</p>
          </div>

          <div className="grid gap-6 border-t border-black/5 pt-6 md:grid-cols-2">
            <div>
              <h5 className="pp-eyebrow mb-2.5">Eligibility Criteria</h5>
              <ul className="flex flex-col gap-1.5 text-[15px] text-ink-600">
                {result.eligibilityCriteria.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-black/25">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="pp-eyebrow mb-2.5">Core Tech Stack</h5>
              <div className="flex flex-wrap gap-1.5">
                {result.coreTechStack.map((tech, i) => (
                  <span key={i} className="pp-chip">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="pp-eyebrow mb-2.5">Stipend / CTC</h5>
              <div className="pp-chip-ochre inline-block text-sm">{result.stipendOrCTC}</div>
            </div>

            <div>
              <h5 className="pp-eyebrow mb-2.5">Likely OA / Interview Topics</h5>
              <ul className="flex flex-col gap-1.5 text-[15px] text-ink-600">
                {result.likelyTopics.map((topic, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ochre-500">—</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default JobExtractor;
