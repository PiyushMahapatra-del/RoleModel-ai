/**
 * Placement Prep OS - Endpoints Configuration
 *
 * Defines every payment-protected x402 endpoint exposed by this resource
 * server. Each entry maps an HTTP method + path to its USDC price on
 * Algorand and a discovery description used by x402 Bazaar.
 *
 * To add a new endpoint:
 * 1. Add a config entry below
 * 2. Create/extend a handler in x402-core-api/src (see prompts.ts + index.ts)
 * 3. Register the route in index.ts (paid route + proxy target)
 */

import { ALGORAND_TESTNET_CAIP2, ALGORAND_MAINNET_CAIP2, USDC_TESTNET_ASA_ID, USDC_MAINNET_ASA_ID } from '@x402/avm';
import { declareDiscoveryExtension } from '@x402-avm/extensions';

// ════════════════════════════════════════════════════════════════════
// NETWORK CONFIG TOGGLE (TestNet / MainNet)
//
// Flip ACTIVE_NETWORK below to switch every endpoint's price/network in
// one place. Defaults to Algorand TestNet for local development & demos.
// ════════════════════════════════════════════════════════════════════

// --- Default: Algorand TestNet ---
const NETWORK_CAIP2: string = ALGORAND_TESTNET_CAIP2; // ALGORAND_TESTNET_CAIP2
const USDC_ASA_ID: string = USDC_TESTNET_ASA_ID; // 10458941

// --- MainNet (uncomment to switch) ---
// const NETWORK_CAIP2 = ALGORAND_MAINNET_CAIP2; // ALGORAND_MAINNET_CAIP2
// const USDC_ASA_ID = USDC_MAINNET_ASA_ID; // 31566704

// Re-exported so index.ts / other modules can log which network is active
// without duplicating the toggle logic.
export const ACTIVE_NETWORK_CAIP2 = NETWORK_CAIP2;
export const ACTIVE_USDC_ASA_ID = USDC_ASA_ID;
export const IS_MAINNET = NETWORK_CAIP2 === ALGORAND_MAINNET_CAIP2;

// Type definition for endpoints
export interface EndpointConfig {
  [key: string]: {
    accepts: Array<{
      scheme: 'exact';
      price: string;
      network: string;
      payTo: string;
      extra: { asset: number };
    }>;
    description: string;
    extensions?: Record<string, unknown>;
  };
}

export function createPaymentConfig(avmAddress: string): EndpointConfig {
  const asset = Number(USDC_ASA_ID);

  return {
    /**
     * RESUME-TO-ROLE MATCHER
     * Compares a resume against a target job description and returns an
     * ATS-style match score, missing keywords, and rewrite suggestions.
     */
    'POST /resume-match': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.02',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Resume-to-Role Matcher - ATS match score, missing keywords & rewrite suggestions - Pay $0.02 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: {
          resumeText: 'Full plain-text resume...',
          jobDescription: 'Full target job description...',
        },
        inputSchema: {
          properties: {
            resumeText: { type: 'string' },
            jobDescription: { type: 'string' },
          },
          required: ['resumeText', 'jobDescription'],
        },
        output: {
          example: {
            matchPercentage: 74,
            missingKeywords: { technical: ['Kubernetes', 'GraphQL'], soft: ['stakeholder management'] },
            revisions: ['Reframe bullet 2 to quantify impact...'],
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * JOB DESCRIPTION & OA EXTRACTOR
     * Turns messy raw job-posting text into a clean structured summary.
     */
    'POST /job-extract': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.005',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Job Description & OA Extractor - Structured role summary card - Pay $0.005 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { rawText: 'Pasted LinkedIn / Unstop / email job posting...' },
        inputSchema: {
          properties: { rawText: { type: 'string' } },
          required: ['rawText'],
        },
        output: {
          example: {
            roleTitle: 'Software Engineer Intern',
            eligibilityCriteria: ['B.Tech CSE/IT, 2026 batch', 'CGPA >= 7.0'],
            coreTechStack: ['React', 'Node.js', 'PostgreSQL'],
            stipendOrCTC: '₹60,000/month stipend',
            likelyTopics: ['DSA (Arrays, Trees)', 'DBMS', 'OS basics'],
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * OA CODE DEBUGGER & EDGE-CASE AUDITOR
     * Reviews a code snippet for complexity, bugs and hidden edge cases.
     */
    'POST /code-debug': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'OA Code Debugger & Edge-Case Auditor - Complexity, bugs & optimized rewrite - Pay $0.01 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { code: 'def two_sum(nums, target): ...', language: 'python', context: 'Optional problem statement' },
        inputSchema: {
          properties: {
            code: { type: 'string' },
            language: { type: 'string' },
            context: { type: 'string' },
          },
          required: ['code', 'language'],
        },
        output: {
          example: {
            timeComplexity: 'O(n^2)',
            spaceComplexity: 'O(1)',
            edgeCases: ['Empty array input', 'Integer overflow on large sums'],
            bugs: ['Off-by-one error in loop bound on line 4'],
            optimizedCode: '...',
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * RESUME RATER & IMPACT ENHANCER
     * Multi-dimension review of a resume/section: ATS, verbs, metrics, formatting.
     */
    'POST /resume-rate': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.02',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Resume Rater & Impact Enhancer - Multi-agent ATS, verb & impact review - Pay $0.02 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { resumeText: 'Resume section or full resume text...' },
        inputSchema: {
          properties: { resumeText: { type: 'string' } },
          required: ['resumeText'],
        },
        output: {
          example: {
            atsScore: 81,
            actionVerbScore: 70,
            quantifiedImpactScore: 55,
            formattingFeedback: ['Inconsistent bullet punctuation'],
            revisedBullets: ['Led migration of 6 microservices, cutting p95 latency 32%...'],
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * COLD EMAIL & LINKEDIN OUTREACH GENERATOR
     * Candidate profile + recruiter details -> tailored outreach copy.
     */
    'POST /cold-email': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Cold Email & LinkedIn Outreach Generator - Tailored recruiter outreach copy - Pay $0.01 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: {
          candidateProfile: 'Short candidate profile summary...',
          recruiterDetails: 'Optional recruiter / hiring manager details...',
        },
        inputSchema: {
          properties: {
            candidateProfile: { type: 'string' },
            recruiterDetails: { type: 'string' },
          },
          required: ['candidateProfile'],
        },
        output: {
          example: {
            emailSubject: 'Backend engineer excited about {Company}\'s platform team',
            emailBody: '...',
            linkedinMessage: '...',
            keyTalkingPoints: ['3 years distributed systems experience', 'Shipped a payments migration'],
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * STAR STORY TRANSFORMER
     * Raw project/experience notes -> Situation-Task-Action-Result script.
     */
    'POST /star-transform': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'STAR Story Transformer - Behavioral-round interview script - Pay $0.01 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { rawNotes: 'Raw project description or experience notes...' },
        inputSchema: {
          properties: { rawNotes: { type: 'string' } },
          required: ['rawNotes'],
        },
        output: {
          example: {
            situation: '...',
            task: '...',
            action: '...',
            result: '...',
            interviewScript: '...',
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * REPO README PITCH GENERATOR
     * Project title + tech description -> polished GitHub README markdown.
     */
    'POST /repo-pitch': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Repo README Pitch Generator - Professional GitHub README markdown - Pay $0.01 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { projectTitle: 'Project title...', techDescription: 'Brief tech description...' },
        inputSchema: {
          properties: {
            projectTitle: { type: 'string' },
            techDescription: { type: 'string' },
          },
          required: ['projectTitle', 'techDescription'],
        },
        output: {
          example: {
            readmeMarkdown: '# Project Title\n\n...',
            highlights: ['Built a real-time sync engine handling 10k events/sec'],
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * OA PATTERN PREDICTOR
     * Company + role -> likely DSA patterns, edge-case alerts, sample topics.
     */
    'POST /oa-predictor': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'OA Pattern Predictor - Likely DSA patterns & sample OA topics - Pay $0.01 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { companyName: 'Company name...', targetRole: 'Target job role...' },
        inputSchema: {
          properties: {
            companyName: { type: 'string' },
            targetRole: { type: 'string' },
          },
          required: ['companyName', 'targetRole'],
        },
        output: {
          example: {
            likelyPatterns: ['Dynamic Programming', 'Two Pointers'],
            edgeCaseAlerts: ['Large-input performance', 'Malformed input handling'],
            sampleTopics: ['Longest increasing subsequence variant'],
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * PROMPT-INJECTION / INPUT GUARD AUDITOR
     * Resume or other user input -> injection/hidden-text/policy audit.
     */
    'POST /prompt-guard': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.005',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Prompt-Guard Input Auditor - Injection & hidden-text detection - Pay $0.005 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { inputText: 'Resume or other user-submitted text...' },
        inputSchema: {
          properties: { inputText: { type: 'string' } },
          required: ['inputText'],
        },
        output: {
          example: {
            riskLevel: 'low',
            findings: [],
            sanitizedSummary: '...',
            safeToProceed: true,
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },

    /**
     * ATOMIC APPLICATION SPRINT (AGGREGATOR)
     * Job posting + resume -> job extraction + resume match + cold email,
     * atomically executed behind a single x402 payment.
     */
    'POST /atomic-app-sprint': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.04',
          network: NETWORK_CAIP2,
          payTo: avmAddress,
          extra: { asset },
        },
      ],
      description: 'Atomic Application Sprint - Job extraction + resume match + cold email in one payment - Pay $0.04 USDC',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { jobPosting: 'Raw target job posting text...', resumeText: 'Full plain-text resume...' },
        inputSchema: {
          properties: {
            jobPosting: { type: 'string' },
            resumeText: { type: 'string' },
          },
          required: ['jobPosting', 'resumeText'],
        },
        output: {
          example: {
            jobExtract: { roleTitle: 'Software Engineer Intern' },
            resumeMatch: { matchPercentage: 74 },
            coldEmail: { emailSubject: '...' },
            paidVia: 'x402 / USDC Algorand',
          },
        },
      }),
    },
  };
}

/**
 * PRICING REFERENCE (USDC on Algorand, 6 decimals):
 * TestNet ASA 10458941 (default) · MainNet ASA 31566704
 * - /prompt-guard      $0.005 =  5,000 microunits
 * - /job-extract       $0.005 =  5,000 microunits
 * - /code-debug        $0.01  = 10,000 microunits
 * - /cold-email        $0.01  = 10,000 microunits
 * - /star-transform    $0.01  = 10,000 microunits
 * - /repo-pitch        $0.01  = 10,000 microunits
 * - /oa-predictor      $0.01  = 10,000 microunits
 * - /resume-match      $0.02  = 20,000 microunits
 * - /resume-rate       $0.02  = 20,000 microunits
 * - /atomic-app-sprint $0.04  = 40,000 microunits
 */

export default createPaymentConfig;
