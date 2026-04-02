"use client";

import { useState, useEffect } from "react";

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
  const [alreadyAdded, setAlreadyAdded] = useState(false);

  useEffect(() => {
    async function checkChain() {
      if (typeof window === "undefined" || !window.ethereum) return;
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId === MONAD_TESTNET.chainId) {
          setAlreadyAdded(true);
        }
      } catch {}
    }
    checkChain();
  }, []);

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
      setAlreadyAdded(true);
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
      disabled={adding || alreadyAdded}
      className="border border-border px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-50"
    >
      {alreadyAdded
        ? "MONAD TESTNET ADDED"
        : adding
          ? "ADDING..."
          : status === "error"
            ? "NO WALLET"
            : "ADD MONAD TESTNET"}
    </button>
  );
}
