"use client";

import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function valueColor(val: string): string {
  const t = (val ?? "").trim();
  if (t.startsWith("+")) return "var(--qc-up)";
  if (t.startsWith("-")) return "var(--qc-down)";
  const n = parseFloat(t);
  if (!isNaN(n) && n > 0) return "var(--qc-up)";
  return "var(--qc-ink)";
}

// ─── Build metric tiles from lens data ───────────────────────────────────────

interface TileDef {
  label: string;
  value: string;
  note: string;
}

// Fixed 4-tile layout using the standardised metric names from the backend
const TILE_METRICS = [
  { metric: "EPS_CAGR_COMPANY",           label: "Company EPS CAGR" },
  { metric: "EPS_CAGR_INDUSTRY",          label: "Industry EPS CAGR" },
  { metric: "EPS_RELATIVE_OUTPERFORMANCE", label: "Relative Outperf." },
  { metric: "EPS_GROWTH_ESTIMATE",        label: "EPS Growth (Est.)" },
];

function buildTiles(lens: LensDetail): TileDef[] {
  const sig = lens.top_signals ?? [];

  return TILE_METRICS.map(({ metric, label }) => {
    const s = sig.find((s) => s.metric === metric);
    if (s?.actual_value != null) {
      return {
        label,
        value: `${s.actual_value}%`,
        note: s.statement?.slice(0, 50) ?? "",
      };
    }
    return { label, value: "—", note: "" };
  });
}

// ─── MetricTile ───────────────────────────────────────────────────────────────

function MetricTile({ label, value, note }: TileDef) {
  const color = valueColor(value);
  return (
    <div style={{
      padding: "10px 12px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderTop: `2px solid ${color}`,
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}>
      <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>
        {label}
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
        {value}
      </span>
      {note && (
        <span style={{ fontSize: 9, color: "var(--qc-ink-3)", lineHeight: 1.4 }}>{note}</span>
      )}
    </div>
  );
}

// ─── BarChart from top_signals ────────────────────────────────────────────────

interface BarDatum {
  label: string;
  primary: number | null;
  secondary: number | null;
}

function MetricBarChart({ data, unit = "%" }: { data: BarDatum[]; unit?: string }) {
  const W = 520;
  const H = 150;
  const PAD = { top: 14, right: 16, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.primary ?? 0, d.secondary ?? 0]).filter((v) => v !== 0);
  const maxVal = Math.max(...allVals, 5) * 1.2;

  const groupW = chartW / data.length;
  const barW = groupW * 0.30;
  const gap = groupW * 0.06;

  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxVal / tickCount) * i));
  const toY = (v: number) => chartH - (v / maxVal) * chartH;

  const linePoints = data.map((d, i) => {
    const cx = groupW * i + groupW / 2 - gap / 2;
    const v = d.primary ?? 0;
    return [PAD.left + cx, PAD.top + toY(v)] as [number, number];
  });
  const linePath = linePoints.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      {ticks.map((t) => {
        const y = PAD.top + toY(t);
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="var(--qc-hair)" strokeWidth={1} strokeDasharray={t === 0 ? "none" : "3 3"} />
            <text x={PAD.left - 5} y={y + 3} textAnchor="end"
              fontSize={7} fill="var(--qc-ink-3)" fontFamily="inherit">
              {t}{unit}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const groupX = PAD.left + groupW * i;
        const cx = groupX + groupW / 2;
        const primaryX = cx - barW - gap / 2;
        const secondaryX = cx + gap / 2;
        const primaryH = ((d.primary ?? 0) / maxVal) * chartH;

        return (
          <g key={d.label}>
            {d.primary !== null && (
              <motion.rect
                x={primaryX} y={PAD.top + toY(d.primary)} width={barW} height={primaryH}
                fill="var(--qc-ink)" rx={2}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                style={{ transformOrigin: `0px ${PAD.top + chartH}px` }}
              />
            )}
            {d.secondary !== null && (
              <motion.rect
                x={secondaryX} y={PAD.top + toY(d.secondary)} width={barW} height={((d.secondary ?? 0) / maxVal) * chartH}
                fill="var(--qc-ink-3)" rx={2} opacity={0.4}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.07 + 0.04, ease: "easeOut" }}
                style={{ transformOrigin: `0px ${PAD.top + chartH}px` }}
              />
            )}
            {d.primary !== null && (
              <text x={primaryX + barW / 2} y={PAD.top + toY(d.primary) - 3}
                textAnchor="middle" fontSize={7} fontWeight={600}
                fill="var(--qc-ink)" fontFamily="inherit">
                {d.primary}{unit}
              </text>
            )}
            <text x={cx} y={H - 5} textAnchor="middle"
              fontSize={8} fill="var(--qc-ink-3)" fontFamily="inherit">
              {d.label}
            </text>
          </g>
        );
      })}

      <motion.path
        d={linePath} fill="none"
        stroke="var(--qc-ink-3)" strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
      />
      {linePoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5}
          fill="var(--qc-card)" stroke="var(--qc-ink-3)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

// ─── InsightCard ─────────────────────────────────────────────────────────────

function InsightCard({
  label, badge, badgeColor, accent, icon,
}: {
  label: string; badge?: string; badgeColor?: string; accent?: string; icon?: "up" | "down" | "dot";
}) {
  const ac = accent ?? "var(--qc-ink-3)";
  const bc = badgeColor ?? "var(--qc-ink-3)";
  const iconEl =
    icon === "up" ? <span style={{ color: "var(--qc-up)", fontSize: 11, lineHeight: 1 }}>↑</span> :
    icon === "down" ? <span style={{ color: "var(--qc-down)", fontSize: 11, lineHeight: 1 }}>↓</span> :
    icon === "dot" ? <span style={{ color: "var(--qc-blue)", fontSize: 11, lineHeight: 1 }}>◉</span> :
    null;

  return (
    <div style={{
      padding: "9px 12px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${ac}`,
      borderRadius: 8,
      display: "flex",
      gap: 8,
      alignItems: "flex-start",
    }}>
      <div style={{ marginTop: 2, flexShrink: 0 }}>{iconEl}</div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.45 }}>{label}</span>
        {badge && (
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: bc, border: `1px solid color-mix(in srgb, ${bc} 40%, transparent)`,
            borderRadius: 4, padding: "2px 6px",
            flexShrink: 0,
            background: `color-mix(in srgb, ${bc} 10%, transparent)`,
            whiteSpace: "nowrap",
          }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Build chart data from top_signals ───────────────────────────────────────

function buildChartData(lens: LensDetail): { data: BarDatum[]; unit: string } {
  const sig = lens.top_signals ?? [];

  // Primary: PAT_GROWTH_YOY time-series signals, sorted chronologically
  const growthSigs = sig
    .filter((s) => s.metric === "PAT_GROWTH_YOY" && s.actual_value != null)
    .sort((a, b) => (a.actual_date ?? "").localeCompare(b.actual_date ?? ""))
    .slice(0, 5);

  if (growthSigs.length >= 2) {
    return {
      data: growthSigs.map((s) => ({
        label: s.label.slice(0, 10),
        primary: s.actual_value,
        secondary: s.guided_value ?? null,
      })),
      unit: "%",
    };
  }

  // Fallback: any % signals
  const percentSigs = sig.filter((s) => s.actual_value != null && s.unit === "%").slice(0, 4);
  if (percentSigs.length >= 2) {
    return {
      data: percentSigs.map((s) => ({
        label: s.label.split(" ").slice(0, 2).join(" ").slice(0, 12),
        primary: s.actual_value,
        secondary: s.guided_value ?? null,
      })),
      unit: "%",
    };
  }

  // Last resort: any numeric signal
  const anySigs = sig.filter((s) => s.actual_value != null).slice(0, 4);
  if (anySigs.length > 0) {
    return {
      data: anySigs.map((s) => ({
        label: s.label.split(" ").slice(0, 2).join(" ").slice(0, 12),
        primary: s.actual_value,
        secondary: s.guided_value ?? null,
      })),
      unit: anySigs.every((s) => s.unit === "Cr") ? " Cr" : "",
    };
  }

  return { data: [{ label: "Score", primary: lens.score, secondary: null }], unit: "" };
}

// ─── Build summary metrics for footer ────────────────────────────────────────

function buildFooterMetrics(lens: LensDetail) {
  const sig = lens.top_signals ?? [];

  // Broad growth signal
  const growthSig = sig.find((s) => s.actual_value != null && s.unit === "%" && (
    s.metric?.toUpperCase().includes("GROWTH") ||
    s.metric?.toUpperCase().includes("AUM") ||
    s.metric?.toUpperCase().includes("CAGR")
  ));

  // PAT or large profit metric
  const profitSig = sig.find((s) => s.actual_value != null && (
    s.metric === "PAT" || s.metric === "NET_PROFIT" || s.metric?.toUpperCase().includes("PAT")
  ));

  // Quality metric — ROA, ROE, CRAR, capital adequacy
  const qualitySig = sig.find((s) => s.actual_value != null && (
    s.metric === "ROA" || s.metric === "ROE" ||
    s.metric?.toUpperCase().includes("CAPITAL_ADEQUACY") ||
    s.metric?.toUpperCase().includes("CRAR") ||
    s.metric?.toUpperCase().includes("TIER")
  ));

  const m1 = {
    label: growthSig ? growthSig.label.replace(/\(.*?\)/, "").trim().slice(0, 18) : "Growth",
    value: growthSig ? `${growthSig.actual_value}%` : "—",
    sub: growthSig ? "Core segment YoY" : "",
  };

  const m2 = {
    label: profitSig ? profitSig.label.replace(/\(.*?\)/, "").trim().slice(0, 18) : "Profitability",
    value: profitSig
      ? profitSig.unit === "Cr" ? `₹${profitSig.actual_value} Cr` : `${profitSig.actual_value}%`
      : "—",
    sub: profitSig ? "Earnings quality" : "",
  };

  const m3 = {
    label: qualitySig ? qualitySig.label.replace(/\(.*?\)/, "").trim().slice(0, 18) : "Quality Score",
    value: qualitySig
      ? qualitySig.unit ? `${qualitySig.actual_value}${qualitySig.unit}` : `${qualitySig.actual_value}%`
      : `${lens.score}/100`,
    sub: qualitySig ? "Return / capital metric" : "Composite score",
  };

  return [m1, m2, m3];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailEarningQuality({ lens }: Props) {
  const tiles = buildTiles(lens);
  const { data: chartData, unit: chartUnit } = buildChartData(lens);

  const badgeLabels = ["Strong", "Expanding", "Growing", "Watch", "Monitor", "Moderate"];
  const positiveCards = (lens.highlights ?? []).map((h, i) => ({
    label: h, icon: "up" as const, accent: "var(--qc-up)", badge: badgeLabels[i] ?? "Strong", badgeColor: "var(--qc-up)",
  }));
  const riskCards = (lens.risks ?? []).map((r, i) => ({
    label: r, icon: "down" as const, accent: "var(--qc-down)", badge: i === 0 ? "Watch" : "Monitor", badgeColor: "var(--qc-down)",
  }));
  const consistencyCard = {
    label: `Growth Consistency — ${lens.score >= 70 ? "Strong" : lens.score >= 50 ? "Moderate" : "Weak"} · Score ${lens.score}/100`,
    icon: "dot" as const, accent: "var(--qc-blue)",
    badge: lens.score >= 70 ? "Strong" : "Moderate", badgeColor: "var(--qc-blue)",
  };
  const allCards = [...positiveCards, ...riskCards, consistencyCard];

  const footerMetrics = buildFooterMetrics(lens);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Header strip */}
      <div style={{
        padding: "10px 14px",
        background: "var(--qc-section)",
        borderRadius: 10,
        border: "1px solid var(--qc-hair)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
            Earnings Growth Analysis
          </p>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--qc-blue)", border: "1px solid var(--qc-blue)", borderRadius: 4, padding: "2px 6px",
            background: "color-mix(in srgb, var(--qc-blue) 10%, transparent)",
          }}>
            {lens.computed_at ? new Date(lens.computed_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Latest"}
          </span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>
            {lens.description}
          </span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: lens.status === "STRONG" ? "var(--qc-up)" : lens.status === "MODERATE" ? "var(--qc-warn)" : "var(--qc-down)",
          border: `1px solid ${lens.status === "STRONG" ? "var(--qc-up)" : lens.status === "MODERATE" ? "var(--qc-warn)" : "var(--qc-down)"}`,
          borderRadius: 99, padding: "3px 10px",
          background: `color-mix(in srgb, ${lens.status === "STRONG" ? "var(--qc-up)" : lens.status === "MODERATE" ? "var(--qc-warn)" : "var(--qc-down)"} 10%, transparent)`,
          whiteSpace: "nowrap",
        }}>
          ● {lens.status ?? "—"}
        </span>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 8 }}>
        {tiles.map((t) => (
          <MetricTile key={t.label} label={t.label} value={t.value} note={t.note} />
        ))}
      </div>

      {/* Metric bar chart */}
      <div style={{
        padding: "12px 14px",
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
            Key Metrics Comparison
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 8, background: "var(--qc-ink)", borderRadius: 2, display: "inline-block" }} />
              <span style={{ fontSize: 9, color: "var(--qc-ink-3)" }}>Actual</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="8" style={{ display: "inline-block" }}>
                <line x1="0" y1="4" x2="14" y2="4" stroke="var(--qc-ink-3)" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="7" cy="4" r="2" fill="var(--qc-card)" stroke="var(--qc-ink-3)" strokeWidth="1.5" />
              </svg>
              <span style={{ fontSize: 9, color: "var(--qc-ink-3)" }}>Guided (trend)</span>
            </div>
          </div>
        </div>
        <MetricBarChart data={chartData} unit={chartUnit} />
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
        {allCards.map((card, i) => (
          <InsightCard
            key={i}
            label={card.label}
            badge={card.badge}
            badgeColor={card.badgeColor}
            accent={card.accent}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.takeaway?.split(".")[0] ?? "Earning quality assessment complete."}
        body={lens.takeaway ?? ""}
        metrics={footerMetrics}
      />
    </div>
  );
}
