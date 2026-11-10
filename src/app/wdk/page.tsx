import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "WDK on Monad - Devnads",
  description:
    "Build self-custodial wallets and payments on Monad with Tether's WDK, with optional local AI from QVAC. Hackathon starter, project ideas and Monad-specific gotchas.",
};

const REPO = "https://github.com/portdeveloper/wdk-qvac-monad-starter";

const QUICKSTART = `git clone ${REPO}
cd wdk-qvac-monad-starter
npm install       # ~240 MB
npm run setup     # new seed in .env + 1 testnet MON from the devnads faucet
npm run mint      # 100 test USDC + USDT
npm run send -- 0xRecipient 5 USDC`;

const AGENT_QUICKSTART = `npm run agent:install   # ~2 GB (QVAC native runtimes), do it before the venue
npm run agent           # first run downloads a ~1.1 GB model, then it's cached`;

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

const STARTER_SNIPPET = `import { createWallet } from './src/wallet.js'

const wallet = await createWallet() // reads WDK_SEED + MONAD_NETWORK from env (node --env-file=.env)
console.log(wallet.address, await wallet.balances())

await wallet.transfer('USDC', '0x…', '5')
await wallet.sendTransaction({ to: contract, data }) // any contract call`;

const TOOL_SNIPPET = `// examples/qvac-agent/agent.js: one entry in TOOLS = one new agent capability
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

const WDK_IDEAS = [
  {
    name: "Tip bot",
    body: "A Telegram or Discord bot where every member gets a wallet derived from one seed (account index = user). /tip @friend 5 USDT. The bot holds the seed, so keep it on testnet.",
  },
  {
    name: "Claim links",
    body: "Send USDT as a link: the link carries a fresh one-time key holding the funds (plus a little MON for gas), and whoever opens it sweeps them into their own wallet. Red packets, giveaways, onboarding friends.",
  },
  {
    name: "Checkout with per-order addresses",
    body: "A shop derives a new address for every order from one seed, watches it for the USDT payment, marks the order paid, then tops it up with MON for gas and sweeps the funds to the treasury.",
  },
  {
    name: "Pay-per-call API",
    body: "Your API answers 402 with a price. The client pays in USDT on Monad with WDK, retries with the tx hash, and the server checks the receipt. Fees of a fraction of a cent make per-request pricing work.",
  },
  {
    name: "Wallet MCP server",
    body: "Give Claude, ChatGPT or any agent a wallet: an MCP server exposing balance, quote and send tools backed by WDK, with spending limits enforced in code, not in the prompt.",
  },
  {
    name: "Split and settle",
    body: "A group expense ledger that computes who owes whom and settles every debt in one go. The starter's write queue keeps the burst of back-to-back transfers safe on Monad.",
  },
  {
    name: "Game with a real wallet",
    body: "Every player gets a WDK wallet. Rewards are test USDT, items are the ERC-1155s from /tokens, and trades between players are real transfers.",
  },
  {
    name: "One seed, many chains",
    body: "One recovery phrase, accounts on Monad and Solana (or TON, Tron): a wallet that pays from whichever chain has the funds.",
  },
];

const QVAC_IDEAS = [
  {
    name: "Pay-per-prompt AI",
    body: "One laptop runs a bigger model and charges 0.001 test USDT per answer. Your agent pays automatically with WDK on every request. Serve it over QVAC's P2P layer or plain HTTP.",
  },
  {
    name: "Explain before you sign",
    body: "Before WDK signs, a local model reads the transaction and says what it does in plain words: \"this lets contract X spend all your USDC forever.\" Anything over a limit needs a spoken confirmation.",
  },
  {
    name: "Receipt splitter",
    body: "Photo of the bill, QVAC OCR reads the items, the model splits them per person, WDK sends each share in test USDT.",
  },
  {
    name: "Voice wallet in your language",
    body: "\"Send 5 dollars to Ali\" in Turkish or Spanish. Speech-to-text and translation run locally, WDK pays, text-to-speech reads back the confirmation.",
  },
  {
    name: "Allowance wallet",
    body: "A parent (or a developer) writes spending rules in plain English: \"max 10 USDT a day, no gambling.\" A local model checks every spend before WDK signs it.",
  },
  {
    name: "Bounty bot",
    body: "Post a task, submit the work, the model judges it against the task, WDK pays the bounty after a human approves.",
  },
  {
    name: "Private bill payer",
    body: "Point it at a folder of invoices. Amounts, due dates and addresses are extracted on your machine and queued as WDK payments for one-click approval. Your financial documents never touch a cloud.",
  },
  {
    name: "Live talk tip jar",
    body: "Speech-to-text runs on a talk, and listeners' agents tip the speaker when they mention a topic you flagged: \"tip 0.1 when they say Monad.\"",
  },
  {
    name: "Offline market stall",
    body: "The seller says the price, the app shows a QR, the buyer pays. All the AI works offline; only the transaction needs a connection.",
  },
  {
    name: "AI dungeon with real loot",
    body: "A local LLM runs a text adventure. Finding treasure sends test tokens or mints NFTs to the player's WDK wallet (the /tokens contracts are already deployed).",
  },
];

const LINKS = [
  { name: "Starter repo", url: REPO, description: "Clone this. WDK wallet, scripts, Monad config, optional QVAC agent." },
  { name: "WDK docs", url: "https://docs.wdk.tether.io", description: "Wallet Development Kit: wallets, accounts, protocols." },
  { name: "QVAC docs", url: "https://docs.qvac.tether.io", description: "Local AI SDK: LLMs, tool calling, speech, RAG." },
  { name: "Test Tokens", url: "/tokens", description: "Mint test USDC, USDT, WETH, WBTC on Monad testnet." },
];

function Part({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-16 pb-6 border-b border-border">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h2>
      <p className="text-base text-muted-foreground max-w-xl">{subtitle}</p>
    </div>
  );
}

function Ideas({ ideas }: { ideas: { name: string; body: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
      {ideas.map((idea) => (
        <div key={idea.name} className="bg-background p-6 flex flex-col gap-2">
          <h3 className="text-base font-medium text-foreground">{idea.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{idea.body}</p>
        </div>
      ))}
    </div>
  );
}

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
              WDK on Monad
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Build self-custodial wallets and payments on Monad with Tether&apos;s Wallet Development Kit. Add local,
              on-device AI with QVAC if your idea needs it.
            </p>
          </div>

          <Part
            title="WDK"
            subtitle="JavaScript modules for building self-custodial wallets. One seed phrase derives accounts on EVM chains like Monad, plus Solana, TON, Tron and more. Read balances, quote fees, sign, send. Keys stay with the user, never with a server."
          />

          <Section title="Quick start">
            <p className="text-sm text-muted-foreground">Node.js 22+.</p>
            <CodeBlock code={QUICKSTART} />
          </Section>

          <Section title="Use the wallet">
            <p className="text-sm text-muted-foreground">
              The starter&apos;s <code className="font-mono">createWallet()</code> wraps WDK with Monad config, token
              helpers and a write queue that keeps back-to-back sends safe (see gotchas).
            </p>
            <CodeBlock code={STARTER_SNIPPET} />
            <p className="text-sm text-muted-foreground">
              Or use WDK directly. Monad is a standard EVM chain to it: register{" "}
              <code className="font-mono">@tetherto/wdk-wallet-evm</code> with a Monad RPC.
            </p>
            <CodeBlock code={WDK_SNIPPET} />
          </Section>

          <Section title="What to build">
            <p className="text-sm text-muted-foreground">
              Ideas sized for one day. The bar: WDK holds the keys (no MetaMask), and the demo makes at least one real
              transaction on Monad testnet.
            </p>
            <Ideas ideas={WDK_IDEAS} />
          </Section>

          <Section title="Monad gotchas">
            <div className="grid grid-cols-1 gap-px bg-border border border-border">
              {GOTCHAS.map((g) => (
                <div key={g.title} className="bg-background p-6 flex flex-col gap-2">
                  <h3 className="text-base font-medium text-foreground">
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
              Tested November 2026 with @tetherto/wdk 1.0.0-beta.22 and @tetherto/wdk-wallet-evm 1.0.0-beta.25. WDK is
              in beta; the starter pins exact versions.
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

          <Part
            title="WDK + QVAC"
            subtitle="Optional. QVAC runs AI models on the user's own device: LLM chat with tool calling, speech-to-text, text-to-speech, translation, embeddings/RAG and OCR, offline, in Node.js or Expo. No API key, no cloud."
          />

          <Section title="Why combine them">
            <p className="text-sm text-muted-foreground">
              QVAC decides what to do, WDK signs and sends it. Inference and signing both happen on your machine, so an
              agent can hold a wallet without handing keys or prompts to a third party; only the signed transaction
              leaves it.
            </p>
          </Section>

          <Section title="Run the agent">
            <p className="text-sm text-muted-foreground">
              The starter&apos;s agent lives in <code className="font-mono">examples/qvac-agent</code> with its own
              install, so teams that only use WDK skip the download.
            </p>
            <CodeBlock code={AGENT_QUICKSTART} />
            <p className="text-sm text-muted-foreground">
              It turns plain English into a tool call, WDK quotes it, and nothing is sent until you confirm.
            </p>
            <CodeBlock code={AGENT_DEMO} />
            <p className="text-sm text-muted-foreground">
              Keep the confirmation. In testing, &quot;pay 1 usdt&quot; once came back as a 0.5 USDT transfer: small
              models misread amounts.
            </p>
          </Section>

          <Section title="Add an agent tool">
            <p className="text-sm text-muted-foreground">
              Tools are zod schemas. QVAC&apos;s Qwen3 1.7B model picks the tool and fills the arguments; your handler
              calls WDK.
            </p>
            <CodeBlock code={TOOL_SNIPPET} />
          </Section>

          <Section title="What to build with QVAC">
            <p className="text-sm text-muted-foreground">
              The bar: QVAC makes a decision that changes what happens, and WDK holds the keys. A chatbot with a send
              button is the starter, not a project.
            </p>
            <Ideas ideas={QVAC_IDEAS} />
            <p className="text-sm text-muted-foreground">
              Probably too big for a day: training or fine-tuning models, autonomous trading (a 1.7B model shouldn&apos;t
              make that call), cross-chain bridging.
            </p>
            <p className="text-sm text-muted-foreground">
              Verified with @qvac/sdk 0.23.0 on testnet: tool calls, balance lookups and token transfers through WDK.
              QVAC ships builds for macOS, Linux and Windows; we ran it on Linux.
            </p>
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
