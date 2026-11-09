"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative bg-secondary/20 border border-border p-4 overflow-x-auto">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        title="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="font-mono text-xs text-muted-foreground leading-relaxed pr-8">{code}</pre>
    </div>
  );
}
