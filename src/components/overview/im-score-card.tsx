"use client";

import { ArrowUpRight } from "lucide-react";

interface IMScoreCardProps {
  managementScore?: number | null;
  managementMax?: number | null;
  opportunityScore?: number | null;
  opportunityMax?: number | null;
  dealScore?: number | null;
  dealMax?: number | null;
}

function getRating(scorePct: number): string {
  if (scorePct >= 0.80) return "Strong Buy";
  if (scorePct >= 0.65) return "Buy";
  if (scorePct >= 0.50) return "Hold";
  if (scorePct >= 0.35) return "Underperform";
  return "Sell";
}

/** SVG semicircle tick gauge */
function TickGauge({ value, max }: { value: number; max: number }) {
  const TICKS = 40;
  const START_ANGLE = 180;
  const END_ANGLE = 0;
  const cx = 110;
  const cy = 100;
  const r = 80;
  const TICK_W = 4;
  const TICK_H_SHORT = 10;
  const TICK_H_TALL = 14;

  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const filledCount = Math.round(pct * TICKS);

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const angle = START_ANGLE - (i / (TICKS - 1)) * (START_ANGLE - END_ANGLE);
    const rad = (angle * Math.PI) / 180;
    const isTall = i === 0 || i === TICKS - 1 || i === Math.floor(TICKS / 2);
    const tickH = isTall ? TICK_H_TALL : TICK_H_SHORT;
    const ox = cx + r * Math.cos(rad);
    const oy = cy - r * Math.sin(rad);
    const ix = cx + (r - tickH) * Math.cos(rad);
    const iy = cy - (r - tickH) * Math.sin(rad);
    const filled = i < filledCount;
    const color = filled ? "#0F172B" : "#d1d5db";
    return { ox, oy, ix, iy, angle: rad, color, tickH };
  });

  return (
    <svg viewBox="0 0 220 110" className="w-full" style={{ overflow: "visible" }}>
      {ticks.map(({ ox, oy, ix, iy, angle, color }, i) => {
        const midX = (ox + ix) / 2;
        const midY = (oy + iy) / 2;
        const len = Math.sqrt((ox - ix) ** 2 + (oy - iy) ** 2);
        const deg = (angle * 180) / Math.PI - 90;
        return (
          <rect
            key={i}
            x={midX - TICK_W / 2}
            y={midY - len / 2}
            width={TICK_W}
            height={len}
            rx={2}
            fill={color}
            transform={`rotate(${-deg}, ${midX}, ${midY})`}
          />
        );
      })}
      <text x={8} y={108} fontSize={11} fill="#9ca3af" textAnchor="middle">0</text>
      <text x={212} y={108} fontSize={11} fill="#9ca3af" textAnchor="middle">100</text>
    </svg>
  );
}

/** Horizontal tick bar for score distribution */
function HorizontalTickBar({ value, max }: { value: number; max: number }) {
  const ticks = max;
  const filled = max > 0 ? Math.round(Math.min(value / max, 1) * ticks) : 0;
  return (
    <div className="flex gap-[2px] my-2 flex-wrap">
      {Array.from({ length: ticks }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 12,
            borderRadius: 1,
            backgroundColor: i < filled ? "#0F172B" : "#d1d5db",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

interface DistributionColumnProps {
  label: string;
  letter: string;
  score: number | null;
  max: number;
  description: string;
}

function DistributionColumn({ label, letter, score, max, description }: DistributionColumnProps) {
  return (
    <div className="px-5 py-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
        {label} ({letter})
      </p>
      <div className="text-2xl font-bold text-[#0F172B] leading-none">
        {score !== null ? score : "—"}
        <span className="text-base font-normal text-zinc-500 ml-1">/{max}</span>
      </div>
      <HorizontalTickBar value={score ?? 0} max={max} />
      <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

export function IMScoreCard({
  managementScore,
  managementMax,
  opportunityScore,
  opportunityMax,
  dealScore,
  dealMax,
}: IMScoreCardProps) {
  const mScore = managementScore ?? null;
  const oScore = opportunityScore ?? null;
  const dScore = dealScore ?? null;

  const mMax = managementMax ?? 20;
  const oMax = opportunityMax ?? 40;
  const dMax = dealMax ?? 40;

  let partialScore = 0;
  let partialMax = 0;
  if (mScore !== null) { partialScore += mScore; partialMax += mMax; }
  if (oScore !== null) { partialScore += oScore; partialMax += oMax; }
  if (dScore !== null) { partialScore += dScore; partialMax += dMax; }

  const gaugeMax = mMax + oMax + dMax;
  const hasAnyScore = partialMax > 0;
  const gaugeValue = hasAnyScore ? partialScore : 0;

  const displayScore = hasAnyScore ? Math.round(partialScore * 10) / 10 : null;
  const rating = hasAnyScore ? getRating(partialScore / gaugeMax) : null;

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#E2E2E2]">

        {/* Left panel: Total IM Score */}
        <div className="p-6 flex flex-col lg:w-80 flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <h5>Total IM Score</h5>
            <ArrowUpRight className="h-4 w-4 text-zinc-500 flex-shrink-0" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[260px]">
              <TickGauge value={gaugeValue} max={gaugeMax} />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center" style={{ bottom: 8 }}>
                <span className="text-4xl font-bold leading-none text-[#0F172B]">
                  {displayScore !== null ? displayScore : "—"}
                </span>
                {rating && (
                  <span className="mt-2 rounded-full bg-zinc-900 px-3 py-0.5 text-xs font-semibold text-white uppercase tracking-wide">
                    {rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: IM Score Distribution */}
        <div className="p-6 flex-1">
          <div className="flex items-start justify-between mb-4">
            <h5>IM Score Distribution</h5>
            <ArrowUpRight className="h-4 w-4 text-zinc-500 flex-shrink-0" />
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#E2E2E2]">
            <DistributionColumn
              label="Management"
              letter="M"
              score={mScore}
              max={mMax}
              description="Guidance accuracy & capital discipline"
            />
            <DistributionColumn
              label="Opportunity"
              letter="O"
              score={oScore}
              max={oMax}
              description="Industry strength & competitive position"
            />
            <DistributionColumn
              label="Deal"
              letter="D"
              score={dScore}
              max={dMax}
              description="Valuation, EPS engine & risk-reward"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
