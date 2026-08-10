import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

import { generateStructuredJson, respondWithAiResult, handleAiError, MAX_INPUT_LENGTH, ALLOWED_LANGUAGES } from './lib/gemini.js';
import { logScan, getHistoryForWallet } from './lib/history.js';
import {
  buildResumeMatchPrompt,
  buildJobExtractPrompt,
  buildCodeDebugPrompt,
  buildResumeRatePrompt,
  buildColdEmailPrompt,
  buildStarTransformPrompt,
  buildRepoPitchPrompt,
  buildOaPredictorPrompt,
  buildPromptGuardPrompt,
} from './prompts.js';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// Health Check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'placement-prep-core-api' });
});

function requireFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field]) return field;
  }
  return null;
}

function tooLong(...values: (string | undefined)[]): boolean {
  return values.some((v) => typeof v === 'string' && v.length > MAX_INPUT_LENGTH);
}

// ════════════════════════════════════════════════════════════════════
// 1. RESUME-TO-ROLE MATCHER — POST /api/resume-match
// ════════════════════════════════════════════════════════════════════
app.post('/api/resume-match', async (c) => {
  try {
    const body = await c.req.json();
    const { resumeText, jobDescription } = body;

    const missing = requireFields(body, ['resumeText', 'jobDescription']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(resumeText, jobDescription)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Matching resume to role using Gemini...');
    const result = await generateStructuredJson(buildResumeMatchPrompt(resumeText, jobDescription));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'resume match');
  }
});

// ════════════════════════════════════════════════════════════════════
// 2. JOB DESCRIPTION & OA EXTRACTOR — POST /api/job-extract
// ════════════════════════════════════════════════════════════════════
app.post('/api/job-extract', async (c) => {
  try {
    const body = await c.req.json();
    const { rawText } = body;

    const missing = requireFields(body, ['rawText']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(rawText)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Extracting job posting structure using Gemini...');
    const result = await generateStructuredJson(buildJobExtractPrompt(rawText));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'job extraction');
  }
});

// ════════════════════════════════════════════════════════════════════
// 3. OA CODE DEBUGGER & EDGE-CASE AUDITOR — POST /api/code-debug
// ════════════════════════════════════════════════════════════════════
app.post('/api/code-debug', async (c) => {
  try {
    const body = await c.req.json();
    const { code, language, context } = body;

    const missing = requireFields(body, ['code', 'language']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(code)) {
      return c.json({ error: `Code snippet exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    const validatedLanguage = ALLOWED_LANGUAGES.includes(String(language).toLowerCase())
      ? String(language).toLowerCase()
      : 'general';

    console.log(`[CORE-API] Debugging ${validatedLanguage} code using Gemini...`);
    const result = await generateStructuredJson(buildCodeDebugPrompt(code, validatedLanguage, context));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'code debug');
  }
});

// ════════════════════════════════════════════════════════════════════
// 4. RESUME RATER & IMPACT ENHANCER — POST /api/resume-rate
// ════════════════════════════════════════════════════════════════════
app.post('/api/resume-rate', async (c) => {
  try {
    const body = await c.req.json();
    const { resumeText } = body;

    const missing = requireFields(body, ['resumeText']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(resumeText)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Rating resume using Gemini...');
    const result = await generateStructuredJson(buildResumeRatePrompt(resumeText));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'resume rating');
  }
});

// ════════════════════════════════════════════════════════════════════
// 5. COLD EMAIL & LINKEDIN OUTREACH GENERATOR — POST /api/cold-email
// ════════════════════════════════════════════════════════════════════
app.post('/api/cold-email', async (c) => {
  try {
    const body = await c.req.json();
    const { candidateProfile, recruiterDetails } = body;

    const missing = requireFields(body, ['candidateProfile']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(candidateProfile, recruiterDetails)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Generating cold outreach copy using Gemini...');
    const result = await generateStructuredJson(buildColdEmailPrompt(candidateProfile, recruiterDetails));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'cold email generation');
  }
});

// ════════════════════════════════════════════════════════════════════
// 6. STAR STORY TRANSFORMER — POST /api/star-transform
// ════════════════════════════════════════════════════════════════════
app.post('/api/star-transform', async (c) => {
  try {
    const body = await c.req.json();
    const { rawNotes } = body;

    const missing = requireFields(body, ['rawNotes']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(rawNotes)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Building STAR interview script using Gemini...');
    const result = await generateStructuredJson(buildStarTransformPrompt(rawNotes));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'STAR transform');
  }
});

// ════════════════════════════════════════════════════════════════════
// 7. REPO README PITCH GENERATOR — POST /api/repo-pitch
// ════════════════════════════════════════════════════════════════════
app.post('/api/repo-pitch', async (c) => {
  try {
    const body = await c.req.json();
    const { projectTitle, techDescription } = body;

    const missing = requireFields(body, ['projectTitle', 'techDescription']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(projectTitle, techDescription)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Generating README pitch using Gemini...');
    const result = await generateStructuredJson(buildRepoPitchPrompt(projectTitle, techDescription));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'repo pitch generation');
  }
});

// ════════════════════════════════════════════════════════════════════
// 8. OA PATTERN PREDICTOR — POST /api/oa-predictor
// ════════════════════════════════════════════════════════════════════
app.post('/api/oa-predictor', async (c) => {
  try {
    const body = await c.req.json();
    const { companyName, targetRole } = body;

    const missing = requireFields(body, ['companyName', 'targetRole']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(companyName, targetRole)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Predicting OA patterns using Gemini...');
    const result = await generateStructuredJson(buildOaPredictorPrompt(companyName, targetRole));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'OA prediction');
  }
});

// ════════════════════════════════════════════════════════════════════
// 9. PROMPT-INJECTION / INPUT GUARD AUDITOR — POST /api/prompt-guard
// ════════════════════════════════════════════════════════════════════
app.post('/api/prompt-guard', async (c) => {
  try {
    const body = await c.req.json();
    const { inputText } = body;

    const missing = requireFields(body, ['inputText']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(inputText)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Auditing input for injection risks using Gemini...');
    const result = await generateStructuredJson(buildPromptGuardPrompt(inputText));
    return respondWithAiResult(c, result);
  } catch (error) {
    return handleAiError(c, error, 'prompt guard audit');
  }
});

// ════════════════════════════════════════════════════════════════════
// 10. ATOMIC APPLICATION SPRINT (AGGREGATOR) — POST /api/atomic-app-sprint
// ════════════════════════════════════════════════════════════════════
app.post('/api/atomic-app-sprint', async (c) => {
  try {
    const body = await c.req.json();
    const { jobPosting, resumeText } = body;

    const missing = requireFields(body, ['jobPosting', 'resumeText']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);
    if (tooLong(jobPosting, resumeText)) {
      return c.json({ error: `Input exceeds max length (${MAX_INPUT_LENGTH} characters)` }, 400);
    }

    console.log('[CORE-API] Running atomic application sprint (job-extract + resume-match) using Gemini...');
    const [jobExtractResult, resumeMatchResult] = await Promise.all([
      generateStructuredJson(buildJobExtractPrompt(jobPosting)),
      generateStructuredJson(buildResumeMatchPrompt(resumeText, jobPosting)),
    ]);

    const roleTitle = typeof jobExtractResult.roleTitle === 'string' ? jobExtractResult.roleTitle : 'the target role';
    const candidateProfile = `Target role: ${roleTitle}\n\nResume:\n${resumeText}`;

    console.log('[CORE-API] Atomic sprint: generating cold email using Gemini...');
    const coldEmailResult = await generateStructuredJson(buildColdEmailPrompt(candidateProfile));

    const aggregateFailed = [jobExtractResult, resumeMatchResult, coldEmailResult].some((r) => r.error === true);
    if (aggregateFailed) {
      return c.json({ error: 'One or more steps of the atomic application sprint failed to produce valid JSON.' }, 502);
    }

    return c.json({
      jobExtract: jobExtractResult,
      resumeMatch: resumeMatchResult,
      coldEmail: coldEmailResult,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleAiError(c, error, 'atomic application sprint');
  }
});

// ════════════════════════════════════════════════════════════════════
// RESULT PERSISTENCE LAYER
// ════════════════════════════════════════════════════════════════════

app.post('/history', async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress, endpoint, cost, txId, summaryResult } = body;

    const missing = requireFields(body, ['walletAddress', 'endpoint']);
    if (missing) return c.json({ error: `Missing required parameter: ${missing}` }, 400);

    const entry = logScan({
      walletAddress: String(walletAddress),
      endpoint: String(endpoint),
      cost: String(cost || 'unknown'),
      txId: String(txId || 'unknown'),
      summaryResult: String(summaryResult || '').slice(0, 500),
    });

    return c.json({ ok: true, entry });
  } catch (error) {
    return handleAiError(c, error, 'history logging');
  }
});

app.get('/history/:walletAddress', (c) => {
  const walletAddress = c.req.param('walletAddress');
  if (!walletAddress) {
    return c.json({ error: 'Missing walletAddress parameter' }, 400);
  }
  const records = getHistoryForWallet(walletAddress);
  return c.json({ walletAddress, count: records.length, records });
});

// ════════════════════════════════════════════════════════════════════
// SERVER STARTUP (Render Compatible)
// ════════════════════════════════════════════════════════════════════

const port = Number(process.env.PORT) || 4022;
serve({ 
  fetch: app.fetch, 
  port,
  hostname: '0.0.0.0' // CRITICAL for Render to expose the server properly
}, (info) => {
  console.log(`🚀 RoleModel AI Core API running on http://0.0.0.0:${info.port}`);
});