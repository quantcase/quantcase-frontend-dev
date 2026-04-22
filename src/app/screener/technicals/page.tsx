"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { useTechnicals } from "@/hooks/useTechnicals";
import { usePrices } from "@/hooks/usePrices";
import { CandlestickChart, type ChartMode } from "./_components/CandlestickChart";
import { DecisionIntelligenceBanner } from "./_components/DecisionIntelligenceBanner";
import { TechnicalsRuleEngine, type EngineTab } from "./_components/TechnicalsRuleEngine";
import { LevelsStrip } from "./_components/LevelsStrip";
import { PriceActionOverview } from "./_components/PriceActionOverview";
import { SupportResistanceAnalysis } from "./_components/SupportResistanceAnalysis";
import { SignalScorecard } from "./_components/SignalScorecard";
import { MomentumIndicators } from "./_components/MomentumIndicators";
import { MovingAverages } from "./_components/MovingAverages";
import { MarketStructureSection } from "./_components/MarketStructureSection";
import { TimeframeMatrix } from "./_components/TimeframeMatrix";
import { VolumeAnalysis } from "./_components/VolumeAnalysis";
import { SectionPanel } from "@/components/molecules/section-panel";

const TECHNICALS_NAV = [
  { id: "section-price-levels", label: "Price Levels" },
  { id: "section-price-chart", label: "Price Chart" },
  { id: "section-rule-engine", label: "Rule Engine" },
];

function TechnicalsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [activeEngine, setActiveEngine] = useState<EngineTab>("STRUCTURE");
  const [chartMode, setChartMode] = useState<ChartMode>("DEFAULT");

  const handleEngineChange = (tab: EngineTab) => {
    setActiveEngine(tab);
    setChartMode(tab);
  };

  const { data, derived, loading, error } = useTechnicals(symbol);
  const { prices, indicators, loading: pricesLoading, error: pricesError } = usePrices(symbol);

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV}>
        <div className="text-sm text-red-600 px-4 pt-6">
          Error: No symbol provided in query parameters
        </div>
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
  const changeDisplay = `${changeIsPositive ? "+" : ""}${data.price.changePercent.toFixed(1)}%`;

  const di = data.decisionIntelligence;
  const trendIndicator = di?.indicators.find((i) => i.name.toLowerCase() === "trend");
  const momentumIndicator = di?.indicators.find((i) => i.name.toLowerCase() === "momentum");
  const volatilityIndicator = di?.indicators.find((i) => i.name.toLowerCase() === "volatility");

  const insightCards = di ? (
    <>
      {[trendIndicator, momentumIndicator, volatilityIndicator]
        .filter(Boolean)
        .map((ind) => (
          <div
            key={ind!.name}
            className="rounded-[8px] border px-3 py-1.5 text-center"
            style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] mb-px" style={{ color: "var(--qc-text-muted)" }}>
              {ind!.name}
            </p>
            <p className="text-[12px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{ind!.tag}</p>
          </div>
        ))}
      <div
        className="rounded-[8px] border px-3 py-1.5 text-center"
        style={{ borderColor: "var(--qc-text-heading)", background: "var(--qc-surface-white)" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] mb-px" style={{ color: "var(--qc-text-muted)" }}>
          Tag
        </p>
        <p className="text-[12px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{di.tag}</p>
      </div>
    </>
  ) : null;

  return (
    <ScreenerPageShell navItems={TECHNICALS_NAV} headerRight={insightCards}>
      <div className="mb-8 px-4 space-y-[14px] pt-4">
        <div id="section-price-levels">
          <LevelsStrip
            price={data.price}
            movingAverages={data.movingAverages}
            supportResistance={data.supportResistance}
            meta={data.meta}
            changeDisplay={changeDisplay}
            changeIsPositive={changeIsPositive}
          />
        </div>

        {/* Row 1: Price Chart + Rule Engine (2/3) + Decision Intelligence (1/3) */}
        <div className="grid grid-cols-3 gap-[14px] items-start">
          <div className="col-span-2 flex flex-col gap-[14px]">
            <div id="section-price-chart">
              <SectionPanel
                title="Price Chart"
                headerAction={
                  chartMode !== "DEFAULT" ? (
                    <button
                      onClick={() => setChartMode("DEFAULT")}
                      className="px-2.5 py-1 rounded-[8px] font-mono text-[10px] uppercase tracking-[0.14em] border transition-colors"
                      style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)", color: "var(--qc-text-heading)" }}
                    >
                      Default View
                    </button>
                  ) : null
                }
              >
                <CandlestickChart
                  prices={prices}
                  indicators={indicators}
                  chartMode={chartMode}
                  loading={pricesLoading}
                  error={pricesError}
                  supportResistance={data.supportResistance}
                  structureEngine={data.ruleEngine?.structureEngine}
                />
              </SectionPanel>
            </div>
            {data.ruleEngine && (
              <div id="section-rule-engine">
                <TechnicalsRuleEngine
                  ruleEngine={data.ruleEngine}
                  decisionIntelligence={data.decisionIntelligence}
                  activeEngine={activeEngine}
                  onEngineChange={handleEngineChange}
                />
              </div>
            )}
          </div>
          <div className="col-span-1 sticky top-28">
            {data.decisionIntelligence && (
              <DecisionIntelligenceBanner di={data.decisionIntelligence} />
            )}
          </div>
        </div>

        {/* <div id="section-price-action">
          <PriceActionOverview
            price={data.price}
            meta={data.meta}
            changeDisplay={changeDisplay}
          />
        </div> */}

        {/* <div id="section-support-resistance">
          <SupportResistanceAnalysis
            price={data.price}
            supportResistance={data.supportResistance}
            derived={derived}
          />
        </div> */}

        {/* <div id="section-signal-scorecard">
          <SignalScorecard signals={data.signals} />
        </div> */}

        {/* <div id="section-momentum">
          <MomentumIndicators momentum={data.momentum} />
        </div> */}

        {/* <div id="section-moving-averages">
          <MovingAverages
            price={data.price}
            movingAverages={data.movingAverages}
            volatility={data.volatility}
          />
        </div> */}

        {/* Market Structure + Timeframe Matrix + Volume Analysis — 3-col row */}
        {/* <div className="grid grid-cols-3 gap-6">
          <MarketStructureSection trend={data.trend} patterns={data.patterns} />
          <TimeframeMatrix timeframes={data.timeframes} />
          <VolumeAnalysis volume={data.volume} />
        </div> */}

        {/* Key Insights */}
        {/* {data.insights.length > 0 && (
          <div id="section-key-insights">
            <SectionPanel title="Key Insights" subtitle="AI-generated observations from technical analysis">
              <ul className="space-y-2 pb-4 px-2">
                {data.insights.map((insight, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#888888]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </SectionPanel>
          </div>
        )} */}
      </div>
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
