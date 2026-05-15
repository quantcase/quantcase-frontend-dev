"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsightData, InsightLens } from "@/types/analysis";
import { DarkGradientCard, MonoLabel } from "@/components/ds";

// ─── Color helpers ─────────────────────────────────────────────────────────────

function verdictBandColor(band: string) {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH")) return "var(--qc-up)";
  if (b.includes("WEAK") || b.includes("LOW")) return "var(--qc-down)";
  return "var(--qc-warn)";
}

function verdictBandBg(band: string) {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH")) return "rgba(31,122,74,0.18)";
  if (b.includes("WEAK") || b.includes("LOW")) return "rgba(220,38,38,0.15)";
  return "rgba(180,115,26,0.15)";
}

// Traffic-light fill colors for radar area — based on per-axis score
function axisStatusColor(pct: number): { stroke: string; fill: string; soft: string } {
  if (pct >= 70) return { stroke: "#1F7A4A", fill: "#1F7A4A", soft: "rgba(31,122,74,0.12)" };
  if (pct >= 40) return { stroke: "#B4731A", fill: "#B4731A", soft: "rgba(180,115,26,0.12)" };
  return { stroke: "#DC2626", fill: "#DC2626", soft: "rgba(220,38,38,0.12)" };
}

// Overall band → gradient stops
function bandGradientStops(band: string): { c1: string; c2: string; soft: string } {
  const b = (band ?? "").toUpperCase();
  if (b.includes("STRONG") || b.includes("HIGH"))
    return { c1: "rgba(31,122,74,0.55)", c2: "rgba(31,122,74,0.08)", soft: "#1F7A4A" };
  if (b.includes("WEAK") || b.includes("LOW"))
    return { c1: "rgba(220,38,38,0.50)", c2: "rgba(220,38,38,0.06)", soft: "#DC2626" };
  return { c1: "rgba(180,115,26,0.50)", c2: "rgba(180,115,26,0.06)", soft: "#B4731A" };
}

function lensBarColor(pct: number) {
  if (pct >= 70) return "var(--qc-up)";
  if (pct >= 40) return "var(--qc-warn)";
  return "var(--qc-down)";
}

function lensStatusLabel(pct: number, status: string) {
  if (status) return status.toUpperCase();
  if (pct >= 70) return "STRONG";
  if (pct >= 40) return "MODERATE";
  return "NEUTRAL";
}

function parseHeadline(headline: string) {
  const match = headline.match(/^([\s\S]*?)\*([\s\S]*?)\*([\s\S]*)$/);
  if (match) return { before: match[1], highlight: match[2], after: match[3] };
  const semi = headline.indexOf(";");
  if (semi !== -1) return { before: headline.slice(0, semi + 1), highlight: headline.slice(semi + 1).trim(), after: "" };
  return { before: "", highlight: headline, after: "" };
}

function getTotalScore(lenses: InsightLens[]) {
  const totalScore = lenses.reduce((sum, l) => sum + l.score, 0);
  const totalMax = lenses.reduce((sum, l) => sum + l.max_score, 0);
  return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
}

// ─── Pure SVG Radar ───────────────────────────────────────────────────────────

interface RadarPoint {
  subject: string;
  pct: number; // 0–100
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function buildPolygonPoints(cx: number, cy: number, r: number, n: number, startAngle = 0) {
  return Array.from({ length: n }, (_, i) => {
    const angle = startAngle + (2 * Math.PI * i) / n;
    return polarToCartesian(cx, cy, r, angle);
  });
}

function pointsToPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";
}

interface SVGRadarProps {
  data: RadarPoint[];
  band: string;
  overallScore: number;
  hoveredIndex: number | null;
  onHoverVertex: (i: number | null) => void;
}

function SVGRadar({ data, band, overallScore, hoveredIndex, onHoverVertex }: SVGRadarProps) {
  const SIZE = 260;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = SIZE * 0.34;
  const n = data.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const { c1, c2, soft } = bandGradientStops(band);
  const gradId = `radar-fill-${band.replace(/\s+/g, "")}`;
  const glowId = `radar-glow-${band.replace(/\s+/g, "")}`;

  // Vertices for data polygon
  const dataPoints = data.map((d, i) => {
    const angle = (2 * Math.PI * i) / n;
    const r = (d.pct / 100) * maxR;
    return polarToCartesian(cx, cy, r, angle);
  });

  // Axis endpoints (full radius)
  const axisPoints = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return polarToCartesian(cx, cy, maxR, angle);
  });

  // Label positions (slightly outside maxR)
  const labelPoints = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return polarToCartesian(cx, cy, maxR + 28, angle);
  });

  const dataPath = pointsToPath(dataPoints);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
      <defs>
        {/* Radial gradient for fill area */}
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        {/* Glow filter for the stroke */}
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ring grid */}
      {rings.map((ratio, ri) => {
        const ringPts = buildPolygonPoints(cx, cy, maxR * ratio, n);
        return (
          <polygon
            key={ri}
            points={ringPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none"
            stroke="#E9E7E1"
            strokeWidth={ri === rings.length - 1 ? 1.2 : 0.8}
            strokeOpacity={ri === rings.length - 1 ? 0.9 : 0.55}
          />
        );
      })}

      {/* Axis spokes */}
      {axisPoints.map((pt, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={pt.x.toFixed(2)} y2={pt.y.toFixed(2)}
          stroke="#E9E7E1"
          strokeWidth={0.8}
          strokeOpacity={0.7}
        />
      ))}

      {/* Data area fill — animated */}
      <motion.path
        d={dataPath}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data area stroke with glow */}
      <motion.path
        d={dataPath}
        fill="none"
        stroke={soft}
        strokeWidth={2}
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
      />

      {/* Axis labels */}
      {data.map((d, i) => {
        const lp = labelPoints[i];
        const words = d.subject.split(" ");
        const { stroke: axColor } = axisStatusColor(d.pct);
        const isHovered = hoveredIndex === i;
        const textAnchor =
          Math.abs(lp.x - cx) < 6 ? "middle"
          : lp.x < cx ? "end"
          : "start";
        return (
          <g key={i} style={{ cursor: "pointer" }} onMouseEnter={() => onHoverVertex(i)} onMouseLeave={() => onHoverVertex(null)}>
            {words.map((word, wi) => (
              <text
                key={wi}
                x={lp.x}
                y={lp.y + wi * 11 - ((words.length - 1) * 11) / 2}
                textAnchor={textAnchor}
                fontSize={8}
                fontWeight={isHovered ? 700 : 500}
                letterSpacing="0.06em"
                fill={isHovered ? axColor : "#9A9A92"}
                style={{ transition: "fill 0.15s, font-weight 0.15s" }}
              >
                {word}
              </text>
            ))}
          </g>
        );
      })}

      {/* Vertex dots — color-coded by per-axis score */}
      {dataPoints.map((pt, i) => {
        const { stroke: dotColor } = axisStatusColor(data[i].pct);
        const isHovered = hoveredIndex === i;
        return (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={isHovered ? 6 : 4}
            fill={dotColor}
            stroke="white"
            strokeWidth={1.5}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.55 + i * 0.07, duration: 0.3, ease: "backOut" }}
            onMouseEnter={() => onHoverVertex(i)}
            onMouseLeave={() => onHoverVertex(null)}
            style={{ cursor: "pointer", filter: isHovered ? `drop-shadow(0 0 4px ${dotColor})` : undefined }}
          />
        );
      })}

      {/* Center: score + label */}
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <text
          x={cx} y={cy + 6}
          textAnchor="middle"
          fontSize={20}
          fontWeight={600}
          fill={soft}
          letterSpacing="-0.02em"
        >
          {overallScore}
        </text>
        <text
          x={cx} y={cy + 17}
          textAnchor="middle"
          fontSize={7}
          fontWeight={600}
          letterSpacing="0.12em"
          fill="#9A9A92"
        >
          M-SCORE
        </text>
      </motion.g>
    </svg>
  );
}

// ─── Hover tooltip for a vertex ────────────────────────────────────────────────

function VertexTooltip({ lens, visible }: { lens: InsightLens | null; visible: boolean }) {
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
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            background: "#1C1C20",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8,
            padding: "8px 14px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 3 }}>
            {lens.name}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>
            {lens.score}
            <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.45)", marginLeft: 2 }}>/ {lens.max_score}</span>
            <span style={{
              marginLeft: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              color: lens.max_score > 0 && (lens.score / lens.max_score) >= 0.7 ? "#1F7A4A"
                : (lens.score / lens.max_score) >= 0.4 ? "#B4731A" : "#DC2626",
            }}>
              {(lens.status || (lens.score / lens.max_score >= 0.7 ? "STRONG" : lens.score / lens.max_score >= 0.4 ? "MODERATE" : "WEAK")).toUpperCase()}
            </span>
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

  const { before, highlight, after } = parseHeadline(insight.headline);
  const bandColor = verdictBandColor(insight.verdict_band ?? insight.verdict);
  const bandBg = verdictBandBg(insight.verdict_band ?? insight.verdict);
  const bandLabel = (insight.verdict_band || insight.verdict || "").toUpperCase();
  const overallScore = getTotalScore(insight.lenses);

  const radarData: RadarPoint[] = insight.lenses.map((l) => ({
    subject: l.name.toUpperCase(),
    pct: l.max_score > 0 ? Math.round((l.score / l.max_score) * 100) : 0,
  }));

  const hoveredLens = hoveredVertex !== null ? insight.lenses[hoveredVertex] ?? null : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* LEFT — dark verdict panel */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          style={{ borderRadius: 14, overflow: "hidden" }}
        >
          <DarkGradientCard radius={14} style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", minHeight: 260, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <MonoLabel size={10} tracking="0.14em" color="rgba(255,255,255,0.45)">
                {verdictLabel}
              </MonoLabel>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                color: bandColor, background: bandBg, border: `1px solid ${bandColor}`,
                borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                {bandLabel}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: 26, fontWeight: 400, lineHeight: 1.35, letterSpacing: "-0.01em",
                margin: 0, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif, Georgia, serif)",
              }}>
                {before && <span>{before} </span>}
                {highlight && <em style={{ color: bandColor, fontStyle: "italic" }}>{highlight}</em>}
                {after && <span> {after}</span>}
              </h2>

              {insight.description && (
                <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: "90%" }}>
                  {insight.description}
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
                        fontSize: 12, color: "rgba(255,255,255,0.88)",
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
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        >
          {/* Top: radar + context text */}
          <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "8px 0 0" }}>

            {/* Radar */}
            <div style={{ flex: "0 0 52%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "16px 0 16px 16px" }}>
              <VertexTooltip lens={hoveredLens} visible={hoveredVertex !== null} />
              <SVGRadar
                data={radarData}
                band={bandLabel}
                overallScore={overallScore}
                hoveredIndex={hoveredVertex}
                onHoverVertex={setHoveredVertex}
              />
            </div>

            {/* Right of radar: band pill + thesis */}
            <div style={{ flex: 1, padding: "20px 20px 20px 8px" }}>
              <span style={{
                display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                color: bandColor, background: bandBg, border: `1px solid ${bandColor}`,
                borderRadius: 4, padding: "2px 10px", textTransform: "uppercase", marginBottom: 12,
              }}>
                {bandLabel}
              </span>

              <h3 style={{
                fontSize: 16, fontWeight: 400, lineHeight: 1.4, margin: 0,
                color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif, Georgia, serif)",
              }}>
                {insight.subtitle && (
                  <>
                    {insight.subtitle.split(";")[0]}
                    {insight.subtitle.includes(";") && (
                      <>; <em style={{ color: bandColor, fontStyle: "italic" }}>{insight.subtitle.split(";")[1].trim()}</em></>
                    )}
                  </>
                )}
              </h3>

              {insight.analyzed_at && (
                <p style={{ marginTop: 8, fontSize: 11, color: "var(--qc-ink-3)", lineHeight: 1.5 }}>
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} · Analyzed {new Date(insight.analyzed_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                </p>
              )}

              {/* Compact legend */}
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { label: "Strong ≥ 70%", color: "#1F7A4A", soft: "rgba(31,122,74,0.12)" },
                  { label: "Moderate 40–69%", color: "#B4731A", soft: "rgba(180,115,26,0.12)" },
                  { label: "Weak < 40%", color: "#DC2626", soft: "rgba(220,38,38,0.12)" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: row.soft, border: `1.5px solid ${row.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "var(--qc-ink-3)", letterSpacing: "0.02em" }}>{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: lens score tiles */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(insight.lenses.length, 4)}, 1fr)`,
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
                    <span style={{ fontSize: 24, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1 }}>{lens.score}</span>
                    <span style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>/{lens.max_score}</span>
                    <span style={{
                      marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                      color: barColor, textTransform: "uppercase",
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
