"use client";

import { BackgroundGrid } from "@/components/background-grid";
import { ArrowLeft, ArrowUpRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  parseAbi,
  parseEventLogs,
  parseUnits,
  type Address,
  type EIP1193Provider,
} from "viem";
import { monadTestnet } from "viem/chains";

const EXPLORER = "https://testnet.monadscan.com";

const TOKENS = [
  { symbol: "USDC", name: "Test USD Coin", decimals: 6, cap: "10000", address: "0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73", note: "EIP-2612 permit" },
  { symbol: "USDT", name: "Test Tether USD", decimals: 6, cap: "10000", address: "0x42D54D7aE6776D309363e650fBcbF93D961D8b58", note: "EIP-2612 permit" },
  { symbol: "WETH", name: "Test Wrapped Ether", decimals: 18, cap: "5", address: "0x05bE0A4Bc7848424029B75d51565A34e17802D2d", note: "EIP-2612 permit" },
  { symbol: "WBTC", name: "Test Wrapped BTC", decimals: 8, cap: "0.5", address: "0x596886d5875D73cC9bCEC4fAf1EE54e4B8af3d6a", note: "EIP-2612 permit" },
] as const;

const NFT_ADDRESS: Address = "0x26A784DfaF1e428aC51a5c1AE6E80E84278Af41D";
const NFT_MAX_PER_MINT = 10;

const TOKEN_ABI = parseAbi([
  "function mint(address to, uint256 amount)",
  "function balanceOf(address) view returns (uint256)",
]);

const NFT_ABI = parseAbi([
  "function mint(address to, uint256 quantity)",
  "function balanceOf(address) view returns (uint256)",
  "function tokenURI(uint256) view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });

function getProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ethereum as unknown as EIP1193Provider | undefined;
}

async function getWallet() {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet found. Install MetaMask or another browser wallet.");
  const walletClient = createWalletClient({ chain: monadTestnet, transport: custom(provider) });
  const [account] = await walletClient.requestAddresses();
  if ((await walletClient.getChainId()) !== monadTestnet.id) {
    try {
      await walletClient.switchChain({ id: monadTestnet.id });
    } catch {
      await walletClient.addChain({ chain: monadTestnet });
    }
  }
  return { walletClient, account };
}

function errorMessage(e: unknown) {
  const err = e as { shortMessage?: string; message?: string };
  return err.shortMessage ?? err.message ?? "Something went wrong";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function AddressLink({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <a
        href={`${EXPLORER}/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-muted-foreground hover:text-foreground break-all"
      >
        {address}
      </a>
      <CopyButton text={address} />
    </div>
  );
}

const buttonClass =
  "inline-flex items-center justify-center gap-2 border border-border px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-50 shrink-0";

type Status = { kind: "idle" } | { kind: "pending"; text: string } | { kind: "done"; hash: string } | { kind: "error"; text: string };

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  if (status.kind === "pending") return <p className="text-xs text-muted-foreground">{status.text}</p>;
  if (status.kind === "error") return <p className="text-xs text-red-500 break-words">{status.text}</p>;
  return (
    <a
      href={`${EXPLORER}/tx/${status.hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
    >
      Minted. View transaction <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}

function TokenRow({ token, account, onConnect }: { token: (typeof TOKENS)[number]; account?: Address; onConnect: () => Promise<Address | undefined> }) {
  const [amount, setAmount] = useState<string>(token.cap);
  const [balance, setBalance] = useState<bigint>();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [balanceVersion, setBalanceVersion] = useState(0);
  const refresh = () => setBalanceVersion((v) => v + 1);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    publicClient
      .readContract({ address: token.address, abi: TOKEN_ABI, functionName: "balanceOf", args: [account] })
      .then((b) => !cancelled && setBalance(b))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [account, token.address, balanceVersion]);

  async function mint() {
    try {
      const value = parseUnits(amount || "0", token.decimals);
      if (value <= BigInt(0) || value > parseUnits(token.cap, token.decimals)) {
        setStatus({ kind: "error", text: `Enter an amount between 0 and ${token.cap}` });
        return;
      }
      if (!account && !(await onConnect())) return;
      const { walletClient, account: from } = await getWallet();
      setStatus({ kind: "pending", text: "Confirm in your wallet..." });
      const hash = await walletClient.writeContract({ account: from, address: token.address, abi: TOKEN_ABI, functionName: "mint", args: [from, value] });
      setStatus({ kind: "pending", text: "Waiting for confirmation..." });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus({ kind: "done", hash });
      refresh();
    } catch (e) {
      setStatus({ kind: "error", text: errorMessage(e) });
    }
  }

  async function addToWallet() {
    try {
      const { walletClient } = await getWallet();
      await walletClient.watchAsset({ type: "ERC20", options: { address: token.address, symbol: token.symbol, decimals: token.decimals } });
    } catch (e) {
      setStatus({ kind: "error", text: errorMessage(e) });
    }
  }

  return (
    <div className="bg-background p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-base font-medium text-foreground">{token.symbol}</span>
            <span className="text-sm text-muted-foreground">{token.name}</span>
          </div>
          <AddressLink address={token.address} />
        </div>
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 shrink-0">
          <span>{token.decimals} decimals</span>
          <span>{token.note}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 items-center border border-border">
          <input
            type="number"
            min="0"
            max={token.cap}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 min-w-0 bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none"
            aria-label={`${token.symbol} amount`}
          />
          <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">max {token.cap}</span>
        </div>
        <button onClick={mint} disabled={status.kind === "pending"} className={buttonClass}>
          Mint {token.symbol}
        </button>
        <button onClick={addToWallet} className={buttonClass}>
          Add to wallet
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusLine status={status} />
        {balance !== undefined && (
          <span className="font-mono text-xs text-muted-foreground ml-auto">
            Balance: {formatUnits(balance, token.decimals)} {token.symbol}
          </span>
        )}
      </div>
    </div>
  );
}

type Minted = { id: bigint; image?: string; name?: string };

function NftSection({ account, onConnect }: { account?: Address; onConnect: () => Promise<Address | undefined> }) {
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState<bigint>();
  const [minted, setMinted] = useState<Minted[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [balanceVersion, setBalanceVersion] = useState(0);
  const refresh = () => setBalanceVersion((v) => v + 1);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    publicClient
      .readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "balanceOf", args: [account] })
      .then((b) => !cancelled && setBalance(b))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [account, balanceVersion]);

  async function mint() {
    try {
      if (!account && !(await onConnect())) return;
      const { walletClient, account: from } = await getWallet();
      setStatus({ kind: "pending", text: "Confirm in your wallet..." });
      const hash = await walletClient.writeContract({ account: from, address: NFT_ADDRESS, abi: NFT_ABI, functionName: "mint", args: [from, BigInt(quantity)] });
      setStatus({ kind: "pending", text: "Waiting for confirmation..." });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setStatus({ kind: "done", hash });
      refresh();
      const ids = parseEventLogs({ abi: NFT_ABI, eventName: "Transfer", logs: receipt.logs }).map((l) => l.args.tokenId);
      const items = await Promise.all(
        ids.map(async (id) => {
          try {
            const uri = await publicClient.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "tokenURI", args: [id] });
            const meta = JSON.parse(atob(uri.split(",")[1]));
            return { id, image: meta.image as string, name: meta.name as string };
          } catch {
            return { id };
          }
        }),
      );
      setMinted((prev) => [...items, ...prev]);
    } catch (e) {
      setStatus({ kind: "error", text: errorMessage(e) });
    }
  }

  async function addToWallet(id: bigint) {
    try {
      const { walletClient } = await getWallet();
      await walletClient.request({
        method: "wallet_watchAsset",
        params: { type: "ERC721", options: { address: NFT_ADDRESS, tokenId: id.toString() } },
      } as never);
    } catch (e) {
      setStatus({ kind: "error", text: errorMessage(e) });
    }
  }

  return (
    <div className="bg-background p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-base font-medium text-foreground">DTNFT</span>
            <span className="text-sm text-muted-foreground">Devnads Test NFT</span>
          </div>
          <AddressLink address={NFT_ADDRESS} />
        </div>
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 shrink-0">
          <span>ERC-721</span>
          <span>On-chain metadata</span>
          <span>5% ERC-2981</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 items-center border border-border">
          <input
            type="number"
            min={1}
            max={NFT_MAX_PER_MINT}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(NFT_MAX_PER_MINT, Number(e.target.value) || 1)))}
            className="flex-1 min-w-0 bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none"
            aria-label="NFT quantity"
          />
          <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">max {NFT_MAX_PER_MINT}</span>
        </div>
        <button onClick={mint} disabled={status.kind === "pending"} className={buttonClass}>
          Mint NFT{quantity > 1 ? "s" : ""}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusLine status={status} />
        {balance !== undefined && <span className="font-mono text-xs text-muted-foreground ml-auto">You own: {balance.toString()}</span>}
      </div>
      {minted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {minted.map((nft) => (
            <div key={nft.id.toString()} className="border border-border bg-background p-2 flex flex-col gap-2">
              {nft.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={nft.image} alt={nft.name ?? `#${nft.id}`} className="w-full aspect-square" />
              ) : (
                <div className="w-full aspect-square bg-secondary/30" />
              )}
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs text-muted-foreground">#{nft.id.toString()}</span>
                <button onClick={() => addToWallet(nft.id)} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  + Wallet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TokensPage() {
  const [account, setAccount] = useState<Address>();
  const [connectError, setConnectError] = useState<string>();

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;
    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => setAccount((accounts as Address[])[0]))
      .catch(() => {});
    const onAccounts = (accounts: string[]) => setAccount(accounts[0] as Address | undefined);
    provider.on?.("accountsChanged", onAccounts);
    return () => provider.removeListener?.("accountsChanged", onAccounts);
  }, []);

  async function connect() {
    try {
      setConnectError(undefined);
      const { account } = await getWallet();
      setAccount(account);
      return account;
    } catch (e) {
      setConnectError(errorMessage(e));
      return undefined;
    }
  }

  return (
    <>
      <BackgroundGrid />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-[960px] mx-auto w-full border-x border-border px-6 py-4 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            {account ? (
              <span className="font-mono text-xs text-muted-foreground">
                {account.slice(0, 6)}…{account.slice(-4)}
              </span>
            ) : (
              <button onClick={connect} className={buttonClass}>
                Connect wallet
              </button>
            )}
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-[960px] mx-auto w-full border-x border-border">
          {/* Hero */}
          <div className="px-6 py-20 md:py-32 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 leading-[1.2]">
              Test Tokens
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Mint test versions of USDC, USDT, WETH and WBTC, plus test NFTs, on
              Monad testnet. Same decimals and interfaces as the real tokens,
              no value.
            </p>
            {connectError && <p className="text-xs text-red-500 mt-4">{connectError}</p>}
          </div>

          {/* Tokens */}
          <div className="px-6 py-10 border-b border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">ERC-20 tokens</h2>
            <div className="grid grid-cols-1 gap-px bg-border border border-border">
              {TOKENS.map((token) => (
                <TokenRow key={token.symbol} token={token} account={account} onConnect={connect} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4">
              Anyone can mint up to the listed max per transaction. Contracts have
              no owner and are verified on{" "}
              <a href={EXPLORER} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                Monadscan
              </a>{" "}
              and MonadVision. Minting needs a little MON for gas; get some from the{" "}
              <Link href="/agents" className="underline hover:text-foreground">
                faucet
              </Link>
              .
            </p>
          </div>

          {/* NFTs */}
          <div className="px-6 py-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">NFTs</h2>
            <div className="grid grid-cols-1 gap-px bg-border border border-border">
              <NftSection account={account} onConnect={connect} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="max-w-[960px] mx-auto w-full border-x border-border px-6 py-8">
            <span className="text-xs text-muted-foreground font-mono">Built by Devnads for the Monad community</span>
          </div>
        </footer>
      </div>
    </>
  );
}
