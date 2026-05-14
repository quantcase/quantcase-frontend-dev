"use client";

import React from "react";
import { SentimentPill } from "@/components/overview/primitives";

// ─── ValuationHeroSection ─────────────────────────────────────────────────────

interface ValuationHeroSectionProps {
  pe: number | null;
  industryPE: number | null;
  verdictLabel: string;
  benchmarkPct: number;
  narrative: string;
  footer?: React.ReactNode;
}

export function ValuationHeroSection({
  pe, industryPE, verdictLabel, benchmarkPct, narrative, footer,
}: ValuationHeroSectionProps) {
  const sentiment =
    verdictLabel === "Undervalued" ? "up" : verdictLabel === "Overvalued" ? "down" : "neutral";

  return (
    <section
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: "18px 22px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* PE figure + benchmark bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "center",
          paddingBottom: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
            <p style={{ fontSize: 12, color: "var(--qc-ink)" }}>Current P/E ratio</p>
            <SentimentPill label={verdictLabel} sentiment={sentiment} />
          </div>
          <div
            style={{
              fontSize: 48, fontWeight: 500, letterSpacing: "-0.035em",
              lineHeight: 1, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums",
              display: "flex", alignItems: "baseline", gap: 5,
            }}
          >
            {pe != null ? pe.toFixed(1) : "—"}
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--qc-ink-2)" }}>x</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--qc-ink)", marginTop: 6, lineHeight: 1.45 }}>
            {narrative}
          </div>
        </div>

        {/* Benchmark bar */}
        <div style={{ minWidth: 240 }}>
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 8, fontSize: 12, color: "var(--qc-ink)",
            }}
          >
            <span>vs. Industry</span>
            <b style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: "var(--qc-ink)" }}>
              {industryPE != null ? `${industryPE.toFixed(1)}x` : "—"}
            </b>
          </div>
          <div
            style={{
              position: "relative", height: 22,
              background: "linear-gradient(90deg,#E8F3C9 0%, #F3EBC8 55%, #F7D8C8 100%)",
              borderRadius: 6, overflow: "visible",
            }}
          >
            <div style={{ position: "absolute", top: -3, bottom: -3, left: "50%", width: 2, background: "rgba(14,14,12,0.3)" }} />
            <div
              style={{
                position: "absolute", top: -6, bottom: -6,
                left: `calc(${benchmarkPct}% - 6px)`,
                width: 12, borderRadius: 4,
                background: "var(--qc-ink)",
                border: "2px solid #fff",
                boxShadow: "0 1px 4px rgba(0,0,0,.18)",
              }}
              title={`P/E ${pe?.toFixed(1)}x`}
            />
          </div>
          <div
            style={{
              display: "flex", justifyContent: "space-between", marginTop: 6,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: "var(--qc-ink-2)", letterSpacing: ".06em", textTransform: "uppercase",
            }}
          >
            <span>Cheap</span>
            <span>Median</span>
            <span>Rich</span>
          </div>
        </div>
      </div>

      {footer && (
        <div style={{ marginLeft: -22, marginRight: -22, borderTop: "1px solid var(--qc-hair-2)" }}>
          {footer}
        </div>
      )}
    </section>
  );
}
