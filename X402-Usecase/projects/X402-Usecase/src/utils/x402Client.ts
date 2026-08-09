import { x402Client, wrapFetchWithPayment, decodePaymentResponseHeader } from '@x402-avm/fetch';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { ClientAvmSigner } from '@x402-avm/avm';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';

/**
 * Minimal shape of a connected wallet signer, as provided by
 * @txnlab/use-wallet-react's `signTransactions`.
 */
export interface WalletSigner {
  address: string;
  signTransactions: (txns: Uint8Array[]) => Promise<(Uint8Array | null)[] | Uint8Array[]>;
}

/**
 * On-chain settlement receipt derived from the x402 PAYMENT-RESPONSE header.
 * Rendered by <SettlementReceipt /> on every paid result.
 */
export interface SettlementReceipt {
  success: boolean;
  transaction: string;
  network: string;
  payer?: string;
  costUsdc: string;
  explorerUrl: string;
}

const NETWORK_EXPLORER_SEGMENT: Record<string, string> = {
  [ALGORAND_TESTNET_CAIP2]: 'testnet',
};

function explorerUrlForTransaction(network: string, transaction: string): string {
  const segment = NETWORK_EXPLORER_SEGMENT[network] || 'testnet';
  return `https://lora.algokit.io/${segment}/transaction/${transaction}`;
}

/**
 * Builds a Lora explorer link for a bare transaction ID when the network
 * CAIP-2 identifier isn't known up front (e.g. history records loaded from
 * storage). Defaults to TestNet, matching the default network toggle in
 * x402-demo-server/endpoints.config.ts.
 */
export function explorerUrlForTxId(transaction: string): string {
  return explorerUrlForTransaction(ALGORAND_TESTNET_CAIP2, transaction);
}

/**
 * Wraps the browser's fetch with automatic x402 payment handling:
 * on a 402 response it signs and attaches a payment payload, then retries.
 */
export async function createX402Fetch(walletSigner: WalletSigner) {
  const client = new x402Client();
  let originalTxns: Uint8Array[] = [];

  const x402Signer: ClientAvmSigner = {
    address: walletSigner.address,
    signTransactions: async (txns: Uint8Array[]) => {
      originalTxns = txns;
      const walletResult = await walletSigner.signTransactions(txns);

      if (Array.isArray(walletResult)) {
        return walletResult.map((item: any, i: number) => {
          if (item === null || item === undefined) return originalTxns[i];
          if (item instanceof Uint8Array) return item;
          if (typeof item === 'string') {
            const binaryString = atob(item);
            const bytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }
            return bytes;
          }
          return originalTxns[i];
        });
      }
      return walletResult;
    },
  };

  client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(x402Signer));
  return wrapFetchWithPayment(fetch, client);
}

/**
 * Performs a payment-protected POST request and returns both the parsed
 * JSON body and an on-chain settlement receipt (when a payment was made).
 */
export async function payAndFetchJson<TResponse>(
  url: string,
  walletSigner: WalletSigner,
  body: unknown,
  costUsdc: string,
  timeoutMs = 45000
): Promise<{ data: TResponse; receipt: SettlementReceipt | null }> {
  const fetchFn = await createX402Fetch(walletSigner);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let receipt: SettlementReceipt | null = null;
    const paymentResponseHeader =
      response.headers.get('PAYMENT-RESPONSE') || response.headers.get('X-PAYMENT-RESPONSE');

    if (paymentResponseHeader) {
      try {
        const settlement = decodePaymentResponseHeader(paymentResponseHeader) as {
          success: boolean;
          transaction: string;
          network: string;
          payer?: string;
        };
        receipt = {
          success: settlement.success,
          transaction: settlement.transaction,
          network: settlement.network,
          payer: settlement.payer,
          costUsdc,
          explorerUrl: explorerUrlForTransaction(settlement.network, settlement.transaction),
        };
      } catch {
        // Non-fatal: proceed without a receipt if the header can't be decoded.
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error((errorBody as any)?.error || `Request failed with HTTP ${response.status}`);
    }

    const data = (await response.json()) as TResponse;
    return { data, receipt };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
