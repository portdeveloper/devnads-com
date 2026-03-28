"use client";

import { BackgroundGrid } from "@/components/background-grid";
import { ArrowUpRight } from "lucide-react";

const PROPERTIES = [
  {
    name: "Blitz",
    url: "https://blitz.devnads.com",
    description:
      "Monad testnet event platform. Claim tokens, submit projects, form teams, and vote. All in one place.",
  },
  {
    name: "monskills",
    url: "https://skills.devnads.com",
    description:
      "Level up your Monad development skills with guided challenges and hands-on exercises.",
  },
  {
    name: "MIP Land",
    url: "https://mipland.com",
    description:
      "Monad Improvement Proposals. Community-driven standards and specifications for the ecosystem.",
  },
  {
    name: "puddleswap",
    url: "https://app.puddleswap.org",
    description:
      "Swap tokens on Monad testnet. A simple, fast DEX for the Monad ecosystem.",
  },
];

const SOCIALS = [
  { name: "Discord", url: "https://discord.gg/monaddev" },
  { name: "X / Twitter", url: "https://x.com/monad_dev" },
];

export default function Home() {
  return (
    <>
      <BackgroundGrid />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-[960px] mx-auto w-full border-x border-border px-6 py-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Devnads
            </span>
            <div className="flex gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-[960px] mx-auto w-full border-x border-border">
          {/* Hero */}
          <div className="px-6 py-20 md:py-32 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 leading-[1.2]">
              Tools for Monad Builders
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Community tools and platforms for the Monad ecosystem.
            </p>
          </div>

          {/* Properties grid */}
          <div className="px-6 py-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
              {PROPERTIES.map((prop) => (
                <a
                  key={prop.name}
                  href={prop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background p-6 flex flex-col gap-3 group hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-foreground">
                      {prop.name}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prop.description}
                  </p>
                  <span className="text-xs font-mono text-muted-foreground/60 mt-auto">
                    {prop.url.replace("https://", "")}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom section */}
          <div className="px-6 py-10 border-t border-border">
            <div className="border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Monad Ecosystem
                </h2>
                <p className="text-base font-medium text-foreground">
                  Explore everything building on Monad
                </p>
              </div>
              <a
                href="https://app.monad.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-foreground hover:bg-secondary/30 transition-colors shrink-0"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Explore
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
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-foreground transition-colors"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
