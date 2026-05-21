import { MODSynopsisCard } from "@/components/investor/mod-synopsis-card";
import { HoldingsPanel } from "@/components/investor/holdings-panel";
import { WhatsMovingFeed } from "@/components/investor/whats-moving-feed";
import type { MovingItem } from "@/components/investor/whats-moving-feed";
import { IndustrySignalsGrid } from "@/components/investor/industry-signals-grid";
import type { IndustrySignal } from "@/components/investor/industry-signals-grid";
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
    symbol: "HDFCBANK",
    price: "₹1,728.40",
    priceChange: "↑1.2%",
    priceChangePositive: true,
    kind: "score_upgrade",
    headlineLabel: "Management score upgraded",
    headlineDetail: "78 → 82",
    body: "Q4 concall: ROA expansion holding above 1.95%, deposit growth back above credit growth for first time in 6 quarters.",
    holdingDetail: "You hold 22 shares · 6.1% of equity book.",
    qcScore: 82,
    ctaLabel: "Open",
    ctaHref: "/screener/management?symbol=HDFCBANK",
  },
  {
    id: "2",
    symbol: "ASIANPAINT",
    price: "₹2,418.10",
    priceChange: "↓3.8%",
    priceChangePositive: false,
    kind: "score_downgrade",
    headlineLabel: "Management score downgraded",
    headlineDetail: "62 → 54",
    body: "Tier-2 demand weak; capex guidance walked back. Three years of margin assumptions now under review.",
    holdingDetail: "You hold 8 shares · 2.4% of equity book.",
    qcScore: 54,
    ctaLabel: "Open",
    ctaHref: "/screener/management?symbol=ASIANPAINT",
  },
  {
    id: "3",
    symbol: "TATAMOTORS",
    price: "₹942.80",
    priceChange: "↑0.4%",
    priceChangePositive: true,
    kind: "earnings",
    headlineLabel: "Earnings tonight · 17:30",
    headlineDetail: "your watchlist position",
    body: "Street expects ₹17,400 Cr revenue, JLR margin watch is the key swing factor. Stock has rallied 8% into the print.",
    holdingDetail: "Watching · not held.",
    qcScore: 71,
    ctaLabel: "Brief",
    ctaHref: "/screener/management?symbol=TATAMOTORS",
  },
  {
    id: "4",
    symbol: "DIVISLAB",
    price: "₹5,418.00",
    priceChange: "↓1.1%",
    priceChangePositive: false,
    kind: "score_downgrade",
    headlineLabel: "Guidance revision flagged",
    headlineDetail: "API export outlook cut",
    body: "Management trimmed FY26 revenue guidance by 4% citing US FDA inspection delays at Kakinada plant. QC Insight flags disclosure quality drop.",
    holdingDetail: "You hold 3 shares · 3.1% of equity book.",
    qcScore: 69,
    ctaLabel: "Open",
    ctaHref: "/screener/management?symbol=DIVISLAB",
  },
];

const INDUSTRY_SIGNALS: IndustrySignal[] = [
  { id: "1", rating: "BUY",   sector: "Private Banks",  etfLabel: "PVTBNK",  etfTicker: "PVTBNK ETF",  href: "/screener/home?sector=private-banks" },
  { id: "2", rating: "BUY",   sector: "Capital Goods",  etfLabel: "INFRA",   etfTicker: "INFRA ETF",   href: "/screener/home?sector=capital-goods" },
  { id: "3", rating: "BUY",   sector: "FMCG — Foods",   etfLabel: "FMCG",    etfTicker: "FMCG ETF",    href: "/screener/home?sector=fmcg" },
  { id: "4", rating: "WAIT",  sector: "IT Services",    etfLabel: "ITBEES",  etfTicker: "ITBEES ETF",  href: "/screener/home?sector=it" },
  { id: "5", rating: "WAIT",  sector: "Chemicals",      etfLabel: "CHEMX",   etfTicker: "CHEMX ETF",   href: "/screener/home?sector=chemicals" },
  { id: "6", rating: "WAIT",  sector: "Real Estate",    etfLabel: "HOUSING", etfTicker: "HOUSING ETF", href: "/screener/home?sector=real-estate" },
  { id: "7", rating: "AVOID", sector: "Power Gen",      etfLabel: "PSUINFRA",etfTicker: "PSUINFRA ETF",href: "/screener/home?sector=psu-infra" },
  { id: "8", rating: "AVOID", sector: "Telecom",        etfLabel: "TELECOM", etfTicker: "TELECOM ETF", href: "/screener/home?sector=telecom" },
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
  { symbol: "TATAMOTORS", name: "Tata Motors",          ltp: "₹942.80",   change1d: "+0.4%", changePositive: true,  qcScore: 71, thesisTags: ["OPPORTUNITY"], whyInvested: "Industry Tailwind", conviction: "POSITIVE", href: "/screener/management?symbol=TATAMOTORS" },
  { symbol: "ICICIBANK",  name: "ICICI Bank",            ltp: "₹1,184.20", change1d: "+0.8%", changePositive: true,  qcScore: 84, thesisTags: ["MANAGEMENT"],  whyInvested: "Capital Allocation", conviction: "POSITIVE", href: "/screener/management?symbol=ICICIBANK"  },
  { symbol: "DIVISLAB",   name: "Divi's Laboratories",   ltp: "₹5,418.00", change1d: "-1.1%", changePositive: false, qcScore: 69, thesisTags: ["MANAGEMENT"],  whyInvested: "Disclosure Honesty", conviction: "NEUTRAL",  href: "/screener/management?symbol=DIVISLAB"   },
  { symbol: "ZOMATO",     name: "Zomato",                ltp: "₹208.40",   change1d: "-2.3%", changePositive: false, qcScore: 52, thesisTags: ["OPPORTUNITY"], whyInvested: "TAM Expansion",      conviction: "WATCH",    href: "/screener/management?symbol=ZOMATO"     },
  { symbol: "PIDILITIND", name: "Pidilite Industries",   ltp: "₹2,896.10", change1d: "+0.6%", changePositive: true,  qcScore: 79, thesisTags: ["OPPORTUNITY"], whyInvested: "Distribution Strength", conviction: "HOLD", href: "/screener/management?symbol=PIDILITIND" },
  { symbol: "HDFCBANK",   name: "HDFC Bank",             ltp: "₹1,728.40", change1d: "+1.2%", changePositive: true,  qcScore: 82, thesisTags: ["MANAGEMENT"],  whyInvested: "Guidance Accuracy",  conviction: "POSITIVE", href: "/screener/management?symbol=HDFCBANK"   },
  { symbol: "SBIN",       name: "State Bank of India",   ltp: "₹812.40",   change1d: "+1.4%", changePositive: true,  qcScore: 76, thesisTags: ["DEAL"],        whyInvested: "Valuation",          conviction: "POSITIVE", href: "/screener/management?symbol=SBIN"       },
  { symbol: "ASIANPAINT", name: "Asian Paints",          ltp: "₹2,418.10", change1d: "-3.8%", changePositive: false, qcScore: 54, thesisTags: ["DEAL"],        whyInvested: "P/E Re-rating",      conviction: "WATCH",    href: "/screener/management?symbol=ASIANPAINT", thesisDrift: true },
];

const COMMUNITY_THREAD: CommunityThread = {
  kind: "community",
  label: "HOT IN COMMUNITY · LAST 24H",
  liveTag: true,
  titleHtml: `Is <span style="color:#7c3aed;font-style:italic">HDFC Bank</span> finally turning the corner?`,
  body: "187 comments · ROA print, deposit/credit ratio, and merger integration discussion picking up. Top thread by Sandeep Tekwani (badge: 4.6★).",
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
            {greeting}, <span style={{ fontWeight: 500 }}>Arjun</span>
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
            draggingSymbols={["ASIANPAINT", "TCS"]}
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
          <IndustrySignalsGrid count={8} signals={INDUSTRY_SIGNALS} />
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
            count={9}
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
    </div>
  );
}
