import { useWallet } from '@txnlab/use-wallet-react';
import React, { useState } from 'react';
import { fetchCodeDebug, CodeDebugResult } from '../utils/placementApi';
import { SettlementReceipt as SettlementReceiptType } from '../utils/x402Client';
import StatusBanner, { PaymentStage } from './StatusBanner';
import SettlementReceipt from './SettlementReceipt';

const LANGUAGES = ['python', 'java', 'c++', 'c', 'javascript', 'typescript', 'go', 'rust', 'kotlin', 'swift'];

const CodeDebugger: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [context, setContext] = useState('');
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeDebugResult | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceiptType | null>(null);

  const canSubmit = Boolean(activeAddress && signTransactions) && code.trim().length > 0;
  const isBusy = stage === 'signing' || stage === 'processing';

  const handleDebug = async () => {
    if (!activeAddress || !signTransactions || !canSubmit) return;

    setError(null);
    setResult(null);
    setReceipt(null);
    setStage('signing');

    try {
      const { data, receipt: settlement } = await fetchCodeDebug(
        { address: activeAddress, signTransactions },
        code,
        language,
        context || undefined
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
          Code Debugger <span className="font-medium italic">& Edge-Case Audit</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
          Paste a snippet from an online assessment. Get complexity analysis, hidden edge cases, bugs, and an
          optimized rewrite.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Language</label>
          <select className="pp-select" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isBusy}>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="pp-eyebrow">Problem Context (optional)</label>
          <input
            type="text"
            className="pp-field"
            placeholder="e.g. Two Sum — return indices of the pair that adds to target"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isBusy}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="pp-eyebrow">Code Snippet</label>
        <textarea
          className="pp-code-block h-64 w-full resize-y focus:outline-none disabled:opacity-70"
          placeholder="Paste your code here…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isBusy}
        />
      </div>

      <button className="pp-btn-pay w-fit" onClick={handleDebug} disabled={!canSubmit || isBusy}>
        <span className="pp-btn-pay-label">{isBusy ? 'Analyzing…' : 'Debug Code'}</span>
        <span className="pp-price-badge">$0.01 USDC</span>
      </button>

      <StatusBanner stage={stage} errorMessage={error} />

      {result && (
        <div className="pp-bento flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="pp-bento-tight text-center">
              <div className="pp-eyebrow">Time Complexity</div>
              <div className="mt-1.5 font-mono text-lg font-medium text-ink">{result.timeComplexity}</div>
            </div>
            <div className="pp-bento-tight text-center">
              <div className="pp-eyebrow">Space Complexity</div>
              <div className="mt-1.5 font-mono text-lg font-medium text-ink">{result.spaceComplexity}</div>
            </div>
          </div>

          <div>
            <h5 className="pp-eyebrow mb-2.5">Hidden Edge Cases</h5>
            {result.edgeCases.length === 0 ? (
              <p className="text-sm text-sage-600">No hidden edge-case risks detected.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-[15px] text-ink-600">
                {result.edgeCases.map((ec, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ochre-500">—</span>
                    {ec}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h5 className="pp-eyebrow mb-2.5">Bugs Found</h5>
            {result.bugs.length === 0 ? (
              <p className="text-sm text-sage-600">No bugs detected in this snippet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-[15px] text-ink-600">
                {result.bugs.map((bug, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-400">—</span>
                    {bug}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h5 className="pp-eyebrow mb-2.5">Optimized Rewrite</h5>
            <pre className="pp-code-block whitespace-pre-wrap">{result.optimizedCode}</pre>
            <p className="mt-3 text-sm text-black/45">{result.explanation}</p>
          </div>

          {receipt && <SettlementReceipt receipt={receipt} />}
        </div>
      )}
    </div>
  );
};

export default CodeDebugger;
