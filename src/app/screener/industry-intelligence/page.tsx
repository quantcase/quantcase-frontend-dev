"use client";

import { useState } from "react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { useIndustryIntelligence } from "@/hooks/useIndustryIntelligence";
import { DashboardTab }       from "./_components/dashboard-tab";
import { IndustryRankingTab } from "./_components/industry-ranking-tab";
import { DeepDiveTab }        from "./_components/deep-dive-tab";
import { StockRankingTab }    from "./_components/stock-ranking-tab";
import { RotationAlertsTab }  from "./_components/rotation-alerts-tab";
import { UniverseBrowserTab } from "./_components/universe-browser-tab";
import { NewsIntelligenceTab } from "./_components/news-intelligence-tab";

const TABS = [
  "Dashboard",
  "Industry ranking",
  "Deep-dive",
  "Stock ranking",
  "Rotation & alerts",
  "Universe browser",
  "News intelligence",
] as const;

type Tab = typeof TABS[number];

export default function IndustryIntelligencePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const { data, loading, error } = useIndustryIntelligence();

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-surface-base)" }}>

      {/* ── Terminal header ──────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3"
        style={{ background: "var(--qc-surface-card)", borderBottom: "1px solid var(--qc-border-default)" }}
      >
        <span
          className="text-[14px] font-semibold"
          style={{ color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-sans, sans-serif)" }}
        >
          Industry Intelligence Terminal
        </span>

        <div className="flex items-center gap-4">
          {/* Regime badge */}
          {(() => {
            const regime = data?.meta.regime ?? "";
            const isRiskOn  = regime.toLowerCase().includes("risk-on")  || regime.toLowerCase().includes("bull");
            const isRiskOff = regime.toLowerCase().includes("risk-off") || regime.toLowerCase().includes("bear");
            const bg  = isRiskOn ? "var(--qc-up-soft)"   : isRiskOff ? "var(--qc-down-soft)"   : "var(--qc-surface-panel)";
            const clr = isRiskOn ? "var(--qc-up)"        : isRiskOff ? "var(--qc-down)"        : "var(--qc-text-muted)";
            const bdr = isRiskOn ? "var(--qc-up)"        : isRiskOff ? "var(--qc-down)"        : "var(--qc-border-default)";
            return (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: bg, border: `1px solid ${bdr}` }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: clr }} />
                <span className="text-[11px] font-semibold" style={{ color: clr }}>
                  {regime || "—"} regime
                </span>
              </div>
            );
          })()}

          <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
            {data?.meta.week_ending_label ?? "Loading…"}
          </span>

          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              background: "var(--qc-surface-panel)",
              border: "1px solid var(--qc-border-default)",
              color: "var(--qc-text-muted)",
            }}
          >
            {data ? `v${data.meta.version}` : "—"}
          </span>
        </div>
      </header>

      {/* ── Tab navigation ───────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30"
        style={{ background: "var(--qc-surface-card)" }}
      >
        <TabToggle
          options={[...TABS]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as Tab)}
          variant="underline"
          className="px-2"
        />
      </div>

      {/* ── Loading / error ───────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <span className="text-[13px]" style={{ color: "var(--qc-text-muted)" }}>Loading…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-24">
          <span className="text-[13px]" style={{ color: "var(--qc-down)" }}>Failed to load: {error}</span>
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────────────────── */}
      {!loading && data && (
        <>
          {activeTab === "Dashboard"          && <DashboardTab       data={data.dashboard} />}
          {activeTab === "Industry ranking"   && <IndustryRankingTab data={data.industry_ranking} />}
          {activeTab === "Deep-dive"          && <DeepDiveTab        data={data.deep_dive} />}
          {activeTab === "Stock ranking"      && <StockRankingTab    data={data.stock_ranking} />}
          {activeTab === "Rotation & alerts"  && <RotationAlertsTab  data={data.rotation_alerts} meta={data.meta} />}
          {activeTab === "Universe browser"   && <UniverseBrowserTab data={data.universe_browser} />}
          {activeTab === "News intelligence"  && <NewsIntelligenceTab />}
        </>
      )}
    </div>
  );
}
