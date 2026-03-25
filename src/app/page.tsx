import { ShieldCheck, AlertTriangle, Clock, AlertCircle } from "lucide-react";
import { InvestmentSignalChanges } from "@/components/dashboard/investment-signal-changes";
import { StatCard } from "@/components/dashboard/stat-card";
import { FrameworkIntegrityMonitor } from "@/components/dashboard/framework-integrity-monitor";
import { ResearchMomentum } from "@/components/dashboard/research-momentum";
import { OpportunityRadar } from "@/components/dashboard/opportunity-radar";
import { MarketNarrativeShifts } from "@/components/dashboard/market-narrative-shifts";
import type { InvestmentSignal } from "@/components/dashboard/investment-signal-changes";
import type { FrameworkItem } from "@/components/dashboard/framework-integrity-monitor";
import type { ResearchMetric } from "@/components/dashboard/research-momentum";
import type { OpportunityItem } from "@/components/dashboard/opportunity-radar";
import type { NarrativeShift } from "@/components/dashboard/market-narrative-shifts";

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
  {
    id: "1",
    label: "IC Drafts Created",
    value: 3,
    sublabel: "This Week",
  },
  {
    id: "2",
    label: "Models Updated",
    value: 8,
    sublabel: "Since Monday",
  },
  {
    id: "3",
    label: "Decision Milestones",
    value: 2,
    sublabel: "Approaching",
  },
  {
    id: "4",
    label: "New Watchlist Adds",
    value: 4,
    sublabel: "Last 7 Days",
  },
];

const OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "1",
    company: "Tata Motors",
    ticker: "TATAMOTORS",
    conviction: "positive",
    valuationZone: "Attractive",
    nextCatalyst: "Earnings (Feb 14)",
  },
  {
    id: "2",
    company: "Titan Company",
    ticker: "TITAN",
    conviction: "neutral",
    valuationZone: "Fair",
    nextCatalyst: "None Near-term",
  },
  {
    id: "3",
    company: "Adani Enterprises",
    ticker: "ADANIENT",
    conviction: "watch",
    valuationZone: "High",
    nextCatalyst: "AGM (Aug 12)",
  },
  {
    id: "4",
    company: "Zomato",
    ticker: "ZOMATO",
    conviction: "review",
    valuationZone: "Speculative",
    nextCatalyst: "Q4 Results",
  },
];

const NARRATIVE_SHIFTS: NarrativeShift[] = [
  {
    id: "1",
    category: "MACRO POLICY",
    sentiment: "neutral",
    description:
      "RBI maintains rate stance — rate-sensitive rerating unlikely near-term.",
  },
  {
    id: "2",
    category: "SECTOR: IT",
    sentiment: "caution",
    description:
      "Discretionary spend remains muted across US geos; expect margin compression.",
  },
  {
    id: "3",
    category: "FLOWS",
    sentiment: "positive",
    description:
      "DII inflows sustaining support levels despite FII selling pressure.",
  },
];

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

export default function Home() {
  const greeting = getGreeting();
  const today = getTodayLabel();

  return (
    <div className="min-h-screen bg-white mb-8 px-4">
      <div className="container mx-auto max-w-7xl space-y-4">

        {/* Page header */}
        <div className="mb-6">
          <h2 style={{ color: "#0F172B", fontWeight: 500 }}>{greeting}, Alex</h2>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>
            Here is your daily IC briefing for {today}.
          </p>
        </div>

        {/* Investment Signal Changes */}
        <InvestmentSignalChanges signals={SIGNALS} />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            value={12}
            label="Thesis Strengthening"
            icon={<ShieldCheck className="size-4 text-zinc-500" />}
          />
          <StatCard
            value={3}
            label="Thesis Weakening"
            icon={<AlertTriangle className="size-4 text-zinc-500" />}
          />
          <StatCard
            value={5}
            label="Near Catalysts"
            icon={<Clock className="size-4 text-zinc-500" />}
          />
          <StatCard
            value={2}
            label="Risk Flags Active"
            icon={<AlertCircle className="size-4 text-zinc-500" />}
          />
        </div>

        {/* Framework Integrity + Research Momentum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FrameworkIntegrityMonitor items={FRAMEWORK_ITEMS} />
          <ResearchMomentum metrics={RESEARCH_METRICS} />
        </div>

        {/* Opportunity Radar + Market Narrative Shifts */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4">
          <OpportunityRadar items={OPPORTUNITIES} />
          <MarketNarrativeShifts shifts={NARRATIVE_SHIFTS} />
        </div>

      </div>
    </div>
  );
}
