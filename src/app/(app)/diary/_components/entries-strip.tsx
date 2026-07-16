"use client";

import { useMemo } from "react";

import { EntryStripCard } from "./entry-strip-card";
import { sortForStrip } from "../_lib/diary-derive";
import type { DiaryTicker } from "../_lib/diary-derive";

interface EntriesStripProps {
  tickers: DiaryTicker[];
  loading: boolean;
  onPick: (t: DiaryTicker) => void;
}

const VISIBLE = 5;

export function EntriesStrip({ tickers, loading, onPick }: EntriesStripProps) {
  // Written first, then most-recently-touched — the strip leads with your words.
  const cards = useMemo(() => sortForStrip(tickers).slice(0, VISIBLE), [tickers]);

  if (loading) {
    return (
      <section className="mb-8">
        <div className="eyebrow mb-3">Your entries</div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[190px] w-[248px] shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="eyebrow mb-3">Your entries</div>
      {/* Horizontal scroll rather than wrap: the strip is a glance, not a grid. */}
      <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {cards.map((t) => (
          <EntryStripCard key={t.ticker} t={t} onClick={() => onPick(t)} />
        ))}
      </div>
    </section>
  );
}
