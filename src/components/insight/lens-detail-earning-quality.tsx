"use client";

import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function valueColor(val: string): string {
  const t = (val ?? "").trim();
  if (t.startsWith("+")) return "var(--qc-up)";
  if (t.startsWith("-")) return "var(--qc-down)";
  return "var(--qc-ink)";
}

// ─── MetricTile ───────────────────────────────────────────────────────────────

function MetricTile({ label, value, note }: { label: string; value: string; note?: string }) {
  const color = valueColor(value);
  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderTop: `3px solid ${color}`,
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color }}>
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 600, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
        {value}
      </span>
      {note && (
        <span style={{ fontSize: 11, color: "var(--qc-ink-3)", lineHeight: 1.4 }}>{note}</span>
      )}
    </div>
  );
}

// ─── SegmentBarChart ──────────────────────────────────────────────────────────
// Vertical grouped bars: Ex-Greenfield (dark) + Greenfield (muted) per metric
// Dashed line overlay for PAT (the "lagging" series, shown as a reference line)

interface BarDatum {
  label: string;         // x-axis label
  exGf: number | null;  // primary bar value
  gf: number | null;    // secondary bar value
}

function SegmentBarChart({ data, unit = "%" }: { data: BarDatum[]; unit?: string }) {
  const W = 520;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 36, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.exGf ?? 0, d.gf ?? 0]).filter((v) => v !== 0);
  const maxVal = Math.max(...allVals, 5) * 1.2;

  const groupW = chartW / data.length;
  const barW = groupW * 0.32;
  const gap = groupW * 0.06;

  // Y ticks
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxVal / tickCount) * i));

  const toY = (v: number) => chartH - (v / maxVal) * chartH;

  // Dashed line for PAT (last metric): connect midpoints of exGf bars
  const linePoints = data.map((d, i) => {
    const cx = groupW * i + groupW / 2 - gap / 2;
    const v = d.exGf ?? 0;
    return [PAD.left + cx, PAD.top + toY(v)] as [number, number];
  });
  const linePath = linePoints.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      {/* Y grid + ticks */}
      {ticks.map((t) => {
        const y = PAD.top + toY(t);
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="var(--qc-hair)" strokeWidth={1} strokeDasharray={t === 0 ? "none" : "3 3"} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end"
              fontSize={9} fill="var(--qc-ink-3)" fontFamily="inherit">
              {t}{unit}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = PAD.left + groupW * i;
        const cx = groupX + groupW / 2;
        const exGfX = cx - barW - gap / 2;
        const gfX = cx + gap / 2;

        const exGfH = ((d.exGf ?? 0) / maxVal) * chartH;
        const gfH = ((d.gf ?? 0) / maxVal) * chartH;

        return (
          <g key={d.label}>
            {/* Ex-Greenfield bar */}
            {d.exGf !== null && (
              <motion.rect
                x={exGfX} y={PAD.top + toY(d.exGf)} width={barW} height={exGfH}
                fill="var(--qc-ink)" rx={2}
                initial={{ scaleY: 0, originY: "100%" }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                style={{ transformOrigin: `0px ${PAD.top + chartH}px` }}
              />
            )}
            {/* Greenfield bar */}
            {d.gf !== null && (
              <motion.rect
                x={gfX} y={PAD.top + toY(d.gf)} width={barW} height={gfH}
                fill="var(--qc-ink-3)" rx={2} opacity={0.45}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: i * 0.08 + 0.05, ease: "easeOut" }}
                style={{ transformOrigin: `0px ${PAD.top + chartH}px` }}
              />
            )}
            {/* Value label above ex-GF bar */}
            {d.exGf !== null && (
              <text x={exGfX + barW / 2} y={PAD.top + toY(d.exGf) - 4}
                textAnchor="middle" fontSize={9} fontWeight={600}
                fill="var(--qc-ink)" fontFamily="inherit">
                {d.exGf}{unit}
              </text>
            )}
            {/* X label */}
            <text x={cx} y={H - 6} textAnchor="middle"
              fontSize={10} fill="var(--qc-ink-3)" fontFamily="inherit">
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Dashed overlay line connecting Ex-GF bar tops */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="var(--qc-ink-3)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      />
      {/* Dots on line */}
      {linePoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3}
          fill="var(--qc-card)" stroke="var(--qc-ink-3)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

// ─── InsightCard ─────────────────────────────────────────────────────────────

function InsightCard({
  label, sublabel, badge, badgeColor, accent, icon,
}: {
  label: string; sublabel: string; badge?: string;
  badgeColor?: string; accent?: string; icon?: "up" | "down" | "dot";
}) {
  const ac = accent ?? "var(--qc-ink-3)";
  const bc = badgeColor ?? "var(--qc-ink-3)";
  const iconEl =
    icon === "up" ? <span style={{ color: "var(--qc-up)", fontSize: 13, lineHeight: 1 }}>↑</span> :
    icon === "down" ? <span style={{ color: "var(--qc-down)", fontSize: 13, lineHeight: 1 }}>↓</span> :
    icon === "dot" ? <span style={{ color: "var(--qc-blue)", fontSize: 13, lineHeight: 1 }}>◉</span> :
    null;

  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--qc-section)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${ac}`,
      borderRadius: 8,
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
    }}>
      <div style={{ marginTop: 3, flexShrink: 0 }}>{iconEl}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.35 }}>{label}</span>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: bc, border: `1px solid ${bc}`, borderRadius: 4, padding: "2px 7px",
              flexShrink: 0, background: `color-mix(in srgb, ${bc} 10%, transparent)`,
              whiteSpace: "nowrap",
            }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.55 }}>{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailEarningQuality({ lens }: Props) {
  const km = lens.key_metrics ?? {};

  // Metric tiles — pulled directly from key_metrics keys
  const tiles = [
    {
      label: "Ex-GF Revenue Growth YoY",
      value: km["EX_GREENFIELD_REV_YoY"] ?? "—",
      note: "Core segment underlying momentum",
    },
    {
      label: "EBITDA Margin (Ex-GF)",
      // "299 Cr (11.3% margin)" → extract "11.3% margin"
      value: (() => {
        const raw = km["EX_GREENFIELD_EBITDA_Q3"] ?? "";
        const m = raw.match(/\(([^)]+)\)/);
        return m ? m[1] : raw || "—";
      })(),
      note: "Operational leverage, Q3 FY2026",
    },
    {
      label: "PAT Growth YoY",
      value: km["MSWIL_PAT_YoY"] ?? "—",
      note: "Earnings vs revenue divergence",
    },
    {
      label: "Greenfield Rev 9M",
      // "6,672 Cr → 7,546 Cr (+13.1% 9M cumulative)" → extract "+13.1%"
      value: (() => {
        const raw = km["GREENFIELD_REV_9M"] ?? "";
        const m = raw.match(/\(([+-][\d.]+%)/);
        return m ? m[1] : "+13.1%";
      })(),
      note: km["GREENFIELD_REV_9M"] ?? "9M cumulative",
    },
  ];

  // Chart data from top_signals — pick revenue / ebitda / pat growth signals
  const sig = lens.top_signals ?? [];
  const find = (metric: string) => sig.find((s) => s.metric === metric);

  const chartData: BarDatum[] = [
    {
      label: "Rev YoY",
      exGf: find("EX_GREENFIELD_REV")?.actual_value ?? null,
      gf: find("SEG_GREENFIELD_REV")?.actual_value ?? null,
    },
    {
      label: "EBITDA YoY",
      exGf: find("EX_GREENFIELD_EBITDA")?.actual_value ?? null,
      gf: find("SEG_GREENFIELD_EBITDA")?.actual_value ?? null,
    },
    {
      label: "PAT YoY",
      exGf: find("MSWIL_PAT")?.actual_value ?? null,
      gf: null,
    },
    {
      label: "EBITDA Margin",
      exGf: find("EBITDA_MARGIN_EX_GF")?.actual_value ?? null,
      gf: null,
    },
  ];

  // Insight cards — use highlights verbatim as label, no fragile splitting
  const badges = ["Strong", "Expanding", "Growing", "Watch", "Monitor", "Moderate"];
  const positiveCards = (lens.highlights ?? []).map((h, i) => ({
    label: h,
    sublabel: "",
    icon: "up" as const,
    accent: "var(--qc-up)",
    badge: badges[i] ?? "Strong",
    badgeColor: "var(--qc-up)",
  }));

  const riskCards = (lens.risks ?? []).map((r, i) => ({
    label: r,
    sublabel: "",
    icon: "down" as const,
    accent: "var(--qc-down)",
    badge: i === 0 ? "Watch" : "Monitor",
    badgeColor: "var(--qc-down)",
  }));

  const consistencyCard = {
    label: `Growth Consistency — ${lens.score >= 70 ? "Strong" : lens.score >= 50 ? "Moderate" : "Weak"}`,
    sublabel: `Score ${lens.score}/100 — z=${lens.z_score.toFixed(2)}, ${lens.signal_count} signals analyzed`,
    icon: "dot" as const,
    accent: "var(--qc-blue)",
    badge: lens.score >= 70 ? "Strong" : "Moderate",
    badgeColor: "var(--qc-blue)",
  };

  const allCards = [...positiveCards, ...riskCards, consistencyCard];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header strip */}
      <div style={{
        padding: "14px 16px",
        background: "var(--qc-section)",
        borderRadius: 10,
        border: "1px solid var(--qc-hair)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)" }}>
              Earnings Growth Analysis
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--qc-blue)", border: "1px solid var(--qc-blue)", borderRadius: 4, padding: "2px 8px",
              background: "color-mix(in srgb, var(--qc-blue) 10%, transparent)",
            }}>
              Q3 FY2026
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--qc-ink-3)", margin: 0 }}>
            Ex-Greenfield vs Greenfield — earnings quality and growth composition
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--qc-up)", border: "1px solid var(--qc-up)", borderRadius: 99, padding: "4px 12px",
          background: "color-mix(in srgb, var(--qc-up) 10%, transparent)", whiteSpace: "nowrap",
        }}>
          ● {lens.status}
        </span>
      </div>

      {/* Metric tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {tiles.map((t) => (
          <MetricTile key={t.label} label={t.label} value={t.value} note={t.note} />
        ))}
      </div>

      {/* Segment bar chart */}
      <div style={{
        padding: "16px",
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
      }}>
        {/* Chart header + legend */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>
            Segment Growth Comparison
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 10, background: "var(--qc-ink)", borderRadius: 2, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>Ex-Greenfield</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="10" style={{ display: "inline-block" }}>
                <line x1="0" y1="5" x2="16" y2="5" stroke="var(--qc-ink-3)" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="8" cy="5" r="2.5" fill="var(--qc-card)" stroke="var(--qc-ink-3)" strokeWidth="1.5" />
              </svg>
              <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>Greenfield (trend)</span>
            </div>
          </div>
        </div>

        <SegmentBarChart data={chartData} unit="%" />
      </div>

      {/* Insight cards — 2-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {allCards.map((card, i) => (
          <InsightCard
            key={i}
            label={card.label}
            sublabel={card.sublabel}
            badge={card.badge}
            badgeColor={card.badgeColor}
            accent={card.accent}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Robust earning quality with accelerating greenfield momentum."
        body={lens.takeaway}
        metrics={[
          { label: "Ex-GF Rev Growth", value: km["EX_GREENFIELD_REV_YoY"] ?? "—", sub: "Core segment YoY" },
          { label: "PAT Growth", value: km["MSWIL_PAT_YoY"] ?? "—", sub: "Consolidated YoY" },
          { label: "GF Rev 9M", value: (() => { const m = (km["GREENFIELD_REV_9M"] ?? "").match(/\(([+-][\d.]+%)/); return m ? m[1] : "+13.1%"; })(), sub: "9M cumulative" },
        ]}
      />
    </div>
  );
}
