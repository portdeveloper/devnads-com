"use client";

import { BackgroundGrid } from "@/components/background-grid";
import { ArrowLeft, ArrowUpRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BASE_URL = "https://agents.devnads.com";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/verify",
    description: "Verify contract source code",
    chains: "Testnet + Mainnet",
    example: `curl -X POST ${BASE_URL}/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "chainId": 143,
    "contractAddress": "0x...",
    "contractName": "src/MyContract.sol:MyContract",
    "compilerVersion": "v0.8.28+commit.7893614a",
    "standardJsonInput": { ... }
  }'`,
  },
  {
    method: "POST",
    path: "/v1/faucet",
    description: "Request testnet MON tokens",
    chains: "Testnet only",
    example: `curl -X POST ${BASE_URL}/v1/faucet \\
  -H "Content-Type: application/json" \\
  -d '{
    "chainId": 10143,
    "address": "0x..."
  }'`,
  },
  {
    method: "GET",
    path: "/v1/faucet/status/:chainId",
    description: "Check faucet status and limits",
    chains: "Testnet only",
    example: `curl ${BASE_URL}/v1/faucet/status/10143`,
  },
  {
    method: "GET",
    path: "/health",
    description: "Health check",
    chains: "All",
    example: `curl ${BASE_URL}/health`,
  },
];

const VERIFY_PARAMS = [
  { name: "chainId", type: "number", required: true, description: "10143 (testnet) or 143 (mainnet)" },
  { name: "contractAddress", type: "string", required: true, description: "Deployed contract address" },
  { name: "contractName", type: "string", required: true, description: "e.g. src/MyContract.sol:MyContract" },
  { name: "compilerVersion", type: "string", required: true, description: "e.g. v0.8.28+commit.7893614a" },
  { name: "standardJsonInput", type: "object", required: false, description: "Foundry/Hardhat standard JSON input (recommended)" },
  { name: "sourceCode", type: "string", required: false, description: "Flattened source code (legacy fallback)" },
  { name: "constructorArgs", type: "string", required: false, description: "ABI-encoded constructor arguments" },
  { name: "evmVersion", type: "string", required: false, description: "Default: prague" },
  { name: "optimizationUsed", type: "boolean", required: false, description: "Default: false" },
  { name: "runs", type: "number", required: false, description: "Optimizer runs. Default: 200" },
];

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

export default function AgentsPage() {
  return (
    <>
      <BackgroundGrid />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-[960px] mx-auto w-full border-x border-border px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/portdeveloper/monad-agents-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-[960px] mx-auto w-full border-x border-border">
          {/* Hero */}
          <div className="px-6 py-20 md:py-32 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 leading-[1.2]">
              Agents API
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              API for LLM agents to request testnet tokens and verify smart
              contracts on Monad testnet and mainnet.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground/60">
                {BASE_URL.replace("https://", "")}
              </span>
            </div>
          </div>

          {/* Endpoints */}
          <div className="px-6 py-10 border-b border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              Endpoints
            </h2>
            <div className="grid grid-cols-1 gap-px bg-border border border-border">
              {ENDPOINTS.map((ep) => (
                <div
                  key={ep.path}
                  className="bg-background p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2 py-0.5 border border-border text-muted-foreground">
                          {ep.method}
                        </span>
                        <span className="font-mono text-sm text-foreground">
                          {ep.path}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ep.description}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 shrink-0">
                      {ep.chains}
                    </span>
                  </div>
                  <div className="relative bg-secondary/20 border border-border p-4 overflow-x-auto">
                    <div className="absolute top-3 right-3">
                      <CopyButton text={ep.example} />
                    </div>
                    <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
                      {ep.example}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification params */}
          <div className="px-6 py-10 border-b border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Verification Parameters
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Verifies contracts in parallel across three explorers: MonadVision
              (Sourcify), Socialscan, and Monadscan (Etherscan V2).
            </p>
            <div className="border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left font-mono text-xs uppercase tracking-widest text-muted-foreground px-4 py-3">
                      Parameter
                    </th>
                    <th className="text-left font-mono text-xs uppercase tracking-widest text-muted-foreground px-4 py-3">
                      Type
                    </th>
                    <th className="text-left font-mono text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 hidden sm:table-cell">
                      Required
                    </th>
                    <th className="text-left font-mono text-xs uppercase tracking-widest text-muted-foreground px-4 py-3">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {VERIFY_PARAMS.map((param) => (
                    <tr
                      key={param.name}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {param.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {param.type}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                        {param.required ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {param.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4">
              Either <code className="font-mono">standardJsonInput</code>{" "}
              (recommended) or <code className="font-mono">sourceCode</code>{" "}
              (legacy, flattened) is required.
            </p>
          </div>

          {/* Faucet info */}
          <div className="px-6 py-10 border-b border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Faucet
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Dispenses 1 MON per request on testnet (chain 10143).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
              {[
                { label: "Per address", value: "1 request / day" },
                { label: "Per IP", value: "5 requests / day" },
                { label: "Per ASN", value: "20 requests / day" },
                { label: "Daily budget", value: "500 MON / day" },
              ].map((limit) => (
                <div
                  key={limit.label}
                  className="bg-background p-4 flex flex-col gap-1"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    {limit.label}
                  </span>
                  <span className="text-sm text-foreground">{limit.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4">
              Abuse prevention includes IP reputation checks, signal detection
              for coordinated activity, and rate limiting across multiple
              dimensions.
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="px-6 py-10">
            <div className="border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Source Code
                </h2>
                <p className="text-base font-medium text-foreground">
                  View the API source on GitHub
                </p>
              </div>
              <a
                href="https://github.com/portdeveloper/monad-agents-api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-foreground hover:bg-secondary/30 transition-colors shrink-0"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                GitHub
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="max-w-[960px] mx-auto w-full border-x border-border px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground font-mono">
              <span>Built by Devnads for the Monad community</span>
              <div className="flex gap-4">
                <a
                  href="https://discord.gg/monaddev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground transition-colors"
                >
                  Discord
                </a>
                <a
                  href="https://x.com/monad_dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground transition-colors"
                >
                  X / Twitter
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
