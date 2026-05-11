"use client";

import { SentimentPill } from "@/components/overview/primitives";
import type { ChartMetricKey } from "./valuation-chart-sidebar";

// ─── Inline sparkline ─────────────────────────────────────────────────────────

function Sparkline({ values, selected }: { values: number[]; selected: boolean }) {
  if (!values.length) return null;
  const w = 72;
  const h = 16;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const barW = Math.max(4, Math.floor(w / values.length) - 1);
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {values.map((v, i) => {
        const barH = Math.max(2, ((v - min) / range) * (h - 2));
        const isLast = i === values.length - 1;
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={1}
            fill={
              isLast
                ? selected ? "rgba(255,255,255,0.9)" : "var(--qc-ink)"
                : selected ? "rgba(255,255,255,0.25)" : "var(--qc-hair)"
            }
          />
        );
      })}
    </svg>
  );
}

// ─── Sub-metric card ──────────────────────────────────────────────────────────

interface SubMetricCardProps {
  label: string;
  value: string;
  sub: string;
  metricKey: ChartMetricKey | null;
  sparkValues: number[];
  selected: boolean;
  onSelect: (key: ChartMetricKey | null) => void;
  isLast: boolean;
}

function SubMetricCard({ label, value, sub, metricKey, sparkValues, selected, onSelect, isLast }: SubMetricCardProps) {
  const isClickable = metricKey != null && value !== "—";
  return (
    <div
      onClick={isClickable ? () => onSelect(selected ? null : metricKey) : undefined}
      style={{
        padding: "14px 22px 14px",
        borderRight: isLast ? "none" : "1px solid var(--qc-hair-2)",
        minWidth: 0,
        cursor: isClickable ? "pointer" : "default",
        background: selected ? "var(--qc-ink)" : "transparent",
        transition: "background 0.12s",
      }}
    >
      <div style={{ fontSize: 11, color: selected ? "rgba(255,255,255,0.55)" : "var(--qc-ink-2)", letterSpacing: ".02em", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: value === "—" ? 400 : 500,
          letterSpacing: "-0.01em",
          color: value === "—" ? (selected ? "rgba(255,255,255,0.4)" : "var(--qc-ink-2)") : (selected ? "#fff" : "var(--qc-ink)"),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: selected ? "rgba(255,255,255,0.45)" : "var(--qc-ink-2)", marginTop: 2, marginBottom: sparkValues.length ? 6 : 0 }}>
        {sub}
      </div>
      {sparkValues.length > 0 && <Sparkline values={sparkValues} selected={selected} />}
    </div>
  );
}

// ─── ValuationHeroSection ─────────────────────────────────────────────────────

interface QuarterlyTrendPoint {
  period: string;
  revenue: number | null;
  ebitda: number | null;
  netIncome: number | null;
  eps: number | null;
  cfo: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
}

type SparkKey = keyof Omit<QuarterlyTrendPoint, "period">;

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
  trend: QuarterlyTrendPoint[];
  selectedMetric: ChartMetricKey | null;
  onSelectMetric: (key: ChartMetricKey | null) => void;
}

export function ValuationHeroSection({
  pe, industryPE, verdictLabel, benchmarkPct,
  pegRatio, evToEbitda, pbRatio, dividendYield, narrative,
  trend, selectedMetric, onSelectMetric,
}: ValuationHeroSectionProps) {
  const sentiment =
    verdictLabel === "Undervalued" ? "up" : verdictLabel === "Overvalued" ? "down" : "neutral";

  function sparkFor(key: SparkKey): number[] {
    return trend.map((d) => d[key]).filter((v): v is number => v != null);
  }

  const subMetrics: {
    k: string;
    v: string;
    sub: string;
    metricKey: ChartMetricKey | null;
    sparkKey: SparkKey | null;
  }[] = [
    { k: "PEG", v: pegRatio != null ? `${pegRatio.toFixed(1)}x` : "—", sub: "Growth-adjusted", metricKey: "eps", sparkKey: "eps" },
    { k: "EV / EBITDA", v: evToEbitda != null ? `${evToEbitda.toFixed(1)}x` : "—", sub: "Enterprise multiple", metricKey: "ebitda", sparkKey: "ebitda" },
    { k: "P / B", v: pbRatio != null ? `${pbRatio.toFixed(1)}x` : "—", sub: "Book value", metricKey: "totalEquity", sparkKey: "totalEquity" },
    {
      k: "Dividend Yield",
      v: dividendYield != null && dividendYield > 0 ? `${dividendYield.toFixed(2)}%` : "—",
      sub: "Trailing 12M",
      metricKey: null,
      sparkKey: null,
    },
  ];

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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }} />

      {/* PE figure + benchmark bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "end",
          paddingBottom: 18,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <p style={{ fontSize: 12.5, color: "var(--qc-ink)" }}>Current P/E ratio</p>
            <SentimentPill label={verdictLabel} sentiment={sentiment} />
          </div>
          <div
            style={{
              fontSize: 64, fontWeight: 500, letterSpacing: "-0.035em",
              lineHeight: 1, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums",
              display: "flex", alignItems: "baseline", gap: 6,
            }}
          >
            {pe != null ? pe.toFixed(1) : "—"}
            <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--qc-ink-2)" }}>x</span>
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

      {/* Sub-metrics row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 0,
          marginLeft: -22,
          marginRight: -22,
          borderTop: "1px solid var(--qc-hair-2)",
        }}
      >
        {subMetrics.map(({ k, v, sub, metricKey, sparkKey }, i, arr) => (
          <SubMetricCard
            key={k}
            label={k}
            value={v}
            sub={sub}
            metricKey={metricKey}
            sparkValues={sparkKey ? sparkFor(sparkKey) : []}
            selected={metricKey != null && selectedMetric === metricKey}
            onSelect={onSelectMetric}
            isLast={i === arr.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
