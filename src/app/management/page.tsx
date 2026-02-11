"use client";

import { useState } from "react";
import { mockManagementData } from "@/lib/mock-data";
import type { TimeframeOption } from "@/types/management";

import { CallHeader } from "@/components/management/call-header";
import { ScoreOverviewCards } from "@/components/management/score-overview-cards";
import { TrustPanel } from "@/components/management/trust-panel";
import { GovernanceSignals } from "@/components/management/governance-signals";
import { ConsistencyAnalysis } from "@/components/management/consistency-analysis";
import { GuidanceTrackTable } from "@/components/management/guidance-track-table";
import { NotablePatterns } from "@/components/management/notable-patterns";
import { TimeframeSelector } from "@/components/management/timeframe-selector";

export default function ManagementDashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    mockManagementData.selectedTimeframe
  );

  const handleFullLLMClick = () => {
    console.log("Open full LLM analysis modal");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-50 w-full bg-orange-600 dark:bg-orange-700 py-2 px-4 text-center text-sm font-semibold text-white">
        ⚠️ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Management Factor Analysis</h1>
          <TimeframeSelector
            selected={selectedTimeframe}
            onChange={setSelectedTimeframe}
          />
        </div>

        {/* Company Header */}
        <div className="mb-6">
          <CallHeader
            company={mockManagementData.company}
            onFullLLMClick={handleFullLLMClick}
          />
        </div>

        {/* Main Layout: 2 columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Main Content (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Score Overview Cards */}
            <ScoreOverviewCards scores={mockManagementData.scores} />

            {/* Governance Signals */}
            <GovernanceSignals signals={mockManagementData.governanceSignals} />

            {/* Consistency Analysis */}
            <ConsistencyAnalysis consistency={mockManagementData.consistency} />

            {/* Guidance Track Table */}
            <GuidanceTrackTable records={mockManagementData.guidanceRecords} />
          </div>

          {/* Right Sidebar: Trust Panel + Notable Patterns (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <TrustPanel trust={mockManagementData.trust} />
            <NotablePatterns patterns={mockManagementData.notablePatterns} />
          </div>
        </div>
      </div>
    </div>
  );
}
