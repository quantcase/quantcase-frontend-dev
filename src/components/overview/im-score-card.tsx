"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Plus } from "lucide-react";

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

/** SVG semicircle tick gauge matching the Figma design */
function TickGauge({ value, max }: { value: number; max: number }) {
  const TICKS = 40;
  const START_ANGLE = 180; // degrees, left
  const END_ANGLE = 0;     // degrees, right
  const cx = 110;
  const cy = 100;
  const r = 80;
  const TICK_W = 4;
  const TICK_H_SHORT = 10;
  const TICK_H_TALL = 14;

  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const filledCount = Math.round(pct * TICKS);

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    // angle goes from 180° down to 0° as i increases
    const angle = START_ANGLE - (i / (TICKS - 1)) * (START_ANGLE - END_ANGLE);
    const rad = (angle * Math.PI) / 180;

    const isTall = i === 0 || i === TICKS - 1 || i === Math.floor(TICKS / 2);
    const tickH = isTall ? TICK_H_TALL : TICK_H_SHORT;

    // outer point
    const ox = cx + r * Math.cos(rad);
    const oy = cy - r * Math.sin(rad);
    // inner point (toward center)
    const ix = cx + (r - tickH) * Math.cos(rad);
    const iy = cy - (r - tickH) * Math.sin(rad);

    const filled = i < filledCount;
    const color = filled ? "#22c55e" : "#d1d5db";

    return { ox, oy, ix, iy, angle: rad, color, tickH };
  });

  return (
    <svg viewBox="0 0 220 110" className="w-full" style={{ overflow: "visible" }}>
      {ticks.map(({ ox, oy, ix, iy, angle, color }, i) => {
        // draw a thin rotated rect centered on the radial line
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
      {/* 0 label */}
      <text x={8} y={108} fontSize={11} fill="#9ca3af" textAnchor="middle">0</text>
      {/* 100 label */}
      <text x={212} y={108} fontSize={11} fill="#9ca3af" textAnchor="middle">100</text>
    </svg>
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

  const scoreBreakdown = [
    { label: "Management (M)", max: mMax, value: mScore, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Opportunity (O)", max: oMax, value: oScore, color: "text-blue-600 dark:text-blue-400" },
    { label: "Deal (D)",        max: dMax, value: dScore, color: "text-orange-500 dark:text-orange-400" },
  ];

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Total IM Score
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gauge */}
        <div className="relative px-2">
          <TickGauge value={gaugeValue} max={gaugeMax} />
          {/* Score + rating centered at the bottom of the arc */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center" style={{ bottom: 12 }}>
            <span className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
              {displayScore !== null ? displayScore : "—"}
            </span>
            {rating && (
              <span className="mt-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                {rating}
              </span>
            )}
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          {scoreBreakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">/ {item.max}</span>
                <span className={`w-6 text-right font-semibold ${item.color}`}>
                  {item.value !== null ? item.value : "—"}
                </span>
                <button className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
