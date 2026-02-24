"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientContextCard } from "@/components/model-builder/client-context-card";
import { RiskProfileCard } from "@/components/model-builder/risk-profile-card";
import { ICAlignmentCard } from "@/components/model-builder/ic-alignment-card";
import { WhyThisPortfolioCard } from "@/components/model-builder/why-this-portfolio-card";
import { AllocatedPositionsCard } from "@/components/model-builder/allocated-positions-card";
import { RebalanceTriggersCard } from "@/components/model-builder/rebalance-triggers-card";
import { AssetScreenerCard } from "@/components/model-builder/asset-screener-card";
import type { Position, RiskProfileType, RebalanceTrigger, AssetScreenerItem } from "@/types/portfolio";

const SAMPLE_POSITIONS: Position[] = [
  { id: "1", company: "Jupiter Wagons Ltd", ticker: "JWL", assetClass: "growth", score: 84, allocation: 15 },
  { id: "2", company: "Reliance Industries Ltd", ticker: "RELIANCE", assetClass: "quality_compounder", score: 78, allocation: 20 },
  { id: "3", company: "TCS", ticker: "TCS", assetClass: "quality_compounder", score: 82, allocation: 18 },
];

const SAMPLE_TRIGGERS: RebalanceTrigger[] = [
  { id: "1", assetClass: "Growth", currentAllocation: 15, targetAllocation: 35, severity: "warning" },
  { id: "2", assetClass: "Value", currentAllocation: 0, targetAllocation: 20, severity: "warning" },
];

const SAMPLE_SCREENER: AssetScreenerItem[] = [
  { id: "1", company: "Coal India Ltd", ticker: "COALINDIA", assetClass: "value", score: 72, qualityScore: 10, growthScore: 2, pe: "8x" },
  { id: "2", company: "Indian Railway Finance Corp", ticker: "IRFC", assetClass: "income", score: 68, qualityScore: 9, growthScore: 3, pe: "12x" },
  { id: "3", company: "HDFC Bank", ticker: "HDFCBANK", assetClass: "quality_compounder", score: 75, qualityScore: 14, growthScore: 3, pe: "19x" },
];

const WHY_THIS_PORTFOLIO = [
  "This Balanced portfolio targets steady growth with moderate volatility, suitable for investors with a 5+ year horizon.",
  "Quality Compounders (35%) form the core, providing stability through companies with proven ROCE above 15%.",
  "Growth allocation (35%) captures EPS inflection stories with strong momentum and order book visibility.",
  "Value positions (20%) offer margin of safety through P/E discounts to intrinsic value.",
];

export default function ModelBuilderPage() {
  const [activeProfile, setActiveProfile] = useState<RiskProfileType>("balanced");
  const totalAllocation = SAMPLE_POSITIONS.reduce((sum, p) => sum + p.allocation, 0);

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Search bar */}
        <div className="flex gap-2 max-w-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search to load an analysis (optional)..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            />
          </div>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 shadow-none">
            Search
          </Button>
        </div>

        {/* Page header */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            <span>Sample Data</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Portfolio Builder</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Growth &amp; Stability •{" "}
            <span className="text-amber-500 font-semibold">Balanced</span>
          </p>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <ClientContextCard
              client={{
                clientName: "Rajesh Sharma (HNI)",
                aum: "₹4.2 Cr",
                latestUpdate: "Q3 2024 Review - Dec 15",
              }}
            />
            <RiskProfileCard
              activeProfile={activeProfile}
              onProfileChange={setActiveProfile}
            />
            <ICAlignmentCard
              title="Current positions align with the selected Balanced model framework"
              description="All holdings meet the conviction and quality thresholds for this risk profile."
            />
          </div>

          {/* Middle column */}
          <div className="space-y-4">
            <WhyThisPortfolioCard points={WHY_THIS_PORTFOLIO} />
            <AllocatedPositionsCard
              positions={SAMPLE_POSITIONS}
              totalAllocation={totalAllocation}
            />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <RebalanceTriggersCard triggers={SAMPLE_TRIGGERS} />
            <AssetScreenerCard items={SAMPLE_SCREENER} count={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
