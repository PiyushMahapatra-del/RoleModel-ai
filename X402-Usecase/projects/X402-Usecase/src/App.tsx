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
  const [activeTool, setActiveTool] = useState<ToolId>('repo-pitch')
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
      <div className="px-6 pt-8 pb-6 border-b-2 border-ink">
        {/* Stark Brutalist Logo */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[26px] font-extrabold tracking-tight text-ink">Placement</span>
          <span className="font-display text-[26px] font-extrabold italic text-accent">Prep</span>
        </div>
        {/* Technical Specification Label */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 w-2 bg-accent border-2 border-ink" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-ink">
            OS // X402
          </span>
        </div>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto pb-6 pt-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="pp-nav-group-label">{group.label}</div>
            <div className="flex flex-col gap-1 mt-1">
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
          </div>
        ))}
      </nav>

      {/* Heavy bordered bottom panel for wallet */}
      <div className="border-t-2 border-ink p-4 bg-panel">
        <WalletBar onOpenWalletModal={toggleWalletModal} />
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-chassis text-ink md:h-screen md:overflow-hidden relative selection:bg-accent selection:text-white">
      
      {/* Mobile top bar (Brutalist Panel) */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b-2 border-ink bg-panel px-5 py-4 shadow-sm md:hidden">
        <span className="font-display text-lg font-extrabold text-ink">Placement <span className="italic text-accent">Prep</span></span>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-[4px] border-2 border-ink bg-panel px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-ink active:translate-y-[2px] active:translate-x-[2px] shadow-[2px_2px_0px_0px_#1E1E1E] active:shadow-none transition-all duration-150"
        >
          Menu
        </button>
      </div>

      {/* Left sidebar — Heavy bordered panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r-2 border-ink bg-panel transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-20 bg-ink/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Right canvas — The off-white paper workspace */}
      <main className="flex-1 overflow-y-auto pt-20 md:h-screen md:pt-0 relative z-10">
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-16 md:py-20">
          
          {/* Header Area */}
          <div className="mb-14 border-b-2 border-ink pb-8">
            <div className="pp-eyebrow mb-3 flex items-center gap-2 text-accent">
              <div className="h-2 w-2 bg-accent border-2 border-ink" />
              {NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeTool))?.label}
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
              {TOOL_BLURBS[activeTool]}
            </p>
          </div>

          {!activeAddress ? (
            <div className="pp-bento flex flex-col items-center justify-center gap-6 py-20 text-center">
              {/* Brutalist icon block */}
              <div className="h-16 w-16 rounded-[4px] shadow-brutal bg-panel flex items-center justify-center border-2 border-ink">
                <svg className="w-8 h-8 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <div className="max-w-sm mx-auto">
                <h2 className="font-display text-2xl font-extrabold text-ink uppercase tracking-tight">System Offline</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink font-medium">
                  Authentication required. Connect a testnet wallet holding USDC to unlock terminal features.
                </p>
              </div>
              
              <button className="pp-btn-pay mt-4" onClick={toggleWalletModal}>
                <span className="pp-btn-pay-label">Authenticate Wallet</span>
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