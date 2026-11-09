import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "WDK + QVAC on Monad - Devnads",
  description:
    "Build self-custodial wallets and local AI agents on Monad with Tether's WDK and QVAC. Hackathon starter, setup guide and Monad-specific gotchas.",
};

const REPO = "https://github.com/portdeveloper/wdk-qvac-monad-starter";

const QUICKSTART = `git clone ${REPO}
cd wdk-qvac-monad-starter
npm install       # ~2 GB (QVAC native runtimes), do it before the venue
npm run setup     # new seed in .env + 1 testnet MON from the devnads faucet
npm run mint      # 100 test USDC + USDT
npm run agent     # local AI wallet agent (first run downloads a ~1.1 GB model)`;

const AGENT_DEMO = `you> pay 2 usdc to 0xa982dEFe14513bd83e8cFdF083AD6d3e867D45f0
agent> transfer 2 USDC to 0xa982…45f0? max fee 0.012983954 MON [y/N] y
agent> done: https://testnet.monadvision.com/tx/0xc4cc8d09…`;

const WDK_SNIPPET = `import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const wdk = new WDK(process.env.WDK_SEED)
  .registerWallet('monad', WalletManagerEvm, {
    provider: 'https://testnet-rpc.monad.xyz', // mainnet: https://rpc.monad.xyz
    chainId: 10143,                            // mainnet: 143
  })

const account = await wdk.getAccount('monad', 0)
console.log(await account.getAddress(), await account.getBalance())

const { hash } = await account.sendTransaction({ to: '0x…', value: 10n ** 16n }) // 0.01 MON`;

const TOOL_SNIPPET = `// src/agent.js: one entry in TOOLS = one new agent capability
tx_status: {
  description: 'Look up a transaction by its hash',
  parameters: z.object({ hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/) }),
  run: ({ hash }) => wallet.account.getTransaction(hash),
},
// On-chain writes also set write: true plus quote() and summary(),
// so the agent shows the fee and asks before sending (see send_mon).`;

const VERIFIED = [
  ["Seed, HD derivation, chain detection", "✓", "✓"],
  ["Balances, token balances (multicall), allowances", "✓", "✓"],
  ["sign / signTypedData + verify", "✓", "✓"],
  ["Fee quotes", "✓", "✓"],
  ["MON sends (EIP-1559), receipts", "✓", "✓"],
  ["ERC-20 transfer", "✓", "fork only"],
  ["Parallel sends with the starter's write queue", "✓", "✓"],
  ["QVAC agent → WDK tool calls", "✓", "not run"],
];

const GOTCHAS: { title: string; body: string; link?: string }[] = [
  {
    title: "Back-to-back sends reuse nonces",
    body: "Monad's public RPC returns the same pending and latest nonce: it doesn't count txs still in the mempool. WDK uses the pending nonce, so two sends within ~200 ms get the same one. Identical txs are silently deduplicated (same hash returned, only one lands); different ones fail with \"nonce has already been used\" or \"could not coalesce error\". The starter serializes writes and waits for each receipt (~0.4–1 s on Monad).",
  },
  {
    title: "The quoted fee is a ceiling",
    body: "WDK quotes gasLimit × maxFeePerGas, roughly 2× the base fee plus tip. A plain MON send quotes 0.004242 MON and is charged 0.002142 MON.",
  },
  {
    title: "Monad charges for the gas limit, not gas used",
    body: "WDK sets the limit from eth_estimateGas, so leave it alone. Hardcoding a generous gasLimit means paying for all of it.",
    link: "https://docs.monad.xyz/developer-essentials/gas-pricing",
  },
  {
    title: "Empty wallets can't quote",
    body: "With 0 MON, quotes fail with \"missing revert data\". The RPC is rejecting gas estimation for insufficient balance. Fund the wallet first.",
  },
  {
    title: "Public RPCs are rate limited",
    body: "Set MONAD_RPC_URL to your own endpoint if you hit 429s during a demo.",
  },
];

const NETWORKS = [
  { name: "Testnet", chainId: "10143", rpc: "https://testnet-rpc.monad.xyz", tokens: "Test USDC, USDT (mint at /tokens)" },
  { name: "Mainnet", chainId: "143", rpc: "https://rpc.monad.xyz", tokens: "USDC, USDT0" },
];

const LINKS = [
  { name: "Starter repo", url: REPO, description: "Clone this. WDK + QVAC agent, scripts, Monad config." },
  { name: "WDK docs", url: "https://docs.wdk.tether.io", description: "Wallet Development Kit: wallets, accounts, protocols." },
  { name: "QVAC docs", url: "https://docs.qvac.tether.io", description: "Local AI SDK: LLMs, tool calling, speech, RAG." },
  { name: "Test Tokens", url: "/tokens", description: "Mint test USDC, USDT, WETH, WBTC on Monad testnet." },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-10 border-b border-border flex flex-col gap-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

export default function WdkPage() {
  return (
    <>
      <BackgroundGrid />
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="max-w-[960px] mx-auto w-full border-x border-border px-6 py-4 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-foreground hover:bg-secondary/30 transition-colors"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Starter repo
            </a>
          </div>
        </header>

        <main className="flex-1 max-w-[960px] mx-auto w-full border-x border-border">
          <div className="px-6 py-20 md:py-32 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 leading-[1.2]">
              WDK + QVAC on Monad
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Build self-custodial wallets with Tether&apos;s WDK and local, on-device AI with QVAC. The starter
              ships an AI wallet agent that runs entirely on your laptop: no API keys, keys never leave your machine.
            </p>
          </div>

          <Section title="Quick start">
            <p className="text-sm text-muted-foreground">Node.js 22+. A GPU is optional.</p>
            <CodeBlock code={QUICKSTART} />
            <p className="text-sm text-muted-foreground">
              Then talk to your wallet. The agent turns plain English into a tool call, WDK quotes it, and nothing
              is sent until you confirm.
            </p>
            <CodeBlock code={AGENT_DEMO} />
          </Section>

          <Section title="Use WDK directly">
            <p className="text-sm text-muted-foreground">
              Monad is a standard EVM chain to WDK: register <code className="font-mono">@tetherto/wdk-wallet-evm</code>{" "}
              with a Monad RPC. Use the starter&apos;s <code className="font-mono">createWallet()</code> instead of raw
              sends if you send more than one transaction at a time (see gotchas).
            </p>
            <CodeBlock code={WDK_SNIPPET} />
          </Section>

          <Section title="Add an agent tool">
            <p className="text-sm text-muted-foreground">
              Tools are zod schemas. QVAC&apos;s Qwen3 1.7B model picks the tool and fills the arguments; your handler
              calls WDK.
            </p>
            <CodeBlock code={TOOL_SNIPPET} />
          </Section>

          <Section title="Monad gotchas">
            <div className="grid grid-cols-1 gap-px bg-border border border-border">
              {GOTCHAS.map((g, i) => (
                <div key={g.title} className="bg-background p-6 flex flex-col gap-2">
                  <h3 className="text-base font-medium text-foreground">
                    <span className="font-mono text-xs text-muted-foreground/60 mr-3">{String(i + 1).padStart(2, "0")}</span>
                    {g.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {g.body}
                    {g.link && (
                      <>
                        {" "}
                        <a href={g.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                          Monad docs
                        </a>
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Networks">
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-3 font-normal">Network</th>
                    <th className="p-3 font-normal">Chain ID</th>
                    <th className="p-3 font-normal">RPC</th>
                    <th className="p-3 font-normal">Tokens in starter</th>
                  </tr>
                </thead>
                <tbody>
                  {NETWORKS.map((n) => (
                    <tr key={n.name} className="border-b border-border last:border-0">
                      <td className="p-3 text-foreground">{n.name}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{n.chainId}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{n.rpc}</td>
                      <td className="p-3 text-muted-foreground">{n.tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Verified">
            <p className="text-sm text-muted-foreground">
              Tested November 2026 with @tetherto/wdk 1.0.0-beta.22, @tetherto/wdk-wallet-evm 1.0.0-beta.25 and
              @qvac/sdk 0.23.0. WDK is in beta; the starter pins exact versions.
            </p>
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-3 font-normal">Feature</th>
                    <th className="p-3 font-normal">Testnet</th>
                    <th className="p-3 font-normal">Mainnet</th>
                  </tr>
                </thead>
                <tbody>
                  {VERIFIED.map(([feature, testnet, mainnet]) => (
                    <tr key={feature} className="border-b border-border last:border-0">
                      <td className="p-3 text-foreground">{feature}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{testnet}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{mainnet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
              {LINKS.map((l) => {
                const isExternal = l.url.startsWith("http");
                return (
                  <a
                    key={l.name}
                    href={l.url}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="bg-background p-6 flex flex-col gap-3 group hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-foreground">{l.name}</h3>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{l.description}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
