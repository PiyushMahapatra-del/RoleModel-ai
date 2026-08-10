/**
 * RoleModel AI - x402 Resource Server
 *
 * Payment-protected micro-API for on-demand career and interview
 * preparation, built on the x402 protocol over Algorand TestNet.
 *
 * Every route below is a thin reverse proxy: the x402 payment middleware
 * verifies payment first, and only then does the request get forwarded to
 * the AI Core API microservice (x402-core-api) which does the actual work.
 */

import { config } from 'dotenv';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { bodyLimit } from 'hono/body-limit';
import { paymentMiddleware } from '@x402/hono';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import type { ResourceServerExtension } from '@x402/core/types';
import { ExactAvmScheme } from '@x402/avm/exact/server';
import { ALGORAND_TESTNET_CAIP2 } from '@x402/avm';
import { bazaarResourceServerExtension } from '@x402-avm/extensions';

import { handleProxyRequest } from './handlers/proxy';
import createPaymentConfig, { EndpointConfig, IS_MAINNET } from './endpoints.config';

// Load environment variables
config();

// ════════════════════════════════════════════════════════════════════
// CONFIGURATION & SETUP
// ════════════════════════════════════════════════════════════════════

const avmAddress = process.env.AVM_ADDRESS;
const facilitatorUrl = process.env.FACILITATOR_URL;
const port = parseInt(process.env.PORT || '4021', 10);
const coreApiUrl = process.env.CORE_API_URL || 'http://localhost:4022';

// Validate required environment
if (!avmAddress || !facilitatorUrl) {
  console.error(
    '❌ Missing required environment variables:\n' +
      '   - AVM_ADDRESS (your Algorand wallet receiving payments)\n' +
      '   - FACILITATOR_URL (x402 facilitator service)'
  );
  process.exit(1);
}

console.log('\n' + '═'.repeat(60));
console.log('RoleModel AI - x402 Resource Server');
console.log('═'.repeat(60));
console.log('Configuration:');
console.log(`  Network: ${IS_MAINNET ? 'Algorand MainNet ⚠️' : 'Algorand TestNet'}`);
console.log(`  Receiver Address: ${avmAddress}`);
console.log(`  Facilitator: ${facilitatorUrl}`);
console.log(`  Core API: ${coreApiUrl}`);
console.log(`  Port: ${port}`);
console.log('═'.repeat(60) + '\n');

// Initialize x402 Resource Server
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const x402Server = new x402ResourceServer(facilitatorClient)
  .register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme())
  .registerExtension(bazaarResourceServerExtension as unknown as ResourceServerExtension);

// Create Hono app
const app = new Hono();

app.use(
  '*',
  bodyLimit({
    maxSize: 1024 * 1024, // 1MB limit
    onError: (c) => {
      return c.json({ error: 'Payload too large. Maximum size is 1MB.' }, 413);
    },
  })
);

// ════════════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ════════════════════════════════════════════════════════════════════

/**
 * CORS Middleware - MUST be first!
 *
 * Handles browser preflight requests and exposes payment headers.
 * x402 requires wildcard CORS to expose Payment-Signature headers.
 */
app.use('*', async (c, next) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, HEAD',
    'Access-Control-Allow-Headers': '*', // Critical for x402
    'Access-Control-Expose-Headers': '*', // Critical for x402
    'Access-Control-Max-Age': '86400',
  };

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.header(key, value);
  });

  await next();
});

/**
 * X402 Payment Middleware
 *
 * Applies payment protection to configured endpoints. Intercepts
 * requests and enforces the x402 protocol before any handler runs.
 */
const paymentConfig: EndpointConfig = createPaymentConfig(avmAddress);
console.log('📋 Registered Payment-Protected Endpoints:');
Object.entries(paymentConfig).forEach(([route, cfg]) => {
  const price = cfg.accepts[0]?.price || 'unknown';
  console.log(`   ${route} - ${price} USDC - ${cfg.description}`);
});
console.log();

app.use(paymentMiddleware(paymentConfig as any, x402Server as any));

// ════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS - Payment-Protected Endpoints
// ════════════════════════════════════════════════════════════════════

/**
 * These handlers only run AFTER payment is verified by the x402
 * middleware. Each one proxies the already-paid request to the AI
 * Core API microservice.
 */

// Resume-to-Role Matcher - Pay $0.02 USDC
app.post('/resume-match', handleProxyRequest(`${coreApiUrl}/api/resume-match`));

// Job Description & OA Extractor - Pay $0.005 USDC
app.post('/job-extract', handleProxyRequest(`${coreApiUrl}/api/job-extract`));

// OA Code Debugger & Edge-Case Auditor - Pay $0.01 USDC
app.post('/code-debug', handleProxyRequest(`${coreApiUrl}/api/code-debug`));

// Resume Rater & Impact Enhancer - Pay $0.02 USDC
app.post('/resume-rate', handleProxyRequest(`${coreApiUrl}/api/resume-rate`));

// Cold Email & LinkedIn Outreach Generator - Pay $0.01 USDC
app.post('/cold-email', handleProxyRequest(`${coreApiUrl}/api/cold-email`));

// STAR Story Transformer - Pay $0.01 USDC
app.post('/star-transform', handleProxyRequest(`${coreApiUrl}/api/star-transform`));

// Repo README Pitch Generator - Pay $0.01 USDC
app.post('/repo-pitch', handleProxyRequest(`${coreApiUrl}/api/repo-pitch`));

// OA Pattern Predictor - Pay $0.01 USDC
app.post('/oa-predictor', handleProxyRequest(`${coreApiUrl}/api/oa-predictor`));

// Prompt-Guard Input Auditor - Pay $0.005 USDC
app.post('/prompt-guard', handleProxyRequest(`${coreApiUrl}/api/prompt-guard`));

// Atomic Application Sprint (aggregator) - Pay $0.04 USDC
app.post('/atomic-app-sprint', handleProxyRequest(`${coreApiUrl}/api/atomic-app-sprint`));

// ════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS - No payment required
// ════════════════════════════════════════════════════════════════════

/**
 * Health check - Use this to verify server is running
 * No payment required
 */
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'placement-prep-os',
    uptime: process.uptime(),
  });
});

/**
 * Info endpoint - Shows configured endpoints
 * Helpful for debugging and integration
 */
app.get('/info', (c) => {
  return c.json({
    service: 'placement-prep-os',
    version: '1.0.0',
    network: IS_MAINNET ? 'Algorand MainNet' : 'Algorand TestNet',
    receiver: avmAddress,
    endpoints: Object.keys(paymentConfig),
    documentation: 'See README.md in project root',
  });
});

/**
 * Result Persistence Layer - Scan History per Wallet
 * Non-gated: proxies straight through to the Core API's in-memory /
 * history.json-backed store. No payment required to log or read scans.
 */
app.post('/history', handleProxyRequest(`${coreApiUrl}/history`));
app.get('/history/:walletAddress', (c) => {
  const walletAddress = c.req.param('walletAddress');
  return handleProxyRequest(`${coreApiUrl}/history/${encodeURIComponent(walletAddress)}`)(c);
});

// ════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ════════════════════════════════════════════════════════════════════

app.notFound((c) => {
  return c.json(
    {
      error: 'Endpoint not found',
      path: c.req.path,
      hint: 'Try GET /health or GET /info for diagnostics',
    },
    404
  );
});

// ════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ════════════════════════════════════════════════════════════════════

serve({ fetch: app.fetch, port }, () => {
  console.log('\n✅ RoleModel AI resource server is running!\n');
  console.log('═'.repeat(60));
  console.log('Endpoints:');
  console.log(`  API:     http://localhost:${port}`);
  console.log(`  Health:  http://localhost:${port}/health`);
  console.log(`  Info:    http://localhost:${port}/info`);
  console.log('═'.repeat(60));
  console.log('\n📚 QUICK COMMANDS:\n');
  console.log('Test health endpoint (no payment):');
  console.log(`  curl http://localhost:${port}/health\n`);
  console.log('Test a payment endpoint (will request payment):');
  console.log(`  curl -X POST http://localhost:${port}/job-extract\n`);
  console.log('See handlers/ for the proxy pattern');
  console.log('See endpoints.config.ts to add new endpoints');
  console.log('\n' + '═'.repeat(60) + '\n');
});
