"use client";

import type { TechnicalsResponse } from "@/types/technicals";

function formatPrice(val: number | null | undefined): string {
  if (val == null) return "—";
  return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function signalColor(signal: string | null | undefined): string {
  if (!signal) return "text-[#888888]";
  const s = signal.toUpperCase();
  if (s.includes("UPTREND") || s.includes("STRONG") || s.includes("OUTPERFORM") || s.includes("OVERSOLD") || s.includes("CONFIRMED")) return "text-emerald-600";
  if (s.includes("DOWNTREND") || s.includes("WEAK") || s.includes("UNDERPERFORM") || s.includes("OVERBOUGHT") || s.includes("DISTRIBUTION")) return "text-red-600";
  if (s.includes("SIDEWAYS") || s.includes("NEUTRAL") || s.includes("CONSOLIDAT") || s.includes("EARLY") || s.includes("ACCUMULATION") || s.includes("MID")) return "text-amber-600";
  return "text-[#888888]";
}

function humanizeSignal(val: string | null | undefined): string {
  if (!val) return "—";
  return val
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SummaryTileProps {
  label: string;
  value: string;
  sublabel: string;
}

function SummaryTile({ label, value, sublabel }: SummaryTileProps) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3 flex flex-col gap-1 flex-1 min-w-0">
      <small className="text-[10px] uppercase tracking-wider text-[#888888] font-medium">{label}</small>
      <p className={`text-sm font-semibold leading-tight ${signalColor(value)}`}>{humanizeSignal(value)}</p>
      <small className="text-[11px] text-[#888888]">{sublabel}</small>
    </div>
  );
}

interface Props {
  data: TechnicalsResponse;
}

export function TechnicalsCard({ data }: Props) {
  const sr = data.supportResistance;
  const ma = data.movingAverages;
  const price = data.price;
  const trend = data.trend;
  const re = data.ruleEngine;

  // Support / Resistance values
  const supports = sr.static.support.slice(0, 2);
  const resistances = sr.static.resistance.slice(0, 2);

  // Structure label
  const structureLabel = re?.structureEngine.priceStructure.zone
    ?? (trend.phase ? humanizeSignal(trend.phase) : "—");
  const structureSub = re?.structureEngine.marketStructure.wyckoffPhase
    ? `${humanizeSignal(re.structureEngine.marketStructure.wyckoffPhase)} phase`
    : "Base building near support";

  // Trend label
  const trendLabel = trend.direction ?? "—";
  const trendSub = (() => {
    const above: string[] = [];
    const below: string[] = [];
    const pos = ma.pricePosition;
    if (pos.aboveSMA20) above.push("SMA20"); else below.push("SMA20");
    if (pos.aboveSMA50) above.push("SMA50"); else below.push("SMA50");
    if (pos.aboveSMA200) above.push("SMA200"); else below.push("SMA200");
    if (below.length > 0) return `Below ${below.join(", ")}`;
    if (above.length > 0) return `Above ${above.join(", ")}`;
    return "—";
  })();

  // Timing label (momentum)
  const rsi = data.momentum.rsi;
  const timingLabel = re?.timingEngine.momentum.rsiZone ?? rsi.zone ?? "—";
  const timingSub = re?.timingEngine.momentum.rsi != null
    ? `RSI ${re.timingEngine.momentum.rsi.toFixed(0)} · ${humanizeSignal(rsi.trend)}`
    : `RSI ${rsi.value.toFixed(0)} · ${humanizeSignal(rsi.trend)}`;

  // Relative strength label
  const rsVsNifty = re?.dominanceEngine.leadership.vsNifty.signal;
  const rsVsSector = re?.dominanceEngine.leadership.vsSector.signal;
  const relStrengthLabel = rsVsNifty ?? data.signals.overall;
  const relStrengthSub = rsVsSector ? `vs Sector: ${humanizeSignal(rsVsSector)}` : "vs Nifty & sector";

  // Decision context summary
  const summary = re?.decisionContext.summary ?? data.insights[0] ?? "";

  // SMA rows
  const smas: { label: string; val: number; above: boolean }[] = [
    { label: "SMA 20", val: ma.sma[20], above: ma.pricePosition.aboveSMA20 },
    { label: "SMA 50", val: ma.sma[50], above: ma.pricePosition.aboveSMA50 },
    { label: "SMA 100", val: ma.sma[100], above: price.cmp >= ma.sma[100] },
    { label: "SMA 200", val: ma.sma[200], above: ma.pricePosition.aboveSMA200 },
  ];

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[#0F172B]">
          Technicals
        </p>
      </div>

      <div className="px-5 pb-5 space-y-4">

        {/* Insight summary line */}
        {summary && (
          <p className="text-sm text-[#888888] leading-snug">
            {summary}
          </p>
        )}

        {/* 4-up summary tiles */}
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <SummaryTile label="Structure" value={structureLabel} sublabel={structureSub} />
          <SummaryTile label="Trend" value={trendLabel} sublabel={trendSub} />
          <SummaryTile label="Timing" value={timingLabel} sublabel={timingSub} />
          <SummaryTile label="Relative Strength" value={relStrengthLabel} sublabel={relStrengthSub} />
        </div>

        {/* 3-column data panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Support & Resistance */}
          <div className="rounded-[10px] border border-[#E2E2E2] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#0F172B]">Support &amp; resistance</p>
            </div>
            <div className="space-y-2">
              {resistances.slice().reverse().map((r, i) => (
                <div key={`r${i}`} className="flex items-center justify-between">
                  <span className="text-sm text-[#121212]">Resistance {resistances.length - i}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(r)}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-600 text-white">
                      R{resistances.length - i}
                    </span>
                  </div>
                </div>
              ))}
              {supports.map((s, i) => (
                <div key={`s${i}`} className="flex items-center justify-between">
                  <span className="text-sm text-[#121212]">Support {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(s)}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white">
                      S{i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moving Averages */}
          <div className="rounded-[10px] border border-[#E2E2E2] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#0F172B]">Moving averages</p>
            </div>
            <div className="space-y-2">
              {smas.map((sma) => (
                <div key={sma.label} className="flex items-center justify-between">
                  <span className="text-sm text-[#121212]">{sma.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(sma.val)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${sma.above ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                      {sma.above ? "Above" : "Below"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Levels */}
          <div className="rounded-[10px] border border-[#E2E2E2] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#0F172B]">Price levels</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#121212]">All time high</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(price.high52w)}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500 text-white">ATH</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#121212]">52W high</span>
                <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(price.high52w)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#121212]">52W low</span>
                <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(price.low52w)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#121212]">CMP</span>
                <span className="text-sm font-semibold text-[#0F172B]">{formatPrice(price.cmp)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
