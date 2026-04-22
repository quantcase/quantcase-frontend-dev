import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { RMPortfolioSignalGraph } from "@/components/dashboard/rm-portfolio-signal-graph";
import type { RMNode } from "@/components/dashboard/rm-portfolio-signal-graph";
import { InvestmentSignalChanges } from "@/components/dashboard/investment-signal-changes";
import { StatCard } from "@/components/dashboard/stat-card";
import { FrameworkIntegrityMonitor } from "@/components/dashboard/framework-integrity-monitor";
import { ResearchMomentum } from "@/components/dashboard/research-momentum";
import { OpportunityRadar } from "@/components/dashboard/opportunity-radar";
import { MarketNarrativeShifts } from "@/components/dashboard/market-narrative-shifts";
import { WatchlistPanel } from "@/components/dashboard/watchlist-panel";
import { ClientPortfolioOverview } from "@/components/dashboard/client-portfolio-overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { SmartClientSegments } from "@/components/dashboard/smart-client-segments";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import type { InvestmentSignal } from "@/components/dashboard/investment-signal-changes";
import type { FrameworkItem } from "@/components/dashboard/framework-integrity-monitor";
import type { ResearchMetric } from "@/components/dashboard/research-momentum";
import type { OpportunityItem } from "@/components/dashboard/opportunity-radar";
import type { NarrativeShift } from "@/components/dashboard/market-narrative-shifts";
import type { ClientAccount } from "@/components/dashboard/client-portfolio-overview";
import type { ActivityItem } from "@/components/dashboard/activity-feed";
import type { AIInsightItem } from "@/components/dashboard/ai-insights";
import type { ClientSegment } from "@/components/dashboard/smart-client-segments";
import type { TaskItem } from "@/components/dashboard/todays-tasks";

// ── RM Signal Graph data ──────────────────────────────────────────────────────

const RM_GRAPH_DATA: RMNode[] = [
  {
    id: "rm-palash",
    name: "Palash Jain",
    initials: "PJ",
    severity: "critical",
    clients: [
      {
        id: "cli-rahul",
        name: "Rahul Mehta",
        aum: "₹3.2 Cr",
        severity: "critical",
        assetClasses: [
          {
            id: "ac-eq-rm",
            label: "Equity",
            severity: "critical",
            subclasses: [
              { id: "sub-midcap", label: "Mid-cap",    severity: "critical", signal: "Drift +6%" },
              { id: "sub-lrgcap", label: "Large-cap",  severity: "clean",   signal: "On track"  },
            ],
          },
          {
            id: "ac-mf-rm",
            label: "Mutual Funds",
            severity: "moderate",
            subclasses: [
              { id: "sub-hybrid", label: "Hybrid",   severity: "moderate", signal: "Rebalance due" },
            ],
          },
        ],
      },
      {
        id: "cli-varun",
        name: "Varun Kapoor",
        aum: "₹7.1 Cr",
        severity: "critical",
        assetClasses: [
          {
            id: "ac-eq-vk",
            label: "Equity",
            severity: "critical",
            subclasses: [
              { id: "sub-midcap-vk", label: "Mid-cap",    severity: "critical", signal: "Overweight +9%" },
              { id: "sub-smcap-vk", label: "Small-cap",   severity: "warning",  signal: "Threshold near" },
            ],
          },
          {
            id: "ac-bonds-vk",
            label: "Bonds",
            severity: "clean",
            subclasses: [
              { id: "sub-gsec", label: "G-Sec", severity: "clean", signal: "Normal" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rm-sonal",
    name: "Sonal Batra",
    initials: "SB",
    severity: "warning",
    clients: [
      {
        id: "cli-anita",
        name: "Anita Shah",
        aum: "₹5.8 Cr",
        severity: "warning",
        assetClasses: [
          {
            id: "ac-eq-as",
            label: "Equity",
            severity: "warning",
            subclasses: [
              { id: "sub-ev",    label: "EV / Green", severity: "warning",  signal: "Report pending" },
              { id: "sub-it-as", label: "IT",         severity: "moderate", signal: "Watch"         },
            ],
          },
          {
            id: "ac-realty-as",
            label: "Realty",
            severity: "clean",
            subclasses: [
              { id: "sub-realty", label: "REITs", severity: "clean", signal: "Stable" },
            ],
          },
        ],
      },
      {
        id: "cli-suresh",
        name: "Suresh Nair",
        aum: "₹2.4 Cr",
        severity: "clean",
        assetClasses: [
          {
            id: "ac-mf-sn",
            label: "Mutual Funds",
            severity: "clean",
            subclasses: [
              { id: "sub-debt-sn",  label: "Debt",   severity: "clean", signal: "Stable" },
              { id: "sub-equity-sn", label: "Equity", severity: "clean", signal: "Stable" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rm-arjun",
    name: "Arjun Rao",
    initials: "AR",
    severity: "moderate",
    clients: [
      {
        id: "cli-priya",
        name: "Priya Venkat",
        aum: "₹4.6 Cr",
        severity: "moderate",
        assetClasses: [
          {
            id: "ac-eq-pv",
            label: "Equity",
            severity: "moderate",
            subclasses: [
              { id: "sub-infra",   label: "Infra",      severity: "moderate", signal: "Pending review" },
              { id: "sub-pharma",  label: "Pharma",     severity: "clean",    signal: "On track"      },
            ],
          },
          {
            id: "ac-intl-pv",
            label: "Intl Funds",
            severity: "warning",
            subclasses: [
              { id: "sub-us",  label: "US Equity", severity: "warning", signal: "FX exposure" },
            ],
          },
        ],
      },
    ],
  },
];

// ── RM / Client data ──────────────────────────────────────────────────────────

const AI_INSIGHTS: AIInsightItem[] = [
  {
    id: "1",
    client: "Rahul Mehta",
    category: "Small-cap",
    risk: "moderate",
    note: "Anxious about small-cap volatility. Portfolio drifted +6% mid-cap. No updated allocation before weekend.",
    timeAgo: "2 days ago",
    actionLabel: "View profile",
  },
  {
    id: "2",
    client: "Anita Shah",
    category: "EV Interest",
    risk: "low_risk",
    note: "Interested in EV & Green Energy for 2025. Asked for sector update. Report not yet sent.",
    timeAgo: "1 week ago",
    actionLabel: "Send EV report",
  },
  {
    id: "3",
    client: "Varun Kapoor",
    category: "Drift alert",
    risk: "high_risk",
    note: "Portfolio drift +9%. Mid-cap overweight. No interaction in 14 days.",
    timeAgo: "16 days ago",
    actionLabel: "Rebalance",
  },
];

const CLIENT_SEGMENTS: ClientSegment[] = [
  { id: "1", label: "Needs immediate action",    count: 4,  urgency: "alert"   },
  { id: "2", label: "Portfolio drift alerts",    count: 3,  urgency: "warning" },
  { id: "3", label: "High AUM clients",          count: 22, urgency: "neutral" },
  { id: "4", label: "EV / Green Energy interest", count: 8,  urgency: "neutral" },
  { id: "5", label: "Conservative clients",      count: 32, urgency: "neutral" },
  { id: "6", label: "Inactive > 30 days",        count: 7,  urgency: "warning" },
  { id: "7", label: "KYC expiring this month",   count: 2,  urgency: "alert"   },
];

const TODAYS_TASKS: TaskItem[] = [
  { id: "1", label: "Send Rahul updated portfolio PDF", status: "overdue", meta: "Overdue" },
  { id: "2", label: "Share EV report with Anita",       status: "pending", meta: "Today"   },
  { id: "3", label: "KYC renewal — Suresh Nair",        status: "done",    meta: "Done"    },
];

const CLIENT_ACCOUNTS: ClientAccount[] = [
  {
    id: "1",
    name: "Rahul Mehta",
    aum: "₹3.2 Cr",
    pnlPercent: -6.0,
    tag: "HNI",
    lastContact: "2 days ago",
    actionLabel: "Call Now",
  },
  {
    id: "2",
    name: "Anita Shah",
    aum: "₹5.8 Cr",
    pnlPercent: +1.4,
    tag: "HNI",
    lastContact: "1 week ago",
    actionLabel: "Send Report",
  },
  {
    id: "3",
    name: "Varun Kapoor",
    aum: "₹7.1 Cr",
    pnlPercent: -9.2,
    tag: "HNI",
    lastContact: "16 days ago",
    actionLabel: "Rebalance",
  },
  {
    id: "4",
    name: "Suresh Nair",
    aum: "₹2.4 Cr",
    pnlPercent: +0.8,
    tag: "HNI",
    lastContact: "Today",
  },
  {
    id: "5",
    name: "Priya Venkat",
    aum: "₹4.6 Cr",
    pnlPercent: +2.1,
    tag: "HNI",
    lastContact: "3 days ago",
  },
];

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "1",
    time: "9:42 AM",
    company: "Meridian Holdings",
    description: "Portfolio value dropped below threshold",
    tag: "Alert",
    tagColor: "alert",
  },
  {
    id: "2",
    time: "8:15 AM",
    company: "Emerging Markets Outlook",
    description: "New research note published on emerging markets outlook",
    tag: "Research",
    tagColor: "neutral",
  },
  {
    id: "3",
    time: "7:50 AM",
    company: "Northwind Capital",
    description: "Rebalance order executed successfully across 6 holdings",
    tag: "Completed",
    tagColor: "positive",
  },
  {
    id: "4",
    time: "Yesterday",
    company: "Apex Ventures",
    description: "Redemption request of ₹8.2 Cr submitted by client",
    tag: "Action",
    tagColor: "alert",
  },
  {
    id: "5",
    time: "Yesterday",
    company: "Bluechip Growth Fund",
    description: "Q4 earnings call transcript available — management tone flagged for review",
    tag: "Research",
    tagColor: "neutral",
  },
];

// ── Investment / terminal data ────────────────────────────────────────────────

const SIGNALS: InvestmentSignal[] = [
  {
    id: "1",
    company: "Larsen & Toubro",
    signalType: "thesis_strengthening",
    description:
      'Order book visibility has improved significantly beyond FY26 projections, validating the core "Infrastructure Supercycle" thesis component.',
  },
  {
    id: "2",
    company: "HDFC Bank",
    signalType: "assumption_risk",
    description:
      "Capex intensity is currently exceeding the upper bound of our IC-approved range (12.5% vs 10% limit), potentially pressuring near-term ROA.",
  },
  {
    id: "3",
    company: "Reliance Industries",
    signalType: "valuation_trigger",
    description:
      "Stock has entered the designated accumulation zone (1.8x P/B) triggering a formal re-rating review cycle.",
    reviewHref: "#",
  },
];

const FRAMEWORK_ITEMS: FrameworkItem[] = [
  {
    id: "1",
    title: "ROCE Trajectory",
    description: "Portfolio aggregate ROCE expanding +120bps YoY",
    status: "on_track",
  },
  {
    id: "2",
    title: "Margin Assumptions",
    description: "Input cost inflation impacting consumer discretionary holdings",
    status: "pressured",
  },
  {
    id: "3",
    title: "Capex Efficiency",
    description: "Deployment within 5% of guidance across industrials",
    status: "on_track",
  },
  {
    id: "4",
    title: "Cash Conversion",
    description: "Working capital cycles elongating in IT Services",
    status: "watch",
  },
];

const RESEARCH_METRICS: ResearchMetric[] = [
  { id: "1", label: "IC Drafts Created",    value: 3, sublabel: "This Week"    },
  { id: "2", label: "Models Updated",       value: 8, sublabel: "Since Monday" },
  { id: "3", label: "Decision Milestones",  value: 2, sublabel: "Approaching"  },
  { id: "4", label: "New Watchlist Adds",   value: 4, sublabel: "Last 7 Days"  },
];

const OPPORTUNITIES: OpportunityItem[] = [
  { id: "1", company: "Tata Motors",       ticker: "TATAMOTORS", conviction: "positive", valuationZone: "Attractive",  nextCatalyst: "Earnings (Feb 14)" },
  { id: "2", company: "Titan Company",     ticker: "TITAN",      conviction: "neutral",  valuationZone: "Fair",        nextCatalyst: "None Near-term"    },
  { id: "3", company: "Adani Enterprises", ticker: "ADANIENT",   conviction: "watch",    valuationZone: "High",        nextCatalyst: "AGM (Aug 12)"      },
  { id: "4", company: "Zomato",            ticker: "ZOMATO",     conviction: "review",   valuationZone: "Speculative", nextCatalyst: "Q4 Results"        },
];

const NARRATIVE_SHIFTS: NarrativeShift[] = [
  {
    id: "1",
    category: "MACRO POLICY",
    sentiment: "neutral",
    description: "RBI maintains rate stance — rate-sensitive rerating unlikely near-term.",
  },
  {
    id: "2",
    category: "SECTOR: IT",
    sentiment: "caution",
    description: "Discretionary spend remains muted across US geos; expect margin compression.",
  },
  {
    id: "3",
    category: "FLOWS",
    sentiment: "positive",
    description: "DII inflows sustaining support levels despite FII selling pressure.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const greeting = getGreeting();
  const today = getTodayLabel();

  return (
    <div className="min-h-screen mb-12 px-6" style={{ background: "var(--qc-surface-white)" }}>
      <div className="space-y-4">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="pt-6 pb-2">
          <h3 style={{ color: "var(--qc-text-heading)", fontWeight: 500, fontSize: 28 }}>{greeting}, Palash</h3>
          <p style={{ fontSize: 13, color: "var(--qc-text-muted)", marginTop: 2 }}>
            Here is your daily IC briefing for {today}.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════
            SECTION 0 — RM PORTFOLIO SIGNAL MAP + ACTIVITY FEED
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-[30%_1fr] gap-4 items-stretch">
          <ActivityFeed items={ACTIVITY_ITEMS} className="h-full" />
          <RMPortfolioSignalGraph rms={RM_GRAPH_DATA} className="h-full" />
        </div>

        {/* ════════════════════════════════════════════════════════════
            SECTION 1 — RM & CLIENT RELATIONSHIP
        ═══════════════════════════════════════════════════════════════ */}

        {/* Unified two-column bento — columns stay aligned across both rows */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <AIInsights items={AI_INSIGHTS} />
            <ClientPortfolioOverview
              clients={CLIENT_ACCOUNTS}
              totalAUM="₹796 Cr"
              totalClients={18}
              activeAlerts={3}
            />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <SmartClientSegments segments={CLIENT_SEGMENTS} />
            <TodaysTasks tasks={TODAYS_TASKS} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            SECTION 2 — RESEARCH TERMINAL
        ═══════════════════════════════════════════════════════════════ */}

        <SectionDivider label="Research Terminal" sublabel="Watchlists, signals & portfolio intelligence" />

        {/* Unified two-column bento — mirrors top section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">

          {/* Left column */}
          <div className="flex flex-col gap-4">
            <WatchlistPanel />
            <InvestmentSignalChanges signals={SIGNALS} />
            <OpportunityRadar items={OPPORTUNITIES} />
            <FrameworkIntegrityMonitor items={FRAMEWORK_ITEMS} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* 4 stat cards grouped into a single panel */}
            <div className="rounded-[10px] p-2" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
              <div className="grid grid-cols-2 gap-2">
                <StatCard
                  flat
                  value={12}
                  label="Thesis Strengthening"
                  icon={<ShieldCheck className="size-4 text-zinc-500" />}
                  sublabel="+4 this week"
                  trend="up"
                />
                <StatCard
                  flat
                  value={3}
                  label="Thesis Weakening"
                  icon={<AlertTriangle className="size-4 text-zinc-500" />}
                  sublabel="1 new today"
                  trend="down"
                />
                <StatCard
                  flat
                  value={5}
                  label="Near Catalysts"
                  icon={<Clock className="size-4 text-zinc-500" />}
                  sublabel="Next 30 days"
                />
                <StatCard
                  flat
                  value={2}
                  label="Risk Flags Active"
                  icon={<AlertCircle className="size-4 text-zinc-500" />}
                  sublabel="Needs review"
                  trend="down"
                />
              </div>
            </div>

            <ResearchMomentum metrics={RESEARCH_METRICS} />
            <MarketNarrativeShifts shifts={NARRATIVE_SHIFTS} />
          </div>

        </div>

      </div>
    </div>
  );
}
