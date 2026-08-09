import { useWallet } from '@txnlab/use-wallet-react';
import React, { useEffect, useState } from 'react';
import { fetchScanHistory, HistoryRecord } from '../utils/placementApi';
import { explorerUrlForTxId } from '../utils/x402Client';

const ENDPOINT_LABELS: Record<string, string> = {
  '/resume-match': 'Resume-to-Role Matcher',
  '/resume-rate': 'Resume Rater',
  '/job-extract': 'Job Description & OA Extractor',
  '/code-debug': 'OA Code Debugger',
  '/cold-email': 'Cold Email & LinkedIn Outreach',
  '/star-transform': 'STAR Story Transformer',
  '/repo-pitch': 'Repo README Pitch',
  '/oa-predictor': 'OA Pattern Predictor',
  '/prompt-guard': 'Prompt-Guard Auditor',
  '/atomic-app-sprint': 'Atomic Application Sprint',
};

const formatEndpoint = (endpoint: string) => ENDPOINT_LABELS[endpoint] || endpoint;

const formatTimestamp = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M6.5 10.2l2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScanHistory: React.FC = () => {
  const { activeAddress } = useWallet();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAddress) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchScanHistory(activeAddress)
      .then((data) => {
        if (!cancelled) setRecords(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load scan history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeAddress]);

  const handleRefresh = () => {
    if (!activeAddress) return;
    setLoading(true);
    setError(null);
    fetchScanHistory(activeAddress)
      .then(setRecords)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load scan history.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-light leading-tight text-ink">
            Scan <span className="font-medium italic">History</span>
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/45">
            Every paid scan you've run with this wallet, most recent first.
          </p>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="pp-btn-ghost">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <div className="pp-status-error">{error}</div>}

      {!loading && !error && records.length === 0 && (
        <div className="pp-bento flex flex-col items-start gap-3 py-16">
          <div className="h-9 w-9 rounded-full border border-black/10" />
          <h4 className="font-display text-xl font-medium text-ink">No scans yet</h4>
          <p className="text-sm text-black/45">Run any tool from the sidebar and it'll show up here automatically.</p>
        </div>
      )}

      {records.length > 0 && (
        <div className="flex flex-col">
          {records.map((r, i) => (
            <div key={`${r.txId}-${i}`} className={`flex flex-col gap-2 py-6 ${i > 0 ? 'border-t border-black/5' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[15px] font-medium text-ink">{formatEndpoint(r.endpoint)}</span>
                <span className="font-mono text-xs text-ink-300">{r.cost} USDC</span>
              </div>
              <p className="text-sm text-black/50">{r.summaryResult}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="font-mono text-xs text-black/30">{formatTimestamp(r.timestamp)}</span>
                {r.txId && r.txId !== 'unknown' && (
                  <a
                    href={explorerUrlForTxId(r.txId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-ink-300 hover:text-ink"
                  >
                    <CheckIcon className="h-3 w-3 text-sage-500" />
                    {r.txId.slice(0, 10)}...{r.txId.slice(-6)}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScanHistory;
