import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchColdEmail, ColdEmailResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const ColdEmailGenerator: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [candidateProfile, setCandidateProfile] = useState('');
  const [recruiterDetails, setRecruiterDetails] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ColdEmailResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && candidateProfile.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleGenerate = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchColdEmail(
        { address: activeAddress, signTransactions },
        candidateProfile,
        recruiterDetails || undefined
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
          Cold Outreach <span className="font-medium italic">Generator</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          A short candidate profile (and recruiter details, if you have them) becomes a tailored outreach email and
          LinkedIn InMail message.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Candidate Profile Summary</label>
          <textarea
            className="pp-field-soft h-44"
            placeholder="e.g. 3rd-year CSE student, built a real-time chat app with WebSockets, interned at a fintech startup…"
            value={candidateProfile}
            onChange={(e) => setCandidateProfile(e.target.value)}
            disabled={isBusy}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Recruiter Details (optional)</label>
          <textarea
            className="pp-field-soft h-44"
            placeholder="e.g. Priya Sharma, Technical Recruiter at Acme Corp, hiring for the platform team…"
            value={recruiterDetails}
            onChange={(e) => setRecruiterDetails(e.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleGenerate} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Drafting…' : 'Generate Outreach'}</span>
        <span className="pp-price-badge">$0.01 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div>
            <h5 className="pp-eyebrow mb-2.5">Email</h5>
            <div className="text-[15px] font-medium text-ink">{result.emailSubject}</div>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-600">{result.emailBody}</p>
          </div>

          <div className="border-t border-black/5 pt-6">
            <h5 className="pp-eyebrow mb-2.5">LinkedIn Message</h5>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-600">{result.linkedinMessage}</p>
          </div>

          <div className="border-t border-black/5 pt-6">
            <h5 className="pp-eyebrow mb-2.5">Key Talking Points</h5>
            <ul className="flex flex-col gap-2">
              {result.keyTalkingPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-600">
                  <span className="font-mono text-xs text-black/30">{String(i + 1).padStart(2, '0')}</span>
                  <span>{point}</span>
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

export default ColdEmailGenerator;
