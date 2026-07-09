"use client";

import { useState } from "react";
import type { JournalPendingHolding, Dimension, SignalType } from "@/types/journal";
import { formatPrice } from "@/lib/utils";
import { modColor } from "@/lib/portfolio-format";
import { renderMd } from "@/lib/render-md";

const DIMS: { key: Dimension; label: string }[] = [
  { key: "M", label: "Management" },
  { key: "O", label: "Opportunity" },
  { key: "D", label: "Deal" },
];

const SIGNAL_STYLE: Record<SignalType, { bg: string; color: string; icon: string }> = {
  green:   { bg: "var(--qc-up-soft)",   color: "var(--qc-up)",   icon: "✓" },
  amber:   { bg: "var(--qc-warn-soft)", color: "#92400E",        icon: "⚡" },
  red:     { bg: "#FEF2F2",             color: "#B91C1C",        icon: "✕" },
  neutral: { bg: "var(--qc-bg)",        color: "var(--qc-ink-3)", icon: "•" },
};

function SignalChip({ label, type }: { label: string; type: SignalType }) {
  const s = SIGNAL_STYLE[type] ?? SIGNAL_STYLE.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.color, fontSize: 13, padding: "7px 12px", borderRadius: 999, lineHeight: 1 }}>
      <span style={{ fontWeight: 700 }}>{s.icon}</span>
      {label}
    </span>
  );
}

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
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 16, padding: "22px 24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
      {/* Header — name + price */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--qc-font-serif)", fontSize: 30, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--qc-ink)", fontStyle: "italic", lineHeight: 1 }}>{holding.symbol}</div>
          <div style={{ fontSize: 14, color: "var(--qc-ink-3)", marginTop: 8 }}>
            {[holding.name ?? holding.symbol, holding.sector].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>{formatPrice(holding.price)}</div>
          <div style={{ fontSize: 13, marginTop: 4, fontFamily: "var(--qc-font-mono)", color: priceUp ? "var(--qc-up)" : "#B91C1C" }}>
            {priceUp ? "+" : ""}{holding.priceChange.toFixed(1)}%
            {avgMod != null && <span style={{ color: "var(--qc-up)" }}> · MOD {avgMod}</span>}
          </div>
        </div>
      </div>

      {/* Signal chips */}
      {holding.signals.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
          {holding.signals.map((sig, i) => (
            <SignalChip key={i} label={sig.label} type={sig.type} />
          ))}
        </div>
      )}

      {/* Dimension tabs */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-3)", marginBottom: 10 }}>Dimension</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
          {DIMS.map((d, i) => {
            const active = d.key === dim;
            return (
              <button
                key={d.key}
                onClick={() => setDim(d.key)}
                style={{
                  padding: "12px 8px", fontSize: 13, cursor: "pointer",
                  background: active ? "var(--qc-bg)" : "transparent",
                  color: active ? "var(--qc-ink)" : "var(--qc-ink-3)",
                  fontWeight: active ? 600 : 400,
                  border: "none",
                  borderRight: i < DIMS.length - 1 ? "1px solid var(--qc-hair)" : "none",
                }}
              >
                {d.key} · {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected dimension detail */}
      <div style={{ marginTop: 16 }}>
        {mod != null && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 500, color: modColor(mod) }}>{mod}</span>
            <span style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>/100</span>
          </div>
        )}
        {context && (
          <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--qc-ink-2)", marginBottom: 12 }}>{renderMd(context)}</div>
        )}
        {subFactors.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {subFactors.map(sf => (
              <span key={sf} style={{ fontSize: 11, background: "var(--qc-bg)", color: "var(--qc-ink-2)", padding: "4px 10px", borderRadius: 999 }}>{sf}</span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => onWrite?.(holding.symbol)}
        style={{ marginTop: 22, width: "100%", background: "var(--qc-ink)", color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
      >
        Write your reason for {holding.symbol} →
      </button>
    </div>
  );
}
