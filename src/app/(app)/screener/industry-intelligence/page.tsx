"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useIndustryIntelligence } from "@/hooks/useIndustryIntelligence";
import { DashboardTab }        from "./_components/dashboard-tab";
import { IndustryRankingTab }  from "./_components/industry-ranking-tab";
import { DeepDiveTab }         from "./_components/deep-dive-tab";
import { StockRankingTab }     from "./_components/stock-ranking-tab";
import { RotationAlertsTab }   from "./_components/rotation-alerts-tab";
import { UniverseBrowserTab }  from "./_components/universe-browser-tab";
import { NewsIntelligenceTab } from "./_components/news-intelligence-tab";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TabId =
  | "dashboard" | "industry-ranking" | "deep-dive" | "stock-ranking"
  | "rotation-alerts" | "universe-browser" | "news-intelligence";

const VALID_TABS = new Set<TabId>([
  "dashboard", "industry-ranking", "deep-dive", "stock-ranking",
  "rotation-alerts", "universe-browser", "news-intelligence",
]);

// ── Regime helpers ────────────────────────────────────────────────────────────

function regimeStyle(regime: string) {
  const lower = regime.toLowerCase();
  const isRiskOn  = lower.includes("risk-on")  || lower.includes("bull");
  const isRiskOff = lower.includes("risk-off") || lower.includes("bear");
  return {
    bg:    isRiskOn ? "var(--qc-up-soft)"   : isRiskOff ? "var(--qc-down-soft)"   : "rgba(18,18,18,0.05)",
    color: isRiskOn ? "var(--qc-up)"        : isRiskOff ? "var(--qc-down)"        : "var(--qc-text-muted)",
    border:isRiskOn ? "var(--qc-up)"        : isRiskOff ? "var(--qc-down)"        : "var(--qc-border-default)",
    Icon:  isRiskOn ? TrendingUp            : isRiskOff ? TrendingDown            : Minus,
  };
}

// ── Summary stat tile ─────────────────────────────────────────────────────────

function StatTile({
  label, value, sublabel, change, changePositive,
}: {
  label: string;
  value: string;
  sublabel?: string;
  change?: string;
  changePositive?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--qc-surface-card, #fff)",
        border: "1px solid var(--qc-border-default, #E2E2E2)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: "var(--qc-fz-10)",
          fontWeight: "var(--qc-w-semi)",
          fontFamily: "var(--qc-font-sans)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--qc-ink-3)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--qc-fz-22)",
          fontWeight: "var(--qc-w-medium)",
          fontFamily: "var(--qc-font-mono)",
          color: "var(--qc-text-heading, #0F172B)",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </span>
      {change && (
        <span
          style={{
            fontSize: "var(--qc-fz-11)",
            fontWeight: "var(--qc-w-medium)",
            fontFamily: "var(--qc-font-mono)",
            color: changePositive === true ? "var(--qc-up, #16a34a)" : changePositive === false ? "var(--qc-down, #dc2626)" : "var(--qc-ink-3)",
          }}
        >
          {change}
        </span>
      )}
      {sublabel && !change && (
        <span style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)" }}>{sublabel}</span>
      )}
    </div>
  );
}

// ── Page inner (needs Suspense for useSearchParams) ───────────────────────────

function IndustryIntelligenceInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab") ?? "dashboard";
  const activeTab: TabId = VALID_TABS.has(raw as TabId) ? (raw as TabId) : "dashboard";

  const { data, loading, error } = useIndustryIntelligence();

  const meta   = data?.meta;
  const tiles  = data?.dashboard?.summary_tiles;
  const regime = meta?.regime ?? "";
  const { bg: regimeBg, color: regimeColor, border: regimeBorder, Icon: RegimeIcon } = regimeStyle(regime);

  return (
    <div style={{ background: "var(--qc-surface-base, #F5F5F5)", minHeight: "100vh" }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <header
        style={{
          padding: "28px 36px 0",
          fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <h1
              style={{
                fontSize: "var(--qc-fz-30)",
                fontWeight: "var(--qc-w-medium)",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.15,
                color: "var(--qc-text-heading, #0F172B)",
              }}
            >
              Industry Intelligence
            </h1>
            <div
              style={{
                marginTop: 6,
                fontSize: "var(--qc-fz-12)",
                fontFamily: "var(--qc-font-sans)",
                color: "var(--qc-ink-3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{meta?.week_ending_label ?? "Loading…"}</span>
              {regime && (
                <>
                  <span style={{ color: "var(--qc-border-default, #E2E2E2)" }}>·</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "2px 10px",
                      borderRadius: 99,
                      background: regimeBg,
                      border: `1px solid ${regimeBorder}`,
                      color: regimeColor,
                      fontSize: "var(--qc-fz-11)",
                      fontWeight: "var(--qc-w-semi)",
                      fontFamily: "var(--qc-font-sans)",
                    }}
                  >
                    <RegimeIcon style={{ width: 11, height: 11 }} />
                    {regime} regime
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Version pill */}
          {meta && (
            <span
              style={{
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-medium)",
                fontFamily: "var(--qc-font-sans)",
                padding: "3px 8px",
                borderRadius: 6,
                background: "var(--qc-surface-card, #fff)",
                border: "1px solid var(--qc-border-default, #E2E2E2)",
                color: "var(--qc-ink-3)",
                marginTop: 4,
                alignSelf: "flex-start",
              }}
            >
              v{meta.version}
            </span>
          )}
        </div>

        {/* Summary stat tiles */}
        {!loading && tiles && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginTop: 18,
              marginBottom: 0,
            }}
          >
            <StatTile
              label="Market Regime"
              value={tiles.market_regime?.value ?? "—"}
              change={tiles.market_regime?.change ?? undefined}
              changePositive={
                tiles.market_regime?.change?.startsWith("+") ? true :
                tiles.market_regime?.change?.startsWith("−") || tiles.market_regime?.change?.startsWith("-") ? false :
                undefined
              }
              sublabel={tiles.market_regime?.since_label ?? undefined}
            />
            <StatTile
              label="Top Cluster"
              value={tiles.top_cluster?.name ?? "—"}
              sublabel={
                tiles.top_cluster
                  ? `Score ${tiles.top_cluster.score} · ${tiles.top_cluster.quartile} · #${tiles.top_cluster.rank}`
                  : undefined
              }
            />
            <StatTile
              label="Biggest Mover"
              value={tiles.biggest_mover?.name ?? "—"}
              change={tiles.biggest_mover?.label ?? undefined}
              changePositive={
                tiles.biggest_mover?.label?.startsWith("+") ? true :
                tiles.biggest_mover?.label?.startsWith("−") || tiles.biggest_mover?.label?.startsWith("-") ? false :
                undefined
              }
            />
            <StatTile
              label="News This Week"
              value={String(tiles.news_this_week?.count ?? "—")}
              sublabel={
                tiles.news_this_week?.clusters_affected
                  ? `${tiles.news_this_week.clusters_affected} clusters affected`
                  : undefined
              }
            />
          </div>
        )}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginTop: 18,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "var(--qc-surface-card, #fff)",
                  border: "1px solid var(--qc-border-default, #E2E2E2)",
                  borderRadius: 10,
                  padding: "16px 20px",
                  height: 84,
                  animation: "pulse 1.5s ease-in-out infinite",
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        )}
      </header>

      {/* ── Loading / error states ────────────────────────────────────── */}
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
          {activeTab === "dashboard"         && <DashboardTab       data={data.dashboard} />}
          {activeTab === "industry-ranking"  && <IndustryRankingTab data={data.industry_ranking} />}
          {activeTab === "deep-dive"         && <DeepDiveTab        data={data.deep_dive} />}
          {activeTab === "stock-ranking"     && <StockRankingTab    data={data.stock_ranking} />}
          {activeTab === "rotation-alerts"   && <RotationAlertsTab  data={data.rotation_alerts} meta={data.meta} />}
          {activeTab === "universe-browser"  && <UniverseBrowserTab data={data.universe_browser} />}
          {activeTab === "news-intelligence" && <NewsIntelligenceTab />}
        </>
      )}
    </div>
  );
}

export default function IndustryIntelligencePage() {
  return (
    <Suspense>
      <IndustryIntelligenceInner />
    </Suspense>
  );
}
