import { payAndFetchJson as originalPayAndFetchJson, WalletSigner, SettlementReceipt } from './x402Client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4021';

export interface PaidResult<T> {
  data: T;
  receipt: SettlementReceipt | null;
}

// ─── 🛡️ Safety Wrapper: JSON Parsing Interceptor ────────────────────
// Prevents Vercel 504 Timeout HTML pages from crashing the React frontend.
async function payAndFetchJson<T>(
  endpointUrl: string,
  signer: WalletSigner,
  body: unknown,
  costUsdc: string
): Promise<{ data: T; receipt: SettlementReceipt | null }> {
  try {
    return await originalPayAndFetchJson<T>(endpointUrl, signer, body, costUsdc);
  } catch (error: any) {
    // If the error message contains HTML from a server timeout or crash
    if (error.message && (error.message.includes('<!DOCTYPE') || error.message.includes('<html'))) {
      throw new Error('Server timeout: The backend is waking up or processing failed. Please wait 30 seconds and try again.');
    }
    throw error;
  }
}

// ─── Result Persistence Layer (Scan History) ────────────────────────
//
// Every paid call below automatically reports itself to the non-gated
// POST /history endpoint immediately after a settlement receipt is
// decoded, so "My Scan History" always reflects what actually happened
// on-chain without the user having to do anything extra.

export interface HistoryRecord {
  timestamp: string;
  walletAddress: string;
  endpoint: string;
  cost: string;
  txId: string;
  summaryResult: string;
}

export async function fetchScanHistory(walletAddress: string): Promise<HistoryRecord[]> {
  // Removed the rogue /api prefix here
  const response = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(walletAddress)}`);
  
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Server timeout: The backend is waking up. Please wait 30 seconds and try again.');
    }
    throw new Error(`Failed to load scan history (HTTP ${response.status})`);
  }
  
  const body = (await response.json()) as { records: HistoryRecord[] };
  return body.records || [];
}

async function recordScanHistory(
  walletAddress: string,
  endpoint: string,
  cost: string,
  txId: string,
  summaryResult: string
): Promise<void> {
  try {
    // Removed the rogue /api prefix here
    await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, endpoint, cost, txId, summaryResult }),
    });
  } catch {
    // Non-fatal: history logging should never block or break the main flow.
  }
}

/**
 * Shared "pay, fetch, then auto-log to scan history" helper. Every
 * endpoint-specific function below is a thin wrapper around this.
 */
async function payAndLog<TResponse>(
  endpointPath: string,
  signer: WalletSigner,
  body: unknown,
  costUsdc: string,
  summarize: (data: TResponse) => string
): Promise<PaidResult<TResponse>> {
  
  // REMOVED the forced /api prefix entirely. We just use the exact endpointPath passed in.
  const { data, receipt } = await payAndFetchJson<TResponse>(
    `${API_BASE_URL}${endpointPath}`, 
    signer, 
    body, 
    costUsdc
  );

  if (receipt) {
    void recordScanHistory(signer.address, endpointPath, costUsdc, receipt.transaction, summarize(data));
  }

  return { data, receipt };
}

// ─── 1. Resume-to-Role Matcher ──────────────────────────────────────

export interface ResumeMatchResult {
  matchPercentage: number;
  missingKeywords: { technical: string[]; soft: string[] };
  revisions: string[];
  summary: string;
  processedAt: string;
}

export async function fetchResumeMatch(
  signer: WalletSigner,
  resumeText: string,
  jobDescription: string
): Promise<PaidResult<ResumeMatchResult>> {
  return payAndLog<ResumeMatchResult>(
    '/resume-match',
    signer,
    { resumeText, jobDescription },
    '$0.02',
    (data) => `Match ${data.matchPercentage}% — ${data.summary}`
  );
}

// ─── 2. Job Description & OA Extractor ──────────────────────────────

export interface JobExtractResult {
  roleTitle: string;
  eligibilityCriteria: string[];
  coreTechStack: string[];
  stipendOrCTC: string;
  likelyTopics: string[];
  summary: string;
  processedAt: string;
}

export async function fetchJobExtract(signer: WalletSigner, rawText: string): Promise<PaidResult<JobExtractResult>> {
  return payAndLog<JobExtractResult>('/job-extract', signer, { rawText }, '$0.005', (data) => `${data.roleTitle} — ${data.summary}`);
}

// ─── 3. OA Code Debugger & Edge-Case Auditor ────────────────────────

export interface CodeDebugResult {
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string[];
  bugs: string[];
  optimizedCode: string;
  explanation: string;
  processedAt: string;
}

export async function fetchCodeDebug(
  signer: WalletSigner,
  code: string,
  language: string,
  context?: string
): Promise<PaidResult<CodeDebugResult>> {
  return payAndLog<CodeDebugResult>(
    '/code-debug',
    signer,
    { code, language, context },
    '$0.01',
    (data) => `${language}: ${data.bugs.length} bug(s), ${data.timeComplexity} time`
  );
}

// ─── 4. Resume Rater & Impact Enhancer ──────────────────────────────

export interface ResumeRateResult {
  atsScore: number;
  actionVerbScore: number;
  quantifiedImpactScore: number;
  formattingFeedback: string[];
  overallFeedback: string;
  revisedBullets: string[];
  processedAt: string;
}

export async function fetchResumeRate(signer: WalletSigner, resumeText: string): Promise<PaidResult<ResumeRateResult>> {
  return payAndLog<ResumeRateResult>(
    '/resume-rate',
    signer,
    { resumeText },
    '$0.02',
    (data) => `ATS score ${data.atsScore}/100`
  );
}

// ─── 5. Cold Email & LinkedIn Outreach Generator ────────────────────

export interface ColdEmailResult {
  emailSubject: string;
  emailBody: string;
  linkedinMessage: string;
  keyTalkingPoints: string[];
  processedAt: string;
}

export async function fetchColdEmail(
  signer: WalletSigner,
  candidateProfile: string,
  recruiterDetails?: string
): Promise<PaidResult<ColdEmailResult>> {
  return payAndLog<ColdEmailResult>(
    '/cold-email',
    signer,
    { candidateProfile, recruiterDetails },
    '$0.01',
    (data) => data.emailSubject
  );
}

// ─── 6. STAR Story Transformer ──────────────────────────────────────

export interface StarTransformResult {
  situation: string;
  task: string;
  action: string;
  result: string;
  interviewScript: string;
  processedAt: string;
}

export async function fetchStarTransform(signer: WalletSigner, rawNotes: string): Promise<PaidResult<StarTransformResult>> {
  return payAndLog<StarTransformResult>('/star-transform', signer, { rawNotes }, '$0.01', (data) =>
    data.interviewScript.slice(0, 140)
  );
}

// ─── 7. Repo README Pitch Generator ─────────────────────────────────

export interface RepoPitchResult {
  readmeMarkdown: string;
  highlights: string[];
  processedAt: string;
}

export async function fetchRepoPitch(
  signer: WalletSigner,
  projectTitle: string,
  techDescription: string
): Promise<PaidResult<RepoPitchResult>> {
  return payAndLog<RepoPitchResult>(
    '/repo-pitch',
    signer,
    { projectTitle, techDescription },
    '$0.01',
    () => `README generated for ${projectTitle}`
  );
}

// ─── 8. OA Pattern Predictor ────────────────────────────────────────

export interface OaPredictorResult {
  likelyPatterns: string[];
  edgeCaseAlerts: string[];
  sampleTopics: string[];
  summary: string;
  processedAt: string;
}

export async function fetchOaPredictor(
  signer: WalletSigner,
  companyName: string,
  targetRole: string
): Promise<PaidResult<OaPredictorResult>> {
  return payAndLog<OaPredictorResult>(
    '/oa-predictor',
    signer,
    { companyName, targetRole },
    '$0.01',
    (data) => `${companyName} (${targetRole}): ${data.likelyPatterns.slice(0, 3).join(', ')}`
  );
}

// ─── 9. Prompt-Guard Input Auditor ──────────────────────────────────

export interface PromptGuardFinding {
  type: string;
  description: string;
}

export interface PromptGuardResult {
  riskLevel: 'low' | 'medium' | 'high';
  findings: PromptGuardFinding[];
  sanitizedSummary: string;
  safeToProceed: boolean;
  processedAt: string;
}

export async function fetchPromptGuard(signer: WalletSigner, inputText: string): Promise<PaidResult<PromptGuardResult>> {
  return payAndLog<PromptGuardResult>(
    '/prompt-guard',
    signer,
    { inputText },
    '$0.005',
    (data) => `Risk: ${data.riskLevel} (${data.findings.length} finding(s))`
  );
}

// ─── 10. Atomic Application Sprint (aggregator) ─────────────────────

export interface AtomicAppSprintResult {
  jobExtract: JobExtractResult;
  resumeMatch: ResumeMatchResult;
  coldEmail: ColdEmailResult;
  processedAt: string;
}

export async function fetchAtomicAppSprint(
  signer: WalletSigner,
  jobPosting: string,
  resumeText: string
): Promise<PaidResult<AtomicAppSprintResult>> {
  return payAndLog<AtomicAppSprintResult>(
    '/atomic-app-sprint',
    signer,
    { jobPosting, resumeText },
    '$0.04',
    (data) => `${data.jobExtract.roleTitle}: ${data.resumeMatch.matchPercentage}% match, outreach drafted`
  );
}