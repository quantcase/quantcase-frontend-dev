"use client";

import { useState } from "react";
import { MODSynopsisCard } from "@/components/investor/mod-synopsis-card";
import { MODBreakdownDrawer } from "@/components/investor/mod-breakdown-drawer";
import { HoldingsPanel } from "@/components/investor/holdings-panel";
import { WhatsMovingFeed } from "@/components/investor/whats-moving-feed";
import type { MovingItem } from "@/components/investor/whats-moving-feed";
import { IndustrySignalsGrid } from "@/components/investor/industry-signals-grid";
import { MarketViewCard } from "@/components/investor/market-view-card";
import type { MarketMetric } from "@/components/investor/market-view-card";
import { EventsMovingMarket } from "@/components/investor/events-moving-market";
import type { MacroRegime } from "@/components/investor/events-moving-market";
import { ShadowPortfolio } from "@/components/investor/shadow-portfolio";
import type { ShadowStock } from "@/components/investor/shadow-portfolio";
import { CommunityDiscussionRow } from "@/components/investor/community-discussion-row";
import type { CommunityThread, IpoDiscussion } from "@/components/investor/community-discussion-row";
import { DiscoverScreens } from "@/components/investor/discover-screens";
import type { DiscoverScreen } from "@/components/investor/discover-screens";
import { ResearchLibraryBanner } from "@/components/investor/research-library-banner";

// ── Static placeholder data ───────────────────────────────────────────────────

const MOVING_ITEMS: MovingItem[] = [
  {
    id: "1",
    symbol: "HINDUNILVR",
    price: "₹2,318.60",
    priceChange: "↑0.9%",
    priceChangePositive: true,
    kind: "score_upgrade",
    headlineLabel: "Management score upgraded",
    headlineDetail: "74 → 79",
    body: "Q4 concall: rural volume recovery accelerated; pricing power maintained despite commodity headwinds. Disclosure quality flagged as improving.",
    holdingDetail: "You hold 14 shares · 5.8% of equity book.",
    qcScore: 79,
    ctaLabel: "Open",
    ctaHref: "/screener/management?symbol=HINDUNILVR",
  },
  {
    id: "2",
    symbol: "ACC",
    price: "₹1,874.30",
    priceChange: "↓2.1%",
    priceChangePositive: false,
    kind: "score_downgrade",
    headlineLabel: "Management score downgraded",
    headlineDetail: "68 → 61",
    body: "Capacity utilisation guidance walked back; blended realisation under pressure from South India pricing war. Capital allocation under review.",
    holdingDetail: "You hold 6 shares · 2.0% of equity book.",
    qcScore: 61,
    ctaLabel: "Open",
    ctaHref: "/screener/management?symbol=ACC",
  },
  {
    id: "3",
    symbol: "POWERGRID",
    price: "₹318.40",
    priceChange: "↑0.6%",
    priceChangePositive: true,
    kind: "earnings",
    headlineLabel: "Earnings tonight · 17:30",
    headlineDetail: "your watchlist position",
    body: "Street expects ₹4,680 Cr revenue; transmission asset capitalisation pace is the key swing factor. Stock up 5% into the print.",
    holdingDetail: "Watching · not held.",
    qcScore: 73,
    ctaLabel: "Brief",
    ctaHref: "/screener/management?symbol=POWERGRID",
  },
  {
    id: "4",
    symbol: "HFCL",
    price: "₹128.75",
    priceChange: "↓1.4%",
    priceChangePositive: false,
    kind: "score_downgrade",
    headlineLabel: "Guidance revision flagged",
    headlineDetail: "Optical fibre order pipeline cut",
    body: "Management trimmed FY26 revenue guidance by 6% citing slower government rollout of BharatNet Phase III. QC Insight flags execution risk.",
    holdingDetail: "You hold 120 shares · 2.8% of equity book.",
    qcScore: 64,
    ctaLabel: "Open",
    ctaHref: "/screener/management?symbol=HFCL",
  },
];


const MARKET_METRICS: MarketMetric[] = [
  { label: "F&O Put/Call Ratio", value: "↑ 1.24", annotation: "Bullish",  annotationPositive: true  },
  { label: "FII Net Flow (₹Cr)", value: "+2,842",  annotation: "",         annotationPositive: true  },
  { label: "VIX (India)",        value: "13.2",    annotation: "Low",      annotationPositive: true  },
  { label: "Advance/Decline",    value: "2.1x",    annotation: "",         annotationPositive: true  },
  { label: "52W Highs vs Lows",  value: "184 / 21",annotation: "",         annotationPositive: true  },
];

const MACRO_REGIMES: MacroRegime[] = [
  {
    category: "COMMODITY",
    title: "Crude",
    arrow: "↑",
    subtitle: "Input Cost Inflation",
    sectors: [
      { name: "Paints",   direction: "down", metric: "margin" },
      { name: "Tyres",    direction: "down", metric: "margin" },
      { name: "Aviation", direction: "down", metric: "cost"   },
    ],
  },
  {
    category: "FISCAL",
    title: "Defense Spending",
    arrow: "↑",
    subtitle: "Expansion",
    sectors: [
      { name: "Defense",     direction: "up", metric: "capex"  },
      { name: "Industrials", direction: "up", metric: "orders" },
      { name: "Electronics", direction: "up", metric: "local"  },
    ],
  },
  {
    category: "ACTIVITY",
    title: "PMI Expansion",
    arrow: "↑",
    subtitle: "Momentum",
    sectors: [
      { name: "Cap Goods",   direction: "up", metric: "orders"   },
      { name: "Industrials", direction: "up", metric: "activity" },
      { name: "Logistics",   direction: "up", metric: "volume"   },
    ],
  },
  {
    category: "MONETARY",
    title: "Rate Hold",
    arrow: "→",
    subtitle: "Policy Pause",
    sectors: [
      { name: "Banks",       direction: "up",   metric: "NIM stable" },
      { name: "Real Estate", direction: "down", metric: "demand"     },
      { name: "Utilities",   direction: "down", metric: "cap cost"   },
    ],
  },
];

const SHADOW_STOCKS: ShadowStock[] = [
  { symbol: "MSUMI",      name: "Motherson Sumi Wiring", ltp: "₹62.40",    change1d: "+1.1%", changePositive: true,  qcScore: 76, thesisTags: ["OPPORTUNITY"], whyInvested: "EV Wiring Tailwind",    conviction: "POSITIVE", href: "/screener/management?symbol=MSUMI"      },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever",    ltp: "₹2,318.60", change1d: "+0.9%", changePositive: true,  qcScore: 79, thesisTags: ["MANAGEMENT"],  whyInvested: "Disclosure Quality",    conviction: "POSITIVE", href: "/screener/management?symbol=HINDUNILVR" },
  { symbol: "ACC",        name: "ACC Ltd",               ltp: "₹1,874.30", change1d: "-2.1%", changePositive: false, qcScore: 61, thesisTags: ["DEAL"],        whyInvested: "Valuation Reset",       conviction: "WATCH",    href: "/screener/management?symbol=ACC",       thesisDrift: true },
  { symbol: "HFCL",       name: "HFCL Ltd",              ltp: "₹128.75",   change1d: "-1.4%", changePositive: false, qcScore: 64, thesisTags: ["OPPORTUNITY"], whyInvested: "BharatNet Exposure",    conviction: "NEUTRAL",  href: "/screener/management?symbol=HFCL"       },
  { symbol: "POWERGRID",  name: "Power Grid Corp",       ltp: "₹318.40",   change1d: "+0.6%", changePositive: true,  qcScore: 73, thesisTags: ["MANAGEMENT"],  whyInvested: "Regulated Asset Base",  conviction: "POSITIVE", href: "/screener/management?symbol=POWERGRID"  },
];

const COMMUNITY_THREAD: CommunityThread = {
  kind: "community",
  label: "HOT IN COMMUNITY · LAST 24H",
  liveTag: true,
  titleHtml: `Is <span style="color:#7c3aed;font-style:italic">Hindustan Unilever</span> staging a rural comeback?`,
  body: "187 comments · Volume recovery pace, pricing power, and rural distribution trends picking up. Top thread by Sandeep Tekwani (badge: 4.6★).",
  stats: [
    { value: 187, label: "comments" },
    { value: 42,  label: "users"    },
    { value: 3,   label: "top contributors" },
  ],
  cta: "Join discussion →",
  href: "#",
};

const IPO_DISCUSSION: IpoDiscussion = {
  kind: "ipo",
  label: "UPCOMING IPO DISCUSSION",
  opensTag: "12 MAY",
  titleHtml: `<span style="color:#7c3aed;font-style:italic">Aditya Birla Capital</span> — DRHP filed, GMP at ₹185`,
  body: "94 users in the room. DRHP analysis posted by Quantcase research team · Subscribe / Subscribe on dips / Avoid verdict in 48 hrs.",
  stats: [
    { value: 94, label: "in room"              },
    { value: 12, label: "independent verdicts" },
  ],
  cta: "Open room →",
  href: "#",
};

const DISCOVER_SCREENS: DiscoverScreen[] = [
  {
    id: "promoter-buying",
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    badgeLabel: "+12 THIS WEEK",
    badgeColor: "#d97706",
    title: "Promoter buying – material disclosures",
    description: "Promoters bought ₹100 Cr+ of own stock in the last 30 days. Historically a strong signal at small/mid caps.",
    stats: [
      { value: 23, label: "NAMES"          },
      { value: 7,  label: "QC SCORE >75"   },
      { value: 4,  label: "IN YOUR SECTORS"},
    ],
    href: "#",
  },
  {
    id: "cash-rich",
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    badgeLabel: "NEW",
    badgeColor: "#7c3aed",
    title: "Cash-rich, debt-free, & growing",
    description: "Net cash > 20% of market cap, ROCE > 18%, sales growth > 15% over 3 years. Quality compounders trading at fair value.",
    stats: [
      { value: 18, label: "NAMES"        },
      { value: 11, label: "QC SCORE >70" },
      { value: 2,  label: "YOU HOLD"     },
    ],
    href: "#",
  },
  {
    id: "52w-lows",
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
    title: "52-week lows · QC Score still high",
    description: "Stocks at 52-week lows where management quality and capital allocation scores remain strong. Mean reversion candidates.",
    stats: [
      { value: 14, label: "NAMES"         },
      { value: 5,  label: "AVG DISC > 25%"},
      { value: 1,  label: "YOU WATCH"     },
    ],
    href: "#",
  },
];

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvestorDashboardPage() {
  const greeting = getGreeting();
  const todayMeta = getTodayMeta();
  const [modDrawerOpen, setModDrawerOpen] = useState(false);

  return (
    <div style={{ background: "var(--qc-bg, #F5F5F5)", minHeight: "100vh" }}>
      <main
        style={{
          padding: "28px 36px 60px",
          maxWidth: 1440,
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink, #0F172B)",
        }}
      >
        {/* ── Page header ───────────────────────────────────────────────── */}
        <header style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.15,
              color: "var(--qc-ink, #0F172B)",
              fontFamily: "var(--qc-font-sans)",
            }}
          >
            {greeting}, <span style={{ fontWeight: 500 }}>Raj</span>
          </h1>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--qc-ink-3, #888)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{todayMeta}</span>
            <span style={{ color: "var(--qc-ink-3, #888)" }}>·</span>
            <span>
              NIFTY{" "}
              <span style={{ color: "#22c55e", fontWeight: 500 }}>24,318</span>
              <span style={{ color: "#22c55e" }}> +0.42%</span>
            </span>
            <span style={{ color: "var(--qc-ink-3, #888)" }}>·</span>
            <span>
              SENSEX{" "}
              <span style={{ color: "#22c55e", fontWeight: 500 }}>79,712</span>
              <span style={{ color: "#22c55e" }}> +0.38%</span>
            </span>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════
            ROW 1 — MOD Synopsis (left) + Holdings (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "5fr 6fr",
            gap: 14,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          <MODSynopsisCard
            overallScore={72}
            headline={`Your book scores <span style="color:#818cf8;font-style:italic">72/100</span> — strong on management, <span style="color:#818cf8;font-style:italic">stretched on deal.</span>`}
            subScores={[
              { label: "Management", score: 81, rating: "STRONG"    },
              { label: "Opportunity", score: 74, rating: "FAIR"      },
              { label: "Deal",        score: 58, rating: "STRETCHED" },
            ]}
            draggingSymbols={["ACC", "HFCL"]}
            onOpenBreakdown={() => setModDrawerOpen(true)}
          />

          <HoldingsPanel
            stockCount={12}
            fundCount={5}
            syncedAgo="2 min ago"
            equityValue="₹56.8 L"
            todayChange="+₹38,200"
            ytdChange="+14.2%"
            capSegments={[
              { label: "Large cap",  value: "₹29.5 L", count: 6, pct: 52, color: "#0F172B" },
              { label: "Mid cap",    value: "₹17.6 L", count: 4, pct: 31, color: "#7c3aed" },
              { label: "Small cap",  value: "₹9.7 L",  count: 2, pct: 17, color: "#d97706" },
            ]}
          />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 2 — What's Moving (left) + Industry Signals (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 14,
            marginBottom: 14,
            alignItems: "start",
          }}
        >
          <WhatsMovingFeed count={4} items={MOVING_ITEMS} />
          <IndustrySignalsGrid />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 3 — Market View (left narrow) + Events Moving Market (right wide)
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 14,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          <MarketViewCard
            score={72}
            sentiment="GREED"
            metrics={MARKET_METRICS}
            updatedTime="09:31 IST"
          />
          <EventsMovingMarket
            regimes={MACRO_REGIMES}
            totalSectorSignals={12}
            refreshedTime="09:31 IST"
            refreshedDate="20 May 2026"
          />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 4 — Shadow Portfolio (full width)
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 14 }}>
          <ShadowPortfolio
            count={5}
            stocks={SHADOW_STOCKS}
            thesisDriftCount={1}
          />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 5 — Community Discussion (left) + IPO Discussion (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 14 }}>
          <CommunityDiscussionRow thread={COMMUNITY_THREAD} ipo={IPO_DISCUSSION} />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 6 — Discover Screens (full width)
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 14 }}>
          <DiscoverScreens screens={DISCOVER_SCREENS} />
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 7 — Research Library Banner (full width)
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 14 }}>
          <ResearchLibraryBanner
            newIcNotes={3}
            catalystsNext30Days={5}
            subtitle="DRHP verdicts, management commentary & thesis updates"
            href="#"
          />
        </section>
      </main>

      <MODBreakdownDrawer
        open={modDrawerOpen}
        stocks={[]}
        onClose={() => setModDrawerOpen(false)}
      />
    </div>
  );
}
