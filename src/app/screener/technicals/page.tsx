"use client";

import { Suspense, useState } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionPanel } from "@/components/molecules/section-panel";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { MetricTile } from "@/components/molecules/metric-tile";
import { useTechnicals } from "@/hooks/useTechnicals";
import { usePrices } from "@/hooks/usePrices";
import { signalColor, directionColor, rsiZoneColor, booleanColor } from "./_components/helpers";
import { SRRangeBar } from "./_components/SRRangeBar";
import { MAPositionChart } from "./_components/MAPositionChart";
import { CandlestickChart } from "./_components/CandlestickChart";
import { DecisionIntelligenceBanner } from "./_components/DecisionIntelligenceBanner";
import { TechnicalsRuleEngine, type EngineTab } from "./_components/TechnicalsRuleEngine";

const TECHNICALS_NAV = [
  { id: "section-price-chart",    label: "Price Chart" },
  { id: "section-rule-engine",    label: "Rule Engine" },
  { id: "section-price-action",   label: "Price Action" },
  { id: "section-support-resistance", label: "Support & Resistance" },
  { id: "section-signal-scorecard",   label: "Signal Scorecard" },
  { id: "section-momentum",       label: "Momentum" },
  { id: "section-moving-averages", label: "Moving Averages" },
  { id: "section-key-insights",   label: "Key Insights" },
];

function TechnicalsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [activeEngine, setActiveEngine] = useState<EngineTab>("STRUCTURE");

  const { data, derived, loading, error } = useTechnicals(symbol);
  const { prices, indicators, loading: pricesLoading, error: pricesError } = usePrices(symbol);

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV}>
        <div className="text-sm text-red-600 px-4 pt-6">Error: No symbol provided in query parameters</div>
      </ScreenerPageShell>
    );
  }

  if (loading) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV}>
        <div className="text-sm px-4 pt-6">Loading...</div>
      </ScreenerPageShell>
    );
  }

  if (error) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV}>
        <div className="text-sm text-red-600 px-4 pt-6">Error: {error}</div>
      </ScreenerPageShell>
    );
  }

  if (!data || !derived) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV}>
        <div className="text-sm px-4 pt-6">No technical data found for {symbol}</div>
      </ScreenerPageShell>
    );
  }

  const changeIsPositive = data.price.changePercent >= 0;
  const changePrefix = changeIsPositive ? "+" : "";
  const changeDisplay = `${changePrefix}${data.price.changePercent.toFixed(2)}%`;

  const riskRewardDisplay =
    derived.downsideToSupport === 0 ? "N/A" : `${derived.riskReward.toFixed(2)}x`;

  const ruleEngine = data.ruleEngine;
  const decisionIntelligence = data.decisionIntelligence;

  return (
    <ScreenerPageShell navItems={TECHNICALS_NAV}>
      <div className="mb-8 px-4 space-y-6 pt-6">

      {/* Decision Intelligence banner */}
      {decisionIntelligence && (
        <DecisionIntelligenceBanner di={decisionIntelligence} />
      )}

      {/* Price Chart + Rule Engine — equal width side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div id="section-price-chart">
          <SectionPanel title="Price Chart">
            <CandlestickChart
              prices={prices}
              indicators={indicators}
              activeEngine={activeEngine}
              loading={pricesLoading}
              error={pricesError}
            />
          </SectionPanel>
        </div>
        {ruleEngine && (
          <div id="section-rule-engine">
            <TechnicalsRuleEngine
              ruleEngine={ruleEngine}
              decisionIntelligence={decisionIntelligence}
              activeEngine={activeEngine}
              onEngineChange={setActiveEngine}
            />
          </div>
        )}
      </div>

            {/* Price Action Overview */}
            <div id="section-price-action">
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

            {/* Support & Resistance Analysis */}
            <div id="section-support-resistance">
            <SectionPanel
              title="Support & Resistance Analysis"
              subtitle="Price position within identified support/resistance band"
            >
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 flex flex-col gap-4">
                  <div>
                    <SRRangeBar
                      support={derived.supportNum}
                      resistance={derived.resistanceNum}
                      cmp={data.price.cmp}
                      positionInRange={derived.positionInRange}
                    />
                  </div>
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
                                    style={{ width: `${pct}%`, background: isCurrent ? "#0F172B" : "rgba(15,23,43,0.12)" }}
                                  />
                                  <span
                                    className="relative z-10 pl-2"
                                    style={{ fontSize: 11, fontWeight: 600, color: isCurrent ? "#fff" : "#0F172B", mixBlendMode: "normal" }}
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
                <div className="col-span-2 pb-4">
                  <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    {/* Row 1 */}
                    <div className="grid grid-cols-4 divide-x divide-dashed divide-zinc-200">
                      {[
                        { icon: AlertTriangle, label: "Support", value: `₹${derived.supportNum.toLocaleString("en-IN")}`, sub: "Key floor level", change: null },
                        { icon: Target, label: "Resistance", value: `₹${derived.resistanceNum.toLocaleString("en-IN")}`, sub: "Key ceiling level", change: null },
                        { icon: TrendingUp, label: "Upside to Resistance", value: `+${derived.upsideToResistance.toFixed(2)}%`, sub: null, change: "positive" },
                        { icon: TrendingDown, label: "Downside to Support", value: `-${derived.downsideToSupport.toFixed(2)}%`, sub: null, change: "negative" },
                      ].map(({ icon: Icon, label, value, sub, change }, i) => (
                        <div key={i} className="flex flex-col gap-1 px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-zinc-400" />
                            <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">{label}</span>
                          </div>
                          <span className={`text-lg font-semibold leading-tight ${change === "positive" ? "text-emerald-600" : change === "negative" ? "text-red-600" : "text-[#0F172B]"}`}>{value}</span>
                          {sub && <span className="text-[11px] text-[#888888]">{sub}</span>}
                        </div>
                      ))}
                    </div>
                    {/* Horizontal dashed divider */}
                    <div className="border-t border-dashed border-zinc-200" />
                    {/* Row 2 */}
                    <div className="grid grid-cols-4 divide-x divide-dashed divide-zinc-200">
                      {[
                        { icon: Scale, label: "Risk / Reward", value: riskRewardDisplay, sub: "Upside ÷ Downside" },
                        { icon: Crosshair, label: "Pivot Point", value: `₹${data.supportResistance.pivotPoints.pivot.toFixed(2)}`, sub: "Daily pivot level" },
                        { icon: ArrowUpRight, label: "Resistance R1 / R2", value: `₹${data.supportResistance.pivotPoints.r1.toFixed(2)}`, sub: `R2: ₹${data.supportResistance.pivotPoints.r2.toFixed(2)}` },
                        { icon: ArrowDownRight, label: "Support S1 / S2", value: `₹${data.supportResistance.pivotPoints.s1.toFixed(2)}`, sub: `S2: ₹${data.supportResistance.pivotPoints.s2.toFixed(2)}` },
                      ].map(({ icon: Icon, label, value, sub }, i) => (
                        <div key={i} className="flex flex-col gap-1 px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-zinc-400" />
                            <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">{label}</span>
                          </div>
                          <span className="text-lg font-semibold leading-tight text-[#0F172B]">{value}</span>
                          {sub && <span className="text-[11px] text-[#888888]">{sub}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionPanel>
            </div>

            {/* Signal Scorecard */}
            <div id="section-signal-scorecard">
            <SectionPanel
              title="Signal Scorecard"
              subtitle="Overall technical signal and component score breakdown"
            >
              <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-zinc-100">
                <div>
                  <h6 className="uppercase tracking-wider mb-1">Overall Signal</h6>
                  <h3 className={signalColor(data.signals.overall)}>{data.signals.overall.replace(/_/g, " ")}</h3>
                </div>
                <div className="text-right">
                  <h6 className="uppercase tracking-wider mb-1">Score</h6>
                  <div className="flex items-baseline gap-1">
                    <h2 style={{ color: "#0F172B" }}>{data.signals.score.toFixed(1)}</h2>
                    <small>/100</small>
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const threshold = (i + 1) * 5;
                    const filled = data.signals.score >= threshold;
                    return <div key={i} style={{ flex: 1, height: 20, borderRadius: 2, backgroundColor: filled ? "#0F172B" : "#E2E8F0" }} />;
                  })}
                </div>
                <div className="flex justify-between">
                  <h6>SELL</h6>
                  <h6>NEUTRAL</h6>
                  <h6>BUY</h6>
                </div>
              </div>
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

            {/* Momentum Indicators */}
            <div id="section-momentum">
            <SectionPanel
              title="Momentum Indicators"
              subtitle="RSI, MACD, and Stochastic oscillator readings"
            >
              <div className="pb-4">
                <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                  {/* RSI Row */}
                  <div className="flex items-center gap-4 px-4 py-3 border-b border-dashed border-zinc-200">
                    <div className="flex items-center gap-2 w-36 shrink-0">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">RSI (14)</span>
                    </div>
                    <div className="flex-1">
                      <div className="relative h-1.5 rounded-full bg-zinc-100">
                        <div className="absolute left-0 top-0 h-full rounded-full bg-zinc-900" style={{ width: `${Math.min(data.momentum.rsi.value, 100)}%` }} />
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[10px] text-zinc-400">0</span>
                        <span className="text-[10px] text-zinc-400">100</span>
                      </div>
                    </div>
                    <div className="text-right w-28 shrink-0">
                      <span className={`text-lg font-semibold ${rsiZoneColor(data.momentum.rsi.zone)}`}>{data.momentum.rsi.value.toFixed(2)}</span>
                      <p className="text-[10px] uppercase tracking-wider text-[#888888] mt-0.5">{data.momentum.rsi.zone}</p>
                    </div>
                  </div>
                  {/* MACD Row */}
                  <div className="border-b border-dashed border-zinc-200">
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                      <Zap className="h-3 w-3 text-zinc-400" />
                      <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">MACD</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${data.momentum.macd.crossover === "ABOVE" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{data.momentum.macd.crossover}</span>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-dashed divide-zinc-200 border-t border-dashed border-zinc-200">
                      {[
                        { label: "MACD Value", value: data.momentum.macd.value.toFixed(2), colored: false },
                        { label: "Signal Line", value: data.momentum.macd.signal.toFixed(2), colored: false },
                        { label: "Histogram", value: data.momentum.macd.histogram.toFixed(2), colored: true },
                      ].map(({ label, value, colored }, i) => (
                        <div key={i} className="px-4 py-3 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">{label}</span>
                          <span className={`text-lg font-semibold leading-tight ${colored ? (data.momentum.macd.histogram >= 0 ? "text-emerald-600" : "text-red-600") : "text-[#0F172B]"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Stochastic Row */}
                  <div className="flex items-center gap-4 px-4 py-3">
                    <Layers className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">Stochastic</span>
                      <p className="text-sm text-[#0F172B] font-medium mt-0.5">K: {data.momentum.stochastic.k.toFixed(2)} / D: {data.momentum.stochastic.d.toFixed(2)}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${data.momentum.stochastic.signal === "BUY" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : data.momentum.stochastic.signal === "SELL" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                      {data.momentum.stochastic.signal}
                    </span>
                  </div>
                </div>
              </div>
            </SectionPanel>
            </div>

            {/* Moving Averages */}
            <div id="section-moving-averages">
            <SectionPanel
              title="Moving Averages"
              subtitle="Price position relative to key SMAs and EMAs"
            >
              {/* MA values — compact unified card */}
              <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden mb-4">
                <div className="grid grid-cols-6 divide-x divide-dashed divide-zinc-200">
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
                      <div key={label} className="flex flex-col gap-0.5 px-4 py-3">
                        <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">{label}</span>
                        <span className="text-base font-semibold text-[#0F172B]">₹{value.toFixed(2)}</span>
                        <span className={`text-[10px] font-semibold ${above ? "text-emerald-600" : "text-red-600"}`}>{above ? "▲ Above" : "▼ Below"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MA Position Chart */}
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

              {/* Crossovers + Price Position — compact row */}
              <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden mt-4 mb-4">
                <div className="flex items-center divide-x divide-dashed divide-zinc-200">
                  {[
                    { label: "Golden Cross", active: data.movingAverages.crossovers.goldenCross, activeClass: "bg-emerald-50 text-emerald-600 border-emerald-200", inactiveClass: "bg-zinc-100 text-zinc-500 border-zinc-200" },
                    { label: "Death Cross", active: data.movingAverages.crossovers.deathCross, activeClass: "bg-red-50 text-red-600 border-red-200", inactiveClass: "bg-zinc-100 text-zinc-500 border-zinc-200" },
                  ].map(({ label, active, activeClass, inactiveClass }) => (
                    <div key={label} className="flex items-center gap-2 px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">{label}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${active ? activeClass : inactiveClass}`}>
                        {active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">Last Crossover</span>
                    <span className="text-[13px] font-medium text-[#0F172B]">{data.movingAverages.crossovers.lastCrossoverDate}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 ml-auto">
                    {([
                      { label: "SMA20", above: data.movingAverages.pricePosition.aboveSMA20 },
                      { label: "SMA50", above: data.movingAverages.pricePosition.aboveSMA50 },
                      { label: "SMA200", above: data.movingAverages.pricePosition.aboveSMA200 },
                    ]).map(({ label, above }) => (
                      <span key={label} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${above ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {above ? "▲" : "▼"} {above ? "Above" : "Below"} {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bollinger Bands & Volatility — compact unified card */}
              <div className="mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#0F172B] mb-2 block">Bollinger Bands &amp; Volatility</span>
                <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                  <div className="grid grid-cols-6 divide-x divide-dashed divide-zinc-200">
                    {[
                      { label: "BB Upper", value: `₹${data.volatility.bollingerBands.upper.toFixed(2)}`, sub: "Upper band" },
                      { label: "BB Middle", value: `₹${data.volatility.bollingerBands.middle.toFixed(2)}`, sub: "Middle band" },
                      { label: "BB Lower", value: `₹${data.volatility.bollingerBands.lower.toFixed(2)}`, sub: "Lower band" },
                      { label: "ATR (14)", value: `₹${data.volatility.atr14.toFixed(2)}`, sub: `${data.volatility.atrPercent.toFixed(2)}% of price` },
                      { label: "BB Width", value: data.volatility.bollingerBands.width.toFixed(2), sub: "Band width" },
                      { label: "BB Squeeze", value: data.volatility.bollingerBands.squeeze ? "YES" : "NO", sub: data.volatility.bollingerBands.squeeze ? "Squeeze active" : "No squeeze", squeeze: data.volatility.bollingerBands.squeeze },
                    ].map(({ label, value, sub, squeeze }, i) => (
                      <div key={i} className="flex flex-col gap-0.5 px-4 py-3">
                        <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">{label}</span>
                        <span className={`text-base font-semibold ${squeeze === true ? "text-amber-600" : squeeze === false ? "text-zinc-500" : "text-[#0F172B]"}`}>{value}</span>
                        <span className="text-[10px] text-[#888888]">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionPanel>
            </div>


      {/* Market Structure + Timeframe Matrix + Volume Analysis — 3-col row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Market Structure */}
        <SectionPanel
          title="Market Structure"
          subtitle="Trend direction, Wyckoff phase & identified price pattern"
        >
          <div className="divide-y divide-zinc-100 pb-4">
            <div className="flex items-center justify-between py-2 px-2">
              <div className="space-y-0.5">
                <h6 className="uppercase tracking-wider">Trend</h6>
                <p>Medium-term price direction</p>
              </div>
              <Badge className={`uppercase font-semibold ${directionColor(data.trend.direction)}`}>{data.trend.direction}</Badge>
            </div>
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
              }`}>{data.trend.strength}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 px-2">
              <div className="space-y-0.5">
                <h6 className="uppercase tracking-wider">Wyckoff Phase</h6>
                <p>Current market cycle phase</p>
              </div>
              <Badge className={`font-semibold ${data.trend.phase === "MARK-DOWN" || data.trend.phase === "DISTRIBUTION" ? "text-red-600" : "text-emerald-600"}`}>{data.trend.phase}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 px-2">
              <div className="space-y-0.5">
                <h6 className="uppercase tracking-wider">Price Pattern</h6>
                <p>Identified chart formation</p>
              </div>
              <Badge>{data.patterns[0]?.name ?? "None"}</Badge>
            </div>
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

        {/* Timeframe Matrix */}
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
                <Badge className={signalColor(tf.signal)}>{tf.signal.replace(/_/g, " ")}</Badge>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 px-2">
              <div>
                <h6 className="uppercase tracking-wider">Multi-TF Score</h6>
                <p>{data.timeframes.multiTimeframeScore.toFixed(1)}/100</p>
              </div>
              <Badge className={signalColor(data.timeframes.multiTimeframeSignal)}>{data.timeframes.multiTimeframeSignal}</Badge>
            </div>
          </div>
        </SectionPanel>

        {/* Volume Analysis */}
        <SectionPanel
          title="Volume Analysis"
          subtitle="Volume levels, trend, and accumulation signals"
        >
          <div className="grid grid-cols-2 gap-3 pb-4 pt-2">
            <MetricTile icon={BarChart2} label="Current Volume" value={data.volume.current.toLocaleString("en-IN")} sublabel="Today's volume" />
            <MetricTile icon={BarChart2} label="Volume Ratio" value={`${data.volume.ratio.toFixed(2)}x`} sublabel="vs 20D avg" change={data.volume.ratio >= 1 ? `+${data.volume.ratio.toFixed(2)}x` : `-${data.volume.ratio.toFixed(2)}x`} />
          </div>
          <div className="flex items-center justify-between py-3 border-t border-zinc-100 px-2">
            <h6 className="uppercase tracking-wider">Volume Trend</h6>
            <Badge className={data.volume.trend === "INCREASING" ? "text-emerald-600" : data.volume.trend === "DECREASING" ? "text-red-600" : "text-amber-600"}>
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
      </div>{/* end 3-col row */}

      </div>{/* end mb-8 px-4 space-y-6 */}
    </ScreenerPageShell>
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
