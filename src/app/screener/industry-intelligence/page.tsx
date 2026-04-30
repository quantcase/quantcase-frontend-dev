"use client";

import { useState } from "react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { DashboardTab }       from "./_components/dashboard-tab";
import { IndustryRankingTab } from "./_components/industry-ranking-tab";
import { DeepDiveTab }        from "./_components/deep-dive-tab";
import { StockRankingTab }    from "./_components/stock-ranking-tab";
import { RotationAlertsTab }    from "./_components/rotation-alerts-tab";
import { UniverseBrowserTab }   from "./_components/universe-browser-tab";
import { NewsIntelligenceTab }  from "./_components/news-intelligence-tab";

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
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "var(--qc-up-soft)", border: "1px solid var(--qc-up)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--qc-up)" }} />
            <span className="text-[11px] font-semibold" style={{ color: "var(--qc-up)" }}>Risk-On regime</span>
          </div>

          <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
            Week ending 11 Apr 2025 · Friday close
          </span>

          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              background: "var(--qc-surface-panel)",
              border: "1px solid var(--qc-border-default)",
              color: "var(--qc-text-muted)",
            }}
          >
            v1.1
          </span>
        </div>
      </header>

      {/* ── Tab navigation (sticky below app topbar, but topbar is hidden here) ── */}
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

      {/* ── Tab content ──────────────────────────────────────────────── */}
      {activeTab === "Dashboard"        && <DashboardTab />}
      {activeTab === "Industry ranking" && <IndustryRankingTab />}
      {activeTab === "Deep-dive"        && <DeepDiveTab />}
      {activeTab === "Stock ranking"    && <StockRankingTab />}
      {activeTab === "Rotation & alerts"&& <RotationAlertsTab />}
      {activeTab === "Universe browser"   && <UniverseBrowserTab />}
      {activeTab === "News intelligence"  && <NewsIntelligenceTab />}
    </div>
  );
}
