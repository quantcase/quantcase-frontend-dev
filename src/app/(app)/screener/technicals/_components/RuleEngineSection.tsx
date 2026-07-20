import React from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import type {
  RuleEngine,
  RelativeStrengthSingle,
  SectorVsIndexStrength,
  SmaDistancePct,
  StructureEngineData,
  TrendEngineData,
  TimingEngineData,
  DominanceEngineData,
  DirectionalBiasIndicator,
  DecisionIntelligence,
  DecisionIntelligenceIndicator,
  IndicatorId,
} from "@/types/technicals";
import { describeSectorLeadership, watchoutFor } from "@/lib/technicals-indicators";
import type { EngineTab } from "./TechnicalsRuleEngine";

function smaPositionColor(pos: string): string {
  if (pos === "ABOVE") return "var(--qc-up)";
  if (pos === "BELOW") return "var(--qc-down)";
  return "var(--qc-ink-2)";
}

function engineSignalColor(signal: string | null): string {
  if (!signal) return "var(--qc-ink-2)";
  const s = signal.toUpperCase();
  if (s === "OUTPERFORMING" || s === "ABOVE_AVERAGE" || s === "POSITIVE" || s === "CONTRACTING") return "var(--qc-up)";
  if (s === "UNDERPERFORMING" || s === "BELOW_AVERAGE" || s === "NEGATIVE" || s === "EXPANDING") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function getBadgeVariant(signal: string | null): { textColor: string; bgColor: string } {
  if (!signal || signal === "N/A") return { textColor: "var(--qc-ink-2)", bgColor: "var(--qc-section)" };
  const s = signal.toUpperCase();

  const positive = ["OUTPERFORMING", "BULLISH", "ABOVE_AVERAGE", "POSITIVE", "MARKUP_PHASE",
                    "CONTRACTING", "STRONG_TREND", "STRONG_LEADERSHIP", "ACCUMULATION",
                    "MOSTLY BULLISH", "ABOVE AVERAGE"];
  const negative = ["UNDERPERFORMING", "BEARISH", "BELOW_AVERAGE", "NEGATIVE", "DISTRIBUTION",
                    "MARK_DOWN", "MOSTLY BEARISH", "BELOW AVERAGE"];
  const state    = ["EXPANDING", "IN_DEMAND_ZONE", "IN DEMAND ZONE", "PENDING"];

  if (positive.some(p => s.includes(p))) return { textColor: "var(--qc-up)", bgColor: "var(--qc-up-soft)" };
  if (negative.some(n => s.includes(n))) return { textColor: "var(--qc-down)", bgColor: "var(--qc-down-soft)" };
  if (state.some(st => s.includes(st)))  return { textColor: "var(--qc-blue)", bgColor: "var(--qc-blue-soft)" };
  return { textColor: "var(--qc-warn)", bgColor: "var(--qc-warn-soft)" };
}

function deriveTrendDirectionBadge(db: DirectionalBiasIndicator): string {
  const positions = [db.priceVsSMA20, db.priceVsSMA50, db.priceVsSMA100, db.priceVsSMA200];
  const aboveCount = positions.filter(p => p === "ABOVE").length;
  if (aboveCount === 4) return "BULLISH";
  if (aboveCount === 3) return "MOSTLY BULLISH";
  if (aboveCount === 1) return "MOSTLY BEARISH";
  if (aboveCount === 0) return "BEARISH";
  return "MIXED";
}

function MetricPill({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5"
      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
    >
      <span style={{ fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", fontWeight: "var(--qc-w-medium)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--qc-font-mono)" }}>{label}</span>
      <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: valueColor ?? "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>{value}</span>
    </span>
  );
}

function EngineCard({
  title,
  subtitle,
  badge,
  metrics,
  output,
  watchout,
  /** Shown when `output` is null. Pass null to omit the block entirely. */
  emptyOutput = "No data available.",
}: {
  title: string;
  subtitle?: string;
  badge?: string | null;
  metrics?: React.ReactNode;
  output: string | null;
  watchout: string | null;
  emptyOutput?: string | null;
}) {
  const variant = getBadgeVariant(badge ?? null);
  const badgeLabel = badge ? badge.replace(/_/g, " ") : null;

  return (
    <div
      className="rounded-[10px] border px-4 py-3 space-y-3"
      style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: "var(--qc-ink)" }}
          >{title}</span>
          {subtitle && (
            <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", fontWeight: "var(--qc-w-regular)", fontFamily: "var(--qc-font-sans)" }}>{subtitle}</span>
          )}
        </div>
        {badgeLabel && (
          <span
            className="shrink-0 inline-flex items-center rounded-[4px] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] font-semibold"
            style={{ background: variant.bgColor, color: variant.textColor }}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      {/* METRIC PILLS */}
      {metrics && <div className="flex flex-wrap gap-1.5">{metrics}</div>}

      {/* INTERPRETATION */}
      {(output || emptyOutput) && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
            <span style={{ fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--qc-font-mono)" }}>
              Interpretation
            </span>
          </div>
          {output ? (
            <p style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.6, fontFamily: "var(--qc-font-sans)" }}>
              {output.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          ) : (
            <p style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-sans)" }}>{emptyOutput}</p>
          )}
        </div>
      )}

      {/* WATCHOUTS */}
      {watchout && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" style={{ color: "var(--qc-warn)" }} />
            <span style={{ fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--qc-font-mono)" }}>
              Watchouts
            </span>
          </div>
          <div className="rounded-[6px] px-3 py-2" style={{ background: "var(--qc-warn-soft)" }}>
            <p style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-warn)", lineHeight: 1.6, fontFamily: "var(--qc-font-sans)" }}>{watchout}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
}

function StructureEnginePanel({ engine, perspective, indicators, avgVolume20d, wyckoffGrowthWarning }: { engine: StructureEngineData; perspective: "GROWTH" | "VALUE"; indicators: DecisionIntelligenceIndicator[] | undefined; avgVolume20d?: number; wyckoffGrowthWarning?: string | null }) {
  const mp = engine.marketStructure;
  const cp = engine.participation;
  const pa = engine.priceStructure;
  const isGrowth = perspective === "GROWTH";

  return (
    <div className="space-y-4">
      {/* Surfaced here — next to the Wyckoff phase it contradicts — rather than
          duplicated alongside the stock-type chip. */}
      {wyckoffGrowthWarning && (
        <div className="flex items-start gap-2 rounded-[8px] px-3 py-2" style={{ background: "var(--qc-warn-soft)" }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "var(--qc-warn)" }} />
          <p style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-warn)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>
            {wyckoffGrowthWarning}
          </p>
        </div>
      )}
      <EngineCard
        title="Market Structure"
        subtitle="Wyckoff Phase"
        badge={mp.wyckoffPhase}
        output={isGrowth ? mp.growthOutput : mp.valueOutput}
        watchout={watchoutFor(indicators, "market_structure", perspective)}
      />
      <EngineCard
        title="Capital Participation"
        subtitle="CMF + Volume Signal"
        badge={cp.volumeSignal}
        metrics={<>
          <MetricPill label="CMF" value={cp.cmf.toFixed(4)} valueColor={cp.cmf >= 0 ? "var(--qc-up)" : "var(--qc-down)"} />
          <MetricPill label="CMF Signal" value={cp.cmfSignal} valueColor={engineSignalColor(cp.cmfSignal)} />
          {avgVolume20d != null && <MetricPill label="Avg Vol (20D)" value={formatVolume(avgVolume20d)} valueColor="var(--qc-ink)" />}
        </>}
        output={isGrowth ? cp.growthOutput : cp.valueOutput}
        watchout={watchoutFor(indicators, "capital_participation", perspective)}
      />
      <EngineCard
        title="Price Structure"
        subtitle="Support & Resistance"
        badge={pa.zone ?? "N/A"}
        output={isGrowth ? pa.growthOutput : pa.valueOutput}
        watchout={watchoutFor(indicators, "price_architecture", perspective)}
      />
    </div>
  );
}

function deriveTrendSummaryLine(db: DirectionalBiasIndicator): string {
  function ud(pos: string) { return pos === "ABOVE" ? "Up" : "Down"; }
  const regime = db.priceVsSMA200 === "ABOVE" ? "Bullish Regime" : "Bearish Regime";
  const st = ud(db.priceVsSMA20);
  const it = ud(db.priceVsSMA50);
  const lt = ud(db.priceVsSMA100);

  if (st === it && it === lt) {
    return `${regime} with Short Term, Intermediate & Long Term trend all ${st}.`;
  }
  if (st === it) {
    return `${regime} with Short Term & Intermediate trend ${st}, but Long Term trend is ${lt}.`;
  }
  if (it === lt) {
    return `${regime} with Short Term trend ${st}, but Intermediate & Long Term trend is ${it}.`;
  }
  return `${regime} with Short Term trend ${st}. Intermediate trend is ${it} and Long Term trend is ${lt}.`;
}

/** `priceVsSMA*` stays the source of truth for direction; the pct adds magnitude. */
function smaPillValue(position: string, distancePct: number | null | undefined): string {
  const dir = position === "ABOVE" ? "UP" : "DOWN";
  if (distancePct == null) return dir;
  const sign = distancePct >= 0 ? "+" : "";
  return `${dir} ${sign}${distancePct.toFixed(1)}%`;
}

function TrendEnginePanel({ engine, perspective, indicators, smaDistancePct }: { engine: TrendEngineData; perspective: "GROWTH" | "VALUE"; indicators: DecisionIntelligenceIndicator[] | undefined; smaDistancePct?: SmaDistancePct | null }) {
  const db = engine.trendDirection;
  const tm = engine.trendQuality;
  const isGrowth = perspective === "GROWTH";
  const summaryLine = deriveTrendSummaryLine(db);
  const trendOutput = summaryLine;

  return (
    <div className="space-y-4">
      <EngineCard
        title="Trend Direction"
        subtitle="SMA 20 / 50 / 100 / 200"
        badge={deriveTrendDirectionBadge(db)}
        metrics={<>
          <MetricPill label="SMA 20" value={smaPillValue(db.priceVsSMA20, smaDistancePct?.sma20)} valueColor={smaPositionColor(db.priceVsSMA20)} />
          <MetricPill label="SMA 50" value={smaPillValue(db.priceVsSMA50, smaDistancePct?.sma50)} valueColor={smaPositionColor(db.priceVsSMA50)} />
          <MetricPill label="SMA 100" value={smaPillValue(db.priceVsSMA100, smaDistancePct?.sma100)} valueColor={smaPositionColor(db.priceVsSMA100)} />
          <MetricPill label="SMA 200" value={smaPillValue(db.priceVsSMA200, smaDistancePct?.sma200)} valueColor={smaPositionColor(db.priceVsSMA200)} />
        </>}
        output={trendOutput}
        watchout={watchoutFor(indicators, "trend_direction", perspective)}
      />
      <EngineCard
        title="Trend Quality"
        subtitle="ADX (14)"
        badge={tm.condition}
        metrics={<>
          <MetricPill label="ADX" value={tm.adx.toFixed(2)} />
          <MetricPill label="ADX Trend" value={tm.adxTrend} valueColor={tm.adxTrend === "RISING" ? "var(--qc-up)" : "var(--qc-down)"} />
          <MetricPill label="Band" value={tm.adxBand} valueColor="var(--qc-ink-2)" />
        </>}
        output={isGrowth ? tm.growthOutput : tm.valueOutput}
        watchout={watchoutFor(indicators, "trend_quality", perspective)}
      />
    </div>
  );
}

function TimingEnginePanel({ engine, perspective, indicators }: { engine: TimingEngineData; perspective: "GROWTH" | "VALUE"; indicators: DecisionIntelligenceIndicator[] | undefined }) {
  const mt = engine.momentum;
  const vr = engine.volatility;
  const isGrowth = perspective === "GROWTH";

  function rsiLabel(zone: string): string {
    if (zone === "0-30") return "OVERSOLD";
    if (zone === "70-100") return "OVERBOUGHT";
    return zone;
  }

  return (
    <div className="space-y-4">
      <EngineCard
        title="Momentum"
        subtitle="RSI (14)"
        badge={rsiLabel(mt.rsiZone)}
        metrics={<MetricPill label="RSI" value={mt.rsi.toFixed(2)} valueColor={mt.rsiZone === "0-30" ? "var(--qc-up)" : mt.rsiZone === "70-100" ? "var(--qc-down)" : "var(--qc-ink)"} />}
        output={isGrowth ? mt.growthOutput : mt.valueOutput}
        watchout={watchoutFor(indicators, "momentum", perspective)}
      />
      <EngineCard
        title="Volatility"
        subtitle="Bollinger Band Width (20,2)"
        badge={vr.condition}
        metrics={<>
          <MetricPill label="BB Width" value={vr.bbWidth.toFixed(4)} />
          <MetricPill label="Direction" value={vr.expanding ? "Expanding" : "Contracting"} valueColor={vr.expanding ? "var(--qc-down)" : "var(--qc-up)"} />
        </>}
        output={isGrowth ? vr.growthOutput : vr.valueOutput}
        watchout={watchoutFor(indicators, "volatility", perspective)}
      />
    </div>
  );
}

function RelativeStrengthCard({ title, subtitle, rs, perspective, indicatorId, indicators, emptyOutput }: { title: string; subtitle: string; rs: RelativeStrengthSingle; perspective: "GROWTH" | "VALUE"; indicatorId: IndicatorId; indicators: DecisionIntelligenceIndicator[] | undefined; emptyOutput?: string | null }) {
  const isGrowth = perspective === "GROWTH";
  const hasData = rs.signal !== null;
  return (
    <EngineCard
      title={title}
      subtitle={subtitle}
      badge={rs.signal ?? "N/A"}
      metrics={hasData ? <>
        <MetricPill label="CRS" value={rs.crsValue?.toFixed(2) ?? "—"} />
        <MetricPill label="Prev CRS" value={rs.prevCrsValue?.toFixed(2) ?? "—"} />
      </> : undefined}
      output={isGrowth ? rs.growthOutput : rs.valueOutput}
      watchout={watchoutFor(indicators, indicatorId, perspective)}
      emptyOutput={emptyOutput}
    />
  );
}

/**
 * Third RS leg: is the sector itself leading the market? Ships no narrative or
 * watchouts, so the interpretation is derived client-side.
 */
function SectorVsNiftyCard({ rs }: { rs: SectorVsIndexStrength }) {
  return (
    <EngineCard
      title="Sector vs Nifty"
      subtitle={rs.sectorTicker ?? "Sector Index"}
      badge={rs.signal ?? "N/A"}
      metrics={rs.signal ? <>
        <MetricPill label="CRS" value={rs.crsValue?.toFixed(2) ?? "—"} />
        <MetricPill label="Prev CRS" value={rs.prevCrsValue?.toFixed(2) ?? "—"} />
      </> : undefined}
      output={describeSectorLeadership(rs)}
      watchout={null}
      emptyOutput={null}
    />
  );
}

function DominanceEnginePanel({ engine, perspective, indicators }: { engine: DominanceEngineData; perspective: "GROWTH" | "VALUE"; indicators: DecisionIntelligenceIndicator[] | undefined }) {
  const sectorNifty = engine.leadership.vsSectorNifty;

  return (
    <div className="space-y-4">
      <RelativeStrengthCard title="Relative Strength vs Nifty" subtitle="Price Ratio vs Index" rs={engine.leadership.vsNifty} perspective={perspective} indicatorId="relative_strength" indicators={indicators} />
      <RelativeStrengthCard title="Relative Strength vs Sector" subtitle="Price Ratio vs Sector ETF" rs={engine.leadership.vsSector} perspective={perspective} indicatorId="relative_strength" indicators={indicators} emptyOutput="Sector data unavailable." />
      {/* Absent for sectors with no NSE index — render nothing rather than an empty card. */}
      {sectorNifty && <SectorVsNiftyCard rs={sectorNifty} />}
    </div>
  );
}

export function RuleEngineSection({
  ruleEngine,
  decisionIntelligence,
  activeEngine,
  activePerspective,
  avgVolume20d,
  smaDistancePct,
  wyckoffGrowthWarning,
}: {
  ruleEngine: RuleEngine;
  decisionIntelligence?: DecisionIntelligence;
  activeEngine: EngineTab;
  activePerspective: "GROWTH" | "VALUE";
  avgVolume20d?: number;
  smaDistancePct?: SmaDistancePct | null;
  wyckoffGrowthWarning?: string | null;
}) {
  const diIndicators = decisionIntelligence?.indicators;

  return (
    <>
      {activeEngine === "STRUCTURE" && (
        <StructureEnginePanel engine={ruleEngine.structureEngine} perspective={activePerspective} indicators={diIndicators} avgVolume20d={avgVolume20d} wyckoffGrowthWarning={wyckoffGrowthWarning} />
      )}
      {activeEngine === "TREND" && (
        <TrendEnginePanel engine={ruleEngine.trendEngine} perspective={activePerspective} indicators={diIndicators} smaDistancePct={smaDistancePct} />
      )}
      {activeEngine === "TIMING" && (
        <TimingEnginePanel engine={ruleEngine.timingEngine} perspective={activePerspective} indicators={diIndicators} />
      )}
      {activeEngine === "RELATIVE STRENGTH" && (
        <DominanceEnginePanel engine={ruleEngine.dominanceEngine} perspective={activePerspective} indicators={diIndicators} />
      )}
    </>
  );
}
