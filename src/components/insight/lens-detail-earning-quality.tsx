"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { BACKEND_URL } from "@/lib/constants";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

// ─── API types ────────────────────────────────────────────────────────────────

interface EarningsQualityTile {
  metric: string;
  label: string;
  unit: string;
  actual_value: number;
  statement: string;
  confidence?: string;
  direction?: string;
}

interface EarningsQualityChartBar {
  fiscal_year: string;
  label: string;
  actual_date: string;
  company_growth_pct: number;
  industry_growth_pct: number;
}

interface EarningsQualityInsightCard {
  metric: string;
  label: string;
  statement: string;
  direction: string;
  impact: string;
  actual_value: number | null;
  unit: string | null;
}

interface EarningsQualityData {
  ticker: string;
  call_id: string;
  available: boolean;
  is_stale: boolean;
  computed_at: string | null;
  score: number;
  status: string;
  z_score: number;
  takeaway: string;
  chart_window_years: number;
  tiles: EarningsQualityTile[];
  chart_bars: EarningsQualityChartBar[];
  beat_rate: { count: number; total: number; label: string };
  consistency: { score: number; status: string; statement: string };
  insight_cards: EarningsQualityInsightCard[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useEarningsQuality(ticker: string | undefined) {
  const [data, setData] = useState<EarningsQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker?.trim()) return;
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/deal/earnings-quality?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res: { success: boolean; data: EarningsQualityData }) => {
        setData(res.data ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ticker]);

  return { data, loading, error };
}

// ─── MetricTile ───────────────────────────────────────────────────────────────

function tileColor(tile: EarningsQualityTile): string {
  if (tile.direction === "miss") return "var(--qc-down)";
  const v = tile.actual_value;
  if (v == null) return "var(--qc-ink)";
  if (v > 0) return "var(--qc-up)";
  if (v < 0) return "var(--qc-down)";
  return "var(--qc-ink)";
}

function formatTileValue(tile: EarningsQualityTile): string {
  if (tile.actual_value == null) return "—";
  const sign = tile.actual_value > 0 ? "+" : "";
  return `${sign}${tile.actual_value}${tile.unit}`;
}

function MetricTile({ tile }: { tile: EarningsQualityTile }) {
  const color = tileColor(tile);
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
        {tile.label}
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
        {formatTileValue(tile)}
      </span>
      {tile.statement && (
        <span style={{ fontSize: 9, color: "var(--qc-ink-3)", lineHeight: 1.4 }}>
          {tile.statement.slice(0, 52)}
        </span>
      )}
    </div>
  );
}

// ─── EPS Growth Bar + Line Chart ──────────────────────────────────────────────

function smoothSegmentPath(pts: [number, number][]): string {
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpx = (x0 + x1) / 2;
    d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
  }
  return d;
}

function EpsGrowthChart({
  bars,
  ticker,
  windowYears,
}: {
  bars: EarningsQualityChartBar[];
  ticker: string;
  windowYears: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    companyVal: number; industryVal: number | null; label: string;
  } | null>(null);

  const W = 560;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 44, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = bars.flatMap((b) => [b.company_growth_pct, b.industry_growth_pct]);
  const dataMin = Math.min(...allVals);
  const dataMax = Math.max(...allVals);

  // Tight padding: 20% of range, minimum 8 units
  const pad = Math.max((dataMax - dataMin) * 0.20, 8);
  const rawMin = Math.min(dataMin - pad, -pad);
  const rawMax = dataMax + pad;

  function niceStep(dataRange: number, targetTicks: number): number {
    const raw = dataRange / targetTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.001))));
    for (const mult of [1, 2, 5, 10]) {
      if (mag * mult >= raw) return mag * mult;
    }
    return mag * 10;
  }
  const step = niceStep(rawMax - rawMin, 5);
  const yMin = Math.floor(rawMin / step) * step;
  const yMax = Math.ceil(rawMax / step) * step;
  const range = yMax - yMin;

  const toY = (v: number) => PAD.top + chartH - ((v - yMin) / range) * chartH;
  const zeroY = toY(0);

  const groupW = chartW / bars.length;
  const barW = Math.min(groupW * 0.38, 48);

  const ticks: number[] = [];
  for (let t = yMin; t <= yMax + 0.001; t += step) ticks.push(Math.round(t));

  // Only connect points where industry_growth_pct is non-null; lift pen on gaps
  const lineSegments: [number, number][][] = [];
  let current: [number, number][] = [];
  bars.forEach((b, i) => {
    if (b.industry_growth_pct != null) {
      current.push([PAD.left + groupW * i + groupW / 2, toY(b.industry_growth_pct)]);
    } else {
      if (current.length >= 1) { lineSegments.push(current); current = []; }
    }
  });
  if (current.length >= 1) lineSegments.push(current);
  // All non-null points for dots
  const lineDots: [number, number][] = bars
    .map((b, i) => b.industry_growth_pct != null ? [PAD.left + groupW * i + groupW / 2, toY(b.industry_growth_pct)] as [number, number] : null)
    .filter((p): p is [number, number] => p !== null);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    // Find nearest bar
    let nearest = 0;
    let minDist = Infinity;
    bars.forEach((_, i) => {
      const cx = PAD.left + groupW * i + groupW / 2;
      const dist = Math.abs(mx - cx);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    if (minDist < groupW * 0.6) {
      const b = bars[nearest];
      const cx = PAD.left + groupW * nearest + groupW / 2;
      setTooltip({ x: cx, y: toY(b.company_growth_pct), companyVal: b.company_growth_pct, industryVal: b.industry_growth_pct, label: b.label });
    } else {
      setTooltip(null);
    }
  }, [bars, groupW, toY]);

  // Tooltip dimensions
  const TW = 110; const TH = 54;

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 10, background: "var(--qc-ink)", borderRadius: 3, display: "inline-block" }} />
          <span style={{ fontSize: 9, color: "var(--qc-ink-3)" }}>{ticker} EPS Growth (%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="20" height="10" style={{ display: "inline-block", overflow: "visible" }}>
            <line x1="0" y1="5" x2="20" y2="5" stroke="#b45309" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="10" cy="5" r="2.5" fill="white" stroke="#b45309" strokeWidth="1.5" />
          </svg>
          <span style={{ fontSize: 9, color: "var(--qc-ink-3)" }}>Industry Growth (%)</span>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block", overflow: "visible" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Grid lines + Y-axis labels */}
          {ticks.map((t) => {
            const y = toY(t);
            const isZero = t === 0;
            return (
              <g key={t}>
                <line
                  x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                  stroke={isZero ? "var(--qc-ink)" : "var(--qc-hair)"}
                  strokeWidth={isZero ? 1.5 : 1}
                  strokeDasharray={isZero ? "none" : "4 3"}
                  strokeOpacity={isZero ? 0.5 : 1}
                />
                <text x={PAD.left - 7} y={y + 3.5} textAnchor="end"
                  fontSize={6} fill={isZero ? "var(--qc-ink)" : "var(--qc-ink-3)"}
                  fontWeight={isZero ? 600 : 400} fontFamily="inherit">
                  {t}%
                </text>
              </g>
            );
          })}

          {/* Company bars */}
          {bars.map((b, i) => {
            const cx = PAD.left + groupW * i + groupW / 2;
            const barX = cx - barW / 2;
            const isNeg = b.company_growth_pct < 0;
            const barTop = isNeg ? zeroY : toY(b.company_growth_pct);
            const barH = Math.abs(toY(b.company_growth_pct) - zeroY);
            const color = isNeg ? "var(--qc-down)" : "var(--qc-ink)";
            // Label: above positive, below negative, always min 12px from zero line
            const labelY = isNeg
              ? Math.max(barTop + barH + 11, zeroY + 13)
              : Math.min(barTop - 5, zeroY - 11);

            return (
              <g key={b.label}>
                <motion.rect
                  x={barX} y={barTop} width={barW} height={Math.max(barH, 2)}
                  fill={color} rx={3}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  style={{ transformOrigin: `0px ${zeroY}px` }}
                />
                <text
                  x={barX + barW / 2} y={labelY}
                  textAnchor="middle" fontSize={7} fontWeight={700}
                  fill={color} fontFamily="inherit">
                  {b.company_growth_pct > 0 ? "+" : ""}{b.company_growth_pct}%
                </text>
                {/* X-axis label */}
                <text x={cx} y={H - 8} textAnchor="middle"
                  fontSize={7} fill="var(--qc-ink-3)" fontFamily="inherit" fontWeight={500}>
                  {b.label}
                </text>
              </g>
            );
          })}

          {/* Industry line — amber/orange, solid, curved; gaps where data is null */}
          {lineSegments.map((seg, si) => (
            <motion.path
              key={si}
              d={smoothSegmentPath(seg)} fill="none"
              stroke="#b45309" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
            />
          ))}
          {lineDots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3}
              fill="white" stroke="#b45309" strokeWidth={1.5} />
          ))}

          {/* Hover crosshair + tooltip */}
          {tooltip && (() => {
            const tx = Math.min(Math.max(tooltip.x - TW / 2, PAD.left), W - PAD.right - TW);
            const ty = PAD.top;
            return (
              <g>
                {/* Vertical rule */}
                <line
                  x1={tooltip.x} x2={tooltip.x}
                  y1={PAD.top} y2={PAD.top + chartH}
                  stroke="var(--qc-ink-3)" strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.5}
                />
                {/* Tooltip box */}
                <rect x={tx} y={ty} width={TW} height={TH} rx={5}
                  fill="var(--qc-ink)" opacity={0.93} />
                <text x={tx + 8} y={ty + 14} fontSize={8} fontWeight={700}
                  fill="rgba(255,255,255,0.6)" fontFamily="inherit" textAnchor="start">
                  {tooltip.label}
                </text>
                {/* Company row */}
                <rect x={tx + 8} y={ty + 20} width={7} height={7} rx={1.5} fill="rgba(255,255,255,0.9)" />
                <text x={tx + 19} y={ty + 27} fontSize={9} fill="rgba(255,255,255,0.85)" fontFamily="inherit">
                  {ticker}
                </text>
                <text x={tx + TW - 8} y={ty + 27} fontSize={9} fontWeight={700}
                  fill={tooltip.companyVal < 0 ? "#f87171" : "#86efac"} fontFamily="inherit" textAnchor="end">
                  {tooltip.companyVal > 0 ? "+" : ""}{tooltip.companyVal}%
                </text>
                {/* Industry row */}
                <rect x={tx + 8} y={ty + 36} width={7} height={2} rx={1} fill="#b45309" />
                <text x={tx + 19} y={ty + 43} fontSize={9} fill="rgba(255,255,255,0.85)" fontFamily="inherit">
                  Industry
                </text>
                <text x={tx + TW - 8} y={ty + 43} fontSize={9} fontWeight={700}
                  fill="#fbbf24" fontFamily="inherit" textAnchor="end">
                  {tooltip.industryVal == null ? "N/A" : `${tooltip.industryVal > 0 ? "+" : ""}${tooltip.industryVal}%`}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: "4px 0 0", textAlign: "right" }}>
        Company vs industry trajectory — {windowYears}-year rolling window
      </p>
    </div>
  );
}

// ─── InsightCard ──────────────────────────────────────────────────────────────

function InsightCard({ card }: { card: EarningsQualityInsightCard }) {
  const isPositive = card.direction === "beat";
  const isTracking = card.direction === "tracking";
  const accent = isPositive ? "var(--qc-up)" : isTracking ? "var(--qc-blue)" : "var(--qc-down)";
  const badgeColor = accent;

  const isConsistency = card.metric === "INSIGHT_CONSISTENCY";
  const score = isConsistency && card.actual_value != null ? card.actual_value : null;

  return (
    <div style={{
      padding: "10px 12px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${accent}`,
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.4 }}>
          {card.label}
        </span>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: badgeColor,
          border: `1px solid color-mix(in srgb, ${badgeColor} 40%, transparent)`,
          background: `color-mix(in srgb, ${badgeColor} 10%, transparent)`,
          borderRadius: 4, padding: "2px 6px", flexShrink: 0, whiteSpace: "nowrap",
        }}>
          {card.impact === "high" ? (isPositive ? "Strong" : isTracking ? "Tracking" : "Watch") : "Moderate"}
        </span>
      </div>
      <span style={{ fontSize: 10, color: "var(--qc-ink-3)", lineHeight: 1.5 }}>
        {card.statement}
      </span>
      {score != null && (
        <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i < score ? "var(--qc-ink)" : "var(--qc-hair)",
              display: "inline-block",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[180, 140, 220, 100].map((h, i) => (
        <div key={i} style={{
          height: h, borderRadius: 10, background: "var(--qc-section)",
          border: "1px solid var(--qc-hair)", animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  lens?: unknown;
  ticker?: string;
}

export function LensDetailEarningQuality({ ticker }: Props) {
  const { data, loading, error } = useEarningsQuality(ticker);

  if (loading) return <LoadingState />;
  if (error || !data) {
    return (
      <div style={{ padding: "20px 0", color: "var(--qc-down)", fontSize: 13 }}>
        {error ?? "No earnings quality data available."}
      </div>
    );
  }

  const statusColor =
    data.status === "STRONG" ? "var(--qc-up)" :
    data.status === "MODERATE" ? "var(--qc-warn)" :
    "var(--qc-down)";

  const summaryMetrics = [
    {
      label: "Company CAGR",
      value: data.tiles.find((t) => t.metric === "EPS_CAGR_COMPANY")?.actual_value != null
        ? `${data.tiles.find((t) => t.metric === "EPS_CAGR_COMPANY")!.actual_value}%`
        : "—",
      sub: `${data.chart_window_years}Y window`,
    },
    {
      label: "Beat Industry",
      value: `${data.beat_rate.count}/${data.beat_rate.total}`,
      sub: "Years outperformed",
    },
    {
      label: "Consistency",
      value: `${data.consistency.score}/5`,
      sub: data.consistency.status,
    },
  ];

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
            EPS Growth Analysis
          </p>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--qc-blue)", border: "1px solid var(--qc-blue)", borderRadius: 4, padding: "2px 6px",
            background: "color-mix(in srgb, var(--qc-blue) 10%, transparent)",
          }}>
            {data.tiles[0]?.label?.match(/\(.*?\)/)?.[0]?.replace(/[()]/g, "") ?? `${data.chart_window_years}Y`}
          </span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>
            Company vs industry trajectory — {data.chart_window_years}-year rolling window
          </span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: statusColor, border: `1px solid ${statusColor}`,
          borderRadius: 99, padding: "3px 10px",
          background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
          whiteSpace: "nowrap",
        }}>
          ● {data.status}
        </span>
      </div>

      {/* 4 metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 8 }}>
        {data.tiles.map((tile) => (
          <MetricTile key={tile.metric} tile={tile} />
        ))}
      </div>

      {/* EPS bar + industry line chart */}
      <div style={{
        padding: "14px 16px",
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
      }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 12px" }}>
          EPS Growth vs Industry
        </p>
        <EpsGrowthChart
          bars={data.chart_bars}
          ticker={ticker ?? data.ticker}
          windowYears={data.chart_window_years}
        />
      </div>

      {/* 2×2 insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
        {data.insight_cards.map((card, i) => (
          <InsightCard key={card.metric + i} card={card} />
        ))}
      </div>

      {/* Dark summary footer */}
      <LensDrawerSummaryCard
        title={data.takeaway.split(".")[0]}
        body={data.takeaway}
        metrics={summaryMetrics}
      />
    </div>
  );
}
