"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsightData, InsightLens } from "@/types/analysis";
import { DarkGradientCard, MonoLabel } from "@/components/ds";
import { renderMd } from "@/lib/render-md";
import { QC } from "@/lib/chart-tokens";
import { LENS_ICON_CONFIG } from "./insight-lenses";

// ─── Color helpers ─────────────────────────────────────────────────────────────

// Thresholds: ≥75% Strong (green, matches top nav), 50–74% Moderate (amber), <50% Weak (red)
function scoreToTier(pct: number): "strong" | "moderate" | "weak" {
  if (pct >= 75) return "strong";
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

export function getTotalScore(lenses: InsightLens[]) {
  const totalScore = lenses.reduce((sum, l) => sum + l.score, 0);
  const totalMax = lenses.reduce((sum, l) => sum + l.max_score, 0);
  return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
}

// ─── Pure SVG Radar ───────────────────────────────────────────────────────────

interface RadarPoint {
  subject: string;
  pct: number; // 0–100, computed as (score/max)*100
  lens: InsightLens;
  position: "top" | "right" | "bottom" | "left";
}

const normSlug = (s: string) => s.toLowerCase().replace(/_/g, "-");

// Slug aliases so radar vertex lookup still works after backend renames / merges
// (e.g. eps-engine → earnings-forecast, pe-rerating → earning-quality).
const RADAR_SLUG_ALIASES: Record<string, string[]> = {
  "earnings-forecast": ["eps-engine", "earnings_forecast"],
  "eps-engine": ["earnings-forecast", "earnings_forecast"],
  "earning-quality": ["pe-rerating-potential", "earnings-quality", "earnings_quality"],
  "pe-rerating-potential": ["earning-quality", "earnings-quality", "earnings_quality"],
  "industry-analysis": ["industry"],
  "industry": ["industry-analysis"],
};

function findRadarLens(lenses: InsightLens[], slug: string): InsightLens | undefined {
  const target = normSlug(slug);
  const aliases = new Set([target, ...(RADAR_SLUG_ALIASES[target] ?? []).map(normSlug)]);
  return lenses.find((l) => aliases.has(normSlug(l.slug)));
}

function toRadarPoint(lens: InsightLens, position: RadarPoint["position"]): RadarPoint {
  return {
    subject: lens.name.toUpperCase(),
    pct: lens.max_score > 0 ? Math.round((lens.score / lens.max_score) * 100) : 0,
    lens,
    position,
  };
}

// Canonical radar positions for each factor page so the radar diamond vertices
// and labels always follow the specified arrangement:
// e.g. Management: Guidance Credibility (left), Disclosure Honesty (top),
// Promoter Activity (right), Capital Allocation (bottom).
export const FACTOR_RADAR_POSITIONS: Record<
  string,
  { top: string; right: string; bottom: string; left: string }
> = {
  management: {
    top: "disclosure-honesty",
    right: "promoter-activity",
    bottom: "capital-allocation",
    left: "guidance-credibility",
  },
  opportunity: {
    top: "competition",
    right: "customer-distribution",
    bottom: "financial-strength",
    left: "industry-analysis",
  },
};

// Deal uses a 3-axis triangle (not a 4-axis diamond): Earnings Quality (top),
// Industry (bottom-right), Earnings Forecast (bottom-left). Industry is often a
// frontend clone from Opportunity onto the Deal scorecard.
export const FACTOR_RADAR_TRIANGLES: Record<
  string,
  { top: string; right: string; left: string }
> = {
  deal: {
    top: "earning-quality",
    right: "industry-analysis",
    left: "earnings-forecast",
  },
};

export function getOrderedRadarData(type: string, lenses: InsightLens[]): RadarPoint[] {
  const typeKey = type.toLowerCase();
  const tri = FACTOR_RADAR_TRIANGLES[typeKey];

  // Prefer an explicit triangle layout when all three vertices resolve — even if
  // extra lenses are present on the scorecard tiles (e.g. target-price-matrix).
  if (tri) {
    const topLens = findRadarLens(lenses, tri.top);
    const rightLens = findRadarLens(lenses, tri.right);
    const leftLens = findRadarLens(lenses, tri.left);
    if (topLens && rightLens && leftLens) {
      return [
        toRadarPoint(topLens, "top"),
        toRadarPoint(rightLens, "right"),
        toRadarPoint(leftLens, "left"),
      ];
    }
  }

  const cfg = FACTOR_RADAR_POSITIONS[typeKey];

  if (cfg && lenses.length === 4) {
    const topLens = findRadarLens(lenses, cfg.top) ?? lenses[1];
    const rightLens = findRadarLens(lenses, cfg.right) ?? lenses[3];
    const bottomLens = findRadarLens(lenses, cfg.bottom) ?? lenses[2];
    const leftLens = findRadarLens(lenses, cfg.left) ?? lenses[0];

    return [
      toRadarPoint(topLens, "top"),
      toRadarPoint(rightLens, "right"),
      toRadarPoint(bottomLens, "bottom"),
      toRadarPoint(leftLens, "left"),
    ];
  }

  // Fallback for 4 lenses:
  // In the 2x2 grid of lens assessment section:
  // [0] is top-left, [1] is top-right, [2] is bottom-left, [3] is bottom-right.
  // Left: [0], Top: [1], Right: [3], Bottom: [2].
  if (lenses.length === 4) {
    return [
      toRadarPoint(lenses[1], "top"),
      toRadarPoint(lenses[3], "right"),
      toRadarPoint(lenses[2], "bottom"),
      toRadarPoint(lenses[0], "left"),
    ];
  }

  // 3-lens fallback → triangle: top, bottom-right, bottom-left
  if (lenses.length === 3) {
    return [
      toRadarPoint(lenses[0], "top"),
      toRadarPoint(lenses[1], "right"),
      toRadarPoint(lenses[2], "left"),
    ];
  }

  const positions: ("top" | "right" | "bottom" | "left")[] = ["top", "right", "bottom", "left"];
  return lenses.map((lens, i) => ({
    subject: lens.name.toUpperCase(),
    pct: lens.max_score > 0 ? Math.round((lens.score / lens.max_score) * 100) : 0,
    lens,
    position: positions[i % 4],
  }));
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
  hoveredSlug: string | null;
  onHoverVertex: (slug: string | null, pctX?: number, pctY?: number) => void;
  onLensClick?: (slug: string) => void;
}

function SVGRadar({ data, overallScore, insightType, hoveredSlug, onHoverVertex, onLensClick }: SVGRadarProps) {
  // Unique prefix so mobile + desktop radars don't collide on gradient/filter ids
  // (duplicate url(#…) refs were wiping the fill + solid stroke on desktop).
  const uid = useId().replace(/:/g, "");
  const WIDTH = 480;
  const HEIGHT = 320;
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  // Desktop keeps prior plot size; mobile enlarges via CSS container height/width.
  const maxR = 118;
  const n = data.length;
  // 4 rings: 25%, 50%, 75%, 100% — marks the threshold zones visually
  const rings = [0.25, 0.5, 0.75, 1];
  const glowId = `radar-glow-${uid}`;
  const areaFillId = `radar-area-fill-${uid}`;

  // One unique gradient per axis based on its own score tier
  const gradIds = data.map((_, i) => `radar-seg-grad-${uid}-${i}`);

  // Vertex positions scaled by each axis's own pct
  // Index 0: Top (angle 0), Index 1: Right (angle PI/2), Index 2: Bottom (angle PI), Index 3: Left (angle 3*PI/2)
  const dataPoints = data.map((d, i) => {
    const angle = (2 * Math.PI * i) / n;
    // clamp so a 0% score still has a tiny visible point at center
    const r = Math.max((d.pct / 100) * maxR, 2);
    return polarToCartesian(cx, cy, r, angle);
  });

  // Full-radius axis endpoints
  const axisPoints = buildPolygonPoints(cx, cy, maxR, n);

  const dataPath = pointsToPath(dataPoints);

  // Overall fill color: tier of the overall score
  const fillTier = TIER_COLORS[scoreToTier(overallScore)];
  const label = scoreLabel(insightType);

  // Vertex reference points and icons.
  // Diamond (n=4): [top, right, bottom, left]
  // Triangle (n=3): [top, bottom-right, bottom-left]
  const isTriangle = n === 3;
  const topPoint = data[0];
  const rightPoint = data[1];
  const bottomPoint = isTriangle ? undefined : data[2];
  const leftPoint = isTriangle ? data[2] : data[3];

  const topPt = dataPoints[0];
  const rightPt = dataPoints[1];
  const bottomPt = isTriangle ? undefined : dataPoints[2];
  const leftPt = isTriangle ? dataPoints[2] : dataPoints[3];

  const isTopHovered = hoveredSlug === topPoint?.lens.slug;
  const isRightHovered = hoveredSlug === rightPoint?.lens.slug;
  const isBottomHovered = hoveredSlug === bottomPoint?.lens.slug;
  const isLeftHovered = hoveredSlug === leftPoint?.lens.slug;

  const TopIcon = topPoint ? LENS_ICON_CONFIG[topPoint.lens.slug] : null;
  const RightIcon = rightPoint ? LENS_ICON_CONFIG[rightPoint.lens.slug] : null;
  const BottomIcon = bottomPoint ? LENS_ICON_CONFIG[bottomPoint.lens.slug] : null;
  const LeftIcon = leftPoint ? LENS_ICON_CONFIG[leftPoint.lens.slug] : null;

  const topTier = topPoint ? axisStatusColor(topPoint.pct) : TIER_COLORS.moderate;
  const rightTier = rightPoint ? axisStatusColor(rightPoint.pct) : TIER_COLORS.moderate;
  const bottomTier = bottomPoint ? axisStatusColor(bottomPoint.pct) : TIER_COLORS.moderate;
  const leftTier = leftPoint ? axisStatusColor(leftPoint.pct) : TIER_COLORS.moderate;

  const leftWords = leftPoint ? leftPoint.lens.name.toUpperCase().split(" ") : [];
  const rightWords = rightPoint ? rightPoint.lens.name.toUpperCase().split(" ") : [];
  // Triangle side vertices sit lower — pin labels near those corners.
  const sideLabelTop = isTriangle ? "68%" : "50%";
  const sideLabelTransform = isTriangle ? "translateY(-30%)" : "translateY(-50%)";

  const iconBoxClass =
    "hidden sm:flex w-7 h-7 rounded-lg items-center justify-center shrink-0 transition-all duration-150";
  const labelTextClass =
    "text-[9.5px] sm:text-[11px] font-semibold tracking-[0.05em] leading-[1.15] uppercase";
  const sideWordClass =
    "text-[9px] sm:text-[10.5px] font-semibold tracking-[0.05em] leading-[1.15] uppercase";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Mobile: near full-bleed + text-only labels. Desktop: previous full framing. */}
      <div className="mx-auto h-[92%] w-[90%] sm:h-full sm:w-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Per-segment gradients from center (transparent) → vertex color */}
          {data.map((d, i) => {
            const { hex } = axisStatusColor(d.pct);
            const apt = axisPoints[i];
            const pctX = (apt.x - cx) / WIDTH + 0.5;
            const pctY = (apt.y - cy) / HEIGHT + 0.5;
            return (
              <linearGradient
                key={i}
                id={gradIds[i]}
                x1="50%"
                y1="50%"
                x2={`${(pctX * 100).toFixed(1)}%`}
                y2={`${(pctY * 100).toFixed(1)}%`}
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor={hex} stopOpacity={0} />
                <stop offset="100%" stopColor={hex} stopOpacity={0.55} />
              </linearGradient>
            );
          })}

          {/* Radial fill from center — uses overall tier color */}
          <radialGradient id={areaFillId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={fillTier.hex} stopOpacity={0.35} />
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
          // dashed ring at 75% to visually reinforce the ~75% strong zone
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
            x1={cx}
            y1={cy}
            x2={pt.x.toFixed(2)}
            y2={pt.y.toFixed(2)}
            stroke={QC.hair}
            strokeWidth={0.9}
            strokeOpacity={1}
          />
        ))}

        {/* ── Data area fill (radial gradient, overall tier) ── */}
        <motion.path
          d={dataPath}
          fill={`url(#${areaFillId})`}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* ── Per-segment coloured stroke edges ── */}
        {dataPoints.map((pt, i) => {
          const nextPt = dataPoints[(i + 1) % n];
          const { hex: fromColor } = axisStatusColor(data[i].pct);
          const { hex: toColor } = axisStatusColor(data[(i + 1) % n].pct);
          const segGradId = `seg-stroke-${uid}-${i}`;
          return (
            <g key={i}>
              <defs>
                <linearGradient
                  id={segGradId}
                  x1={`${((pt.x / WIDTH) * 100).toFixed(1)}%`}
                  y1={`${((pt.y / HEIGHT) * 100).toFixed(1)}%`}
                  x2={`${((nextPt.x / WIDTH) * 100).toFixed(1)}%`}
                  y2={`${((nextPt.y / HEIGHT) * 100).toFixed(1)}%`}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={fromColor} />
                  <stop offset="100%" stopColor={toColor} />
                </linearGradient>
              </defs>
              <motion.line
                x1={pt.x}
                y1={pt.y}
                x2={nextPt.x}
                y2={nextPt.y}
                stroke={`url(#${segGradId})`}
                strokeWidth={2.5}
                strokeLinecap="round"
                filter={`url(#${glowId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
              />
            </g>
          );
        })}

        {/* ── Vertex dots — each colored by its own tier ── */}
        {dataPoints.map((pt, i) => {
          const { hex: dotColor } = axisStatusColor(data[i].pct);
          const isHovered = hoveredSlug === data[i].lens.slug;
          return (
            <motion.circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? 6.5 : 5}
              fill={dotColor}
              stroke="white"
              strokeWidth={1.5}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.3, ease: "backOut" }}
              onMouseEnter={() => onHoverVertex(data[i].lens.slug, pt.x / WIDTH, pt.y / HEIGHT)}
              onMouseLeave={() => onHoverVertex(null)}
              onClick={() => onLensClick?.(data[i].lens.slug)}
              style={{
                cursor: "pointer",
                filter: isHovered ? `drop-shadow(0 0 6px ${dotColor})` : undefined,
                transition: "r 0.15s",
              }}
            />
          );
        })}

        {/* ── Center score + label ── */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fontSize={28}
            fontWeight={700}
            fill={fillTier.hex}
            letterSpacing="-0.03em"
          >
            {overallScore}
          </text>
          <text
            x={cx}
            y={cy + 24}
            textAnchor="middle"
            fontSize={9.5}
            fontWeight={700}
            letterSpacing="0.14em"
            fill={QC.ink2}
          >
            {label}
          </text>
        </motion.g>
      </svg>
      </div>

      {/* ── Lens labels: mobile = text only; desktop = icon + text ── */}
      {(n === 3 || n === 4) && (
        <>
          {/* Top Label */}
          {topPoint && (
            <div
              className="flex max-w-[94%] items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 select-none"
              title={topPoint.lens.name}
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
              onMouseEnter={() => onHoverVertex(topPoint.lens.slug, topPt.x / WIDTH, topPt.y / HEIGHT)}
              onMouseLeave={() => onHoverVertex(null)}
              onClick={() => onLensClick?.(topPoint.lens.slug)}
            >
              <div
                className={iconBoxClass}
                style={{
                  background: isTopHovered ? `${topTier.hex}18` : "rgba(18,18,18,0.04)",
                  border: `1.5px solid ${isTopHovered ? topTier.hex : "rgba(18,18,18,0.10)"}`,
                  color: isTopHovered ? topTier.hex : "var(--qc-ink)",
                  boxShadow: isTopHovered ? `0 0 10px ${topTier.hex}33` : undefined,
                }}
              >
                {TopIcon && <TopIcon size={14} strokeWidth={1.8} />}
              </div>
              <span
                className={labelTextClass}
                style={{
                  fontWeight: isTopHovered ? 700 : 600,
                  color: isTopHovered ? topTier.hex : "var(--qc-ink)",
                  fontFamily: "var(--qc-font-sans)",
                  transition: "color 0.15s",
                  textAlign: "center",
                }}
              >
                {topPoint.lens.name.toUpperCase()}
              </span>
            </div>
          )}

          {/* Right Label */}
          {rightPoint && (
            <div
              className="flex max-w-[30%] sm:max-w-none items-center gap-1 sm:gap-2 cursor-pointer transition-all duration-150 select-none"
              title={rightPoint.lens.name}
              style={{
                position: "absolute",
                right: 0,
                top: sideLabelTop,
                transform: sideLabelTransform,
                zIndex: 10,
              }}
              onMouseEnter={() => onHoverVertex(rightPoint.lens.slug, rightPt.x / WIDTH, rightPt.y / HEIGHT)}
              onMouseLeave={() => onHoverVertex(null)}
              onClick={() => onLensClick?.(rightPoint.lens.slug)}
            >
              <div
                className={iconBoxClass}
                style={{
                  background: isRightHovered ? `${rightTier.hex}18` : "rgba(18,18,18,0.04)",
                  border: `1.5px solid ${isRightHovered ? rightTier.hex : "rgba(18,18,18,0.10)"}`,
                  color: isRightHovered ? rightTier.hex : "var(--qc-ink)",
                  boxShadow: isRightHovered ? `0 0 10px ${rightTier.hex}33` : undefined,
                }}
              >
                {RightIcon && <RightIcon size={14} strokeWidth={1.8} />}
              </div>
              <div className="flex min-w-0 flex-col items-start text-left">
                {rightWords.map((word, wi) => (
                  <span
                    key={wi}
                    className={sideWordClass}
                    style={{
                      fontWeight: isRightHovered ? 700 : 600,
                      color: isRightHovered ? rightTier.hex : "var(--qc-ink)",
                      fontFamily: "var(--qc-font-sans)",
                      transition: "color 0.15s",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Label — diamond only */}
          {n === 4 && bottomPoint && bottomPt && (
            <div
              className="flex max-w-[94%] items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 select-none"
              title={bottomPoint.lens.name}
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
              onMouseEnter={() => onHoverVertex(bottomPoint.lens.slug, bottomPt.x / WIDTH, bottomPt.y / HEIGHT)}
              onMouseLeave={() => onHoverVertex(null)}
              onClick={() => onLensClick?.(bottomPoint.lens.slug)}
            >
              <div
                className={iconBoxClass}
                style={{
                  background: isBottomHovered ? `${bottomTier.hex}18` : "rgba(18,18,18,0.04)",
                  border: `1.5px solid ${isBottomHovered ? bottomTier.hex : "rgba(18,18,18,0.10)"}`,
                  color: isBottomHovered ? bottomTier.hex : "var(--qc-ink)",
                  boxShadow: isBottomHovered ? `0 0 10px ${bottomTier.hex}33` : undefined,
                }}
              >
                {BottomIcon && <BottomIcon size={14} strokeWidth={1.8} />}
              </div>
              <span
                className={labelTextClass}
                style={{
                  fontWeight: isBottomHovered ? 700 : 600,
                  color: isBottomHovered ? bottomTier.hex : "var(--qc-ink)",
                  fontFamily: "var(--qc-font-sans)",
                  transition: "color 0.15s",
                  textAlign: "center",
                }}
              >
                {bottomPoint.lens.name.toUpperCase()}
              </span>
            </div>
          )}

          {/* Left Label */}
          {leftPoint && leftPt && (
            <div
              className="flex max-w-[30%] sm:max-w-none items-center gap-1 sm:gap-2 cursor-pointer transition-all duration-150 select-none"
              title={leftPoint.lens.name}
              style={{
                position: "absolute",
                left: 0,
                top: sideLabelTop,
                transform: sideLabelTransform,
                zIndex: 10,
              }}
              onMouseEnter={() => onHoverVertex(leftPoint.lens.slug, leftPt.x / WIDTH, leftPt.y / HEIGHT)}
              onMouseLeave={() => onHoverVertex(null)}
              onClick={() => onLensClick?.(leftPoint.lens.slug)}
            >
              <div className="flex min-w-0 flex-col items-end text-right">
                {leftWords.map((word, wi) => (
                  <span
                    key={wi}
                    className={sideWordClass}
                    style={{
                      fontWeight: isLeftHovered ? 700 : 600,
                      color: isLeftHovered ? leftTier.hex : "var(--qc-ink)",
                      fontFamily: "var(--qc-font-sans)",
                      transition: "color 0.15s",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
              <div
                className={iconBoxClass}
                style={{
                  background: isLeftHovered ? `${leftTier.hex}18` : "rgba(18,18,18,0.04)",
                  border: `1.5px solid ${isLeftHovered ? leftTier.hex : "rgba(18,18,18,0.10)"}`,
                  color: isLeftHovered ? leftTier.hex : "var(--qc-ink)",
                  boxShadow: isLeftHovered ? `0 0 10px ${leftTier.hex}33` : undefined,
                }}
              >
                {LeftIcon && <LeftIcon size={14} strokeWidth={1.8} />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Hover tooltip for a vertex ────────────────────────────────────────────────

function VertexTooltip({ lens, visible, pctX, pctY }: { lens: InsightLens | null; visible: boolean; pctX: number; pctY: number }) {
  // Convert 0–1 SVG fractions to CSS % within the radar container.
  const leftPct = pctX * 100;
  const topPct  = pctY * 100;
  // If vertex is in the top 26% of container, display tooltip below to avoid clipping
  const isNearTop = topPct < 26;

  return (
    <AnimatePresence>
      {visible && lens && (
        <motion.div
          initial={{ opacity: 0, y: isNearTop ? -6 : 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isNearTop ? -4 : 4, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "absolute",
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform: isNearTop ? "translate(-50%, 14px)" : "translate(-50%, calc(-100% - 10px))",
            zIndex: 30,
            background: QC.ink,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8,
            padding: "8px 14px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
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
  // Lens list to drive the radar + score-breakdown tiles. Defaults to the
  // insight's own lenses; the Deal page passes native + the cloned Industry
  // Analysis lens so the radar/tiles include it (frontend-only clone).
  lenses?: InsightLens[];
  scoreOverride?: number;
}

export function InsightScorecard({ insight, verdictLabel, onLensClick, lenses, scoreOverride }: InsightScorecardProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ pctX: 0.5, pctY: 0 });
  const [mobileVerdictExpanded, setMobileVerdictExpanded] = useState(false);
  const [mobileLensPopup, setMobileLensPopup] = useState<InsightLens | null>(null);

  const scorecardLenses = lenses ?? insight.lenses;

  const bandColor = verdictBandColor(insight.verdict_band ?? insight.verdict);
  const bandBg = verdictBandBg(insight.verdict_band ?? insight.verdict);
  const bandLabel = (insight.verdict_band || insight.verdict || "").toUpperCase();

  const overallScore =
    scoreOverride != null
      ? scoreOverride
      : scorecardLenses.length > 0
      ? getTotalScore(scorecardLenses)
      : (insight.score > 0 ? Math.round(insight.score) : 0);

  const radarData: RadarPoint[] = getOrderedRadarData(insight.type, scorecardLenses);

  const hoveredLens = hoveredSlug !== null ? scorecardLenses.find((l) => l.slug === hoveredSlug) ?? null : null;

  const vertexMap: Record<string, { pctX: number; pctY: number }> = {};
  radarData.forEach((d, i) => {
    const angle = (2 * Math.PI * i) / radarData.length;
    const r = Math.max((d.pct / 100) * 118, 2);
    const pt = polarToCartesian(240, 160, r, angle);
    vertexMap[d.lens.slug] = { pctX: pt.x / 480, pctY: pt.y / 320 };
    vertexMap[d.lens.slug.replace(/_/g, "-")] = { pctX: pt.x / 480, pctY: pt.y / 320 };
    vertexMap[d.lens.slug.replace(/-/g, "_")] = { pctX: pt.x / 480, pctY: pt.y / 320 };
  });

  const verdictPoints: { text: string; sentiment: "positive" | "concern" | "watch" }[] = [
    ...insight.evidence.map((text) => ({ text, sentiment: "positive" as const })),
    ...insight.concerns.map((text) => ({ text, sentiment: "concern" as const })),
    ...insight.watch_outs.map((text) => ({ text, sentiment: "watch" as const })),
  ];

  const overallTier = scoreToTier(overallScore);
  const overallColor = TIER_COLORS[overallTier].hex;

  // ─── Mobile: ArcGauge (reference-style 78% arc) ────────────────────────────
  function MobileArcGauge({ value, color, trackColor, size = 56 }: { value: number; color: string; trackColor?: string; size?: number }) {
    const r = (size - 8) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const arc = circ * 0.78;
    const fill = arc * (value / 100);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(126deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor ?? "var(--qc-hair)"} strokeWidth={4.5}
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4.5}
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" />
      </svg>
    );
  }

  // ─── Mobile Layout ─────────────────────────────────────────────────────────
  const mobileLayout = (
    <div className="flex flex-col gap-4 md:hidden">

      {/* ── VERDICT CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <DarkGradientCard radius={20} style={{ padding: "20px 18px 18px", position: "relative", overflow: "hidden" }}>
          {/* ambient glow */}
          <div style={{
            position: "absolute", top: -48, right: -48, width: 160, height: 160, borderRadius: "50%",
            background: `radial-gradient(circle, ${overallColor} 0%, transparent 70%)`,
            opacity: 0.15, pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            {/* Top row: verdict label + band */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <MonoLabel size={9} tracking="0.14em" color="rgba(255,255,255,0.45)">
                {verdictLabel}
              </MonoLabel>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                color: bandColor, background: bandBg, border: `1px solid ${bandColor}40`,
                borderRadius: 999, padding: "3px 10px", textTransform: "uppercase", whiteSpace: "nowrap",
                fontFamily: "var(--qc-font-sans)",
              }}>
                {bandLabel}
              </span>
            </div>

            {/* Score ring + headline side by side */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, position: "relative", width: 72, height: 72 }}>
                <MobileArcGauge value={overallScore} color={overallColor} trackColor="rgba(255,255,255,0.08)" size={72} />
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", paddingBottom: 4,
                }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: overallColor, lineHeight: 1, fontFamily: "var(--qc-font-sans)" }}>
                    {overallScore}
                  </span>
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontFamily: "var(--qc-font-mono)", marginTop: 2 }}>
                    {scoreLabel(insight.type)}
                  </span>
                </div>
              </div>
              <h2 style={{
                flex: 1, fontSize: 15, fontWeight: 700, lineHeight: 1.4,
                margin: 0, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-sans)",
              }}>
                {renderMd(insight.headline)}
              </h2>
            </div>

            {/* Description — collapsed by default */}
            {insight.description && (
              <div style={{ marginTop: 14 }}>
                <p style={{
                  fontSize: 12, color: "rgba(255,255,255,0.50)", lineHeight: 1.65,
                  margin: 0, fontFamily: "var(--qc-font-sans)",
                  display: mobileVerdictExpanded ? "block" : "-webkit-box",
                  WebkitLineClamp: mobileVerdictExpanded ? undefined : 3,
                  WebkitBoxOrient: mobileVerdictExpanded ? undefined : "vertical",
                  overflow: mobileVerdictExpanded ? "visible" : "hidden",
                }}>
                  {renderMd(insight.description)}
                </p>
                <button
                  onClick={() => setMobileVerdictExpanded(!mobileVerdictExpanded)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: "6px 0 0",
                    fontSize: 12, color: overallColor, fontFamily: "var(--qc-font-sans)",
                    fontWeight: 600,
                  }}
                >
                  {mobileVerdictExpanded ? "Show less ↑" : "Read more ↓"}
                </button>
              </div>
            )}

            {/* Signal chips */}
            {verdictPoints.length > 0 && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14,
                paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)",
              }}>
                {verdictPoints.map((p, i) => {
                  const dotColor =
                    p.sentiment === "positive" ? "var(--qc-up)"
                    : p.sentiment === "concern" ? "var(--qc-down)"
                    : "var(--qc-warn)";
                  return (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 999, padding: "5px 10px",
                        fontSize: 10, color: "rgba(255,255,255,0.80)",
                        fontFamily: "var(--qc-font-sans)",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                      {p.text}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </DarkGradientCard>
      </motion.div>

      {/* ── DIMENSION SCORES 2×2 ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 2px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--qc-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--qc-font-mono)" }}>
            DIMENSION SCORES
          </span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)" }}>
            {scorecardLenses.length} pillars
          </span>
        </div>
        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          {scorecardLenses.map((lens) => {
            const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
            const tColor = TIER_COLORS[scoreToTier(pct)].hex;
            const sLabel = lensStatusLabel(pct, lens.status);
            return (
              <div
                key={lens.slug}
                onClick={() => setMobileLensPopup(lens)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setMobileLensPopup(lens); }}
                style={{
                  borderRadius: 14, background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
                  padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  cursor: "pointer",
                }}
              >
                <div style={{ position: "relative", width: 48, height: 48 }}>
                  <MobileArcGauge value={pct} color={tColor} size={48} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: tColor, lineHeight: 1, fontFamily: "var(--qc-font-sans)" }}>
                      {lens.score}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: 9, color: "var(--qc-ink-3)", lineHeight: 1.3, fontFamily: "var(--qc-font-sans)",
                    whiteSpace: "pre-line",
                  }}>
                    {lens.name}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: tColor, marginTop: 3, fontFamily: "var(--qc-font-sans)" }}>
                    {sLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile lens detail popup — same content as former lens accordion expand */}
      <AnimatePresence>
        {mobileLensPopup && (() => {
          const lens = mobileLensPopup;
          const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
          const tColor = TIER_COLORS[scoreToTier(pct)].hex;
          const tSoft = TIER_COLORS[scoreToTier(pct)].soft;
          const sLabel = lensStatusLabel(pct, lens.status);
          const Icon = LENS_ICON_CONFIG[lens.slug];
          return (
            <>
              <motion.div
                key="lens-popup-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileLensPopup(null)}
                className="md:hidden"
                style={{
                  position: "fixed", inset: 0, zIndex: 60,
                  background: "rgba(0,0,0,0.40)",
                }}
              />
              <motion.div
                key="lens-popup-sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="md:hidden"
                style={{
                  position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 70,
                  background: "var(--qc-card)",
                  borderTopLeftRadius: 20, borderTopRightRadius: 20,
                  borderTop: "1px solid var(--qc-hair)",
                  padding: "12px 16px calc(20px + env(safe-area-inset-bottom))",
                  maxHeight: "75vh", overflowY: "auto",
                  boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
                }}
              >
                {/* Handle */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--qc-hair)" }} />
                </div>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  {Icon && (
                    <div style={{
                      flexShrink: 0, width: 40, height: 40, borderRadius: 10,
                      background: tSoft, display: "flex", alignItems: "center", justifyContent: "center",
                      color: tColor,
                    }}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>
                        {lens.name}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                        color: tColor, background: tSoft, fontFamily: "var(--qc-font-sans)",
                      }}>
                        {sLabel}
                      </span>
                    </div>
                    {lens.subtitle && (
                      <div style={{ fontSize: 11, color: "var(--qc-ink-3)", marginTop: 3, fontFamily: "var(--qc-font-sans)" }}>
                        {lens.subtitle}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileLensPopup(null)}
                    aria-label="Close"
                    style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                      background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "var(--qc-ink-3)", fontSize: 16, lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ height: 1, background: "var(--qc-hair)", marginBottom: 14 }} />

                {/* Detail body — same as former lens accordion expand */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 3, borderRadius: 99, flexShrink: 0, background: tColor, alignSelf: "stretch" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "inline-block", fontSize: 11, fontWeight: 600, padding: "4px 10px",
                      borderRadius: 8, color: tColor, background: tSoft, marginBottom: 10,
                      fontFamily: "var(--qc-font-sans)",
                    }}>
                      {lens.score}/{lens.max_score} — {sLabel}
                    </div>
                    <p style={{
                      fontSize: 13, color: "var(--qc-ink-2)", lineHeight: 1.65,
                      margin: 0, fontFamily: "var(--qc-font-sans)",
                    }}>
                      {renderMd(lens.description)}
                    </p>

                    {onLensClick && (
                      <button
                        onClick={() => {
                          const slug = lens.slug;
                          setMobileLensPopup(null);
                          onLensClick(slug);
                        }}
                        style={{
                          marginTop: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          padding: "12px 16px", borderRadius: 12,
                          background: "var(--qc-ink)", border: "none",
                          fontSize: 13, fontWeight: 600, color: "var(--qc-on-dark, #fff)",
                          fontFamily: "var(--qc-font-sans)", cursor: "pointer",
                        }}
                      >
                        View full analysis
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );

  // ─── Desktop Layout (unchanged) ────────────────────────────────────────────
  const desktopLayout = (
    <div className="hidden md:flex" style={{ flexDirection: "column", gap: 12 }}>
      <div className="grid grid-cols-2" style={{ gap: 12 }}>

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

            {verdictPoints.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
                {verdictPoints.map((p, i) => {
                  const dotColor =
                    p.sentiment === "positive" ? "var(--qc-up)"
                    : p.sentiment === "concern" ? "var(--qc-down)"
                    : "var(--qc-warn)";
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
                      {p.text}
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
          <div className="min-h-[340px] px-4 pt-4 pb-3" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="h-[330px]" style={{ flexShrink: 0, width: "100%", maxWidth: 520, position: "relative", overflow: "visible" }}>
              <VertexTooltip lens={hoveredLens} visible={hoveredSlug !== null} pctX={tooltipPos.pctX} pctY={tooltipPos.pctY} />
              <SVGRadar
                data={radarData}
                overallScore={overallScore}
                insightType={insight.type}
                hoveredSlug={hoveredSlug}
                onHoverVertex={(slug, pctX, pctY) => {
                  setHoveredSlug(slug);
                  if (slug !== null && pctX !== undefined && pctY !== undefined) {
                    setTooltipPos({ pctX, pctY });
                  }
                }}
                onLensClick={onLensClick}
              />
            </div>
          </div>

          <div
            className={`grid ${
              scorecardLenses.length >= 4 ? "grid-cols-4"
              : scorecardLenses.length === 3 ? "grid-cols-3"
              : scorecardLenses.length === 2 ? "grid-cols-2"
              : "grid-cols-1"
            }`}
            style={{
              borderTop: "1px solid var(--qc-hair)",
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
              overflow: "hidden",
            }}>
            {scorecardLenses.map((lens, i) => {
              const pct = lens.max_score > 0 ? (lens.score / lens.max_score) * 100 : 0;
              const barColor = lensBarColor(pct);
              const statusLabel = lensStatusLabel(pct, lens.status);
              const isLast = i === scorecardLenses.length - 1;
              const isClickable = !!onLensClick;
              const isHovered = hoveredSlug === lens.slug;

              return (
                <motion.div
                  key={lens.slug}
                  onClick={() => onLensClick?.(lens.slug)}
                  onMouseEnter={() => {
                    setHoveredSlug(lens.slug);
                    const vertexPos = vertexMap[lens.slug] || vertexMap[lens.slug.replace(/_/g, "-")] || vertexMap[lens.slug.replace(/-/g, "_")];
                    if (vertexPos) setTooltipPos(vertexPos);
                  }}
                  onMouseLeave={() => setHoveredSlug(null)}
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

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}