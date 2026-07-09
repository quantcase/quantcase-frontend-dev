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
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--qc-hair)" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-2)" }}>
          Since your last entry · {items.length} thing{items.length === 1 ? "" : "s"} changed
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: "28px 20px", textAlign: "center", fontSize: 13, color: "var(--qc-ink-3)" }}>
          Nothing has changed since your last visit.
        </div>
      ) : (
        items.map((it, i) => {
          const tc = thesisConfig(it.health);
          return (
            <div
              key={`${it.symbol}-${i}`}
              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
              style={{ padding: "16px 20px", borderBottom: i < items.length - 1 ? "1px solid var(--qc-hair)" : "none", gap: 12 }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tc.rule, marginTop: 6, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", color: "var(--qc-ink)" }}>{it.symbol}</div>
                  <div style={{ fontSize: 13, color: "var(--qc-ink-2)", marginTop: 2, lineHeight: 1.45 }}>{it.description}</div>
                </div>
              </div>
              <button
                onClick={() => onReRead?.(it.symbol)}
                style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "var(--qc-ink-2)", cursor: "pointer", whiteSpace: "nowrap", alignSelf: "flex-start" }}
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
