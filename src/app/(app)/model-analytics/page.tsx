"use client";

import { useState } from "react";
import { BarChart2, Layers, ShieldCheck, AlertTriangle } from "lucide-react";
import { SectionDivider } from "@/components/dashboard/section-divider";
import { StatCard } from "@/components/dashboard/stat-card";
import { PortfolioDropdown } from "@/components/model-analytics/portfolio-dropdown";
import { AllocationBreakdownCard } from "@/components/model-analytics/allocation-breakdown-card";
import { DriftMonitorCard } from "@/components/model-analytics/drift-monitor-card";
import { PositionsTableCard } from "@/components/model-analytics/positions-table-card";
import { ClientContextCard } from "@/components/model-analytics/client-context-card";
import { PORTFOLIOS, getDriftItems, driftSeverity, formatCrore } from "@/components/model-analytics/portfolio-data";
import type { PortfolioData } from "@/types/portfolio";

export default function ModelAnalyticsPage() {
  const [active, setActive] = useState<PortfolioData>(PORTFOLIOS[0]);

  const driftItems   = getDriftItems(active);
  const criticalDrifts = driftItems.filter((d) => driftSeverity(d.driftPercent) === "critical").length;
  const warningDrifts  = driftItems.filter((d) => driftSeverity(d.driftPercent) === "warning").length;
  const avgScore = active.positions.length
    ? Math.round(active.positions.reduce((s, p) => s + p.score, 0) / active.positions.length)
    : 0;
  const totalWeight = active.positions.reduce((s, p) => s + p.allocation, 0);

  return (
    <div className="min-h-screen bg-white mb-12 px-6">
      <div className="space-y-4">

        {/* Header + dropdown on one line */}
        <div className="pt-6 pb-2 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 style={{ color: "var(--qc-ink)", fontWeight: 500, fontSize: 28 }}>Model Analytics</h3>
            <p style={{ fontSize: 13, color: "var(--qc-ink-2)", marginTop: 2 }}>
              Portfolio allocation, drift monitoring, and position intelligence.
            </p>
          </div>
          <PortfolioDropdown portfolios={PORTFOLIOS} selected={active} onChange={setActive} />
        </div>

        {/* Summary stat cards */}
        <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <StatCard
              flat
              value={formatCrore(active.capital)}
              label="Portfolio AUM"
              icon={<BarChart2 className="size-4 text-zinc-500" />}
              sublabel={active.client.clientName}
            />
            <StatCard
              flat
              value={active.positions.length}
              label="Active Positions"
              icon={<Layers className="size-4 text-zinc-500" />}
              sublabel={`${totalWeight}% allocated`}
            />
            <StatCard
              flat
              value={avgScore}
              label="Avg IC Score"
              icon={<ShieldCheck className="size-4 text-zinc-500" />}
              sublabel={avgScore >= 75 ? "Strong conviction" : "Moderate"}
              trend={avgScore >= 75 ? "up" : "neutral"}
            />
            <StatCard
              flat
              value={criticalDrifts + warningDrifts}
              label="Drift Alerts"
              icon={<AlertTriangle className="size-4 text-zinc-500" />}
              sublabel={criticalDrifts > 0 ? `${criticalDrifts} critical` : "No critical drifts"}
              trend={criticalDrifts > 0 ? "down" : warningDrifts > 0 ? "neutral" : "up"}
            />
          </div>
        </div>

        <SectionDivider label="Allocation Overview" sublabel="Asset class breakdown and drift vs. targets" />

        {/* Allocation + Drift */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AllocationBreakdownCard portfolio={active} />
          <DriftMonitorCard portfolio={active} />
        </div>

        <SectionDivider label="Position Intelligence" sublabel="Equity holdings ranked by IC score" />

        <PositionsTableCard portfolio={active} />

        <ClientContextCard portfolio={active} />

      </div>
    </div>
  );
}
