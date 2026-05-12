"use client";

import { type PillarKey } from "./pillar-pills";

interface PillarPieChartProps {
  activePillar: PillarKey;
  onSelect: (key: PillarKey) => void;
  weights: Record<PillarKey, number>;
  displayScore: number | null;
  rating: string | null;
}

const PILLAR_FILL: Record<PillarKey, string> = {
  M: "#1a1a18",
  O: "#1E3A2B",
  D: "#7A5A12",
};

const PILLAR_FILL_ACTIVE: Record<PillarKey, string> = {
  M: "#2563EB",
  O: "#1F7A4A",
  D: "#B4731A",
};


function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const span = endDeg - startDeg;
  if (span >= 360) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
  }
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}

export function PillarPieChart({
  activePillar, onSelect, weights, displayScore, rating,
}: PillarPieChartProps) {
  const keys: PillarKey[] = ["M", "O", "D"];
  const cx = 100, cy = 100;
  const rNormal = 72, rActive = 84, rInner = 42;

  let cursor = 0;
  const slices = keys.map((key) => {
    const deg = (weights[key] / 100) * 360;
    const start = cursor;
    cursor += deg;
    return { key, start, end: cursor };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg viewBox="0 0 200 200" width="200" height="200" style={{ overflow: "visible", flexShrink: 0 }}>
        {slices.map(({ key, start, end }) => {
          const isActive = key === activePillar;
          const r = isActive ? rActive : rNormal;
          const fill = isActive ? PILLAR_FILL_ACTIVE[key] : PILLAR_FILL[key];
          const midAngle = start + (end - start) / 2;
          const explode = isActive ? 6 : 0;
          const rad = ((midAngle - 90) * Math.PI) / 180;
          const tx = Math.cos(rad) * explode;
          const ty = Math.sin(rad) * explode;
          return (
            <g
              key={key}
              transform={`translate(${tx}, ${ty})`}
              onClick={() => onSelect(key)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={slicePath(cx, cy, r, start, end)}
                fill={fill}
                opacity={isActive ? 1 : 0.65}
                style={{ transition: "all 0.22s ease" }}
              />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={rInner} fill="var(--qc-card)" />
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          fontSize="22" fontWeight="500"
          fill="var(--qc-ink)"
          style={{ letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}
        >
          {displayScore != null ? displayScore : "—"}
        </text>
        <text
          x={cx} y={cy + 10}
          textAnchor="middle"
          fontSize="8" fontWeight="500"
          fill="var(--qc-ink-2)"
          fontFamily="'IBM Plex Mono', monospace"
          letterSpacing="0.1em"
        >
          {rating ? rating.toUpperCase() : "QC SCORE"}
        </text>
      </svg>

    </div>
  );
}
