"use client";

import { useState } from "react";
import type { JournalPendingHolding, Dimension, SignalType } from "@/types/journal";
import { formatPrice, cn } from "@/lib/utils";
import { modColor } from "@/lib/portfolio-format";
import { renderMd } from "@/lib/render-md";
import { StatusBadge, ScoreValue, type StatusSentiment } from "@/components/ds";
import { Button } from "@/components/ui/button";

const DIMS: { key: Dimension; label: string }[] = [
  { key: "M", label: "Management" },
  { key: "O", label: "Opportunity" },
  { key: "D", label: "Deal" },
];

// Map the diary signal types onto the canonical StatusBadge sentiment, so the
// ✓/⚡/✕ chip cloud shares ONE styling source with the rest of the app
// (audit /diary: "ragged chip cloud", off-palette hardcoded colors).
const SIGNAL_SENTIMENT: Record<SignalType, StatusSentiment> = {
  green: "positive",
  amber: "caution",
  red: "negative",
  neutral: "neutral",
};

// The "KEEP WRITING" hero card: a single pending holding shown with price, MOD,
// signal chips and M · O · D dimension tabs. Clicking a tab or the CTA opens
// the journal wizard for this symbol / dimension.
export function DimensionCard({
  holding,
  onWrite,
}: {
  holding: JournalPendingHolding;
  onWrite?: (symbol: string) => void;
}) {
  const [dim, setDim] = useState<Dimension>("M");
  const mod = holding.mod[dim];
  const overallMod =
    [holding.mod.M, holding.mod.O, holding.mod.D].filter((v): v is number => v != null);
  const avgMod = overallMod.length ? Math.round(overallMod.reduce((a, b) => a + b, 0) / overallMod.length) : null;

  const context = holding.aiContext[dim];
  const subFactors = holding.subFactors[dim] ?? [];
  const priceUp = holding.priceChangeDir === "pos";

  return (
    <div className="rounded-2xl border border-hair bg-card p-[22px_24px] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      {/* Header — name + price */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="serif text-[30px] font-medium italic leading-none text-ink">{holding.symbol}</div>
          <div className="mt-2 text-[14px] text-ink-3">
            {[holding.name ?? holding.symbol, holding.sector].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-[24px] font-semibold text-ink">{formatPrice(holding.price)}</div>
          <div className={cn("mt-1 font-mono text-[13px]", priceUp ? "text-up" : "text-down")}>
            {priceUp ? "+" : ""}{holding.priceChange.toFixed(1)}%
            {avgMod != null && <span className="text-up"> · MOD {avgMod}</span>}
          </div>
        </div>
      </div>

      {/* Signal chips — canonical StatusBadge, even flex-wrap */}
      {holding.signals.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {holding.signals.map((sig, i) => (
            <StatusBadge key={i} label={sig.label} sentiment={SIGNAL_SENTIMENT[sig.type] ?? "neutral"} />
          ))}
        </div>
      )}

      {/* Dimension segmented control */}
      <div className="mt-6">
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Dimension</div>
        <div className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-hair">
          {DIMS.map((d, i) => {
            const active = d.key === dim;
            return (
              <button
                key={d.key}
                onClick={() => setDim(d.key)}
                className={cn(
                  "cursor-pointer px-2 py-3 text-[13px] transition-colors",
                  i < DIMS.length - 1 && "border-r border-hair",
                  active ? "bg-[var(--qc-bg)] font-semibold text-ink" : "font-normal text-ink-3 hover:text-ink"
                )}
              >
                {d.key} · {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected dimension detail */}
      <div className="mt-4">
        {mod != null && (
          <div className="mb-2">
            <ScoreValue value={mod} max={100} size="sm" style={{ color: modColor(mod) }} />
          </div>
        )}
        {context && (
          <div className="mb-3 text-[13px] leading-[1.55] text-ink-2">{renderMd(context)}</div>
        )}
        {subFactors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {subFactors.map(sf => (
              <span key={sf} className="rounded-full bg-[var(--qc-bg)] px-2.5 py-1 text-[11px] text-ink-2">{sf}</span>
            ))}
          </div>
        )}
      </div>

      {/* CTA — primary tier */}
      <Button
        onClick={() => onWrite?.(holding.symbol)}
        className="mt-[22px] w-full rounded-[10px] py-3 text-sm font-medium"
      >
        Write your reason for {holding.symbol} →
      </Button>
    </div>
  );
}
