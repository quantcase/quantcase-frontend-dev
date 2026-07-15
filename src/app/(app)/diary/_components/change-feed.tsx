"use client";

import type { ThesisHealth } from "@/types/journal";
import { thesisConfig } from "@/lib/portfolio-format";

export interface ChangeItem {
  symbol: string;
  health: ThesisHealth;
  description: string;
}

// "SINCE YOUR LAST ENTRY · N THINGS CHANGED" — a compact change/alert feed.
// Each row: a health-colored dot, symbol + description, and a "Re-read →" link.
export function ChangeFeed({ items, onReRead }: { items: ChangeItem[]; onReRead?: (symbol: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-card">
      <div className="border-b border-hair px-5 pb-3 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2">
          Since your last entry · {items.length} thing{items.length === 1 ? "" : "s"} changed
        </span>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-7 text-center text-[13px] text-ink-3">
          Nothing has changed since your last visit.
        </div>
      ) : (
        items.map((it, i) => {
          const tc = thesisConfig(it.health);
          const last = i === items.length - 1;
          return (
            <div
              key={`${it.symbol}-${i}`}
              className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${last ? "" : "border-b border-hair"}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: tc.rule }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold tracking-[0.02em] text-ink">{it.symbol}</div>
                  <div className="mt-0.5 text-[13px] leading-[1.45] text-ink-2">{it.description}</div>
                </div>
              </div>
              <button
                onClick={() => onReRead?.(it.symbol)}
                className="shrink-0 cursor-pointer self-start whitespace-nowrap text-[13px] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                Re-read →
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
