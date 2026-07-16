"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import OnboardingPage from "@/app/(onboarding)/onboarding/page";
import { MODSynopsisCard } from "@/components/investor/mod-synopsis-card";
import { MODBreakdownDrawer } from "@/components/investor/mod-breakdown-drawer";
import { HoldingsPanel } from "@/components/investor/holdings-panel";
import { DiscoverScreens } from "@/components/investor/discover-screens";
import { ResearchHero } from "@/components/investor/research-hero";
import { UploadPortfolioModal } from "@/components/investor/upload-portfolio-modal";
import { ConnectPortfolioModal } from "@/components/investor/connect-portfolio-modal";
import { useUserPortfolio } from "@/hooks/useUserPortfolio";
import { useUser } from "@/components/providers/UserContext";
import { brokerLabel } from "@/lib/portfolio-format";
import { useModSynopsis } from "@/hooks/useModSynopsis";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { useDiscoverScreens } from "@/hooks/useDiscoverScreens";
import { useMarketIndices } from "@/hooks/useMarketIndices";
import type { ModPillar, ModSubScore } from "@/types/investor-dashboard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayMeta(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

// Title-case display label for a MOD pillar, e.g. "management" → "Management"
function pillarLabel(pillar: ModPillar | null | undefined): string {
  if (!pillar) return "";
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
}

// Map API sub-scores → the card's { label, score, rating } shape, always in M/O/D order.
function toCardSubScores(subs: ModSubScore[]): { label: string; score: number; rating: ModSubScore["rating"] }[] {
  const order: ModPillar[] = ["management", "opportunity", "deal"];
  return order
    .map((p) => subs.find((s) => s.pillar === p))
    .filter((s): s is ModSubScore => Boolean(s))
    .map((s) => ({ label: pillarLabel(s.pillar), score: s.score, rating: s.rating }));
}

// Build the serif headline for the MOD synopsis card from the overall score + weakest pillar.
function buildModHeadline(overall: number, subs: ModSubScore[], weakest: ModPillar | null): string {
  // Emphasis = serif-italic ink (was off-palette brand-accent purple — accent drift).
  const gold = (t: string) => `<span style="font-style:italic">${t}</span>`;
  const strongest = [...subs].sort((a, b) => b.score - a.score)[0];
  const strongText = strongest ? `strong on ${strongest.pillar}` : "";
  if (!weakest) {
    return strongText
      ? `Your book scores ${gold(`${overall}/100`)} — ${strongText}.`
      : `Your book scores ${gold(`${overall}/100`)}.`;
  }
  const weakSub = subs.find((s) => s.pillar === weakest);
  const weakText = weakSub && weakSub.rating === "STRETCHED"
    ? `${gold(`stretched on ${weakest}`)}.`
    : `${gold(`soft on ${weakest}`)}.`;
  return `Your book scores ${gold(`${overall}/100`)} — ${strongText}, ${weakText}`;
}

// Format a market index value, e.g. 24318 → "24,318"
function fmtIndex(v: number): string {
  return v.toLocaleString("en-IN");
}

// Signed percent, e.g. 0.42 → "+0.42%"
function fmtIndexPct(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvestorDashboardPage() {
  // useSearchParams() requires a Suspense boundary during static prerender.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--qc-bg)]" />}>
      <InvestorDashboardRouter />
    </Suspense>
  );
}

function InvestorDashboardRouter() {
  const searchParams = useSearchParams();
  if (searchParams.get("ob") === "true") {
    return <OnboardingPage />;
  }
  return <InvestorDashboardContent />;
}

function InvestorDashboardContent() {
  const greeting = getGreeting();
  const todayMeta = getTodayMeta();
  const { displayName, smallcase } = useUser();
  const firstName = displayName?.trim().split(/\s+/)[0] ?? "";
  const [modDrawerOpen, setModDrawerOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: userPortfolio, loading: portfolioLoading, refetch: refetchUserPortfolio } = useUserPortfolio();

  // Dashboard widget data
  const { data: modSynopsis } = useModSynopsis();
  const { data: summary } = usePortfolioSummary();
  const { data: discover } = useDiscoverScreens();
  const { data: indices } = useMarketIndices();

  // Holdings (user portfolio)
  const userHoldings = userPortfolio?.holdings ?? [];
  const userStockCount = userHoldings.length;
  const isUserPortfolioMissing = !portfolioLoading && (!userPortfolio || userHoldings.length === 0);

  // Broker connection state from /auth/me. When connected, the cards show a synced
  // status pill instead of a "Connect your portfolio" CTA — even if holdings haven't
  // synced yet (holdings_count can be 0 right after linking).
  const brokerConnected = smallcase?.is_connected ?? false;
  const connectedBrokerLabel = brokerLabel(smallcase?.broker);

  // ── MOD synopsis (portfolio-level) ──────────────────────────────────────────
  const modSubScores = modSynopsis ? toCardSubScores(modSynopsis.sub_scores) : [];
  const modHeadline = modSynopsis
    ? buildModHeadline(modSynopsis.overall_score, modSynopsis.sub_scores, modSynopsis.weakest_pillar)
    : "";
  const modBreakdown = (modSynopsis?.breakdown ?? []).map((row) => ({
    symbol: row.symbol,
    name: row.name,
    pct: row.weight_pct,
    management: row.management,
    opportunity: row.opportunity,
    deal: row.deal,
  }));

  // ── Discover ────────────────────────────────────────────────────────────────
  const discoverScreens = discover?.screens ?? [];

  // ── Market indices (header) ─────────────────────────────────────────────────
  const nifty = indices?.indices.find((i) => i.symbol.toUpperCase() === "NIFTY");
  const sensex = indices?.indices.find((i) => i.symbol.toUpperCase() === "SENSEX");

  return (
    <div className="min-h-screen bg-[var(--qc-bg)]">
      <main className="px-4 pb-16 pt-6 font-sans text-ink sm:px-6 md:px-9">
        {/* ── Page header ───────────────────────────────────────────────── */}
        {/* Single search surface only — the research hero below is the primary
            entry point, so the header no longer duplicates a stock search. */}
        <header className="mb-[22px]">
          <h1 className="m-0 text-[30px] font-medium leading-[1.15] tracking-[var(--qc-track-display)] text-ink">
            {greeting}
            {firstName && <>, <span className="font-medium">{firstName}</span></>}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
            <span>{todayMeta}</span>
            {[
              { label: "NIFTY", idx: nifty },
              { label: "SENSEX", idx: sensex },
            ]
              .filter((e) => e.idx)
              .map((e) => {
                const up = (e.idx!.change_pct ?? 0) >= 0;
                return (
                  <span key={e.label} className="flex items-center gap-x-2">
                    <span className="text-ink-3">·</span>
                    <span>
                      {e.label}{" "}
                      <span className={`font-mono font-medium ${up ? "text-up" : "text-down"}`}>
                        {fmtIndex(e.idx!.value)}
                      </span>
                      <span className={`font-mono ${up ? "text-up" : "text-down"}`}> {fmtIndexPct(e.idx!.change_pct)}</span>
                    </span>
                  </span>
                );
              })}
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════
            ROW 1 — MOD Synopsis (left) + Holdings (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section
          className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5 items-stretch"
        >
          <MODSynopsisCard
            overallScore={modSynopsis?.overall_score ?? 0}
            headline={modHeadline}
            subScores={modSubScores}
            draggingSymbols={modSynopsis?.dragging_symbols ?? []}
            draggingLabel={modSynopsis?.weakest_pillar ? pillarLabel(modSynopsis.weakest_pillar) : undefined}
            onOpenBreakdown={() => setModDrawerOpen(true)}
            isShadow={isUserPortfolioMissing}
            brokerConnected={brokerConnected}
            brokerLabel={connectedBrokerLabel}
            onUploadPortfolio={() => setConnectModalOpen(true)}
          />

          <HoldingsPanel
            stockCount={summary?.stock_count ?? userStockCount}
            fundCount={summary?.fund_count ?? 0}
            equityValue={summary?.equity_value ?? 0}
            investedValue={summary?.invested_value ?? 0}
            todayChangeValue={summary?.today_change_value ?? null}
            todayChangePct={summary?.today_change_pct ?? null}
            ytdChangePct={summary?.ytd_change_pct ?? null}
            return6mPct={summary?.return_6m_pct ?? null}
            valueTrend={summary?.value_trend ?? []}
            capSegments={summary?.cap_segments ?? []}
            industrySegments={summary?.industry_segments ?? []}
            approximate={summary?.source === "firstparty"}
            isShadow={isUserPortfolioMissing}
            brokerConnected={brokerConnected}
            brokerLabel={connectedBrokerLabel}
            onUploadPortfolio={() => setConnectModalOpen(true)}
          />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 2 — Research hero (full width)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-3.5">
          <ResearchHero />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 3 — Discover Screens (full width)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-3.5">
          <DiscoverScreens screens={discoverScreens} />
        </section>
      </main>

      <MODBreakdownDrawer
        open={modDrawerOpen}
        stocks={modBreakdown}
        onClose={() => setModDrawerOpen(false)}
      />

      <ConnectPortfolioModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onOpenCsvUpload={() => setUploadModalOpen(true)}
        onConnected={() => { setConnectModalOpen(false); refetchUserPortfolio(); }}
      />

      <UploadPortfolioModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => { setUploadModalOpen(false); window.location.reload(); }}
      />
    </div>
  );
}
