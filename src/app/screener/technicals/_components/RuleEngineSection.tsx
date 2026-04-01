import React from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import type {
  RuleEngine,
  RelativeStrengthSingle,
  StructureEngineData,
  TrendEngineData,
  TimingEngineData,
  DominanceEngineData,
  DirectionalBiasIndicator,
  DecisionIntelligence,
  DecisionIntelligenceIndicator,
} from "@/types/technicals";

function resolveWatchout(
  indicators: DecisionIntelligenceIndicator[] | undefined,
  name: string,
  perspective: "GROWTH" | "VALUE",
  fallback: string | null
): string | null {
  if (indicators) {
    const match = indicators.find((ind) => ind.name === name);
    if (match) {
      return perspective === "GROWTH" ? match.growthWatchout : match.valueWatchout;
    }
  }
  return fallback;
}

const ENGINE_TABS = ["STRUCTURE", "TREND", "TIMING", "DOMINANCE"] as const;

function smaPositionColor(pos: string): string {
  if (pos === "ABOVE") return "text-emerald-600";
  if (pos === "BELOW") return "text-red-600";
  return "text-zinc-500";
}

function engineSignalColor(signal: string | null): string {
  if (!signal) return "text-zinc-500";
  const s = signal.toUpperCase();
  if (s === "OUTPERFORMING" || s === "ABOVE_AVERAGE" || s === "POSITIVE" || s === "CONTRACTING") return "text-emerald-600";
  if (s === "UNDERPERFORMING" || s === "BELOW_AVERAGE" || s === "NEGATIVE" || s === "EXPANDING") return "text-red-600";
  return "text-amber-600";
}

function getBadgeVariant(signal: string | null): { text: string; bg: string } {
  if (!signal || signal === "N/A") return { text: "text-zinc-500", bg: "bg-zinc-100" };
  const s = signal.toUpperCase();

  const positive = ["OUTPERFORMING", "BULLISH", "ABOVE_AVERAGE", "POSITIVE", "MARKUP_PHASE",
                    "CONTRACTING", "STRONG_TREND", "STRONG_LEADERSHIP", "ACCUMULATION",
                    "MOSTLY BULLISH", "ABOVE AVERAGE"];
  const negative = ["UNDERPERFORMING", "BEARISH", "BELOW_AVERAGE", "NEGATIVE", "DISTRIBUTION",
                    "MARK_DOWN", "MOSTLY BEARISH", "BELOW AVERAGE"];
  const state    = ["EXPANDING", "IN_DEMAND_ZONE", "IN DEMAND ZONE", "PENDING"];

  if (positive.some(p => s.includes(p))) return { text: "text-emerald-700", bg: "bg-emerald-50" };
  if (negative.some(n => s.includes(n))) return { text: "text-red-700", bg: "bg-red-50" };
  if (state.some(st => s.includes(st)))  return { text: "text-blue-700", bg: "bg-blue-50" };
  return { text: "text-amber-700", bg: "bg-amber-50" };
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

function MetricPill({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-[#E2E2E2] bg-[#F5F5F5] px-2 py-0.5">
      <span style={{ fontSize: 10, color: "#888888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span className={`text-[11px] font-semibold ${colorClass ?? "text-[#0F172B]"}`}>{value}</span>
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
}: {
  title: string;
  subtitle?: string;
  badge?: string | null;
  metrics?: React.ReactNode;
  output: string | null;
  watchout: string | null;
}) {
  const variant = getBadgeVariant(badge ?? null);
  const badgeLabel = badge ? badge.replace(/_/g, " ") : null;

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white px-4 py-3 space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B" }}>{title}</span>
          {subtitle && (
            <span style={{ fontSize: 11, color: "#888888", fontWeight: 400 }}>{subtitle}</span>
          )}
        </div>
        {badgeLabel && (
          <span
            className={`shrink-0 inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${variant.bg} ${variant.text}`}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      {/* METRIC PILLS */}
      {metrics && <div className="flex flex-wrap gap-1.5">{metrics}</div>}

      {/* INTERPRETATION */}
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-zinc-400" />
          <span style={{ fontSize: 9, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Interpretation
          </span>
        </div>
        {output ? (
          <p style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.6 }}>
            {output.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        ) : (
          <p style={{ fontSize: 12, color: "#888888" }}>No data available.</p>
        )}
      </div>

      {/* WATCHOUTS */}
      {watchout && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-500" />
            <span style={{ fontSize: 9, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Watchouts
            </span>
          </div>
          <div className="rounded-[6px] bg-amber-50 px-3 py-2">
            <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>{watchout}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StructureEnginePanel({ engine, perspective, indicators }: { engine: StructureEngineData; perspective: "GROWTH" | "VALUE"; indicators: DecisionIntelligenceIndicator[] | undefined }) {
  const mp = engine.marketStructure;
  const cp = engine.participation;
  const pa = engine.priceStructure;
  const isGrowth = perspective === "GROWTH";

  return (
    <div className="space-y-4">
      <EngineCard
        title="Market Structure"
        subtitle="Wyckoff Phase"
        badge={mp.wyckoffPhase}
        output={isGrowth ? mp.growthOutput : mp.valueOutput}
        watchout={resolveWatchout(indicators, "Wyckoff Phase", perspective, isGrowth ? mp.growthWatchout : mp.valueWatchout)}
      />
      <EngineCard
        title="Capital Participation"
        subtitle="CMF + Volume Signal"
        badge={cp.volumeSignal}
        metrics={<>
          <MetricPill label="CMF" value={cp.cmf.toFixed(4)} colorClass={cp.cmf >= 0 ? "text-emerald-600" : "text-red-600"} />
          <MetricPill label="CMF Signal" value={cp.cmfSignal} colorClass={engineSignalColor(cp.cmfSignal)} />
        </>}
        output={isGrowth ? cp.growthOutput : cp.valueOutput}
        watchout={resolveWatchout(indicators, "Participation", perspective, isGrowth ? cp.growthWatchout : cp.valueWatchout)}
      />
      <EngineCard
        title="Price Structure"
        subtitle="Support & Resistance"
        badge={pa.zone ?? "N/A"}
        output={isGrowth ? pa.growthOutput : pa.valueOutput}
        watchout={resolveWatchout(indicators, "Price Structure", perspective, isGrowth ? pa.growthWatchout : pa.valueWatchout)}
      />
    </div>
  );
}

function TrendEnginePanel({ engine, perspective, indicators }: { engine: TrendEngineData; perspective: "GROWTH" | "VALUE"; indicators: DecisionIntelligenceIndicator[] | undefined }) {
  const db = engine.trendDirection;
  const tm = engine.trendQuality;
  const isGrowth = perspective === "GROWTH";

  return (
    <div className="space-y-4">
      <EngineCard
        title="Trend Direction"
        subtitle="SMA 20 / 50 / 100 / 200"
        badge={deriveTrendDirectionBadge(db)}
        metrics={<>
          <MetricPill label="SMA 20" value={db.priceVsSMA20} colorClass={smaPositionColor(db.priceVsSMA20)} />
          <MetricPill label="SMA 50" value={db.priceVsSMA50} colorClass={smaPositionColor(db.priceVsSMA50)} />
          <MetricPill label="SMA 100" value={db.priceVsSMA100} colorClass={smaPositionColor(db.priceVsSMA100)} />
          <MetricPill label="SMA 200" value={db.priceVsSMA200} colorClass={smaPositionColor(db.priceVsSMA200)} />
        </>}
        output={isGrowth ? db.growthOutput : db.valueOutput}
        watchout={isGrowth ? db.growthWatchout : db.valueWatchout}
      />
      <EngineCard
        title="Trend Quality"
        subtitle="ADX (14)"
        badge={tm.condition}
        metrics={<>
          <MetricPill label="ADX" value={tm.adx.toFixed(2)} />
          <MetricPill label="ADX Trend" value={tm.adxTrend} colorClass={tm.adxTrend === "RISING" ? "text-emerald-600" : "text-red-600"} />
          <MetricPill label="Band" value={tm.adxBand} colorClass="text-zinc-500" />
        </>}
        output={isGrowth ? tm.growthOutput : tm.valueOutput}
        watchout={resolveWatchout(indicators, "Trend Quality", perspective, isGrowth ? tm.growthWatchout : tm.valueWatchout)}
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
        metrics={<MetricPill label="RSI" value={mt.rsi.toFixed(2)} colorClass={mt.rsiZone === "0-30" ? "text-emerald-600" : mt.rsiZone === "70-100" ? "text-red-600" : "text-zinc-600"} />}
        output={isGrowth ? mt.growthOutput : mt.valueOutput}
        watchout={resolveWatchout(indicators, "Momentum", perspective, isGrowth ? mt.growthWatchout : mt.valueWatchout)}
      />
      <EngineCard
        title="Volatility"
        subtitle="Bollinger Band Width (20,2)"
        badge={vr.condition}
        metrics={<>
          <MetricPill label="BB Width" value={vr.bbWidth.toFixed(4)} />
          <MetricPill label="Direction" value={vr.expanding ? "Expanding" : "Contracting"} colorClass={vr.expanding ? "text-red-600" : "text-emerald-600"} />
        </>}
        output={isGrowth ? vr.growthOutput : vr.valueOutput}
        watchout={isGrowth ? vr.growthWatchout : vr.valueWatchout}
      />
    </div>
  );
}

function RelativeStrengthCard({ title, subtitle, rs, perspective }: { title: string; subtitle: string; rs: RelativeStrengthSingle; perspective: "GROWTH" | "VALUE" }) {
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
      watchout={isGrowth ? rs.growthWatchout : rs.valueWatchout}
    />
  );
}

function DominanceEnginePanel({ engine, perspective }: { engine: DominanceEngineData; perspective: "GROWTH" | "VALUE" }) {
  return (
    <div className="space-y-4">
      <RelativeStrengthCard title="Relative Strength vs Nifty" subtitle="Price Ratio vs Index" rs={engine.leadership.vsNifty} perspective={perspective} />
      <RelativeStrengthCard title="Relative Strength vs Sector" subtitle="Price Ratio vs Sector ETF" rs={engine.leadership.vsSector} perspective={perspective} />
    </div>
  );
}

export function RuleEngineSection({
  ruleEngine,
  decisionIntelligence,
  activeEngine,
  setActiveEngine,
  activePerspective,
}: {
  ruleEngine: RuleEngine;
  decisionIntelligence?: DecisionIntelligence;
  activeEngine: string;
  setActiveEngine: (v: string) => void;
  activePerspective: "GROWTH" | "VALUE";
}) {
  const diIndicators = decisionIntelligence?.indicators;

  return (
    <>
      {activeEngine === "STRUCTURE" && (
        <StructureEnginePanel engine={ruleEngine.structureEngine} perspective={activePerspective} indicators={diIndicators} />
      )}
      {activeEngine === "TREND" && (
        <TrendEnginePanel engine={ruleEngine.trendEngine} perspective={activePerspective} indicators={diIndicators} />
      )}
      {activeEngine === "TIMING" && (
        <TimingEnginePanel engine={ruleEngine.timingEngine} perspective={activePerspective} indicators={diIndicators} />
      )}
      {activeEngine === "DOMINANCE" && (
        <DominanceEnginePanel engine={ruleEngine.dominanceEngine} perspective={activePerspective} />
      )}
    </>
  );
}
