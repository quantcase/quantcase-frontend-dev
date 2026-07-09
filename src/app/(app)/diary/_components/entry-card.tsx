"use client";

import type { JournalEntryItem, JournalPendingHolding } from "@/types/journal";
import { thesisConfig } from "@/lib/portfolio-format";
import { timeAgo } from "@/lib/utils";
import { renderMd } from "@/lib/render-md";

// A single "YOUR ENTRIES" card — colored top rule keyed to thesis health,
// symbol + status label, an italic thesis quote, and MOD score + relative time.
export function EntryCard({ item, onClick }: { item: JournalEntryItem; onClick?: (symbol: string) => void }) {
  const tc = thesisConfig(item.thesisHealth);
  const statusLabel = tc.label.toUpperCase();
  const quote = item.journal?.thesis?.replace(/^["“]|["”]$/g, "").trim();

  return (
    <button
      onClick={() => onClick?.(item.symbol)}
      style={{
        flex: "0 0 320px", width: 320, minHeight: 250,
        textAlign: "left", cursor: onClick ? "pointer" : "default",
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderTop: `3px solid ${tc.rule}`,
        borderRadius: 12,
        padding: "18px 20px 16px",
        display: "flex", flexDirection: "column",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Header — symbol + status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: "var(--qc-ink)" }}>{item.symbol}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: tc.color }}>{statusLabel}</span>
      </div>

      {/* Thesis quote — serif italic, markdown-aware, clamped to 5 lines */}
      <div
        style={{
          flex: 1,
          fontFamily: "var(--qc-font-serif)",
          fontStyle: "italic",
          fontSize: 15,
          lineHeight: 1.5,
          color: "var(--qc-ink-2)",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 5,
          overflow: "hidden",
        }}
      >
        {quote ? <>&ldquo;{renderMd(quote)}&rdquo;</> : <span style={{ color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)", fontStyle: "normal" }}>No thesis written yet</span>}
      </div>

      {/* Footer — MOD score + relative time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, paddingTop: 12, borderTop: "1px solid var(--qc-hair)" }}>
        <span style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", letterSpacing: "0.06em", color: "var(--qc-ink-3)" }}>
          {item.modScore > 0 ? `MOD ${item.modScore}` : "MOD —"}
        </span>
        <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>
          {item.journal?.updatedAt ? timeAgo(item.journal.updatedAt) : ""}
        </span>
      </div>
    </button>
  );
}

// The "no thesis yet" variant — same card silhouette, but muted, with an AI nudge
// and a CTA prompting the user to write their first entry for this holding.
export function PendingEntryCard({ item, onClick }: { item: JournalPendingHolding; onClick?: (symbol: string) => void }) {
  const bestMod = item.mod.M ?? item.mod.O ?? item.mod.D;
  const nudge =
    item.prompts?.[0] ??
    item.aiContext.M ??
    item.aiContext.O ??
    item.aiContext.D ??
    "You haven't recorded why you own this yet.";

  return (
    <button
      onClick={() => onClick?.(item.symbol)}
      style={{
        flex: "0 0 320px", width: 320, minHeight: 250,
        textAlign: "left", cursor: onClick ? "pointer" : "default",
        background: "var(--qc-bg)",
        border: "1px dashed var(--qc-hair)",
        borderTop: "3px solid var(--qc-hair)",
        borderRadius: 12,
        padding: "18px 20px 16px",
        display: "flex", flexDirection: "column",
        transition: "box-shadow 0.15s, transform 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--qc-ink-3)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--qc-hair)"; }}
    >
      {/* Header — symbol + "no entry" status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: "var(--qc-ink)" }}>{item.symbol}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--qc-ink-3)" }}>NO ENTRY</span>
      </div>

      {/* AI nudge / prompt — markdown-aware, clamped to 5 lines */}
      <div
        style={{
          flex: 1,
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--qc-ink-3)",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 5,
          overflow: "hidden",
        }}
      >
        {renderMd(nudge)}
      </div>

      {/* Footer — MOD + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, paddingTop: 12, borderTop: "1px solid var(--qc-hair)" }}>
        <span style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", letterSpacing: "0.06em", color: "var(--qc-ink-3)" }}>
          {typeof bestMod === "number" ? `MOD ${bestMod}` : "MOD —"}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)" }}>
          Write your reason →
        </span>
      </div>
    </button>
  );
}
