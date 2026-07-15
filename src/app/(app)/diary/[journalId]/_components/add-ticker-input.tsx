"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { useStocks } from "@/hooks/useStocks";

interface Props {
  existing: string[]; // tickers already in the journal (uppercase)
  busy?: boolean;
  onAdd: (ticker: string) => void;
}

// Compact ticker search+add for the journal detail header. Autocompletes against
// the stock universe; also allows a free-typed ticker (backend validates).
export function AddTickerInput({ existing, busy, onAdd }: Props) {
  const { stocks } = useStocks();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const existingSet = useMemo(() => new Set(existing.map((t) => t.toUpperCase())), [existing]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stocks
      .filter((s) => s.ticker && !existingSet.has(s.ticker.toUpperCase()))
      .filter(
        (s) =>
          s.ticker?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.industry?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, stocks, existingSet]);

  function add(ticker: string) {
    const t = ticker.trim().toUpperCase();
    if (!t || existingSet.has(t)) { setQuery(""); setOpen(false); return; }
    onAdd(t);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 rounded-md border border-hair bg-card px-2.5 py-1.5 focus-within:border-hair-strong">
        {busy ? <Loader2 className="size-3.5 shrink-0 animate-spin text-ink-3" /> : <Search className="size-3.5 shrink-0 text-ink-3" />}
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) add(results[0]?.ticker ?? query); }}
          placeholder="Add a ticker…"
          className="w-[180px] bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute right-0 z-[100] mt-1 w-[280px] overflow-hidden rounded-md border border-hair bg-card shadow-lg">
          {results.map((s) => (
            <button
              key={s.ticker}
              onClick={() => add(s.ticker)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-secondary"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">{s.name}</span>
                <span className="block truncate text-[11px] text-ink-3">{s.industry}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-ink-2">
                <Plus className="size-3" />{s.ticker}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
