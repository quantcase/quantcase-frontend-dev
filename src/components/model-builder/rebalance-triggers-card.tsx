import { RefreshCw, TriangleAlert, CheckCircle2 } from "lucide-react";
import type { RebalanceTrigger } from "@/types/portfolio";

interface RebalanceTriggersCardProps {
  triggers: RebalanceTrigger[];
}

export function RebalanceTriggersCard({ triggers }: RebalanceTriggersCardProps) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "rgba(18,18,18,0.50)" }}>
          <RefreshCw className="h-3 w-3" />
          Rebalance Triggers
        </p>
      </div>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-3 space-y-2">
        {triggers.length === 0 ? (
          <div className="flex items-center gap-2 py-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm" style={{ color: "#888888" }}>All allocations within target ranges.</p>
          </div>
        ) : (
          triggers.map((trigger) => {
            const diff = trigger.currentAllocation - trigger.targetAllocation;
            return (
              <div
                key={trigger.id}
                className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] p-3 space-y-1"
              >
                <div className="flex items-start gap-2">
                  <TriangleAlert className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold" style={{ color: "#0F172B" }}>
                    {trigger.assetClass} allocation is {trigger.currentAllocation}%{" "}
                    <span className="font-normal" style={{ color: "#888888" }}>(target: {trigger.targetAllocation}%)</span>
                  </p>
                </div>
                <p className="text-[11px] pl-5" style={{ color: "#888888" }}>
                  A {Math.abs(diff)}% deviation from target may affect the portfolio&apos;s risk-return profile.
                </p>
              </div>
            );
          })
        )}
        <p className="text-[11px] italic pt-1" style={{ color: "rgba(18,18,18,0.40)" }}>
          Advisory triggers only. No automatic rebalancing.
        </p>
      </div>
    </div>
  );
}
