"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsightData, InsightLens } from "@/types/analysis";
import { DarkGradientCard, MonoLabel } from "@/components/ds";
import { renderMd } from "@/lib/render-md";
import { QC } from "@/lib/chart-tokens";

// ─── Color helpers ─────────────────────────────────────────────────────────────

// Thresholds: ≥80% Strong (green), 50–79% Moderate (amber), <50% Weak (red)
function scoreToTier(pct: number): "strong" | "moderate" | "weak" {
  if (pct >= 80) return "strong";
  if (pct >= 50) return "moderate";
  return "weak";
}

// `hex` is used for SVG fills/stops/text/tooltip colors — SVG accepts var(--qc-*)
// directly, so it points at the same token as `var`. `soft`/`fill` stay rgba.
const TIER_COLORS = {
  strong:   { hex: QC.up,   soft: "rgba(31,122,74,0.14)",  fill: "rgba(31,122,74,0.50)",  var: QC.up },
  moderate: { hex: QC.warn, soft: "rgba(180,115,26,0.14)", fill: "rgba(180,115,26,0.50)", var: QC.warn },
  weak:     { hex: QC.down, soft: "rgba(220,38,38,0.14)",  fill: "rgba(220,38,38,0.50)",  var: QC.down },
};

function axisStatusColor(pct: number) {
  return TIER_COLORS[scoreToTier(pct)];
}

function verdictBandColor(band: string) {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH")) return TIER_COLORS.strong.var;
  if (b.includes("WEAK") || b.includes("LOW")) return TIER_COLORS.weak.var;
  return TIER_COLORS.moderate.var;
}

function verdictBandBg(band: string) {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH")) return TIER_COLORS.strong.soft;
  if (b.includes("WEAK") || b.includes("LOW")) return TIER_COLORS.weak.soft;
  return TIER_COLORS.moderate.soft;
}

// Per-lens fill colour for gradient & stroke — driven by each lens's own pct
function lensBarColor(pct: number) {
  return TIER_COLORS[scoreToTier(pct)].var;
}

function lensStatusLabel(pct: number, status: string) {
  if (status) return status.toUpperCase();
  const t = scoreToTier(pct);
  if (t === "strong") return "STRONG";
  if (t === "moderate") return "MODERATE";
  return "WEAK";
}

// Score label per insight type
function scoreLabel(type: string): string {
  if (type === "opportunity") return "O-SCORE";
  if (type === "deal") return "D-SCORE";
  return "M-SCORE";
}


function getTotalScore(lenses: InsightLens[]) {
  const totalScore = lenses.reduce((sum, l) => sum + l.score, 0);
  const totalMax = lenses.reduce((sum, l) => sum + l.max_score, 0);
  return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
}

// ─── Pure SVG Radar ───────────────────────────────────────────────────────────

interface RadarPoint {
  subject: string;
  pct: number; // 0–100, computed as (score/max)*100
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function buildPolygonPoints(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return polarToCartesian(cx, cy, r, angle);
  });
}

function pointsToPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";
}

interface SVGRadarProps {
  data: RadarPoint[];
  overallScore: number;
  insightType: string;
  hoveredIndex: number | null;
  onHoverVertex: (i: number | null, pctX?: number, pctY?: number) => void;
}

function SVGRadar({ data, overallScore, insightType, hoveredIndex, onHoverVertex }: SVGRadarProps) {
  const SIZE = 260;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = SIZE * 0.34;
  const n = data.length;
  // 4 rings: 25%, 50%, 75%, 100% — marks the threshold zones visually
  const rings = [0.25, 0.5, 0.75, 1];
  const glowId = "radar-glow";

  // One unique gradient per axis based on its own score tier
  const gradIds = data.map((_, i) => `radar-seg-grad-${i}`);

  // Vertex positions scaled by each axis's own pct
  const dataPoints = data.map((d, i) => {
    const angle = (2 * Math.PI * i) / n;
    // clamp so a 0% score still has a tiny visible point at center
    const r = Math.max((d.pct / 100) * maxR, 2);
    return polarToCartesian(cx, cy, r, angle);
  });

  // Full-radius axis endpoints
  const axisPoints = buildPolygonPoints(cx, cy, maxR, n);

  // Label positions — tight to the outer ring edge
  const labelOffset = maxR + 14;
  const labelPoints = buildPolygonPoints(cx, cy, labelOffset, n);

  const dataPath = pointsToPath(dataPoints);

  // Overall fill color: average pct drives the gradient center color
  const avgPct = data.length > 0 ? data.reduce((s, d) => s + d.pct, 0) / data.length : 0;
  const fillTier = TIER_COLORS[scoreToTier(avgPct)];

  const label = scoreLabel(insightType);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
      <defs>
        {/* Per-segment gradients from center (transparent) → vertex color */}
        {data.map((d, i) => {
          const { hex } = axisStatusColor(d.pct);
          const apt = axisPoints[i];
          // linear gradient along the axis spoke direction
          const pctX = ((apt.x - cx) / SIZE + 0.5);
          const pctY = ((apt.y - cy) / SIZE + 0.5);
          return (
            <linearGradient
              key={i}
              id={gradIds[i]}
              x1="50%" y1="50%"
              x2={`${(pctX * 100).toFixed(1)}%`}
              y2={`${(pctY * 100).toFixed(1)}%`}
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={hex} stopOpacity={0} />
              <stop offset="100%" stopColor={hex} stopOpacity={0.55} />
            </linearGradient>
          );
        })}

        {/* Radial fill from center — uses average tier color */}
        <radialGradient id="radar-area-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={fillTier.hex} stopOpacity={0.35} />
          <stop offset="100%" stopColor={fillTier.hex} stopOpacity={0.06} />
        </radialGradient>

        {/* Subtle glow on stroke */}
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background rings ── */}
      {rings.map((ratio, ri) => {
        const ringPts = buildPolygonPoints(cx, cy, maxR * ratio, n);
        // dashed ring at 75% to visually reinforce the ~80% strong zone
        const isThreshold = ri === 2;
        return (
          <polygon
            key={ri}
            points={ringPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none"
            stroke={isThreshold ? QC.ink3 : QC.hair}
            strokeWidth={isThreshold ? 1.2 : 0.9}
            strokeOpacity={1}
            strokeDasharray={isThreshold ? "3 3" : undefined}
          />
        );
      })}

      {/* ── Axis spokes ── */}
      {axisPoints.map((pt, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={pt.x.toFixed(2)} y2={pt.y.toFixed(2)}
          stroke={QC.hair}
          strokeWidth={0.9}
          strokeOpacity={1}
        />
      ))}

      {/* ── Data area fill (radial gradient, overall tier) ── */}
      <motion.path
        d={dataPath}
        fill="url(#radar-area-fill)"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* ── Per-segment coloured stroke edges (one line per edge, coloured by the "from" vertex) ── */}
      {dataPoints.map((pt, i) => {
        const nextPt = dataPoints[(i + 1) % n];
        const { hex: fromColor } = axisStatusColor(data[i].pct);
        const { hex: toColor } = axisStatusColor(data[(i + 1) % n].pct);
        const segGradId = `seg-stroke-${i}`;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={segGradId} x1={`${((pt.x / SIZE) * 100).toFixed(1)}%`} y1={`${((pt.y / SIZE) * 100).toFixed(1)}%`} x2={`${((nextPt.x / SIZE) * 100).toFixed(1)}%`} y2={`${((nextPt.y / SIZE) * 100).toFixed(1)}%`} gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor={fromColor} />
                <stop offset="100%" stopColor={toColor} />
              </linearGradient>
            </defs>
            <motion.line
              x1={pt.x} y1={pt.y}
              x2={nextPt.x} y2={nextPt.y}
              stroke={`url(#${segGradId})`}
              strokeWidth={2}
              strokeLinecap="round"
              filter={`url(#${glowId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
            />
          </g>
        );
      })}

      {/* ── Axis labels ── */}
      {data.map((d, i) => {
        const lp = labelPoints[i];
        const words = d.subject.split(" ");
        const { hex: axColor } = axisStatusColor(d.pct);
        const isHovered = hoveredIndex === i;
        const textAnchor =
          Math.abs(lp.x - cx) < 8 ? "middle"
          : lp.x < cx ? "end"
          : "start";
        return (
          <g
            key={i}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHoverVertex(i, lp.x / SIZE, lp.y / SIZE)}
            onMouseLeave={() => onHoverVertex(null)}
          >
            {words.map((word, wi) => (
              <text
                key={wi}
                x={lp.x}
                y={lp.y + wi * 11 - ((words.length - 1) * 11) / 2}
                textAnchor={textAnchor}
                fontSize={8}
                fontWeight={isHovered ? 700 : 500}
                letterSpacing="0.06em"
                fill={isHovered ? axColor : QC.ink3}
                style={{ transition: "fill 0.15s" }}
              >
                {word}
              </text>
            ))}
          </g>
        );
      })}

      {/* ── Vertex dots — each colored by its own tier ── */}
      {dataPoints.map((pt, i) => {
        const { hex: dotColor } = axisStatusColor(data[i].pct);
        const isHovered = hoveredIndex === i;
        return (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={isHovered ? 6 : 4.5}
            fill={dotColor}
            stroke="white"
            strokeWidth={1.5}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.07, duration: 0.3, ease: "backOut" }}
            onMouseEnter={() => onHoverVertex(i, pt.x / SIZE, pt.y / SIZE)}
            onMouseLeave={() => onHoverVertex(null)}
            style={{
              cursor: "pointer",
              filter: isHovered ? `drop-shadow(0 0 5px ${dotColor})` : undefined,
              transition: "r 0.15s",
            }}
          />
        );
      })}

      {/* ── Center score + label ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <text
          x={cx} y={cy + 7}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fill={fillTier.hex}
          letterSpacing="-0.03em"
        >
          {overallScore}
        </text>
        <text
          x={cx} y={cy + 20}
          textAnchor="middle"
          fontSize={8.5}
          fontWeight={700}
          letterSpacing="0.14em"
          fill={QC.ink2}
        >
          {label}
        </text>
      </motion.g>
    </svg>
  );
}

// ─── Hover tooltip for a vertex ────────────────────────────────────────────────

function VertexTooltip({ lens, visible, pctX, pctY }: { lens: InsightLens | null; visible: boolean; pctX: number; pctY: number }) {
  // Convert 0–1 SVG fractions to CSS % within the radar container.
  // Nudge tooltip above the vertex by 28px; clamp x so it doesn't overflow.
  const leftPct = pctX * 100;
  const topPct  = pctY * 100;

  return (
    <AnimatePresence>
      {visible && lens && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "absolute",
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
            zIndex: 20,
            background: QC.ink,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8,
            padding: "8px 14px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", letterSpacing: "var(--qc-track-eyebrow)", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 3, fontFamily: "var(--qc-font-sans)" }}>
            {lens.name}
          </p>
          <p style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", color: "#fff", margin: 0, fontFamily: "var(--qc-font-sans)" }}>
            {lens.score}
            <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-regular)", color: "rgba(255,255,255,0.45)", marginLeft: 2 }}>/ {lens.max_score}</span>
            {(() => {
              const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
              const { hex } = axisStatusColor(pct);
              const label = lensStatusLabel(pct, lens.status ?? "");
              return (
                <span style={{ marginLeft: 8, fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow)", color: hex, fontFamily: "var(--qc-font-sans)" }}>
                  {label}
                </span>
              );
            })()}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Card entry animation ──────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ─── Main export ───────────────────────────────────────────────────────────────

interface InsightScorecardProps {
  insight: InsightData;
  verdictLabel: string;
  onLensClick?: (slug: string) => void;
}

export function InsightScorecard({ insight, verdictLabel, onLensClick }: InsightScorecardProps) {
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ pctX: 0.5, pctY: 0 });

  const bandColor = verdictBandColor(insight.verdict_band ?? insight.verdict);
  const bandBg = verdictBandBg(insight.verdict_band ?? insight.verdict);
  const bandLabel = (insight.verdict_band || insight.verdict || "").toUpperCase();
  // Overall score comes straight from the backend (0–100). Fall back to a
  // lens average only if the top-level score is missing.
  const overallScore = insight.score > 0 ? Math.round(insight.score) : getTotalScore(insight.lenses);

  const radarData: RadarPoint[] = insight.lenses.map((l) => ({
    subject: l.name.toUpperCase(),
    pct: l.max_score > 0 ? Math.round((l.score / l.max_score) * 100) : 0,
  }));

  const hoveredLens = hoveredVertex !== null ? insight.lenses[hoveredVertex] ?? null : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>

        {/* LEFT — dark verdict panel */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          style={{ borderRadius: 14, overflow: "hidden" }}
        >
          <DarkGradientCard radius={14} style={{ padding: "20px 16px 20px", display: "flex", flexDirection: "column", minHeight: 260, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <MonoLabel size={10} tracking="0.14em" color="rgba(255,255,255,0.45)">
                {verdictLabel}
              </MonoLabel>
              <span style={{
                fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow)",
                color: bandColor, background: bandBg, border: `1px solid ${bandColor}`,
                borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", whiteSpace: "nowrap",
                fontFamily: "var(--qc-font-sans)",
              }}>
                {bandLabel}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: "var(--qc-fz-26)", fontWeight: "var(--qc-w-regular)", lineHeight: 1.35,
                letterSpacing: "var(--qc-track-display)", margin: 0,
                color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif)",
              }}>
                {renderMd(insight.headline)}
              </h2>

              {insight.description && (
                <p style={{ marginTop: 14, fontSize: "var(--qc-fz-13)", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: "90%", fontFamily: "var(--qc-font-sans)" }}>
                  {renderMd(insight.description)}
                </p>
              )}
            </div>

            {insight.key_signals.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
                {insight.key_signals.map((s, i) => {
                  const dotColor = s.sentiment === "positive" ? "var(--qc-up)" : s.sentiment === "negative" ? "var(--qc-down)" : "var(--qc-ink-3)";
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 999, padding: "5px 12px",
                        fontSize: "var(--qc-fz-12)", color: "rgba(255,255,255,0.88)",
                        fontFamily: "var(--qc-font-sans)",
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                      {s.label}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </DarkGradientCard>
        </motion.div>

        {/* RIGHT — radar + score breakdown */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          style={{
            borderRadius: 14, overflow: "visible",
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* Top: radar + context text */}
          <div className="flex flex-col sm:flex-row" style={{ flex: 1, padding: "28px 16px 0" }}>

            {/* Radar — horizontal padding absorbs left/right axis label overflow */}
            <div style={{ flexShrink: 0, width: 300, height: 260, position: "relative", overflow: "visible", padding: "0 28px" }}>
              <VertexTooltip lens={hoveredLens} visible={hoveredVertex !== null} pctX={tooltipPos.pctX} pctY={tooltipPos.pctY} />
              <SVGRadar
                data={radarData}
                overallScore={overallScore}
                insightType={insight.type}
                hoveredIndex={hoveredVertex}
                onHoverVertex={(i, pctX, pctY) => {
                  setHoveredVertex(i);
                  if (i !== null && pctX !== undefined && pctY !== undefined) {
                    setTooltipPos({ pctX, pctY });
                  }
                }}
              />
            </div>

            {/* Right of radar: thesis section */}
            <div style={{ flex: 1, padding: "4px 24px 16px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <MonoLabel size={9} tracking="0.16em" color="var(--qc-ink-3)" style={{ marginBottom: 8 }}>
                THESIS
              </MonoLabel>

              <h3 style={{
                fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-medium)", lineHeight: 1.35, margin: "0 0 12px",
                color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)", letterSpacing: "-0.01em",
              }}>
                {insight.subtitle && renderMd(insight.subtitle)}
              </h3>

              {insight.thesis && (
                <p style={{
                  margin: 0,
                  fontSize: "var(--qc-fz-11)",
                  color: "var(--qc-ink-3)",
                  lineHeight: 1.7,
                  fontFamily: "var(--qc-font-sans)",
                  borderLeft: "2px solid var(--qc-hair)",
                  paddingLeft: 10,
                }}>
                  {renderMd(insight.thesis)}
                </p>
              )}
            </div>
          </div>

          {/* Bottom: lens score tiles */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{
              borderTop: "1px solid var(--qc-hair)",
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
              overflow: "hidden",
            }}>
            {insight.lenses.map((lens, i) => {
              const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
              const barColor = lensBarColor(pct);
              const statusLabel = lensStatusLabel(pct, lens.status);
              const isLast = i === insight.lenses.length - 1;
              const isClickable = !!onLensClick;
              const isHovered = hoveredVertex === i;

              return (
                <motion.div
                  key={lens.slug}
                  onClick={() => onLensClick?.(lens.slug)}
                  onMouseEnter={() => setHoveredVertex(i)}
                  onMouseLeave={() => setHoveredVertex(null)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, backgroundColor: isHovered ? "var(--qc-section)" : "var(--qc-card)" }}
                  transition={{ opacity: { delay: 0.5 + i * 0.08, duration: 0.3 }, backgroundColor: { duration: 0.15 } }}
                  style={{
                    padding: "14px 16px 12px",
                    borderRight: !isLast ? "1px solid var(--qc-hair)" : undefined,
                    borderBottom: "1px solid var(--qc-hair)",
                    cursor: isClickable ? "pointer" : "default",
                    position: "relative",
                  }}
                >
                  <MonoLabel
                    size={9} tracking="0.12em" color="var(--qc-ink-3)"
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                  >
                    {lens.name.toUpperCase()}
                  </MonoLabel>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "6px 0 4px" }}>
                    <span style={{ fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", lineHeight: 1, fontFamily: "var(--qc-font-sans)" }}>{lens.score}</span>
                    <span style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)" }}>/{lens.max_score}</span>
                    <span style={{
                      marginLeft: 6, fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)",
                      letterSpacing: "var(--qc-track-eyebrow)", color: barColor, textTransform: "uppercase",
                      fontFamily: "var(--qc-font-sans)",
                    }}>{statusLabel}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                      style={{ height: "100%", background: barColor, borderRadius: 99 }}
                    />
                  </div>

                  {/* Highlight border when vertex hovered */}
                  {isHovered && (
                    <motion.div
                      layoutId="lens-highlight"
                      style={{
                        position: "absolute", inset: 0, borderRadius: 0,
                        border: `1.5px solid ${barColor}`,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {isClickable && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      style={{ position: "absolute", top: 10, right: 10, color: "var(--qc-ink-3)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
