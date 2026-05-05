"use client";

import { SentimentPill } from "@/components/overview/primitives";

interface ValuationHeroSectionProps {
  pe: number | null;
  industryPE: number | null;
  verdictLabel: string;
  benchmarkPct: number;
  pegRatio: number | null;
  evToEbitda: number | null;
  pbRatio: number | null;
  dividendYield: number | null;
  narrative: string;
}

export function ValuationHeroSection({
  pe, industryPE, verdictLabel, benchmarkPct,
  pegRatio, evToEbitda, pbRatio, dividendYield, narrative,
}: ValuationHeroSectionProps) {
  const sentiment =
    verdictLabel === "Undervalued" ? "up" : verdictLabel === "Overvalued" ? "down" : "neutral";

  const subMetrics = [
    { k: "PEG", v: pegRatio != null ? `${pegRatio.toFixed(1)}x` : "—", sub: "Growth-adjusted" },
    { k: "EV / EBITDA", v: evToEbitda != null ? `${evToEbitda.toFixed(1)}x` : "—", sub: "Enterprise multiple" },
    { k: "P / B", v: pbRatio != null ? `${pbRatio.toFixed(1)}x` : "—", sub: "Book value" },
    {
      k: "Dividend Yield",
      v: dividendYield != null ? `${(dividendYield * 100).toFixed(2)}%` : "—",
      sub: "Trailing 12M",
    },
  ];

  return (
    <section
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: "18px 22px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: ".16em",
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
          }}
        >
          Valuation · P/E
        </span>
        <SentimentPill label={verdictLabel} sentiment={sentiment} />
      </div>

      {/* PE figure + benchmark bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "end",
          paddingBottom: 18,
          borderBottom: "1px solid var(--qc-hair-2)",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12.5, color: "var(--qc-ink)", marginBottom: 4 }}>
            Current P/E ratio
          </div>
          <div
            style={{
              fontSize: 64, fontWeight: 500, letterSpacing: "-0.035em",
              lineHeight: 1, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums",
              display: "flex", alignItems: "baseline", gap: 6,
            }}
          >
            {pe != null ? pe.toFixed(1) : "—"}
            <span
              style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--qc-ink-2)" }}
            >
              x
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--qc-ink)", marginTop: 8, lineHeight: 1.4, maxWidth: 340 }}>
            {narrative}
          </div>
        </div>

        {/* Benchmark bar */}
        <div style={{ minWidth: 260 }}>
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 8, fontSize: 12, color: "var(--qc-ink)",
            }}
          >
            <span>vs. Industry</span>
            <b
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                color: "var(--qc-ink)",
              }}
            >
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
            {/* Median tick at 50% */}
            <div
              style={{
                position: "absolute", top: -3, bottom: -3, left: "50%",
                width: 2, background: "rgba(14,14,12,0.3)",
              }}
            />
            {/* Current PE marker */}
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

      {/* Sub-metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
        {subMetrics.map(({ k, v, sub }, i, arr) => (
          <div
            key={k}
            style={{
              padding: "0 16px",
              borderRight: i < arr.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
              minWidth: 0,
              paddingLeft: i === 0 ? 0 : undefined,
              paddingRight: i === arr.length - 1 ? 0 : undefined,
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--qc-ink-2)", letterSpacing: ".02em", marginBottom: 4 }}
            >
              {k}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: v === "—" ? 400 : 500,
                letterSpacing: "-0.01em",
                color: v === "—" ? "var(--qc-ink-2)" : "var(--qc-ink)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {v}
            </div>
            <div style={{ fontSize: 11, color: "var(--qc-ink-2)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
