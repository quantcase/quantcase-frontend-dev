"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  AlertTriangle,
  Scale,
  Gauge,
  Layers,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Waves,
  Crosshair,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionPanel } from "@/components/molecules/section-panel";
import { MetricTile } from "@/components/molecules/metric-tile";
import { useTechnicals } from "@/hooks/useTechnicals";

function signalColor(signal: string): string {
  const s = signal.toUpperCase();
  if (s === "STRONG_BUY" || s === "BUY" || s === "WEAK_BUY") return "text-emerald-600";
  if (s === "STRONG_SELL" || s === "SELL" || s === "WEAK_SELL") return "text-red-600";
  return "text-amber-600";
}

function directionColor(direction: string): string {
  if (direction === "UPTREND") return "text-emerald-600";
  if (direction === "DOWNTREND") return "text-red-600";
  return "text-amber-600";
}

function rsiZoneColor(zone: string): string {
  if (zone === "OVERSOLD") return "text-emerald-600";
  if (zone === "OVERBOUGHT") return "text-red-600";
  return "text-zinc-500";
}

function booleanColor(val: boolean, positiveIsTrue = true): string {
  if (positiveIsTrue) return val ? "text-emerald-600" : "text-red-600";
  return val ? "text-red-600" : "text-emerald-600";
}

function SRRangeBar({
  support,
  resistance,
  cmp,
  positionInRange,
}: {
  support: number;
  resistance: number;
  cmp: number;
  positionInRange: number;
}) {
  const clampedPos = Math.max(0, Math.min(100, positionInRange));

  return (
    <div className="px-2 py-2">
      <div className="flex justify-between mb-2">
        <span style={{ fontSize: 11, color: "#888888", fontWeight: 500 }}>SUPPORT</span>
        <span style={{ fontSize: 11, color: "#888888", fontWeight: 500 }}>RESISTANCE</span>
      </div>

      {/* Track */}
      <div className="relative h-3 rounded-full bg-zinc-100" style={{ border: "1px solid #E2E2E2" }}>
        {/* Fill from support to CMP */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-zinc-900"
          style={{ width: `${clampedPos}%` }}
        />
        {/* CMP dot marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${clampedPos}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Value labels */}
      <div className="relative mt-3" style={{ height: 20 }}>
        <span
          className="absolute left-0"
          style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}
        >
          ₹{support.toLocaleString("en-IN")}
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${clampedPos}%`, fontSize: 13, fontWeight: 600, color: "#0F172B" }}
        >
          ₹{cmp.toLocaleString("en-IN")}
        </span>
        <span
          className="absolute right-0"
          style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}
        >
          ₹{resistance.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Annotation */}
      <div className="mt-6 text-center">
        <small>
          CMP is{" "}
          <span style={{ fontWeight: 600, color: "#0F172B" }}>
            {positionInRange.toFixed(1)}%
          </span>{" "}
          from support
        </small>
      </div>
    </div>
  );
}

function MAPositionChart({
  price,
  mas,
  low52w,
  high52w,
}: {
  price: number;
  mas: { label: string; value: number }[];
  low52w: number;
  high52w: number;
}) {
  const range = high52w - low52w;
  function pct(v: number) {
    return range > 0 ? Math.max(0, Math.min(100, ((v - low52w) / range) * 100)) : 0;
  }

  const pricePct = pct(price);
  // Annotate each MA with position and whether price is above it
  const annotated = mas.map((ma) => ({
    ...ma,
    pos: pct(ma.value),
    above: price >= ma.value,
  }));

  // For top labels: assign alternating rows to avoid overlap
  // Sort by pos to detect proximity, then assign row 0/1
  const sorted = [...annotated].sort((a, b) => a.pos - b.pos);
  const labelRow: Record<string, number> = {};
  sorted.forEach((ma, i) => {
    if (i === 0) { labelRow[ma.label] = 0; return; }
    const prev = sorted[i - 1];
    labelRow[ma.label] = (ma.pos - prev.pos < 9) ? (labelRow[prev.label] === 0 ? 1 : 0) : 0;
  });

  // Track height
  const TRACK_H = 10;
  // Top area: two rows of labels (each ~32px) + gap
  const TOP_LABEL_H = 72;
  // Bottom: price callout area
  const BOT_H = 48;
  const TOTAL_H = TOP_LABEL_H + TRACK_H + BOT_H;

  return (
    <div className="px-4 py-6 select-none">
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, color: "#888888", fontWeight: 600, letterSpacing: "0.06em" }}>
            52W LOW
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>
            ₹{low52w.toLocaleString("en-IN")}
          </span>
        </div>
        {/* CMP badge centered */}
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ fontSize: 10, color: "#888888", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Current Price
          </span>
          <span
            className="inline-flex items-center rounded-md px-3 py-1 text-sm font-bold"
            style={{ background: "#0F172B", color: "#fff", letterSpacing: "0.01em" }}
          >
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: 10, color: "#888888" }}>
            {pricePct.toFixed(1)}% of 52W range
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>
            ₹{high52w.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: 11, color: "#888888", fontWeight: 600, letterSpacing: "0.06em" }}>
            52W HIGH
          </span>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full" style={{ height: TOTAL_H }}>
        <svg
          width="100%"
          height={TOTAL_H}
          style={{ overflow: "visible", display: "block" }}
          viewBox={`0 0 1000 ${TOTAL_H}`}
          preserveAspectRatio="none"
        >
          {/* MA tick lines — drawn above the track */}
          {annotated.map((ma) => {
            const x = (ma.pos / 100) * 1000;
            const row = labelRow[ma.label];
            const lineTop = row === 0 ? TOP_LABEL_H - 28 : TOP_LABEL_H - 56;
            const lineBot = TOP_LABEL_H;
            return (
              <line
                key={ma.label + "-line"}
                x1={x} y1={lineTop}
                x2={x} y2={lineBot}
                stroke={ma.above ? "#16a34a" : "#dc2626"}
                strokeWidth={1.5}
                strokeDasharray="3 2"
                opacity={0.7}
              />
            );
          })}

          {/* Track background */}
          <rect
            x={0} y={TOP_LABEL_H}
            width={1000} height={TRACK_H}
            rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill="#F1F5F9"
            stroke="#E2E2E2"
            strokeWidth={1}
          />

          {/* Fill from 0 to CMP */}
          <rect
            x={0} y={TOP_LABEL_H}
            width={(pricePct / 100) * 1000} height={TRACK_H}
            rx={TRACK_H / 2} ry={TRACK_H / 2}
            fill="#0F172B"
            opacity={0.15}
          />

          {/* MA tick marks on the track */}
          {annotated.map((ma) => {
            const x = (ma.pos / 100) * 1000;
            return (
              <rect
                key={ma.label + "-tick"}
                x={x - 1} y={TOP_LABEL_H}
                width={2} height={TRACK_H}
                fill={ma.above ? "#16a34a" : "#dc2626"}
              />
            );
          })}

          {/* CMP dot */}
          <circle
            cx={(pricePct / 100) * 1000}
            cy={TOP_LABEL_H + TRACK_H / 2}
            r={8}
            fill="#0F172B"
            stroke="white"
            strokeWidth={2.5}
          />

          {/* CMP drop line to bottom label */}
          <line
            x1={(pricePct / 100) * 1000}
            y1={TOP_LABEL_H + TRACK_H}
            x2={(pricePct / 100) * 1000}
            y2={TOP_LABEL_H + TRACK_H + 10}
            stroke="#0F172B"
            strokeWidth={1.5}
            opacity={0.3}
          />
        </svg>

        {/* MA labels rendered as HTML for crisp text — positioned above track */}
        {annotated.map((ma) => {
          const leftPct = ma.pos;
          const row = labelRow[ma.label];
          // row 0 = closer to track, row 1 = further up
          const bottomOffset = row === 0 ? TRACK_H + 32 : TRACK_H + 60;
          return (
            <div
              key={ma.label + "-lbl"}
              className="absolute flex flex-col items-center"
              style={{
                left: `${leftPct}%`,
                bottom: bottomOffset,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${ma.above ? "text-emerald-600" : "text-red-600"}`}
              >
                {ma.label}
              </span>
              <span style={{ fontSize: 11, color: "#0F172B", fontWeight: 600 }}>
                ₹{ma.value.toFixed(2)}
              </span>
            </div>
          );
        })}

        {/* CMP label below track */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${pricePct}%`,
            top: TOP_LABEL_H + TRACK_H + 12,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 10, color: "#0F172B", fontWeight: 700 }}>CMP</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 pt-3 border-t border-zinc-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-600 rounded-full" />
          <span style={{ fontSize: 11, color: "#888888" }}>Price above MA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-600 rounded-full" />
          <span style={{ fontSize: 11, color: "#888888" }}>Price below MA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow-sm" />
          <span style={{ fontSize: 11, color: "#888888" }}>Current price</span>
        </div>
      </div>
    </div>
  );
}

function TechnicalsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const { data, derived, loading, error } = useTechnicals(symbol);

  if (!symbol) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-red-600">Error: No symbol provided in query parameters</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data || !derived) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">No technical data found for {symbol}</div>
      </div>
    );
  }

  const changeIsPositive = data.price.changePercent >= 0;
  const changePrefix = changeIsPositive ? "+" : "";
  const changeDisplay = `${changePrefix}${data.price.changePercent.toFixed(2)}%`;

  const riskRewardDisplay =
    derived.downsideToSupport === 0 ? "N/A" : `${derived.riskReward.toFixed(2)}x`;

  return (
    <div className="min-h-screen bg-white pt-8 mb-8 px-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-xs font-semibold text-white">
        CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
      </div>

      {/* Company Header */}
      <div className="flex items-start justify-between gap-4 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Activity className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="space-y-1.5">
            <h2>{symbol}</h2>
            <div className="flex items-center gap-2">
              <Badge>NSE: {symbol}</Badge>
              <p>{data.meta.basicIndustry}</p>
              <p className="text-zinc-400">{data.meta.macroSector}</p>
            </div>
            
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="shrink-0">P/E {data.meta.pe}</Badge>
          <Badge className="shrink-0 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Next Earnings: {data.meta.nextEarningsDate}
          </Badge>
        </div>
      </div>

      {/* Page content */}
      <div className="container mx-auto max-w-7xl space-y-6">

        {/* Top row — 2/3 Price Action Overview + 1/3 Market Structure */}
        <div className="grid grid-cols-3 gap-6 items-stretch">

          {/* Section 1 — Price Action Overview (2 cols) */}
          <div className="col-span-2">
            <SectionPanel
              title="Price Action Overview"
              subtitle="Key price statistics from latest market data"
            >
              <div className="grid grid-cols-3 gap-4 pb-4">
                <MetricTile
                  icon={Activity}
                  label="Current Market Price"
                  value={`₹${data.price.cmp.toLocaleString("en-IN")}`}
                  change={changeDisplay}
                />
                <MetricTile
                  icon={TrendingUp}
                  label="52-Week High"
                  value={`₹${data.price.high52w.toLocaleString("en-IN")}`}
                  sublabel={`${data.price.distanceFrom52wHigh.toFixed(2)}% from high`}
                />
                <MetricTile
                  icon={TrendingDown}
                  label="52-Week Low"
                  value={`₹${data.price.low52w.toLocaleString("en-IN")}`}
                  sublabel={`+${data.price.distanceFrom52wLow.toFixed(2)}% above low`}
                />
                <MetricTile
                  icon={BarChart2}
                  label="Price / Earnings"
                  value={data.meta.pe}
                  sublabel="Trailing P/E"
                />
                <MetricTile
                  icon={Target}
                  label="S/R Range Width"
                  value={data.meta.srRange}
                  sublabel="Support to resistance band"
                />
                <MetricTile
                  icon={BarChart2}
                  label="Volume Ratio"
                  value={`${data.price.volumeRatio.toFixed(2)}x`}
                  sublabel="vs 20D avg vol"
                  change={data.price.volumeRatio >= 1.5 ? `+${data.price.volumeRatio.toFixed(2)}x` : undefined}
                />
              </div>
            </SectionPanel>
          </div>

          {/* Section 2 — Market Structure (1 col) */}
          <div className="col-span-1">
            <SectionPanel
              title="Market Structure"
              subtitle="Trend direction, Wyckoff phase & identified price pattern"
            >
              <div className="divide-y divide-zinc-100 flex flex-col h-full justify-between pb-4">

                {/* Trend Direction */}
                <div className="flex items-center justify-between py-2 px-2">
                  <div className="space-y-0.5">
                    <h6 className="uppercase tracking-wider">Trend</h6>
                    <p>Medium-term price direction</p>
                  </div>
                  <Badge className={`uppercase font-semibold ${directionColor(data.trend.direction)}`}>
                    {data.trend.direction}
                  </Badge>
                </div>

                {/* Trend Strength */}
                <div className="flex items-center justify-between py-2 px-2">
                  <div className="space-y-0.5">
                    <h6 className="uppercase tracking-wider">Trend Strength</h6>
                    <p>ADX {data.trend.adx14.toFixed(1)}</p>
                  </div>
                  <Badge className={`font-semibold ${
                    data.trend.strength === "STRONG" && data.trend.direction === "UPTREND"
                      ? "text-emerald-600"
                      : data.trend.strength === "STRONG" && data.trend.direction === "DOWNTREND"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}>
                    {data.trend.strength}
                  </Badge>
                </div>

                {/* Phase */}
                <div className="flex items-center justify-between py-2 px-2">
                  <div className="space-y-0.5">
                    <h6 className="uppercase tracking-wider">Wyckoff Phase</h6>
                    <p>Current market cycle phase</p>
                  </div>
                  <Badge className={`font-semibold ${
                    data.trend.phase === "MARK-DOWN" || data.trend.phase === "DISTRIBUTION"
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}>
                    {data.trend.phase}
                  </Badge>
                </div>

                {/* Pattern */}
                <div className="flex items-center justify-between py-2 px-2">
                  <div className="space-y-0.5">
                    <h6 className="uppercase tracking-wider">Price Pattern</h6>
                    <p>Identified chart formation</p>
                  </div>
                  <Badge>{data.patterns[0]?.name ?? "None"}</Badge>
                </div>

                {/* Market Structure */}
                <div className="flex items-center justify-between py-2 px-2">
                  <div className="space-y-0.5">
                    <h6 className="uppercase tracking-wider">Market Structure</h6>
                    <p>Price action sequence</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`text-xs font-semibold ${data.trend.structure.higherHighs ? "text-emerald-600" : "text-red-600"}`}>
                      {data.trend.structure.higherHighs ? "Higher Highs" : "Lower Highs"}
                    </span>
                    <span className={`text-xs font-semibold ${data.trend.structure.higherLows ? "text-emerald-600" : "text-red-600"}`}>
                      {data.trend.structure.higherLows ? "Higher Lows" : "Lower Lows"}
                    </span>
                  </div>
                </div>

              </div>
            </SectionPanel>
          </div>

        </div>

        {/* Section 3 — Support & Resistance Analysis */}
        <SectionPanel
          title="Support & Resistance Analysis"
          subtitle="Price position within identified support/resistance band"
        >
          <div className="grid grid-cols-3 gap-6">

            {/* Left column — SR chart + Fibonacci visual */}
            <div className="col-span-1 flex flex-col gap-4">

              {/* SR Range Bar */}
              <div>
                <SRRangeBar
                  support={derived.supportNum}
                  resistance={derived.resistanceNum}
                  cmp={data.price.cmp}
                  positionInRange={derived.positionInRange}
                />
              </div>

              {/* Fibonacci Levels Visual */}
              {data.supportResistance.fibonacci.length > 0 && (
                <div className="border-t border-zinc-100 pt-4">
                  <h6 className="uppercase tracking-wider mb-3 px-2">Fibonacci Retracement Levels</h6>
                  <div className="px-2 pb-2 space-y-2">
                    {(() => {
                      const fibs = [...data.supportResistance.fibonacci].sort((a, b) => b - a);
                      const min = fibs[fibs.length - 1];
                      const max = fibs[0];
                      const range = max - min || 1;
                      const fibLabels = ["0%", "23.6%", "38.2%", "50%", "61.8%", "78.6%", "100%"];
                      return fibs.map((level, i) => {
                        const pct = ((level - min) / range) * 100;
                        const isCurrent = data.price.cmp >= level - (range * 0.05) && data.price.cmp <= level + (range * 0.05);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span style={{ fontSize: 10, color: "#888888", width: 36, textAlign: "right", flexShrink: 0 }}>
                              {fibLabels[i] ?? ""}
                            </span>
                            <div className="flex-1 relative h-5 flex items-center">
                              <div className="absolute inset-0 rounded-sm bg-zinc-50 border border-zinc-100" />
                              <div
                                className="absolute left-0 top-0 h-full rounded-sm"
                                style={{
                                  width: `${pct}%`,
                                  background: isCurrent ? "#0F172B" : "rgba(15,23,43,0.12)",
                                }}
                              />
                              <span
                                className="relative z-10 pl-2"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: isCurrent ? "#fff" : "#0F172B",
                                  mixBlendMode: "normal",
                                }}
                              >
                                ₹{level.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — Metric tiles (2 spans, 4 per row) */}
            <div className="col-span-2 flex flex-col gap-4 pb-4">

              {/* SR + Risk metrics — 4 per row */}
              <div className="grid grid-cols-4 gap-3">
                <MetricTile
                  icon={AlertTriangle}
                  label="Support"
                  value={`₹${derived.supportNum.toLocaleString("en-IN")}`}
                  sublabel="Key floor level"
                />
                <MetricTile
                  icon={Target}
                  label="Resistance"
                  value={`₹${derived.resistanceNum.toLocaleString("en-IN")}`}
                  sublabel="Key ceiling level"
                />
                <MetricTile
                  icon={TrendingUp}
                  label="Upside to Resistance"
                  value={`+${derived.upsideToResistance.toFixed(2)}%`}
                  change={`+${derived.upsideToResistance.toFixed(2)}%`}
                />
                <MetricTile
                  icon={TrendingDown}
                  label="Downside to Support"
                  value={`-${derived.downsideToSupport.toFixed(2)}%`}
                  change={`-${derived.downsideToSupport.toFixed(2)}%`}
                />
              </div>

              {/* Pivot metrics — 4 per row */}
              <div className="grid grid-cols-4 gap-3">
                <MetricTile
                  icon={Scale}
                  label="Risk / Reward"
                  value={riskRewardDisplay}
                  sublabel="Upside ÷ Downside"
                />
                <MetricTile
                  icon={Crosshair}
                  label="Pivot Point"
                  value={`₹${data.supportResistance.pivotPoints.pivot.toFixed(2)}`}
                  sublabel="Daily pivot level"
                />
                <MetricTile
                  icon={ArrowUpRight}
                  label="Resistance R1 / R2"
                  value={`₹${data.supportResistance.pivotPoints.r1.toFixed(2)}`}
                  sublabel={`R2: ₹${data.supportResistance.pivotPoints.r2.toFixed(2)}`}
                />
                <MetricTile
                  icon={ArrowDownRight}
                  label="Support S1 / S2"
                  value={`₹${data.supportResistance.pivotPoints.s1.toFixed(2)}`}
                  sublabel={`S2: ₹${data.supportResistance.pivotPoints.s2.toFixed(2)}`}
                />
              </div>
            </div>

          </div>
        </SectionPanel>

        {/* Row 3 — Signal Scorecard (2/3) + Timeframe Matrix (1/3) */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* Signal Scorecard */}
          <div className="col-span-2">
            <SectionPanel
              title="Signal Scorecard"
              subtitle="Overall technical signal and component score breakdown"
            >
              {/* Overall signal header */}
              <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-zinc-100">
                <div>
                  <h6 className="uppercase tracking-wider mb-1">Overall Signal</h6>
                  <h3 className={signalColor(data.signals.overall)}>
                    {data.signals.overall.replace(/_/g, " ")}
                  </h3>
                </div>
                <div className="text-right">
                  <h6 className="uppercase tracking-wider mb-1">Score</h6>
                  <div className="flex items-baseline gap-1">
                    <h2 style={{ color: "#0F172B" }}>{data.signals.score.toFixed(1)}</h2>
                    <small>/100</small>
                  </div>
                </div>
              </div>

              {/* Segmented score bar */}
              <div className="px-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const threshold = (i + 1) * 5;
                    const filled = data.signals.score >= threshold;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 20,
                          borderRadius: 2,
                          backgroundColor: filled ? "#0F172B" : "#E2E8F0",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <h6>SELL</h6>
                  <h6>NEUTRAL</h6>
                  <h6>BUY</h6>
                </div>
              </div>

              {/* Component scores */}
              <div className="grid grid-cols-4 gap-3 pb-4 pt-4">
                {([
                  { icon: TrendingUp, label: "Trend Score", score: data.signals.components.trend },
                  { icon: Gauge, label: "Momentum Score", score: data.signals.components.momentum },
                  { icon: BarChart2, label: "Volume Score", score: data.signals.components.volume },
                  { icon: Waves, label: "Volatility Score", score: data.signals.components.volatility },
                ] as const).map(({ icon: Icon, label, score }) => (
                  <div key={label} className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2">
                    <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] w-fit">
                      <Icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <small className="uppercase tracking-wider">{label}</small>
                    <div className="flex items-baseline gap-1">
                      <h3>{score}</h3>
                      <small className="text-[#888888]">/100</small>
                    </div>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>

          {/* Timeframe Matrix */}
          <div className="col-span-1">
            <SectionPanel
              title="Timeframe Matrix"
              subtitle="Signal alignment across daily, weekly, monthly"
            >
              <div className="divide-y divide-zinc-100 pb-4">
                {([
                  { label: "DAILY", tf: data.timeframes.daily },
                  { label: "WEEKLY", tf: data.timeframes.weekly },
                  { label: "MONTHLY", tf: data.timeframes.monthly },
                ] as const).map(({ label, tf }) => (
                  <div key={label} className="flex items-center justify-between py-3 px-2">
                    <div>
                      <h6 className="uppercase tracking-wider">{label}</h6>
                      <p className={directionColor(tf.trend)}>{tf.trend}</p>
                    </div>
                    <Badge className={signalColor(tf.signal)}>
                      {tf.signal.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 px-2">
                  <div>
                    <h6 className="uppercase tracking-wider">Multi-TF Score</h6>
                    <p>{data.timeframes.multiTimeframeScore.toFixed(1)}/100</p>
                  </div>
                  <Badge className={signalColor(data.timeframes.multiTimeframeSignal)}>
                    {data.timeframes.multiTimeframeSignal}
                  </Badge>
                </div>
              </div>
            </SectionPanel>
          </div>

        </div>

        {/* Row 4 — Momentum Indicators (2/3) + Volume Analysis (1/3) */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* Momentum Indicators */}
          <div className="col-span-2">
            <SectionPanel
              title="Momentum Indicators"
              subtitle="RSI, MACD, and Stochastic oscillator readings"
            >
              <div className="divide-y divide-zinc-100 pb-4">

                {/* RSI */}
                <div className="flex items-center gap-4 py-4 px-2">
                  <div className="flex-1">
                    <h6 className="uppercase tracking-wider">RSI (14)</h6>
                    <p>Relative Strength Index — {data.momentum.rsi.zone}</p>
                  </div>
                  <div className="w-32">
                    <div className="relative h-2 rounded-full bg-zinc-100" style={{ border: "1px solid #E2E2E2" }}>
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-zinc-900"
                        style={{ width: `${Math.min(data.momentum.rsi.value, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <small>0</small>
                      <small>100</small>
                    </div>
                  </div>
                  <div className="text-right w-20">
                    <h4 className={rsiZoneColor(data.momentum.rsi.zone)}>
                      {data.momentum.rsi.value.toFixed(2)}
                    </h4>
                    <small>{data.momentum.rsi.zone}</small>
                  </div>
                </div>

                {/* MACD */}
                <div className="py-4 px-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-zinc-400" />
                    <h6 className="uppercase tracking-wider">MACD</h6>
                    <Badge className={data.momentum.macd.crossover === "ABOVE" ? "text-emerald-600" : "text-red-600"}>
                      {data.momentum.macd.crossover}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <MetricTile label="MACD Value" value={data.momentum.macd.value.toFixed(2)} />
                    <MetricTile label="Signal Line" value={data.momentum.macd.signal.toFixed(2)} />
                    <MetricTile
                      label="Histogram"
                      value={data.momentum.macd.histogram.toFixed(2)}
                      change={data.momentum.macd.histogram >= 0
                        ? `+${data.momentum.macd.histogram.toFixed(2)}`
                        : `${data.momentum.macd.histogram.toFixed(2)}`}
                    />
                  </div>
                </div>

                {/* Stochastic */}
                <div className="flex items-center gap-4 py-4 px-2">
                  <Layers className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="flex-1">
                    <h6 className="uppercase tracking-wider">Stochastic</h6>
                    <p>K: {data.momentum.stochastic.k.toFixed(2)} / D: {data.momentum.stochastic.d.toFixed(2)}</p>
                  </div>
                  <Badge className={
                    data.momentum.stochastic.signal === "BUY"
                      ? "text-emerald-600"
                      : data.momentum.stochastic.signal === "SELL"
                      ? "text-red-600"
                      : "text-amber-600"
                  }>
                    {data.momentum.stochastic.signal}
                  </Badge>
                </div>

              </div>
            </SectionPanel>
          </div>

          {/* Volume Analysis */}
          <div className="col-span-1">
            <SectionPanel
              title="Volume Analysis"
              subtitle="Volume levels, trend, and accumulation signals"
            >
              <div className="grid grid-cols-2 gap-3 pb-4 pt-2">
                <MetricTile
                  icon={BarChart2}
                  label="Current Volume"
                  value={data.volume.current.toLocaleString("en-IN")}
                  sublabel="Today's volume"
                />
                <MetricTile
                  icon={BarChart2}
                  label="Volume Ratio"
                  value={`${data.volume.ratio.toFixed(2)}x`}
                  sublabel="vs 20D avg"
                  change={data.volume.ratio >= 1 ? `+${data.volume.ratio.toFixed(2)}x` : `-${data.volume.ratio.toFixed(2)}x`}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-zinc-100 px-2">
                <h6 className="uppercase tracking-wider">Volume Trend</h6>
                <Badge className={
                  data.volume.trend === "INCREASING"
                    ? "text-emerald-600"
                    : data.volume.trend === "DECREASING"
                    ? "text-red-600"
                    : "text-amber-600"
                }>
                  {data.volume.trend}
                </Badge>
              </div>

              {([
                { label: "Volume Breakout", key: "volumeBreakout" as const, positiveIsTrue: true },
                { label: "Accumulation", key: "accumulation" as const, positiveIsTrue: true },
                { label: "Distribution", key: "distribution" as const, positiveIsTrue: false },
              ]).map(({ label, key, positiveIsTrue }) => (
                <div key={key} className="flex items-center justify-between py-3 px-2 border-t border-zinc-100">
                  <p>{label}</p>
                  <span className={`text-xs font-semibold ${booleanColor(data.volume.signals[key], positiveIsTrue)}`}>
                    {data.volume.signals[key] ? "YES" : "NO"}
                  </span>
                </div>
              ))}
            </SectionPanel>
          </div>

        </div>

        {/* Row 5 — Moving Averages (full-width) */}
        <SectionPanel
          title="Moving Averages"
          subtitle="Price position relative to key SMAs and EMAs"
        >
          <div className="grid grid-cols-3 gap-3 pb-4 pt-2 md:grid-cols-6">
            {([
              { label: "SMA 20", value: data.movingAverages.sma[20] },
              { label: "SMA 50", value: data.movingAverages.sma[50] },
              { label: "SMA 100", value: data.movingAverages.sma[100] },
              { label: "SMA 200", value: data.movingAverages.sma[200] },
              { label: "EMA 20", value: data.movingAverages.ema[20] },
              { label: "EMA 50", value: data.movingAverages.ema[50] },
            ]).map(({ label, value }) => {
              const above = data.price.cmp > value;
              return (
                <div key={label} className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] w-fit">
                    <TrendingUp className="h-4 w-4 text-zinc-500" />
                  </div>
                  <small className="uppercase tracking-wider text-[#888888]">{label}</small>
                  <h3>₹{value.toFixed(2)}</h3>
                  <small className={`text-[11px] font-semibold ${above ? "text-emerald-600" : "text-red-600"}`}>
                    {above ? "▲ Above" : "▼ Below"}
                  </small>
                </div>
              );
            })}
          </div>

          <hr className="border-zinc-100 mx-0" />

          <MAPositionChart
            price={data.price.cmp}
            mas={[
              { label: "SMA20", value: data.movingAverages.sma[20] },
              { label: "SMA50", value: data.movingAverages.sma[50] },
              { label: "SMA100", value: data.movingAverages.sma[100] },
              { label: "SMA200", value: data.movingAverages.sma[200] },
              { label: "EMA20", value: data.movingAverages.ema[20] },
              { label: "EMA50", value: data.movingAverages.ema[50] },
            ]}
            low52w={data.price.low52w}
            high52w={data.price.high52w}
          />

          <hr className="border-zinc-100 mx-0" />

          {/* Crossover status row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 pb-4 px-2">
            <div className="flex items-center gap-2">
              <h6 className="uppercase tracking-wider">Golden Cross</h6>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                data.movingAverages.crossovers.goldenCross
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-zinc-100 text-zinc-500 border-zinc-200"
              }`}>
                {data.movingAverages.crossovers.goldenCross ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h6 className="uppercase tracking-wider">Death Cross</h6>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                data.movingAverages.crossovers.deathCross
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-zinc-100 text-zinc-500 border-zinc-200"
              }`}>
                {data.movingAverages.crossovers.deathCross ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h6 className="uppercase tracking-wider">Last Crossover</h6>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>
                {data.movingAverages.crossovers.lastCrossoverDate}
              </span>
            </div>
            <div className="ml-auto flex gap-2">
              {([
                { label: "SMA20", above: data.movingAverages.pricePosition.aboveSMA20 },
                { label: "SMA50", above: data.movingAverages.pricePosition.aboveSMA50 },
                { label: "SMA200", above: data.movingAverages.pricePosition.aboveSMA200 },
              ]).map(({ label, above }) => (
                <span
                  key={label}
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold border ${
                    above
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {above ? "▲" : "▼"} {above ? "Above" : "Below"} {label}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-zinc-100 mx-0" />

          {/* Bollinger Bands + Volatility */}
          <div className="pt-4 pb-2 px-2">
            <h6 className="uppercase tracking-wider mb-3">Bollinger Bands &amp; Volatility</h6>
          </div>
          <div className="grid grid-cols-3 gap-3 pb-4 md:grid-cols-6">
            <MetricTile
              icon={Waves}
              label="BB Upper"
              value={`₹${data.volatility.bollingerBands.upper.toFixed(2)}`}
              sublabel="Upper band"
            />
            <MetricTile
              icon={Waves}
              label="BB Middle"
              value={`₹${data.volatility.bollingerBands.middle.toFixed(2)}`}
              sublabel="Middle band"
            />
            <MetricTile
              icon={Waves}
              label="BB Lower"
              value={`₹${data.volatility.bollingerBands.lower.toFixed(2)}`}
              sublabel="Lower band"
            />
            <MetricTile
              icon={Waves}
              label="ATR (14)"
              value={`₹${data.volatility.atr14.toFixed(2)}`}
              sublabel={`${data.volatility.atrPercent.toFixed(2)}% of price`}
            />
            <MetricTile
              icon={Waves}
              label="BB Width"
              value={data.volatility.bollingerBands.width.toFixed(2)}
              sublabel="Band width"
            />
            <div className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2">
              <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] w-fit">
                <Waves className="h-4 w-4 text-zinc-500" />
              </div>
              <small className="uppercase tracking-wider text-[#888888]">BB Squeeze</small>
              <h3>{data.volatility.bollingerBands.squeeze ? "YES" : "NO"}</h3>
              <small className={`text-[11px] font-semibold ${data.volatility.bollingerBands.squeeze ? "text-amber-600" : "text-zinc-500"}`}>
                {data.volatility.bollingerBands.squeeze ? "Squeeze Active" : "Volatility compression"}
              </small>
            </div>
          </div>
        </SectionPanel>

        {/* Row 6 — Key Insights (full-width) */}
        <SectionPanel
          title="Key Insights"
          subtitle="AI-synthesised signals from technical data"
        >
          <div className="grid grid-cols-2 gap-2 pb-4">
            {data.insights.map((insight, i) => {
              const lower = insight.toLowerCase();
              const isBullish = /bullish|buy|uptrend|breakout|accumulation|above|strong|reversion/.test(lower);
              const isBearish = /bearish|sell|downtrend|breakdown|distribution|below|weak|correction/.test(lower);
              const [trigger, ...rest] = insight.split("—");
              const conclusion = rest.join("—").trim();
              const accentColor = isBullish ? "#16a34a" : isBearish ? "#dc2626" : "#888888";
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3"
                  style={{ borderLeft: `3px solid ${accentColor}` }}
                >
                  <span
                    className="shrink-0 mt-0.5 flex items-center justify-center rounded-sm text-[10px] font-bold"
                    style={{
                      width: 18,
                      height: 18,
                      background: "rgba(15,23,43,0.06)",
                      color: "#0F172B",
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>
                      {trigger.trim()}
                    </span>
                    {conclusion && (
                      <>
                        <span style={{ color: "#d4d4d8", margin: "0 4px" }}>—</span>
                        <span style={{ fontSize: 13, color: "#888888" }}>{conclusion}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionPanel>

      </div>
    </div>
  );
}

export default function TechnicalsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-sm">Loading...</div>
        </div>
      }
    >
      <TechnicalsContent />
    </Suspense>
  );
}
