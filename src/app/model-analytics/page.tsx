"use client";

import { CompanyHeaderCard } from "@/components/portfolio/company-header-card";
import { AnalyticsSnapshotCard } from "@/components/model-analytics/analytics-snapshot-card";
import { AllocationChartCard } from "@/components/model-analytics/allocation-chart-card";
import { AllocationDriftCard } from "@/components/model-analytics/allocation-drift-card";
import { AssetDeepDiveCard } from "@/components/model-analytics/asset-deep-dive-card";
import type { AllocationSegment, DriftItem, AssetDeepDive } from "@/types/portfolio";

const SNAPSHOT_STATS = [
  { label: "Weighted Score", value: "43.0" },
  { label: "Positions", value: 3 },
  { label: "Max Position", value: "20%" },
  { label: "Asset Classes", value: 2 },
];

const ALLOCATION_SEGMENTS: AllocationSegment[] = [
  { name: "Growth", value: 35, color: "#22c55e" },
  { name: "Quality Compounder", value: 65, color: "#3b82f6" },
];

const DRIFT_ITEMS: DriftItem[] = [
  {
    id: "1",
    assetClass: "Growth",
    currentAllocation: 15,
    targetAllocation: 35,
    driftPercent: -20,
    direction: "down",
  },
  {
    id: "2",
    assetClass: "Quality Compounder",
    currentAllocation: 38,
    targetAllocation: 40,
    driftPercent: -2,
    direction: "down",
  },
  {
    id: "3",
    assetClass: "Value",
    currentAllocation: 0,
    targetAllocation: 20,
    driftPercent: -20,
    direction: "down",
  },
];

const ASSET_DEEP_DIVE: AssetDeepDive = {
  company: "Jupiter Wagons Ltd",
  ticker: "JWL",
  sector: "Infrastructure",
  conviction: "strong_buy",
  qualityScore: { label: "Quality", value: 11.5, maxValue: 15, sublabel: "Atomic-Q", color: "green" },
  growthScore: { label: "Growth", value: 5, maxValue: 5, sublabel: "Atomic-G", color: "green" },
  peZone: { label: "P/E Zone", value: 6, maxValue: 10, sublabel: "Valuation", color: "amber" },
  totalScore: 84,
  assetClass: "Growth",
  valuationZone: "Fair",
  suitableFor: ["Balanced", "Aggressive"],
  positiveFactors: [
    "Strong EPS growth trajectory",
    "High promoter holding",
    "Order book visibility",
  ],
  riskFactors: [
    "High P/E relative to ROCE",
    "Capex execution risk",
    "CFO/EBITDA below threshold",
  ],
};

export default function ModelAnalyticsPage() {
  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Company Header */}
        <CompanyHeaderCard
          company="Jupiter Wagons Ltd"
          ticker="JWL"
          date="2024-12-17"
          dataConfidence="High"
          badgeLabel="FULL IM"
        />

        {/* 2-column layout: Portfolio Context | Asset Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Portfolio Context */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                ⊞ Portfolio Context
              </span>
            </div>

            <AnalyticsSnapshotCard stats={SNAPSHOT_STATS} />
            <AllocationChartCard
              segments={ALLOCATION_SEGMENTS}
              totalInvestedPercent={100}
            />
            <AllocationDriftCard driftItems={DRIFT_ITEMS} />
          </div>

          {/* Right: Asset Deep Dive */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                ◈ Asset Deep Dive
              </span>
            </div>
            <AssetDeepDiveCard asset={ASSET_DEEP_DIVE} />
          </div>
        </div>
      </div>
    </div>
  );
}
