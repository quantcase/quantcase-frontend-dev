"use client";

import type { JournalEntryItem, JournalPendingHolding } from "@/types/journal";
import { thesisConfig } from "@/lib/portfolio-format";
import { timeAgo } from "@/lib/utils";
import { renderMd } from "@/lib/render-md";
import { ArrowRight } from "lucide-react";

// Shared card body typography — quotes are serif-italic, AI synopsis is sans,
// but BOTH share the same size (15px) and leading (1.5) so the two card kinds
// read as one product (audit /diary: "card content styles diverge").
const CARD_BODY = "flex-1 text-[15px] leading-[1.5] line-clamp-5 overflow-hidden";

// A single "YOUR ENTRIES" card — colored top rule keyed to thesis health,
// symbol + status label, an italic thesis quote, and MOD score + relative time.
export function EntryCard({ item, onClick }: { item: JournalEntryItem; onClick?: (symbol: string) => void }) {
  const tc = thesisConfig(item.thesisHealth);
  const statusLabel = tc.label.toUpperCase();
  const quote = item.journal?.thesis?.replace(/^["“]|["”]$/g, "").trim();

  return (
    <button
      onClick={() => onClick?.(item.symbol)}
      className="group flex min-h-[250px] w-80 flex-[0_0_20rem] flex-col rounded-xl border border-hair bg-card p-[18px_20px_16px] text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
      style={{ borderTopWidth: 3, borderTopColor: tc.rule, cursor: onClick ? "pointer" : "default" }}
    >
      {/* Header — symbol + status */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold tracking-[0.02em] text-ink">{item.symbol}</span>
        <span className="text-[11px] font-bold tracking-[0.06em]" style={{ color: tc.color }}>{statusLabel}</span>
      </div>

      {/* Thesis quote — serif italic, markdown-aware, clamped to 5 lines */}
      <div className={`${CARD_BODY} serif italic text-ink-2`}>
        {quote ? <>&ldquo;{renderMd(quote)}&rdquo;</> : <span className="font-sans not-italic text-ink-3">No thesis written yet</span>}
      </div>

      {/* Footer — MOD score + relative time */}
      <div className="mt-[18px] flex items-center justify-between border-t border-hair pt-3">
        <span className="font-mono text-[11px] tracking-[0.06em] text-ink-3">
          {item.modScore > 0 ? `MOD ${item.modScore}` : "MOD —"}
        </span>
        <span className="text-[11px] text-ink-3">
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
      className="group flex min-h-[250px] w-80 flex-[0_0_20rem] flex-col rounded-xl border border-dashed border-hair bg-[var(--qc-bg)] p-[18px_20px_16px] text-left transition-all hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
      style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: "var(--qc-hair)", cursor: onClick ? "pointer" : "default" }}
    >
      {/* Header — symbol + "no entry" status */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold tracking-[0.02em] text-ink">{item.symbol}</span>
        <span className="text-[11px] font-bold tracking-[0.06em] text-ink-3">NO ENTRY</span>
      </div>

      {/* AI nudge / prompt — sans, markdown-aware, clamped to 5 lines (same size/leading as quote) */}
      <div className={`${CARD_BODY} text-ink-3`}>
        {renderMd(nudge)}
      </div>

      {/* Footer — MOD + CTA (same slot layout as EntryCard: meta left, action right) */}
      <div className="mt-[18px] flex items-center justify-between border-t border-hair pt-3">
        <span className="font-mono text-[11px] tracking-[0.06em] text-ink-3">
          {typeof bestMod === "number" ? `MOD ${bestMod}` : "MOD —"}
        </span>
        {/* Card is the click target, so this mirrors CtaLink's look as a non-interactive span */}
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink transition-transform group-hover:[&>svg]:translate-x-0.5">
          Write your reason
          <ArrowRight className="size-3.5 transition-transform" />
        </span>
      </div>
    </button>
  );
}
