import React, { useState, useRef } from "react";
import { Info } from "lucide-react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import type {
  RuleEngine,
  RelativeStrengthSingle,
  StructureEngineData,
  TrendEngineData,
  TimingEngineData,
  DominanceEngineData,
} from "@/types/technicals";

const ENGINE_TABS = ["STRUCTURE ENGINE", "TREND ENGINE", "TIMING ENGINE", "DOMINANCE ENGINE"] as const;

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

function WatchoutPopover({ watchouts }: { watchouts: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!watchouts || watchouts.length === 0) return null;

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-zinc-400 hover:text-amber-500 transition-colors"
        aria-label="View watchouts"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          className="absolute z-50 left-0 top-full mt-1.5 w-[480px] rounded-[8px] border border-[#E2E2E2] bg-white shadow-lg p-3"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span style={{ fontSize: 10, fontWeight: 600, color: "#888888", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>WATCHOUTS</span>
          <ul className="space-y-1">
            {watchouts.map((w, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-[5px]" />
                <span style={{ fontSize: 12, color: "#888888", lineHeight: 1.4 }}>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
  badge,
  badgeColorClass,
  metrics,
  output,
  watchouts,
}: {
  title: string;
  badge?: string | null;
  badgeColorClass?: string;
  metrics?: React.ReactNode;
  output: string | null;
  watchouts: string[];
}) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h5 style={{ fontSize: 14, fontWeight: 600, color: "#0F172B" }}>{title}</h5>
          <WatchoutPopover watchouts={watchouts} />
        </div>
        {badge && (
          <span
            className={`shrink-0 inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border border-[#E2E2E2] bg-[#F5F5F5] ${badgeColorClass ?? "text-zinc-600"}`}
          >
            {badge}
          </span>
        )}
      </div>
      {metrics && <div className="flex flex-wrap gap-2">{metrics}</div>}
      {output ? (
        <p style={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>
          {output.split("\n").map((line, i) => (
            <span key={i}>{line}{i < output.split("\n").length - 1 && <br />}</span>
          ))}
        </p>
      ) : (
        <p style={{ fontSize: 13, color: "#888888" }}>No data available.</p>
      )}
    </div>
  );
}

function StructureEnginePanel({ engine, perspective }: { engine: StructureEngineData; perspective: "GROWTH" | "VALUE" }) {
  const mp = engine.marketPhase;
  const cp = engine.capitalParticipation;
  const pa = engine.priceArchitecture;
  const isGrowth = perspective === "GROWTH";

  return (
    <div className="space-y-4">
      <EngineCard
        title="Market Phase"
        badge={mp.wyckoffPhase}
        badgeColorClass="text-amber-600"
        output={isGrowth ? mp.growthOutput : mp.valueOutput}
        watchouts={isGrowth ? mp.growthWatchouts : mp.valueWatchouts}
      />
      <EngineCard
        title="Capital Participation"
        badge={cp.volumeSignal}
        badgeColorClass={engineSignalColor(cp.volumeSignal)}
        metrics={<>
          <MetricPill label="CMF" value={cp.cmf.toFixed(4)} colorClass={cp.cmf >= 0 ? "text-emerald-600" : "text-red-600"} />
          <MetricPill label="CMF Signal" value={cp.cmfSignal} colorClass={engineSignalColor(cp.cmfSignal)} />
        </>}
        output={isGrowth ? cp.growthOutput : cp.valueOutput}
        watchouts={isGrowth ? cp.growthWatchouts : cp.valueWatchouts}
      />
      <EngineCard
        title="Price Architecture"
        badge={pa.zone ?? "N/A"}
        badgeColorClass="text-zinc-500"
        output={isGrowth ? pa.growthOutput : pa.valueOutput}
        watchouts={isGrowth ? pa.growthWatchouts : pa.valueWatchouts}
      />
    </div>
  );
}

function TrendEnginePanel({ engine, perspective }: { engine: TrendEngineData; perspective: "GROWTH" | "VALUE" }) {
  const db = engine.directionalBias;
  const tm = engine.trendMaturity;
  const isGrowth = perspective === "GROWTH";

  return (
    <div className="space-y-4">
      <EngineCard
        title="Directional Bias"
        metrics={<>
          <MetricPill label="SMA 20" value={db.priceVsSMA20} colorClass={smaPositionColor(db.priceVsSMA20)} />
          <MetricPill label="SMA 50" value={db.priceVsSMA50} colorClass={smaPositionColor(db.priceVsSMA50)} />
          <MetricPill label="SMA 100" value={db.priceVsSMA100} colorClass={smaPositionColor(db.priceVsSMA100)} />
          <MetricPill label="SMA 200" value={db.priceVsSMA200} colorClass={smaPositionColor(db.priceVsSMA200)} />
        </>}
        output={isGrowth ? db.growthOutput : db.valueOutput}
        watchouts={isGrowth ? db.growthWatchouts : db.valueWatchouts}
      />
      <EngineCard
        title="Trend Maturity"
        badge={tm.condition}
        badgeColorClass="text-amber-600"
        metrics={<>
          <MetricPill label="ADX" value={tm.adx.toFixed(2)} />
          <MetricPill label="ADX Trend" value={tm.adxTrend} colorClass={tm.adxTrend === "RISING" ? "text-emerald-600" : "text-red-600"} />
          <MetricPill label="Band" value={tm.adxBand} colorClass="text-zinc-500" />
        </>}
        output={isGrowth ? tm.growthOutput : tm.valueOutput}
        watchouts={isGrowth ? tm.growthWatchouts : tm.valueWatchouts}
      />
    </div>
  );
}

function TimingEnginePanel({ engine, perspective }: { engine: TimingEngineData; perspective: "GROWTH" | "VALUE" }) {
  const mt = engine.momentumThrust;
  const vr = engine.volatilityRegime;
  const isGrowth = perspective === "GROWTH";

  function rsiLabel(zone: string): string {
    if (zone === "0-30") return "OVERSOLD";
    if (zone === "70-100") return "OVERBOUGHT";
    return zone;
  }

  return (
    <div className="space-y-4">
      <EngineCard
        title="Momentum Thrust"
        badge={rsiLabel(mt.rsiZone)}
        badgeColorClass={mt.rsiZone === "0-30" ? "text-emerald-600" : mt.rsiZone === "70-100" ? "text-red-600" : "text-zinc-500"}
        metrics={<MetricPill label="RSI" value={mt.rsi.toFixed(2)} colorClass={mt.rsiZone === "0-30" ? "text-emerald-600" : mt.rsiZone === "70-100" ? "text-red-600" : "text-zinc-600"} />}
        output={isGrowth ? mt.growthOutput : mt.valueOutput}
        watchouts={isGrowth ? mt.growthWatchouts : mt.valueWatchouts}
      />
      <EngineCard
        title="Volatility Regime"
        badge={vr.condition}
        badgeColorClass={vr.expanding ? "text-red-600" : "text-emerald-600"}
        metrics={<>
          <MetricPill label="BB Width" value={vr.bbWidth.toFixed(4)} />
          <MetricPill label="Direction" value={vr.expanding ? "Expanding" : "Contracting"} colorClass={vr.expanding ? "text-red-600" : "text-emerald-600"} />
        </>}
        output={isGrowth ? vr.growthOutput : vr.valueOutput}
        watchouts={isGrowth ? vr.growthWatchouts : vr.valueWatchouts}
      />
    </div>
  );
}

function RelativeStrengthCard({ title, rs, perspective }: { title: string; rs: RelativeStrengthSingle; perspective: "GROWTH" | "VALUE" }) {
  const isGrowth = perspective === "GROWTH";
  const hasData = rs.signal !== null;
  return (
    <EngineCard
      title={title}
      badge={rs.signal ?? "N/A"}
      badgeColorClass={engineSignalColor(rs.signal)}
      metrics={hasData ? <>
        <MetricPill label="CRS" value={rs.crsValue?.toFixed(2) ?? "—"} />
        <MetricPill label="Prev CRS" value={rs.prevCrsValue?.toFixed(2) ?? "—"} />
      </> : undefined}
      output={isGrowth ? rs.growthOutput : rs.valueOutput}
      watchouts={isGrowth ? rs.growthWatchouts : rs.valueWatchouts}
    />
  );
}

function DominanceEnginePanel({ engine, perspective }: { engine: DominanceEngineData; perspective: "GROWTH" | "VALUE" }) {
  return (
    <div className="space-y-4">
      <RelativeStrengthCard title="Relative Strength vs Nifty" rs={engine.relativeStrength.vsNifty} perspective={perspective} />
      <RelativeStrengthCard title="Relative Strength vs Sector" rs={engine.relativeStrength.vsSector} perspective={perspective} />
    </div>
  );
}

export function RuleEngineSection({
  ruleEngine,
  activeEngine,
  setActiveEngine,
  activePerspective,
  setActivePerspective,
}: {
  ruleEngine: RuleEngine;
  activeEngine: string;
  setActiveEngine: (v: string) => void;
  activePerspective: "GROWTH" | "VALUE";
  setActivePerspective: (v: "GROWTH" | "VALUE") => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <TabToggle
          options={ENGINE_TABS as unknown as string[]}
          value={activeEngine}
          onChange={setActiveEngine}
        />
        <div className="inline-flex rounded-full border border-[#E2E2E2] bg-[#F5F5F5] p-0.5">
          {(["GROWTH", "VALUE"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActivePerspective(p)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all ${
                activePerspective === p
                  ? "bg-[#0F172B] text-white"
                  : "text-[#888888] hover:text-[#0F172B]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {activeEngine === "STRUCTURE ENGINE" && (
        <StructureEnginePanel engine={ruleEngine.structureEngine} perspective={activePerspective} />
      )}
      {activeEngine === "TREND ENGINE" && (
        <TrendEnginePanel engine={ruleEngine.trendEngine} perspective={activePerspective} />
      )}
      {activeEngine === "TIMING ENGINE" && (
        <TimingEnginePanel engine={ruleEngine.timingEngine} perspective={activePerspective} />
      )}
      {activeEngine === "DOMINANCE ENGINE" && (
        <DominanceEnginePanel engine={ruleEngine.dominanceEngine} perspective={activePerspective} />
      )}
    </>
  );
}
