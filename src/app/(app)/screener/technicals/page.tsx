"use client";

import React, { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
import { useTechnicals } from "@/hooks/useTechnicals";
import { usePrices } from "@/hooks/usePrices";
import { useScreenerData } from "@/hooks/useScreenerData";
import { CandlestickChart, type ChartMode } from "./_components/CandlestickChart";
import { DecisionIntelligenceBanner } from "./_components/DecisionIntelligenceBanner";
import { DecisionIntelligenceState } from "./_components/DecisionIntelligenceState";
import { LevelsToWatchCard } from "./_components/LevelsToWatchCard";
import { WhatCanChangeCard } from "./_components/WhatCanChangeCard";
import { TechnicalsRuleEngine, type EngineTab } from "./_components/TechnicalsRuleEngine";
import { LevelsStrip } from "./_components/LevelsStrip";
import { SectionPanel } from "@/components/molecules/section-panel";

/** Each refresh costs an LLM job, so rate-limit the button client-side too. */
const REFRESH_COOLDOWN_MS = 60_000;

// ─── Inline skeleton components ───────────────────────────────────────────────

function Shimmer({ style, rounded = 8 }: { style?: React.CSSProperties; rounded?: number }) {
  return <div className="skeleton-shimmer" style={{ borderRadius: rounded, ...style }} />;
}

function TechnicalsLevelsStripSkeleton() {
  return (
    <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", overflow: "hidden" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={["px-5 py-3.5 flex flex-col gap-2", i > 0 ? "border-l border-[var(--qc-hair)]" : ""].join(" ")}>
            <Shimmer style={{ height: 9, width: "55%" }} rounded={4} />
            <Shimmer style={{ height: 18, width: "70%" }} rounded={5} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TechnicalsChartSkeleton() {
  return (
    <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <Shimmer style={{ height: 10, width: "20%" }} rounded={4} />
      <Shimmer style={{ height: 340 }} rounded={10} />
    </div>
  );
}

function TechnicalsRuleEngineSkeleton() {
  return (
    <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <Shimmer style={{ height: 10, width: "25%" }} rounded={4} />
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} style={{ height: 30, width: 90 }} rounded={20} />)}
      </div>
      {Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} style={{ height: 44 }} rounded={8} />)}
    </div>
  );
}

function TechnicalsDecisionSkeleton() {
  return (
    <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <Shimmer style={{ height: 10, width: "40%" }} rounded={4} />
      <Shimmer style={{ height: 52 }} rounded={10} />
      <Shimmer style={{ height: 9, width: "30%" }} rounded={4} />
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} style={{ height: 56 }} rounded={10} />)}
      </div>
      <Shimmer style={{ height: 9, width: "30%" }} rounded={4} />
      {Array.from({ length: 3 }).map((_, i) => <Shimmer key={i} style={{ height: 36 }} rounded={8} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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

  const {
    data, derived, loading, error,
    insightStatus, insightProgress, isUpdating, isRefreshing, refreshError, refresh,
  } = useTechnicals(symbol);
  const { prices, indicators, loading: pricesLoading, error: pricesError } = usePrices(symbol);

  const [dismissedRefreshError, setDismissedRefreshError] = useState(false);
  const lastRefreshAtRef = useRef(0);

  const handleRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) return;
    lastRefreshAtRef.current = now;
    setDismissedRefreshError(false);
    refresh();
  }, [refresh]);

  const refreshDisabled = isRefreshing || insightStatus === "generating";
  const { data: screenerData } = useScreenerData(symbol);
  const companyInfo = screenerData?.company
    ? { name: screenerData.company.name, exchange: screenerData.company.exchange, sector: screenerData.company.sector, industry: screenerData.company.industry }
    : null;

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV} companyInfo={companyInfo}>
        <div className="text-sm text-down px-4 pt-6">
          Error: No symbol provided in query parameters
        </div>
      </ScreenerPageShell>
    );
  }

  if (error) {
    return (
      <ScreenerPageShell navItems={TECHNICALS_NAV} companyInfo={companyInfo}>
        <div className="text-sm text-down px-4 pt-6">Error: {error}</div>
      </ScreenerPageShell>
    );
  }

  const changeIsPositive = !loading && data ? data.price.changePercent >= 0 : false;
  const changeDisplay = !loading && data ? `${changeIsPositive ? "+" : ""}${data.price.changePercent.toFixed(1)}%` : "";

  return (
    <>
    <ScreenerPageShell navItems={TECHNICALS_NAV} companyInfo={companyInfo}>
      <div className="mb-8 px-4 space-y-[14px] pt-4">
        <div id="section-price-levels">
          {loading ? (
            <TechnicalsLevelsStripSkeleton />
          ) : data && derived ? (
            <LevelsStrip
              price={data.price}
              movingAverages={data.movingAverages}
              supportResistance={data.supportResistance}
              meta={data.meta}
              changeDisplay={changeDisplay}
              changeIsPositive={changeIsPositive}
            />
          ) : null}
        </div>

        {/* Row 1: Price Chart — full width */}
        <div id="section-price-chart">
          {loading ? (
            <TechnicalsChartSkeleton />
          ) : (
            <SectionPanel
              title="Price Chart"
              headerAction={
                chartMode !== "DEFAULT" ? (
                  <button
                    onClick={() => setChartMode("DEFAULT")}
                    className="px-2.5 py-1 rounded-[8px] font-mono text-[10px] uppercase tracking-[0.14em] border transition-colors"
                    style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)", color: "var(--qc-ink)" }}
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
                supportResistance={data!.supportResistance}
                structureEngine={data!.ruleEngine?.structureEngine}
              />
            </SectionPanel>
          )}
        </div>

        {/* Row 2: Rule Engine (left) + Decision Intelligence (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-[14px] items-start">
          <div className="min-w-0 flex flex-col gap-[14px]">
            {!loading && data?.ruleEngine && (
              <div id="section-rule-engine">
                {/* key={symbol} resets the Growth/Value toggle to the new
                    ticker's classification default instead of resyncing via an
                    effect, which would fight a manual selection. */}
                <TechnicalsRuleEngine
                  key={symbol}
                  ruleEngine={data.ruleEngine}
                  decisionIntelligence={data.decisionIntelligence ?? undefined}
                  stockClassification={data.stockClassification ?? null}
                  smaDistancePct={data.smaDistancePct ?? null}
                  activeEngine={activeEngine}
                  onEngineChange={handleEngineChange}
                  avgVolume20d={data.price.avgVolume20d}
                />
              </div>
            )}
            {loading && <TechnicalsRuleEngineSkeleton />}

            {/* These two fill the whitespace the rule engine leaves under it,
                rather than stacking under the sticky Decision Intelligence column. */}
            {!loading && data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] items-start">
                <WhatCanChangeCard items={data.decisionIntelligence?.whatCanChange} />
                <LevelsToWatchCard
                  levels={data.decisionIntelligence?.levelsToWatch ?? null}
                  cmp={data.price.cmp}
                />
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-28 flex flex-col gap-[14px]">
            {loading ? (
              <TechnicalsDecisionSkeleton />
            ) : data ? (
              <>
                {refreshError && !dismissedRefreshError && (
                  <div
                    className="flex items-start justify-between gap-2 rounded-[10px] border px-3 py-2"
                    style={{ borderColor: "var(--qc-hair)", background: "var(--qc-down-soft)" }}
                  >
                    <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-down)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>
                      Couldn&apos;t refresh the analysis: {refreshError}
                    </span>
                    <button onClick={() => setDismissedRefreshError(true)} aria-label="Dismiss">
                      <X style={{ width: 12, height: 12, color: "var(--qc-down)" }} />
                    </button>
                  </div>
                )}

                {data.decisionIntelligence ? (
                  <DecisionIntelligenceBanner
                    di={data.decisionIntelligence}
                    stockType={data.stockClassification?.stock_type ?? null}
                    scores={data.scores}
                    isUpdating={isUpdating}
                    onRefresh={handleRefresh}
                    refreshDisabled={refreshDisabled}
                  />
                ) : (
                  <DecisionIntelligenceState
                    status={insightStatus === "ready" ? "generating" : insightStatus}
                    progress={insightProgress}
                    onRetry={handleRefresh}
                    isRefreshing={isRefreshing}
                    scores={data.scores}
                  />
                )}
              </>
            ) : null}
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
                  <li key={i} className="flex gap-2 text-sm text-ink-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ink-3 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </SectionPanel>
          </div>
        )} */}
      </div>
    </ScreenerPageShell>
    <AssetActionBar ticker={symbol} />
    </>
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
