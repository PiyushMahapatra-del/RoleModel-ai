# RoleModel AI

An on-demand, pay-per-use career and interview-prep micro-API, built on the
[x402 protocol](https://algorand.co/agentic-commerce/x402) over Algorand
TestNet. Every feature is a single HTTP call gated by a USDC micro-payment —
connect a wallet, sign, get your result.

## Features

| Endpoint | Price | What it does |
|---|---|---|
| `POST /resume-match` | $0.02 USDC | ATS match score, missing keywords, and rewrite suggestions against a target job description |
| `POST /job-extract` | $0.005 USDC | Turns a messy raw job posting into a clean, structured summary card |
| `POST /code-debug` | $0.01 USDC | Time/space complexity, hidden edge cases, bug detection, and an optimized rewrite for OA code |
| `POST /resume-rate` | $0.02 USDC | Multi-agent resume review: ATS score, action-verb strength, quantified impact, formatting |

## Architecture

```
X402-Usecase/projects/X402-Usecase/   React + Vite + Tailwind/daisyUI frontend
x402-demo-server/                     x402 Resource Server (Hono) — verifies payment, proxies to Core API
x402-core-api/                        AI Core API microservice (Hono + Gemini) — does the actual analysis
```

The frontend never talks to Gemini directly. It calls `x402-demo-server`,
which is protected by x402 payment middleware. Only after a payment is
verified on-chain does the demo server forward the request to
`x402-core-api`, which performs the AI analysis and returns structured JSON.

## Prerequisites

- Node.js >= 20
- An Algorand TestNet wallet (Pera, Defly, Exodus, or Lute) funded with
  TestNet ALGO + USDC — see [dev.algorand.co](https://dev.algorand.co/concepts/accounts/create/)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

## Setup

Install dependencies in all three projects:

```bash
cd x402-core-api && npm install
cd ../x402-demo-server && npm install
cd ../X402-Usecase/projects/X402-Usecase && npm install
```

Configure environment variables:

```bash
# x402-core-api/.env
GEMINI_API_KEY=your_key_here

# x402-demo-server/.env  (already has sensible testnet defaults)
AVM_ADDRESS=<your Algorand TestNet receiving address>
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
CORE_API_URL=http://localhost:4022

# X402-Usecase/projects/X402-Usecase/.env (already has sensible testnet defaults)
VITE_API_BASE_URL=http://localhost:4021
```

## Running locally

Start all three services, each in its own terminal:

```bash
# 1. AI Core API (port 4022)
cd x402-core-api && npm start

# 2. x402 Resource Server (port 4021)
cd x402-demo-server && npm run dev

# 3. Frontend (Vite dev server, usually port 5173)
cd X402-Usecase/projects/X402-Usecase && npm run dev
```

Open the frontend URL, connect a TestNet wallet with USDC, and try any tab.

Quick health checks (no payment required):

```bash
curl http://localhost:4022/health
curl http://localhost:4021/health
curl http://localhost:4021/info
```

## Design system

- **Navy** `#133458` — headers, nav, dark surfaces
- **Sage** `#838921` — success states, verified badges, positive scores
- **Ochre** `#D99B21` — CTAs, pricing tags, active states
- **Cream** `#FAF7BB` — page background, card tints

Every paid action shows its price directly on the button and, after payment
settles, renders an on-chain **Settlement Receipt** card with a link to the
transaction on [Lora Explorer](https://lora.algokit.io/testnet).

## Extending it

- **New endpoint**: add a price entry in `x402-demo-server/endpoints.config.ts`,
  a proxy route in `x402-demo-server/index.ts`, and a handler in
  `x402-core-api/src/index.ts`.
- **Swap the AI model**: `x402-core-api` isolates all Gemini calls behind
  `generateStructuredJson()` — swap in another provider there without
  touching the resource server or frontend.
- **Persist results**: neither backend currently stores request history;
  add a database layer in `x402-core-api` if you want a saved history of
  scans per wallet address.
- **Mainnet**: swap `ALGORAND_TESTNET_CAIP2`/`USDC_TESTNET_ASA_ID` for their
  mainnet equivalents in `endpoints.config.ts`, and point the frontend's
  wallet network config at mainnet.
