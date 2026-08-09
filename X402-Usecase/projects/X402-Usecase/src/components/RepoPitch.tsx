import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchRepoPitch, RepoPitchResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const RepoPitch: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [projectTitle, setProjectTitle] = useState('');
  const [techDescription, setTechDescription] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepoPitchResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit =
    Boolean(activeAddress && signTransactions) && projectTitle.trim().length > 0 && techDescription.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleGenerate = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setCopied(false);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchRepoPitch(
        { address: activeAddress, signTransactions },
        projectTitle,
        techDescription
      );
      setResult(data);
      setReceipt(settlement);
      setStage('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('error');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.readmeMarkdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-4xl font-light leading-tight text-ink">
          Repo README <span className="font-medium italic">Pitch</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          A project title and a brief tech description become a polished GitHub README with an architecture
          breakdown and feature highlights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Project Title</label>
          <input
            className="pp-field"
            placeholder="e.g. Placement Prep OS"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            disabled={isBusy}
          />
        </div>
        <div className="flex flex-col gap-2 md:row-span-2">
          <label className="pp-eyebrow">Tech Description</label>
          <textarea
            className="pp-field-soft h-40"
            placeholder="e.g. A pay-per-use x402 micro-API on Algorand built with Hono, React, and Gemini, offering resume analysis and interview prep tools…"
            value={techDescription}
            onChange={(e) => setTechDescription(e.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleGenerate} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Writing README…' : 'Generate README'}</span>
        <span className="pp-price-badge">$0.01 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div>
            <h5 className="pp-eyebrow mb-2.5">Portfolio Highlights</h5>
            <div className="flex flex-wrap gap-1.5">
              {result.highlights.map((h, i) => (
                <span key={i} className="pp-chip-sage">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-black/5 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h5 className="pp-eyebrow">README.md</h5>
              <button onClick={handleCopy} className="pp-btn-ghost">
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>
            </div>
            <pre className="pp-code-block max-h-96 overflow-auto whitespace-pre-wrap">{result.readmeMarkdown}</pre>
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default RepoPitch;
