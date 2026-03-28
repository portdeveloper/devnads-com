"use client";

import { useState } from "react";

const MONAD_TESTNET = {
  chainId: "0x279F", // 10143
  chainName: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://rpc-testnet.monadinfra.com"],
  blockExplorerUrls: ["https://testnet.monadscan.com"],
};

declare global {
  interface Window {
    ethereum?: {
      request(args: { method: string; params?: unknown[] }): Promise<unknown>;
    };
  }
}

export function AddMonadTestnet() {
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleAdd() {
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }
    setAdding(true);
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [MONAD_TESTNET],
      });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className="border border-border px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-50"
    >
      {adding
        ? "ADDING..."
        : status === "success"
          ? "ADDED"
          : status === "error"
            ? "NO WALLET"
            : "ADD MONAD TESTNET"}
    </button>
  );
}
