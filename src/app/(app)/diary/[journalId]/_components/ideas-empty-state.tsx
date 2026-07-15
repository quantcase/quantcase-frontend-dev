"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NIFTY50_TICKERS } from "@/lib/journal-ideas";

// Empty Tracking / custom journal → a rotating window of Nifty50 tickers as
// starting ideas. "See more" advances the window.
export function IdeasEmptyState({ existing, onPick }: { existing: string[]; onPick: (ticker: string) => void }) {
  const [offset, setOffset] = useState(0);
  const existingSet = new Set(existing.map((t) => t.toUpperCase()));
  const pool = NIFTY50_TICKERS.filter((t) => !existingSet.has(t.toUpperCase()));
  const window = Array.from({ length: 6 }, (_, i) => pool[(offset + i) % pool.length]).filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hair px-6 py-12 text-center">
      <div className="mb-3 text-[32px]">🔭</div>
      <div className="mb-1.5 text-[18px] font-medium text-ink">No tickers yet</div>
      <div className="mb-5 max-w-[420px] text-[13px] leading-[1.6] text-ink-2">
        Add a ticker above, or start with one of these Nifty50 ideas.
      </div>
      <div className="mb-4 flex max-w-[480px] flex-wrap justify-center gap-2">
        {window.map((sym) => (
          <button
            key={sym}
            onClick={() => onPick(sym)}
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium"
            style={{ color: "var(--qc-brand-accent)", background: "var(--qc-brand-accent-soft)", borderColor: "var(--qc-brand-accent-edge)" }}
          >
            <Plus className="size-3" /> {sym}
          </button>
        ))}
      </div>
      {pool.length > 6 && (
        <button
          onClick={() => setOffset((o) => (o + 6) % pool.length)}
          className="rounded-md border border-hair px-4 py-1.5 text-[12px] text-ink-2 hover:bg-secondary"
        >
          See more ideas →
        </button>
      )}
    </div>
  );
}
