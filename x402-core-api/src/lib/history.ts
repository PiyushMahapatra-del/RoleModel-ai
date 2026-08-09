import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Result Persistence Layer (Scan History per Wallet)
 *
 * Lightweight in-memory store backed by a local `history.json` file.
 * Every successful paid AI execution is logged here by the frontend
 * immediately after it decodes the on-chain settlement receipt, via the
 * non-gated POST /history endpoint (proxied through x402-demo-server).
 *
 * This deliberately lives on the core-api side of the payment boundary:
 * on-chain settlement (and therefore the txId) is only known to the
 * *client* once the x402 payment response header comes back, so the
 * client is the natural place to report "this paid call completed" from.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, '..', '..', 'history.json');
const MAX_RECORDS_PER_WALLET = 200;

export interface HistoryRecord {
  timestamp: string;
  walletAddress: string;
  endpoint: string;
  cost: string;
  txId: string;
  summaryResult: string;
}

let store: HistoryRecord[] = [];

function loadHistory(): void {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
      const parsed = raw.trim() ? JSON.parse(raw) : [];
      store = Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('[HISTORY] Failed to load history.json, starting with an empty store:', err);
    store = [];
  }
}

function persistHistory(): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    // Persistence failures are non-fatal — the in-memory store still works
    // for the lifetime of the process.
    console.error('[HISTORY] Failed to persist history.json:', err);
  }
}

loadHistory();

export function logScan(record: Omit<HistoryRecord, 'timestamp'> & { timestamp?: string }): HistoryRecord {
  const entry: HistoryRecord = {
    timestamp: record.timestamp || new Date().toISOString(),
    walletAddress: record.walletAddress,
    endpoint: record.endpoint,
    cost: record.cost,
    txId: record.txId,
    summaryResult: record.summaryResult,
  };
  store.push(entry);
  persistHistory();
  return entry;
}

export function getHistoryForWallet(walletAddress: string): HistoryRecord[] {
  const needle = walletAddress.toLowerCase();
  return store
    .filter((r) => r.walletAddress.toLowerCase() === needle)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, MAX_RECORDS_PER_WALLET);
}
