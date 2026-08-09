import { SupportedWallet, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import WalletBar from './components/WalletBar'
import ResumeMatcher from './components/ResumeMatcher'
import ResumeRater from './components/ResumeRater'
import JobExtractor from './components/JobExtractor'
import CodeDebugger from './components/CodeDebugger'
import ColdEmailGenerator from './components/ColdEmailGenerator'
import StarTransform from './components/StarTransform'
import RepoPitch from './components/RepoPitch'
import OaPredictor from './components/OaPredictor'
import PromptGuard from './components/PromptGuard'
import AtomicSprint from './components/AtomicSprint'
import ScanHistory from './components/ScanHistory'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [{ id: WalletId.DEFLY }, { id: WalletId.PERA }, { id: WalletId.EXODUS }, { id: WalletId.LUTE }]
}

// ════════════════════════════════════════════════════════════════════
// Ten problem-statement micro-services + a scan-history index, listed
// flat in the sidebar under editorial section labels rather than
// boxed tabs.
// ════════════════════════════════════════════════════════════════════

type ToolId =
  | 'resume-rate'
  | 'resume-match'
  | 'job-extract'
  | 'cold-email'
  | 'oa-predictor'
  | 'code-debug'
  | 'repo-pitch'
  | 'star-transform'
  | 'prompt-guard'
  | 'atomic-sprint'
  | 'history'

interface NavEntry {
  id: ToolId
  label: string
}

interface NavGroup {
  label: string
  items: NavEntry[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Resume & Alignment',
    items: [
      { id: 'resume-rate', label: 'Resume Rater' },
      { id: 'resume-match', label: 'Role Matcher' },
    ],
  },
  {
    label: 'Job Intelligence & Outreach',
    items: [
      { id: 'job-extract', label: 'Job Extractor' },
      { id: 'cold-email', label: 'Cold Outreach' },
      { id: 'oa-predictor', label: 'OA Predictor' },
    ],
  },
  {
    label: 'Coding & Portfolio',
    items: [
      { id: 'code-debug', label: 'Code Debugger' },
      { id: 'repo-pitch', label: 'Repo Pitch' },
      { id: 'star-transform', label: 'STAR Stories' },
    ],
  },
  {
    label: 'Security & Guardrails',
    items: [{ id: 'prompt-guard', label: 'Prompt Guard' }],
  },
  {
    label: 'Atomic Sprint',
    items: [{ id: 'atomic-sprint', label: 'Application Sprint' }],
  },
  {
    label: 'History',
    items: [{ id: 'history', label: 'My Scan History' }],
  },
]

const TOOL_BLURBS: Record<ToolId, string> = {
  'resume-rate': 'Multi-agent ATS, action-verb & impact review',
  'resume-match': 'ATS match score against a target job description',
  'job-extract': 'Turn a raw posting into a clean structured summary',
  'cold-email': 'Tailored recruiter outreach copy',
  'oa-predictor': 'Likely DSA patterns for a company & role',
  'code-debug': 'Complexity, bugs, and an optimized rewrite',
  'repo-pitch': 'Professional GitHub README markdown',
  'star-transform': 'Behavioral-round interview scripts',
  'prompt-guard': 'Injection & hidden-text detection',
  'atomic-sprint': 'Job extraction, resume match & outreach — one payment',
  history: "Every paid scan you've run with this wallet",
}

const renderTool = (id: ToolId) => {
  switch (id) {
    case 'resume-rate':
      return <ResumeRater />
    case 'resume-match':
      return <ResumeMatcher />
    case 'job-extract':
      return <JobExtractor />
    case 'cold-email':
      return <ColdEmailGenerator />
    case 'oa-predictor':
      return <OaPredictor />
    case 'code-debug':
      return <CodeDebugger />
    case 'repo-pitch':
      return <RepoPitch />
    case 'star-transform':
      return <StarTransform />
    case 'prompt-guard':
      return <PromptGuard />
    case 'atomic-sprint':
      return <AtomicSprint />
    case 'history':
      return <ScanHistory />
  }
}

const AppShell: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('resume-rate')
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal((v) => !v)

  const handleSelect = (id: ToolId) => {
    setActiveTool(id)
    setSidebarOpen(false)
  }

  const sidebarContent = (
    <>
      <div className="px-5 pt-8">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[22px] font-medium leading-none text-ink">Placement</span>
          <span className="font-display text-[22px] font-light italic leading-none text-black/40">Prep</span>
        </div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-black/30">
          Pay-per-use · x402 · Algorand
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="pp-nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`pp-nav-item ${activeTool === item.id ? 'pp-nav-item-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-black/5 p-4">
        <WalletBar onOpenWalletModal={toggleWalletModal} />
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-alabaster-100 text-ink md:h-screen md:overflow-hidden">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-black/5 bg-alabaster-50 px-5 py-4 md:hidden">
        <span className="font-display text-lg font-medium text-ink">Placement Prep</span>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium"
        >
          Menu
        </button>
      </div>

      {/* Left sidebar — fixed/sticky, narrow, ultra-clean */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-black/5 bg-alabaster-50 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/10 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Right canvas — scrollable, distraction-free workspace */}
      <main className="flex-1 overflow-y-auto pt-16 md:h-screen md:pt-0">
        <div className="mx-auto max-w-3xl px-6 py-16 md:px-16 md:py-24">
          <div className="mb-14">
            <div className="pp-eyebrow">{NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeTool))?.label}</div>
            <p className="mt-2 text-sm text-black/40">{TOOL_BLURBS[activeTool]}</p>
          </div>

          {!activeAddress ? (
            <div className="pp-bento flex flex-col items-start gap-5 py-16 text-left">
              <div className="h-9 w-9 rounded-full border border-black/10" />
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">Connect a wallet to begin</h2>
                <p className="mt-2 max-w-md text-sm text-black/50">
                  Every tool here is a pay-per-use x402 endpoint on Algorand TestNet. Connect a wallet holding testnet
                  USDC to run your first analysis.
                </p>
              </div>
              <button className="pp-btn-pay" onClick={toggleWalletModal}>
                <span className="pp-btn-pay-label">Connect Wallet</span>
              </button>
            </div>
          ) : (
            renderTool(activeTool)
          )}
        </div>
      </main>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <AppShell />
      </WalletProvider>
    </SnackbarProvider>
  )
}
